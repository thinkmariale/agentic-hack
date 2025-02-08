import { BaseService } from "./base.service.js";
import { Profile, Scraper, SearchMode, Tweet } from "agent-twitter-client";
import fs from "fs/promises";
import { join, dirname } from "path";
import { CertificateParams, createCertificate, pollVerificationStatus, VerificationResult, verifyContent } from "../utils.js";
import { getCollablandApiUrl } from "../utils.js";
import { IAccountInfo } from "../types.js";
import axios, { AxiosError } from "axios";

const __dirname = dirname(new URL(import.meta.url).pathname);
const twitterCookiesPath = join(
  __dirname,
  "..",
  "..",
  "..",
  "twitter-cookies.json"
);

export class TwitterService extends BaseService {
  private static instance: TwitterService;
  private scraper: Scraper | null = null;
  private isConnected: boolean = false;
  public me: Profile | undefined = undefined;
  private latestTweetId: string | null = null;
  public pollInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): TwitterService {
    if (!TwitterService.instance) {
      TwitterService.instance = new TwitterService();
    }
    return TwitterService.instance;
  }

  public async start(): Promise<void> {
    try {
      console.log("[TwitterService] Starting service...");
      if (!(await fs.stat(twitterCookiesPath).catch(() => false))) {
        throw new Error(
          "Twitter cookies not found. Please run the `pnpm login-x` script first."
        );
      }
      console.log(
        "[TwitterService] Loading Twitter cookies from:",
        twitterCookiesPath
      );
      const cookieJson = await fs.readFile(twitterCookiesPath, "utf-8");
      const cookiesJSON = JSON.parse(cookieJson);
      this.scraper = new Scraper();
      await this.scraper.setCookies(cookiesJSON.cookies);
      console.log("[TwitterService] Starting service with existing cookies...");
      const connected = await this.scraper.isLoggedIn();
      if (!connected) {
        throw new Error("Failed to login with existing cookies.");
      }
      this.me = await this.scraper.me();
      this.isConnected = true;
      await this.startPolling();
    } catch (error) {
      console.error("[TwitterService] Error:", error);
      throw new Error(
        "Twitter cookies not found. Please run the `pnpm letsgo` script first."
      );
    }
  }

  private async pollMentionListener() {
    if (!this.scraper) throw new Error("Twitter service not started");
    console.log("waiting for X mentions ... ");

    // Set up tweet stream for mentions
    console.log(`#${this.me?.username}`);
    const tweetStream = await this.scraper.searchTweets(
      `#ipdefenderagent`,
      10,
      SearchMode.Latest
    );

    for await (let tweet of tweetStream) {
      console.log("single tweet");
      console.log(tweet);
      if (this.latestTweetId && tweet.id && tweet.id <= this.latestTweetId) continue;
      this.latestTweetId = tweet.id as string;
      console.log("get tweet by Id");
      if (tweet.text?.toLowerCase().includes("verify")) {

        if (tweet.inReplyToStatusId) {
          tweet = (await this.getTweetById(tweet.inReplyToStatusId)) as Tweet;
        }
        if (tweet.photos.length > 0) {
          console.log(tweet.photos);
          const userWalletAddress = await this.getTwitterUserIdWalletAddress(
            tweet.userId as string
          );
          const verifyResult = await verifyContent(
            tweet.photos[0].url,
            tweet.permanentUrl || "",
            userWalletAddress.account || "na"
          ) as VerificationResult;

          console.log("verify call result: ", verifyResult);

          const finalStatus = await pollVerificationStatus(verifyResult.data.verId);

          console.log("send tweet");
          try {
            let tweetReply = '';
            if(finalStatus && finalStatus === 'Certified') {
              tweetReply = `Certificate found and you can view the ceritifcate transaction at ${finalStatus.data.certificate.txnHash}`
            } else {
              tweetReply = `No certificate found and contetn can't be verified`
            }
            const res = await this.scraper.sendTweet(
              `Here is the verification result. ${tweetReply}`,
              tweet.id
            );
            console.log(res);
          } catch (err) {
            console.log(err);
          }
        }
      }
      if (tweet.text?.toLowerCase().includes("mint") && tweet.photos.length > 0) {
        try {
          const fileExtension = tweet.photos[0].url.split('.').pop() || '';
          
          const params: CertificateParams = {
            projectId: process.env.PROJECT_ID!,
            contentFormat: fileExtension,
            name: `Twitter Certificate - ${tweet.userId}`,
            username: tweet.username || 'twitter_user',
            description: tweet.text || 'Certificate created from Twitter',
            aiTrainingMiningInfo: 'not_allowed',
            usingAI: false
          };
   
          const certificate = await createCertificate(tweet.photos[0].url, params) as any;
          
          await this.scraper.sendTweet(
            `Starting certificate creation. Certificate ID: ${certificate.data.certId}`,
            tweet.id
          );
   
          let status;
          do {
            const statusResponse = await fetch(
              `${process.env.VERIFY_API_URL}/certificates/status?projectId=${process.env.PROJECT_ID}&certId=${certificate.data.certId}`,
              { headers: { 'x-api-key': process.env.CERT_API_KEY! } }
            );
            status = await statusResponse.json() as any;
            await new Promise(r => setTimeout(r, 3000));
          } while (status.data.status.status === 'Processing');
   
          if (status.data.status.status === 'Pending') {
            const approveResponse = await fetch(
              `${process.env.VERIFY_API_URL}/certificates/approve?projectId=${process.env.PROJECT_ID}&certId=${certificate.data.certId}&approved=true`,
              {
                method: 'POST',
                headers: { 'x-api-key': process.env.CERT_API_KEY! }
              }
            );
            const approved = await approveResponse.json() as any;

            const downloadResponse = await fetch(
              `${process.env.VERIFY_API_URL}/download?projectId=${process.env.PROJECT_ID}&certId=${certificate.data.certId}`,
              {
                headers: { 'x-api-key': process.env.CERT_API_KEY! }
              }
            );
            const downloadData = await downloadResponse.json() as any;
         
            // Download image
            const imageResponse = await fetch(downloadData.data);
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            
            await this.scraper.sendTweet(
              `Certificate created and approved!\nTransaction: ${approved.data.txnHash}\nToken ID: ${approved.data.tokenId}\nContract: ${approved.data.contractAddress}\nMetadata: ${approved.data.metadataUri}`,
              tweet.id,
              [{ data: imageBuffer, mediaType: 'image/jpg' }]
            );
          }
        } catch (error) {
          await this.scraper.sendTweet(`Error creating certificate: ${error.message}`, tweet.id);
        }
      }
    }
  }

  private startPolling(intervalMs: number = 30000) {
    this.pollInterval = setInterval(
      () => this.pollMentionListener(),
      intervalMs
    );
  }

  public async getTweetById(tweetId: string): Promise<Tweet | null> {
    if (!this.scraper) throw new Error("Twitter service not started");

    try {
      const tweet = await this.scraper.getTweet(tweetId);
      return tweet;
    } catch (error) {
      console.error(`[TwitterService] Error getting tweet ${tweetId}:`, error);
      return null;
    }
  }

  public async stop(): Promise<void> {
    if (this.isConnected && this.scraper) {
      await this.scraper.clearCookies();
      this.isConnected = false;
    }
  }

  public getScraper(): Scraper {
    if (!this.scraper) {
      throw new Error("Twitter service not started");
    }
    return this.scraper;
  }

  public async getTwitterUserIdWalletAddress(userId: string) {
    try {
      console.log("Getting account address for Twitter User ID:", userId);
      if (!userId) {
        throw new Error("No user id provided");
      }
      const v2ApiUrl = getCollablandApiUrl().replace("v1", "v2");
      // This AccountKit API returns counterfactually calculated smart account addresses for a GitHub/Twitter user
      const { data } = await axios.post<IAccountInfo>(
        `${v2ApiUrl}/evm/calculateAccountAddress`,
        {
          platform: "twitter",
          userId: userId,
        },
        {
          headers: {
            "X-API-KEY": process.env.COLLABLAND_API_KEY!,
          },
        }
      );
      console.log(
        "[Twitter Success] Account address for Twitter User ID:",
        userId,
        data
      );
      // We need base smart account addresses for Wow.XYZ
      const accountAddress = data.evm.find(
        (account) => account.chainId === 8453
      )?.address;
      return {
        success: true,
        account: accountAddress,
      };
    } catch (error) {
      console.error("[Twitter Success] Error:", error);
      if (error instanceof AxiosError) {
        console.error("[Twitter Success] Response:", error.response?.data);
      }
      return {
        success: false,
        error: "Failed to fetch profile information",
      };
    }
  }
}
