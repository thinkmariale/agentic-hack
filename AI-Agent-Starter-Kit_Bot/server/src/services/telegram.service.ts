import { Bot, webhookCallback } from "grammy";
import { BaseService } from "./base.service.js";
import { ElizaService } from "./eliza.service.js";
import {
  AnyType,
  getCollablandApiUrl,
} from "../utils.js";
import { MentaportService, CertificateParams } from "./mentaport.service.js";

import fs from "fs";
import axios, { isAxiosError } from "axios";
import path, { resolve } from "path";
import { keccak256, getBytes, toUtf8Bytes, ethers } from "ethers";
import { TwitterService } from "./twitter.service.js";
import { NgrokService } from "./ngrok.service.js";
import { InputFile } from "grammy";
import { CopyrightInfringementUser, ReportedPost } from "src/contracts/types/ReputationAgent.js";
import { ReputationContractService } from "./reputationContract.service.js";

// hack to avoid 400 errors sending params back to telegram. not even close to perfect
const htmlEscape = (_key: AnyType, val: AnyType) => {
  if (typeof val === "string") {
    return val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;"); // single quote
  }
  return val;
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);
export class TelegramService extends BaseService {
  private static instance: TelegramService;
  private bot: Bot;
  private webhookUrl: string;
  private elizaService: ElizaService;
  public nGrokService: NgrokService;
  private twitterService?: TwitterService;

  private constructor(webhookUrl?: string) {
    super();
    console.log('hre',process.env.TELEGRAM_BOT_TOKEN)
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    if (webhookUrl != null) {
      this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    }
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    this.elizaService = ElizaService.getInstance(this.bot);
    console.log(webhookUrl);
  }

  public static getInstance(webhookUrl?: string): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService(webhookUrl);
    }
    return TelegramService.instance;
  }

  public async setWebhook(webhookUrl: string): Promise<void> {
    this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    await this.bot.api.setWebhook(this.webhookUrl);
    console.log("Telegram webhook set:", this.webhookUrl);
  }

  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    });
  }

  public async start(): Promise<void> {
    const client = axios.create({
      baseURL: getCollablandApiUrl(),
      headers: {
        "X-API-KEY": process.env.COLLABLAND_API_KEY || "",
        "X-TG-BOT-TOKEN": process.env.TELEGRAM_BOT_TOKEN || "",
        "Content-Type": "application/json",
      },
      timeout: 5 * 60 * 1000,
    });
    try {
      //all command descriptions can be added here
      this.bot.api.setMyCommands([
        {
          command: "start",
          description: "Say hello and we will greet you back",
        },
        { command: "mint", description: "Mint a certficate of authenticity for your content, powered by Mentaport Inc." },
        { command: "eliza", description: "Talk to your AI assitant for content authenticity" },
        // { command: "lit", description: "Execute a Lit action" },
        { command: "verify", description: "Execute content verification actions, I am here to help you fight misattribution" },
      ]);
      // all command handlers can be registered here
      this.bot.command("start", (ctx) => ctx.reply("Hello!"));
      this.bot.catch(async (error) => {
        console.error("Telegram bot error:", error);
      });
      await this.elizaService.start();
      // required when starting server for telegram webooks
      this.nGrokService = await NgrokService.getInstance();
      try {
        // try starting the twitter service
        this.twitterService = await TwitterService.getInstance();
        await this.twitterService?.start();
        console.log(
          "Twitter Bot Profile:",
          JSON.stringify(this.twitterService.me, null, 2)
        );
      } catch (err) {
        console.log(
          "[WARN] [telegram.service] Unable to use twitter. Functionality will be disabled",
          err
        );
      }

      this.bot.command("lit", async (ctx) => {
        try {
          const action = ctx.match;
          console.log("action:", action);
          const actionHashes = JSON.parse(
            (
              await fs.readFileSync(
                resolve(
                  __dirname,
                  "..",
                  "..",
                  "..",
                  "lit-actions",
                  "actions",
                  `ipfs.json`
                )
              )
            ).toString()
          );
          console.log("actionHashes:", actionHashes);
          const actionHash = actionHashes[action];
          console.log("actionHash:", actionHash);
          if (!actionHash) {
            ctx.reply(`Action not found: ${action}`);
            return;
          }
          // ! NOTE: You can send any jsParams you want here, it depends on your Lit action code
          let jsParams;
          // ! NOTE: You can change the chainId to any chain you want to execute the action on
          const chainId = 8453;
          switch (action) {
            case "hello-action": {
              // ! NOTE: The message to sign can be any normal message, or raw TX
              // ! In order to sign EIP-191 message, you need to encode it properly, Lit protocol does raw signatures
              const messageToSign =
                ctx.from?.username ?? ctx.from?.first_name ?? "";
              const messageToSignDigest = keccak256(toUtf8Bytes(messageToSign));
              jsParams = {
                helloName: messageToSign,
                toSign: Array.from(getBytes(messageToSignDigest)),
              };
              break;
            }
            case "decrypt-action": {
              const toEncrypt = `encrypt-decrypt-test-${new Date().toUTCString()}`;
              ctx.reply(`Invoking encrypt action with ${toEncrypt}`);
              const { data } = await client.post(
                `/telegrambot/executeLitActionUsingPKP?chainId=${chainId}`,
                {
                  actionIpfs: actionHashes["encrypt-action"].IpfsHash,
                  actionJsParams: {
                    toEncrypt,
                  },
                }
              );
              console.log("encrypt response ", data);
              const { ciphertext, dataToEncryptHash } = JSON.parse(
                data.response.response
              );
              jsParams = {
                ciphertext,
                dataToEncryptHash,
                chain: "base",
              };
              break;
            }
            case "encrypt-action": {
              const message =
                ctx.from?.username ?? ctx.from?.first_name ?? "test data";
              jsParams = {
                toEncrypt: `${message}-${new Date().toUTCString()}`,
              };
              break;
            }
            default: {
              // they typed something random or a dev forgot to update this list
              ctx.reply(`Action not handled: ${action}`);
              return;
            }
          }
          await ctx.reply(
            "Executing action..." +
              `\n\nAction Hash: <code>${actionHash.IpfsHash}</code>\n\nParams:\n<pre lang="json"><code>${JSON.stringify(
                jsParams,
                htmlEscape,
                2
              )}</code></pre>`,
            {
              parse_mode: "HTML",
            }
          );
          console.log(
            `[telegram.service] executing lit action with hash ${actionHash.IpfsHash} on chain ${chainId}`
          );
          const { data } = await client.post(
            `/telegrambot/executeLitActionUsingPKP?chainId=${chainId}`,
            {
              actionIpfs: actionHash.IpfsHash,
              actionJsParams: jsParams,
            }
          );
          console.log(
            `Action with hash ${actionHash.IpfsHash} executed on Lit Nodes 🔥`
          );
          console.log("Result:", data);
          ctx.reply(
            `Action executed on Lit Nodes 🔥\n\n` +
              `Action: <code>${actionHash.IpfsHash}</code>\n` +
              `Result:\n<pre lang="json"><code>${JSON.stringify(
                data,
                null,
                2
              )}</code></pre>`,
            {
              parse_mode: "HTML",
            }
          );
        } catch (error) {
          if (isAxiosError(error)) {
            console.error(
              "Failed to execute Lit action:",
              error.response?.data
            );
            ctx.reply(
              "Failed to execute Lit action" +
                `\n\nError: <pre lang="json"><code>${JSON.stringify(
                  error.response?.data,
                  null,
                  2
                )}</code></pre>`,
              {
                parse_mode: "HTML",
              }
            );
          } else {
            console.error("Failed to execute Lit action:", error);
            ctx.reply(
              "Failed to execute Lit action" +
                `\n\nError: <pre lang="json"><code>${JSON.stringify(
                  error?.message,
                  null,
                  2
                )}</code></pre>`,
              {
                parse_mode: "HTML",
              }
            );
          }
        }
      });

       this.bot.on("message", async (ctx) => {
        const message = ctx.message;
        console.log(message)
        if (message.caption?.startsWith("/verify") || message.text?.startsWith("/verify")) {
          if (!message.photo) {
            await ctx.reply("Please send an image with the /verify command");
            return;
          }
      
        // Get highest resolution photo
        const photo = message.photo[message.photo.length - 1];
        const file = await ctx.api.getFile(photo.file_id);
        
        // Download the file
        const response = await fetch(`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`);
          console.log('response: ', response)
          await ctx.reply("Verifying image...");
      
          try {
            const verifyResult = await MentaportService.getInstance().verifyContent(
              response.url,
              `telegram_${message.message_id}`,
              'na' //`telegram_${ctx.from.id}`
            ) as any;
            // await ctx.reply(`Verification is progress: Verification Job ID ${verifyResult.data.verId}`, {
            //   parse_mode: "HTML"
            // });
            await ctx.reply(`Verification result: ${JSON.stringify(verifyResult)}`);
            console.log("verifyResult", verifyResult)
            if (verifyResult.status && verifyResult.data.status.status === "Certified") {
              const repService = await ReputationContractService.getInstance();
              console.log("Image is certified");
              // TODO: userId must be wallet address
              const user: CopyrightInfringementUser = {
                userId: ctx.from.id.toString(),
                platform: 'telegram',
                username: ctx.from.username as string,
                offenseCount: 0,
                postCount: 1,
              }

              const postHash = ethers.sha256(ethers.toUtf8Bytes(`${ctx.from.id}_${message.message_id}`));
              const recordId = ethers.uuidV4(postHash);

              const postToReport: ReportedPost = {
                recordId,
                contentHash: postHash,
                userId: ctx.from.id.toString(),
                postText: message.caption,
                postUrl: `https://t.me/${ctx.from.username}/${message.message_id}`,
                timestamp: new Date().getTime(),
                reportedTimestamp: new Date().getTime(),
              }

              const infringementRes = await repService.addInfringement(user, postToReport);

              if (infringementRes) {
                // const { userId, reputationScore, post } = infringementRes;
                // TODO: Mariale, change this response if needed?
                await ctx.reply(`Image is certified and reported to the reputation service.`);
              } else {
                await ctx.reply(`Image is certified but failed we couldn't come up with a good reputation score at the moment.`);
              }
            }

          } catch (error) {
            await ctx.reply(`Error: ${error.message}`);
          }
        }

        if (message.caption?.startsWith("/mint") || message.text?.startsWith("/mint")) {
          if (!message.photo) {
            await ctx.reply("Please send an image with the /mint command");
            return;
          }
       
          try {
            // Get certificate params from user
            // const params = await this.getCertificateParams(ctx);

            // Process image
            const photo = message.photo[message.photo.length - 1];
            const file = await ctx.api.getFile(photo.file_id);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
            
            const fileExtension = fileUrl.split('.').pop() || '';
            console.log('fileUrl',fileUrl)
            // TODO: username must be wallet address
            const params: CertificateParams = {
              contentFormat: fileExtension,
              name: 'FunkyMint',
              username: message.from.username as string,
              description: 'Minting just minting, why not',
              aiTrainingMiningInfo: 'not_allowed',
              usingAI: false
            };
            console.log('create certificate response ..')

            await ctx.reply(`Thanks for using my service, your certificate minting is in progress ...`);
            // Create certificate
            const certificate = await MentaportService.getInstance().createCertificate(fileUrl, params) as any;
            console.log(certificate)
            if(certificate.status) {
              const downloadData = certificate.data.downloadData;
              const approved = certificate.data.approved;
              // Download image
              const imageResponse = await fetch(downloadData.data);
              const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
              // Send telegram
              await ctx.api.sendPhoto(ctx.chat.id, new InputFile(imageBuffer), {
                caption: `Congratulations! Certificate created and approved.\nCertificate ID: ${approved.data.certId}\nTransaction: ${approved.data.txnHash}\nToken ID: ${approved.data.tokenId}\nContract: ${approved.data.contractAddress}\nMetadata: ${approved.data.metadataUri}`
               });
            }
            else {
              await ctx.reply(`Certificate creation failed: ${certificate.status}. `);
            }
            
          } catch (error) {
            console.error('error in mint certificate: ',error);
            await ctx.reply(`Error: ${error.message}`);
          }
        }

      });
    } catch (error) {
      console.error("Failed to start Telegram bot:", error);
      throw error;
    }
  }

  private async awaitResponse(ctx: any): Promise<string> {
    console.log(ctx)
    return new Promise((resolve) => {
      const listener = (ctx: any) => {
        // this.bot.off("message", listener);
        resolve(ctx.message.text);
      };
      this.bot.on("message", listener);
    });
   }


public async getCertificateParams(ctx: any): Promise<CertificateParams> {
  const params: Partial<CertificateParams> = {};
  
  await ctx.reply("Please enter certificate name:");
  params.name = await this.awaitResponse(ctx);
 
  await ctx.reply("Please enter description:");
  params.description = await this.awaitResponse(ctx);
 
  await ctx.reply("AI training/mining info (allow/not_allowed):");
  params.aiTrainingMiningInfo = await this.awaitResponse(ctx);
 
  await ctx.reply("Was AI used to create this image? (yes/no):");
  const aiResponse = await this.awaitResponse(ctx);
  params.usingAI = aiResponse.toLowerCase() === 'yes';
 
  if (!params.usingAI) {
    await ctx.reply("Enter AI software used (or 'none'):");
    params.aiSoftware = await this.awaitResponse(ctx);
 
    await ctx.reply("Enter AI model used (or 'none'):");
    params.aiModel = await this.awaitResponse(ctx);
  }
 
  return params as CertificateParams;
 }

  public getBotInfo() {
    return this.bot.api.getMe();
  }

  public async stop(): Promise<void> {
    try {
      await this.bot.api.deleteWebhook();
    } catch (error) {
      console.error("Error stopping Telegram bot:", error);
    }
  }
}
