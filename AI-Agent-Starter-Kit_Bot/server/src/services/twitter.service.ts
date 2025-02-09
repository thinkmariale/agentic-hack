import { BaseService } from "./base.service.js";
import { Profile, Scraper, SearchMode, Tweet } from "agent-twitter-client";
import fs from "fs/promises";
import { join, dirname } from "path";
// import { CertificateParams, createCertificate, pollVerificationStatus, VerificationResult, verifyContent } from "../utils.js";

import { MentaportService, CertificateParams } from "./mentaport.service.js";
import {  stringToAddress } from "../utils.js";
import { ReputationContractService } from "./reputationContract.service.js";
import { CopyrightInfringementUser, ReportedPost } from "src/contracts/types/ReputationAgent.js";
import { ethers } from "ethers";

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
    const repService = ReputationContractService.getInstance();
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
    //  console.log(tweet);
      if (this.latestTweetId && tweet.id && tweet.id <= this.latestTweetId) continue;
      this.latestTweetId = tweet.id as string;
      console.log("get tweet by Id");
      if (tweet.text?.toLowerCase().includes("verify")) {

        if (tweet.inReplyToStatusId) {
          tweet = (await this.getTweetById(tweet.inReplyToStatusId)) as Tweet;
        }
        if (tweet.photos.length > 0) {
          console.log(tweet.photos);
          const userWalletAddress = stringToAddress( tweet.userId as string);
          // await getUserIdWalletAddress(
          //   tweet.userId as string,
          //   "twitter"
          // );
          const verifyResult = await MentaportService.getInstance().verifyContent(
            tweet.photos[0].url,
            tweet.permanentUrl || "https://ipdefender.chat.mentaport.com",
            userWalletAddress.account || "na"
          );

          if(!verifyResult.status) {
          }
          const finalStatus = verifyResult.data.status;
          console.log("send tweet");
          console.log(verifyResult)
          try {
            let tweetReply = '';
            if( finalStatus.status === 'Certified') {
              tweetReply = `Certificate found and you can view the ceritifcate transaction at ${verifyResult.data.verId}`
              const { text, permanentUrl, username, timestamp } = tweet;
              const currTime = new Date().getTime();
              const contentStr = `${text || ""}${permanentUrl}${username}twitter`;
              const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentStr));
              // const contentHash = ethers.sha256((text || "") + permanentUrl + username + "twitter");
              const recordId = ethers.uuidV4(contentHash);
             // TODO: userId must be wallet address
              // create new user and new post
              const user: CopyrightInfringementUser = {
                userId: userWalletAddress.account as string,
                platform: "twitter",
                username: username!,
                offenseCount: 0,
                postCount: 1,
                firstOffenseTimestamp: undefined,
                lastOffenseTimestamp: undefined,
                reputationScore: undefined
              }
              const post: ReportedPost = {
                recordId: recordId,
                userId: userWalletAddress.account as string,
                contentHash: contentHash,
                postText: text,
                postUrl: permanentUrl,
                timestamp: timestamp || currTime,
                // reportedTimestamp: currTime,
                severityScore: undefined,
                derivedContext: undefined,
                derivedContextExplanation: undefined
              }

              let res = await repService.addInfringement(user, post);
              if(!res) {
                tweetReply = `No certificate found and contetn can't be verified`
              } else {
                res.reputationScore = res.reputationScore.toString() as string;
                console.log('infringe res ', res)
                // turn this into natural text.
                tweetReply = JSON.stringify(res);
              }
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
          
          // TODO: tweet.username must be wallet address
          const params: CertificateParams = {
            contentFormat: fileExtension,
            name: `Twitter Certificate - ${tweet.userId}`,
            username: tweet.username || 'twitter_user',
            description: tweet.text || 'Certificate created from Twitter',
            aiTrainingMiningInfo: 'not_allowed',
            usingAI: false
          };
   
          const certificate = await MentaportService.getInstance().createCertificate(tweet.photos[0].url, params) as any;
          if(certificate.status) {
            const downloadData = certificate.data.downloadData;
            const approved = certificate.data.approved;
            // Download image
            const imageResponse = await fetch(downloadData.data);
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            // Send tweet
            await this.scraper.sendTweet(
              `Certificate created and approved!\nTransaction: ${approved.data.txnHash}\nToken ID: ${approved.data.tokenId}\nContract: ${approved.data.contractAddress}\nMetadata: ${approved.data.metadataUri}`,
              tweet.id,
              [{ data: imageBuffer, mediaType: 'image/jpg' }]
            );
          }
          else {
            console.log(certificate.message);
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

  // public async getTwitterUserIdWalletAddress(userId: string) {
  //   try {
  //     console.log("Getting account address for Twitter User ID:", userId);
  //     if (!userId) {
  //       throw new Error("No user id provided");
  //     }
  //     const v2ApiUrl = getCollablandApiUrl().replace("v1", "v2");
  //     // This AccountKit API returns counterfactually calculated smart account addresses for a GitHub/Twitter user
  //     const { data } = await axios.post<IAccountInfo>(
  //       `${v2ApiUrl}/evm/calculateAccountAddress`,
  //       {
  //         platform: "twitter",
  //         userId: userId,
  //       },
  //       {
  //         headers: {
  //           "X-API-KEY": process.env.COLLABLAND_API_KEY!,
  //         },
  //       }
  //     );
  //     console.log(
  //       "[Twitter Success] Account address for Twitter User ID:",
  //       userId,
  //       data
  //     );
  //     // We need base smart account addresses for Wow.XYZ
  //     const accountAddress = data.evm.find(
  //       (account) => account.chainId === 8453
  //     )?.address;
  //     return {
  //       success: true,
  //       account: accountAddress,
  //     };
  //   } catch (error) {
  //     console.error("[Twitter Success] Error:", error);
  //     if (error instanceof AxiosError) {
  //       console.error("[Twitter Success] Response:", error.response?.data);
  //     }
  //     return {
  //       success: false,
  //       error: "Failed to fetch profile information",
  //     };
  //   }
  // }
}
