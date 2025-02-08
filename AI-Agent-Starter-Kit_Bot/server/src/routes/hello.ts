import { Router, Request, Response, NextFunction } from "express";

const router = Router();

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

router.post("/chat", (_req: Request, res: Response) => {
  try {
   const message = _req.query.message;
   console.log('message',message);
    res.json({
      success: true,
      message: "got message successful",
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
