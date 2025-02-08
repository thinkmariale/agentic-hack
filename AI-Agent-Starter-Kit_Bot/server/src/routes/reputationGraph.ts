import { Router, Request, Response } from "express";

// import { parseEther, toBeHex } from "ethers";
import { ethers } from "ethers";
import { Tweet } from "agent-twitter-client";

import { ReportedPost, CopyrightInfringementUser} from "../contracts/types/index.js";
// import { ethers,Wallet } from "ethers";
import  {ReputationContractService} from "../services/reputationContract.service.js"
// rpcUrl=
const router = Router();
// const states = new Set<string>();

// const getSigner = () => {
//   // localhost wallet
//   console.log("getSigner")
//   const wallet = new Wallet("0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e");
//   //rpcUrl
//   const url = 'http://127.0.0.1:8545/';

//   return wallet.connect(new ethers.JsonRpcProvider(url));
// }

router.post("/add", async (_req: Request, res: Response) => {
  // get the tweet object from the body
  const tweet = _req.body as Tweet;
  // get post text, url, username, and user id from the tweet object
  const { text, permanentUrl, userId, username, timestamp } = tweet;
  // now in ms
  const currTime = new Date().getTime();  
  const repService = ReputationContractService.getInstance();

  // find or create the user in the graph
  let user: CopyrightInfringementUser = {
    userId: userId!,
    platform: "twitter",
    username: username!,
    offenseCount: 0,
    postCount: 0,
    firstOffenseTimestamp: undefined,
    lastOffenseTimestamp: undefined,
    reputationScore: undefined
  }

  try {
    const existingUser = await repService.getCopyrightInfringementUser(userId!);
    if (existingUser) {
      user = existingUser;
    }
  } catch (error) {
    console.error("Error getting user from graph", error);
  }

  // find or create the post in the graph
  const contentHash = ethers.sha256((text || "") + permanentUrl + username + "twitter");
    const recordId = ethers.uuidV4(contentHash);

  let post: ReportedPost = {
    recordId: recordId,
    userId: userId!,
    contentHash: contentHash,
    postText: text,
    postUrl: permanentUrl,
    timestamp: timestamp || currTime,
    reportedTimestamp: currTime,
    severityScore: undefined,
    derivedContext: undefined,
    derivedContextExplanation: undefined
  }

  // see if the post already exists in the graph
  let postExists = false;
  try {
    const existingPost = await repService.getReportedPost(contentHash);
    if (existingPost) {
      post = existingPost;
      postExists = true;
    }
  } catch (error) {
    console.error("Error getting post from graph", error);
  }

  /* No need to recalculate the reputation score if the post already exists */
  if (postExists && post.severityScore && user.reputationScore) {
    res.json({ message: "Post already reported", reputationScore: user.reputationScore, post: post });
    return;
  }

  try {
    console.log("HERE", currTime)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const resultInfr = await repService.addInfringement(user, post, true);
    const result = await repService.getReputationScore(user.userId);
    console.log(resultInfr)
    console.log('result',result);
    res.json({ message:"hello form back" });
  } catch (error) {
    console.error("[RepGraph Add] Error:", error);
    res.status(500).json({ error: "Adding infringement failed" });
  }
});


router.get("/get/reportedPost", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    console.log(code, state)
    const repService = ReputationContractService.getInstance();
    const posts = await repService.getReportedPost('0x5fbdb2315678afecb367f032d93f642f64180aa3');
    res.json({
      success: true,
      message: " got posts successful",
      data: posts,
      profile: "profileResponse.data",
    });
  } catch (error) {
    console.error("[RepGraph GetPosts] Error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to fetch posts information",
    });
  }
});

export default router;
