
import { ethers, Wallet } from "ethers";
import { ReputationAgent__factory, ReportedPost, CopyrightInfringementUser } from "../contracts/types/index.js";
import { AddInfringementReponse } from "src/contracts/types/ReputationAgent.js";
import { ReputationAlgorithmService } from "./reputationAlgorithm.service.js";
import { OffenseContextScore } from "src/contracts/types/ReputationAlgorithm.js";

export class ReputationContractService {
  private static instance: ReputationContractService;
  private signer: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  private constructor() {
    const url = 'http://127.0.0.1:8545/';
    const wallet = new Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e");
    this.signer = wallet.connect(new ethers.JsonRpcProvider(url));

    this.contract = ReputationAgent__factory.connect(this.signer);
  }

  private async updateUserPostSeverityScores(userId: string): Promise<void> {
    const posts = await this.getUsersPosts(userId);
    const algorithmService = ReputationAlgorithmService.getInstance();

    // update the severity score for each post that does not already have one
    const missingSeverityScorePosts = posts.filter(post => post.severityScore === undefined);
    for (const post of missingSeverityScorePosts) {
      const res = await algorithmService.generatePostSeverityScore(post);
      if (!res) {
        continue;
      }

      const { context, explanation } = res;
      const severityScore = OffenseContextScore[context];

      await this.updateReportedPost(post.recordId, severityScore, context, explanation);
    }
  }

  private async generateUserReputationScore(userId: string): Promise<{ score: number, posts: ReportedPost[] } | null> {
    const algorithmService = ReputationAlgorithmService.getInstance();
    const user = await this.getCopyrightInfringementUser(userId);
    if (!user) {
      return null;
    }

    const posts = await this.getUsersPosts(userId);
    const score = algorithmService.generateUserOverallReputationScore(posts);
    return { score, posts };
  }

  public static getInstance(): ReputationContractService {
    if (!ReputationContractService.instance) {
      ReputationContractService.instance = new ReputationContractService();
    }
    return ReputationContractService.instance;
  }

  public async addInfringement(infringeUser: CopyrightInfringementUser, post: ReportedPost, offender: boolean): Promise<AddInfringementReponse | null> {
    try {
      if (!this.contract) {
        return null;
      }

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

      const result = await this.contract.AddInfringement(infringeUser, post, offender);
      await this.updateUserPostSeverityScores(infringeUser.userId);
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
      const result = await this.contract.UpdateInfringement(userId, reputationScore, fistOffenseTimestamp, lastOffenseTimestamp, postCount, offenseCount);
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
      const result: ReportedPost = await this.contract.GetReputationScore(contentHash);
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
      // const contract = new ethers.Contract(
      //   "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      //   [
      //     "function GetReputationScore(address user) public view returns (uint256)",
      //   ],
      //   this.signer
      // );
      const score = await this.contract.GetReputationScore(userId);
      return score.toNumber();

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