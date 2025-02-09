import { BaseService } from "./base.service.js";

import { ethers, Wallet } from "ethers";
import { ReputationAgent__factory, ReportedPost, CopyrightInfringementUser } from "../contracts/types/index.js";
import { AddInfringementReponse, OffenseContext } from "../contracts/types/ReputationAgent.js";
import { ReputationAlgorithmService } from "./reputationAlgorithm.service.js";
import { OffenseContextScore } from "../contracts/types/ReputationAlgorithm.js";

export class ReputationContractService extends BaseService{
  private static instance: ReputationContractService;
  private signer: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  private constructor() {
    super();
    // const RPC_URL = 'http://127.0.0.1:8545/';
    const RPC_URL=process.env.RPC_URL ?? "http://127.0.0.1:8545/";
    const wallet = new Wallet(process.env.WALLET_KEY!);
    this.signer = wallet.connect(new ethers.JsonRpcProvider(RPC_URL));
    this.contract = ReputationAgent__factory.connect(this.signer);
  }
  public static getInstance(): ReputationContractService {
    if (!ReputationContractService.instance) {
      ReputationContractService.instance = new ReputationContractService();
    }
    return ReputationContractService.instance;
  }
  
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  
  private async generatePostSeverityScore(post: ReportedPost): Promise<{ severityScore: number, context: OffenseContext, explanation: string }> {
    const algorithmService = ReputationAlgorithmService.getInstance();
    const res = await algorithmService.generatePostSeverityScore(post);

    if (!res) 
      return {
        severityScore: 0,
        context: "unknown",
        explanation: 'We were unable to determine the context of the offense.',
      }

      const { context, explanation } = res;
      const severityScore = OffenseContextScore[context];
      return { severityScore, context, explanation };
  }

  private async generateUserReputationScore(userId: string): Promise<{ score: number, posts: ReportedPost[] }> {
    const algorithmService = ReputationAlgorithmService.getInstance();
    const user = await this.getCopyrightInfringementUser(userId);
    if (!user) {
      return { score: 0, posts: [] };
    }

    const posts = await this.getUsersPosts(userId);
    const score = algorithmService.generateUserOverallReputationScore(posts);
    return { score, posts };
  }


  public async addInfringement(infringeUser: CopyrightInfringementUser, post: ReportedPost): Promise<AddInfringementReponse | null> {
    try {
      if (!this.contract) {
        return null;
      }
      console.log('[addInfringement]')
      console.log(infringeUser)
      console.log(post)
      post.recordId = 1
      const existingPost = await this.getReportedPost(post.contentHash);
      if (existingPost) {
        // no need to recalculate the context. return the existing reputation score;
        const existingUser = await this.getCopyrightInfringementUser(infringeUser.userId);
        if (existingUser) {
          const response: AddInfringementReponse = {
            userId: existingUser.userId,
            reputationScore: existingUser.reputationScore!,
            post: {
              offenseContext: existingPost.derivedContext!,
              offenseContextExplanation: existingPost.derivedContextExplanation!,
            }
          }

          return response;
        }
        return null;
      }

      const derivedContextRes = await this.generatePostSeverityScore(post);
      const { severityScore, context, explanation } = derivedContextRes;
      post.severityScore = severityScore;
      post.derivedContext = context;
      post.derivedContextExplanation = explanation;
      const result = await this.contract.AddInfringement(infringeUser, post);
      const scoreRes = await this.generateUserReputationScore(infringeUser.userId);
      if (!scoreRes) {
        return null;
      }
      const { score: reputationScore, posts: refreshedPosts } = scoreRes;
      const infringingPosts = refreshedPosts.filter(post => post.severityScore !== undefined || post.severityScore !== 0).sort((a, b) => a.timestamp - b.timestamp);
      const refreshedPost = refreshedPosts.find(p => p.contentHash === post.contentHash);
      const isFirstOffense = !infringeUser.firstOffenseTimestamp && infringingPosts.length === 1;

      const firstOffenseTimestamp = (isFirstOffense ? post.timestamp : infringeUser.firstOffenseTimestamp)!;
      const lastOffenseTimestamp = infringingPosts[infringingPosts.length - 1].timestamp;
      if (reputationScore) {
        // update the user
        await this.updateCopyrightInfringementUser(
          infringeUser.userId, 
          reputationScore, 
          firstOffenseTimestamp, 
          lastOffenseTimestamp,
          refreshedPosts.length, 
          infringingPosts.length);
      }

      console.log(result)
      const res: AddInfringementReponse = {
        userId: result.userId,
        reputationScore: result.reputationScore,
        post: {
          offenseContext: refreshedPost?.derivedContext!,
          offenseContextExplanation: refreshedPost?.derivedContextExplanation!,
        }
      }
      return res;
    } catch (error) {
      console.log("Error (addInfringement):", error);
      return null;
    }
  }

  public async updateReportedPost(recordId: string, severityScore: number, derivedContext: string, derivedContextExplanatio: string): Promise<boolean> {
    try {
      if (!this.contract) {
        return false;
      }
      const result = await this.contract.UpdatePost(recordId, severityScore, derivedContext, derivedContextExplanatio);
      console.log(result)
      return true
    } catch (error) {
      console.log("Error (updateReportedPost):", error);
      return false;
    }
  }

  public async updateCopyrightInfringementUser(userId: string, reputationScore: number, fistOffenseTimestamp: number, lastOffenseTimestamp: number, postCount?: number, offenseCount?: number): Promise<boolean> {
    try {
      if (!this.contract) {
        return false;
      }
      const result = await this.contract.UpdateCopyrightInfringementUser(userId,reputationScore, fistOffenseTimestamp, lastOffenseTimestamp, postCount, offenseCount);
      console.log(result)
      return true
    } catch (error) {
      console.log("Error (updateCopyrightInfringementUser):", error);
      return false;
    }
  }
  public async getReportedPost(contentHash: string): Promise<ReportedPost | null> {
    try {
      if (!this.contract) {
        return null;
      }
      const result: ReportedPost = await this.contract.GetReportedPost(contentHash);
      console.log(result)
      if (result.contentHash == '') {
        return null
      }
      return result;
    } catch (error) {
      console.log("Error (getIsReportedPost):", error);
      return null;
    }
  }
  public async getCopyrightInfringementUser(userId: string): Promise<CopyrightInfringementUser | null> {
    try {
      if (!this.contract) {
        return null;
      }
      const result: CopyrightInfringementUser = await this.contract.GetUsers(userId);
      console.log(result)
      if (result.postCount == 0) {
        return null
      }
      return result
    } catch (error) {
      console.log("Error (addInfringement):", error);
      return null;
    }
  }

  public async getReputationScore(userId: string): Promise<number> {
    try {
      if (!this.contract) {
        return -1;
      }
      const score = await this.contract.GetReputationScore(userId);
      return score
   
    } catch (error) {
      console.log("Error (getReputationScore):", error);
      return -1;
    }
  }
  public async getUsersPosts(userId: string): Promise<ReportedPost[]> {
    try {
      if (!this.contract) {
        return [];
      }
      const result = await this.contract.GetPosts(userId);
      return result;

    } catch (error) {
      console.log("Error (getUsersPosts):", error);
      return [];
    }
  }


}