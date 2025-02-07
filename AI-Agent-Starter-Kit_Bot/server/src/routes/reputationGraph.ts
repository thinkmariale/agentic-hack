import { Router, Request, Response } from "express";

import { ReputationAgent__factory,ReportedPost, CopyrightInfringementUser} from "../contracts/types/index.js";
// import { parseEther, toBeHex } from "ethers";
import { ethers, Wallet } from "ethers";
import { Tweet } from "agent-twitter-client";

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
  // get the tweet object from the body
  const tweet = _req.body as Tweet;
  // get post text, url, username, and user id from the tweet object
  const { text, permanentUrl, userId, username, timestamp } = tweet;

  let user;
  try {
    // try to find user in graph
    // set user if found,
    // else create user
  } catch (error) {
    console.error("Error getting user from graph", error);
  }

  try {
    // TODO: Ron here to add to subgraph
    const curTime = new Date().setFullYear(2022, 1, 1);
    const newReportedUser: CopyrightInfringementUser ={
      userId: userId!,
      platform: "twitter",
      username: username!,
      offenseCount: 0,
      postCount: 0,
      firstOffenseTimestamp: undefined,
      lastOffenseTimestamp: undefined,
      reputationScore: undefined,
    };

    const contentHash = ethers.sha256((text || "") + permanentUrl + username);
    const recordId = ethers.uuidV4(contentHash);
    // check to see if the post has already been reported
    // if it has, we do not need to create a new record,, simply return the exising reputation score

    const reportedPost: ReportedPost = {
      recordId: recordId,
      userId: userId!,
      contentHash: contentHash,
      postText: text,
      postUrl: permanentUrl,
      timestamp: timestamp || curTime,
      reportedTimestamp: curTime,
      severityScore: undefined,
      derivedContext: undefined,
      derivedContextExplanation: undefined
    }

    console.log("HERE", curTime)
    const signer = getSigner();
    const contract = ReputationAgent__factory.connect(signer);
    console.log("contract 1", contract.interface.fragments)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const resultInfr = await contract.AddInfringement(newReportedUser, reportedPost, true);
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
