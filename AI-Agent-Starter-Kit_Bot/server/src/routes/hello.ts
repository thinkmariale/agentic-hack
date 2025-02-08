import { Router, Request, Response, NextFunction } from "express";

const router = Router();
// const gaiaUrl = "https://0x58598ed2556a25062e011b23c93118ee645fd0a6.gaia.domains/v1/chat/completions";

//middleware to check that NODE_ENV is only local development
const checkNodeEnv = (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

//handles the collabland api token creation in .env
const handlePostCollabLand = async (_req: Request, res: Response) => {
  console.log("Getting AI Agent Starter Kit ...");
  res.status(200).json({
    message: "AI Agent Starter Kit",
    timestamp: new Date().toISOString(),
  });
};

router.get("/collabland", checkNodeEnv, handlePostCollabLand);

router.post("/chat", async (_req: Request, res: Response) => {
  try {
    const messageBody = _req.body.message;
    console.log('messageBody',messageBody);
    const message = {
      messages: [{ role: "system", content: "You are a helpful content IP assistant" },{ role: "user", content: messageBody}]

    }
    let responseMesage = "got message successful";
    // const agentResponse = await fetch(gaiaUrl, {
    //   method: "POST",
    //   headers: {
    //       "Content-Type": "application/json",
    //       "Accept": "application/json",
    //   },
    //   body: JSON.stringify(message),
    // });
    // console.log(agentResponse);
    // if(agentResponse.ok){
    //   responseMesage = await agentResponse.json().toString();  
    // }
    console.log('message',message);
    res.json({
      success: true,
      message: responseMesage,
    });
  } catch (error) {
    console.error("[chat mesages] Error:", error);
    res.status(400).json({
      success: false,
      error: "Error sendign message",
    });
  }
})
export default router;
