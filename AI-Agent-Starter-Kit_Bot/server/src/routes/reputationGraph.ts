import { Router, Request, Response } from "express";

import { ReputationAgent__factory,ReportedPost, CopyrightInfringementUser} from "../contracts/types/index.js";
// import { parseEther, toBeHex } from "ethers";
import { ethers,Wallet } from "ethers";

// rpcUrl=
const router = Router();
const states = new Set<string>();

const getSigner = () => {
  // localhost wallet
  console.log("getSigner")
  const wallet = new Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e");
  //rpcUrl
  const url = 'http://127.0.0.1:8545/';

  return wallet.connect(new ethers.JsonRpcProvider(url));
}

router.post("/add", async (_req: Request, res: Response) => {
  try {
    // TODO: Ron here to add to subgraph
    const curTime = new Date().getTime()
    const cp: CopyrightInfringementUser ={
      userId: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      platform: "twitter",
      username: "username",
      offenseCount: 1,
      postCount: 1,
      firstOffenseTimestamp:curTime,
      lastOffenseTimestamp: curTime,
      reputationScore: 1,
    };

    const post: ReportedPost = {
      recordId: "0x21",
      userId: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
      contentHash: "0x214444331",
      postText: "postText",
      postUrl: "postUrl",
      timestamp: curTime,
      severityScore: 1,
      derivedContext: "plagiarism",
      derivedContextExplanation:"something"
    }
    console.log("HERE", curTime)
    const signer = getSigner();
    const contract = ReputationAgent__factory.connect(signer);
    console.log("contract 1", contract.interface.fragments)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const resultInfr = await contract.AddInfringement(cp, post, true);
    const result = await contract.GetReputationScore("0x5fbdb2315678afecb367f032d93f642f64180aa3");
    console.log(resultInfr)
    console.log('result',result);
    res.json({ message:"hello form back" });
  } catch (error) {
    console.error("[GitHub Auth] Error:", error);
    res.status(500).json({ error: "Auth initialization failed" });
  }
});


router.get("/success", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
  console.log(code, state)
    if (!states.has(state as string)) {
      throw new Error("Invalid state parameter");
    }
    res.json({
      success: true,
      message: "GitHub authentication successful",
      token: "success",
      profile: "profileResponse.data",
    });
  } catch (error) {
    console.error("[GitHub Success] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch profile information",
    });
  }
});

export default router;
