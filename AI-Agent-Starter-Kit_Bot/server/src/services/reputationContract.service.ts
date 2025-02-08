
import { ethers,Wallet } from "ethers";
import { ReputationAgent__factory,ReportedPost, CopyrightInfringementUser} from "../contracts/types/index.js";


export class ReputationContractService {
  private static instance: ReputationContractService;
  private signer: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  private constructor() {
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

  public async addInfringement(infringeUser: CopyrightInfringementUser, post:ReportedPost): Promise<boolean> {
    try {
      if(!this.contract){
        return false;
      }
      console.log("infringeUser",infringeUser)
      const result = await this.contract.AddInfringement(infringeUser,post );
      console.log(result)
      return true
    } catch (error) {
      console.log("Error (addInfringement):", error);
      return false;
    }
  }

  public async updateReportedPost(recordId:string, severityScore:number, derivedContext:string, derivedContextExplanatio:string): Promise<boolean> {
    try {
      if(!this.contract){
        return false;
      }
      const result = await this.contract.UpdatePost(recordId,severityScore, derivedContext, derivedContextExplanatio);
      console.log(result)
      return true
    } catch (error) {
      console.log("Error (updateReportedPost):", error);
      return false;
    }
  }

  public async updateCopyrightInfringementUser(userId:string, reputationScore:number, fistOffenseTimestamp:number, lastOffenseTimestamp:number, postCount?:number, offenseCount?:number): Promise<boolean> {
    try {
      if(!this.contract){
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
  public async getReportedPost(contentHash:string): Promise<ReportedPost | null> {
    try {
      if(!this.contract){
        return null;
      }
      const result:ReportedPost = await this.contract.GetReportedPost(contentHash);
      console.log(result)
      if(result.contentHash == ''){
        return null
      }
      return result;
    } catch (error) {
      console.log("Error (getIsReportedPost):", error);
      return null;
    }
  }
  public async getCopyrightInfringementUser(userId:string): Promise<CopyrightInfringementUser | null> {
    try {
      if(!this.contract){
        return null;
      }
      const result:CopyrightInfringementUser = await this.contract.GetUsers(userId);
      console.log(result)
      if(result.postCount == 0){
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
      if(!this.contract){
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
      if(!this.contract) {
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