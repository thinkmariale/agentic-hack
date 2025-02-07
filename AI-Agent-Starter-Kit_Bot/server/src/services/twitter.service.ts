import { BaseService } from "./base.service.js";
import { Profile, Scraper, SearchMode, Tweet } from "agent-twitter-client";
import fs from "fs/promises";
import { join, dirname } from "path";
import { pollVerificationStatus, verifyContent } from "../utils.js";
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

interface VerificationResult {
  status: boolean;
  message: string;
  data: {
    verId: string;
  };
}

export class TwitterService extends BaseService {
  private static instance: TwitterService;
  private scraper: Scraper | null = null;
  private isConnected: boolean = false;
  public me: Profile | undefined = undefined;
  // private latestTweetId: string | null = null;
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

    // const results = await this.scraper.fetchSearchTweets(`#mentaportxapp`, 20, SearchMode.Top);

    // console.log('search tweet results', results)
    // Set up tweet stream for mentions
    console.log(`@${this.me?.username}`);
    const tweetStream = await this.scraper.searchTweets(
      `#mentaportxapp`,
      10,
      SearchMode.Latest
    );

    for await (let tweet of tweetStream) {
      console.log("single tweet");
      console.log(tweet);

      console.log("get tweet by Id");
      if (tweet.text?.toLowerCase().includes("mint")) {
        try {
          // const [_, recipient, amount] = tweet.text.split(' ');
          // const tx = await contract.mint(recipient, amount);
          await this.scraper.sendTweet(`Minted tokens to . TX: `, tweet.id);
        } catch (error) {
          await this.scraper.sendTweet(
            `Error minting: ${error.message}`,
            tweet.id
          );
        }
      }
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
    }
  }

  private startPolling(intervalMs: number = 15000) {
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
