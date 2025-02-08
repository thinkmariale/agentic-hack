import { Bot, webhookCallback } from "grammy";
import { BaseService } from "./base.service.js";
import { ElizaService } from "./eliza.service.js";
import {
  AnyType,
  CertificateParams,
  createCertificate,
  getCollablandApiUrl,
  getTokenMetadataPath,
  MintResponse,
  pollVerificationStatus,
  TokenMetadata,
  VerificationResult,
  verifyContent,
} from "../utils.js";
import fs from "fs";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { parse as jsoncParse } from "jsonc-parser";
import path, { resolve } from "path";
import { keccak256, getBytes, toUtf8Bytes } from "ethers";
import { TwitterService } from "./twitter.service.js";
import { NgrokService } from "./ngrok.service.js";

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
  private nGrokService: NgrokService;
  private twitterService?: TwitterService;

  private constructor(webhookUrl?: string) {
    super();
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    if (webhookUrl != null) {
      this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    }
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
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

      this.bot.command("mint", async (ctx) => {
        try {
          ctx.reply("Minting your token...");
          const tokenPath = getTokenMetadataPath();
          const tokenInfo = jsoncParse(
            fs.readFileSync(tokenPath, "utf8")
          ) as TokenMetadata;
          console.log("TokenInfoToMint", tokenInfo);
          console.log("Hitting Collab.Land APIs to mint token...");
          const { data: _tokenData } = await client.post<
            AnyType,
            AxiosResponse<MintResponse>
          >(`/telegrambot/evm/mint?chainId=8453`, {
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            metadata: {
              description: tokenInfo.description ?? "",
              website_link: tokenInfo.websiteLink ?? "",
              twitter: tokenInfo.twitter ?? "",
              discord: tokenInfo.discord ?? "",
              telegram: tokenInfo.telegram ?? "",
              media: tokenInfo.image ?? "",
              nsfw: tokenInfo.nsfw ?? false,
            },
          });
          console.log("Mint response from Collab.Land:");
          console.dir(_tokenData, { depth: null });
          const tokenData = _tokenData.response.contract.fungible;
          await ctx.reply(
            `Your token has been minted on wow.xyz 🥳
Token details:
<pre><code class="language-json">${JSON.stringify(tokenData, null, 2)}</code></pre>

You can view the token page below (it takes a few minutes to be visible)`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "View Wow.xyz Token Page",
                      url: `https://wow.xyz/${tokenData.address}`,
                    },
                  ],
                ],
              },
              parse_mode: "HTML",
            }
          );
          if (this.twitterService) {
            const twitterBotInfo = this.twitterService.me;
            const twitterClient = this.twitterService.getScraper();
            const ngrokURL = this.nGrokService.getUrl();
            await ctx.reply(
              `🐦 Posting a tweet about the new token...\n\n` +
                `Twitter account details:\n<pre lang="json"><code>${JSON.stringify(
                  twitterBotInfo,
                  null,
                  2
                )}</code></pre>`,
              {
                parse_mode: "HTML",
              }
            );
            const claimURL = `${process.env.NEXT_PUBLIC_HOSTNAME}/claim/${tokenData.address}`;
            const botUsername = twitterBotInfo?.username;
            console.log("botUsername:", botUsername);
            console.log("claimURL:", claimURL);
            const slug =
              Buffer.from(claimURL).toString("base64url") +
              ":" +
              Buffer.from(botUsername!).toString("base64url");
            console.log("slug:", slug);
            const cardURL = `${ngrokURL}/auth/twitter/card/${slug}/index.html`;
            console.log("cardURL:", cardURL);
            const twtRes = await twitterClient.sendTweet(
              `I just minted a token on Base using Wow!\nThe ticker is $${tokenData.symbol}\nClaim early alpha here: ${cardURL}`
            );
            if (twtRes.ok) {
              const tweetId = (await twtRes.json()) as AnyType;
              console.log("Tweet posted successfully:", tweetId);
              const tweetURL = `https://twitter.com/${twitterBotInfo?.username}/status/${tweetId?.data?.create_tweet?.tweet_results?.result?.rest_id}`;
              console.log("Tweet URL:", tweetURL);
              await ctx.reply(
                `Tweet posted successfully!\n\n` +
                  `🎉 Tweet details: ${tweetURL}`,
                {
                  parse_mode: "HTML",
                }
              );
            } else {
              console.error("Failed to post tweet:", await twtRes.json());
              await ctx.reply("Failed to post tweet");
            }
          }
        } catch (error) {
          if (isAxiosError(error)) {
            console.error("Failed to mint token:", error.response?.data);
          } else {
            console.error("Failed to mint token:", error);
          }
          ctx.reply("Failed to mint token");
        }
      });
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
            const verifyResult = await verifyContent(
              response.url,
              `telegram_${message.message_id}`,
              'na' //`telegram_${ctx.from.id}`
            ) as VerificationResult;
            await ctx.reply(`Verification is progress: Verification Job ID ${verifyResult.data.verId}`, {
              parse_mode: "HTML"
            });
            const status = await pollVerificationStatus(verifyResult.data.verId);
            await ctx.reply(`Verification result: ${JSON.stringify(status)}`);
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

            const params: CertificateParams = {
              projectId: process.env.PROJECT_ID!,
              contentFormat: fileExtension,
              name: 'Test',
              username: message.from.username as string,
              description: 'Test 1',
              aiTrainingMiningInfo: 'not_allowed',
              usingAI: false
            };

            // Create certificate
            const certificate = await createCertificate(fileUrl, params) as any;

            console.log('create certificate response ..')
       
            console.log(certificate)
            await ctx.reply(`Thanks for using my service, your certifctae minting is in progress ...`);
            // Poll status
            let status;
            do {
              const statusResponse = await fetch(`${process.env.VERIFY_API_URL}/certificates/status?projectId=${process.env.PROJECT_ID}&certId=${certificate.data.certId}`, {
                headers: { 'x-api-key': process.env.CERT_API_KEY! }
              });
              status = await statusResponse.json() as any;
              console.log('check certificate upload status ..', status)

              await new Promise(r => setTimeout(r, 3000));
            } while (status.data.status.status === 'Processing' || status.data.status.status === 'Initiating');
       
            // Approve certificate
            if (status.data.status.status === 'Pending') {
              await ctx.reply(`We are one step away from finalizing your certifcate minting, stay connected ...`);

              const approveResponse = await fetch(`${process.env.VERIFY_API_URL}/certificates/approve?projectId=${process.env.PROJECT_ID}&certId=${certificate.data.certId}&approved=true`, {
                method: 'POST',
                headers: { 'x-api-key': process.env.CERT_API_KEY! }
              }) as any;
              const approved = await approveResponse.json();
              console.log('check certificate approve status ..', approved)
              await ctx.reply(`Congratulations! Certificate created and approved. Your certificate ID: ${approved.data.certId}. Find your certificate on-chain minted on Base chain in transaction: ${approved.data.txnHash}, and token Id (${approved.data.tokenId}) on this contract address (${approved.data.contractAddress}). If you want to check the certificate NFT metadata check the IPFS link here ${approved.data.metadataUri}`);
            } else {
              await ctx.reply(`Certificate creation failed: ${status.status}. `);
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
