import { GetPostContextArgs, PostContextResponse } from "./types/aiAgentApi";
import fetch from "node-fetch";

const AI_AGENT_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";
const AI_AGENT_API_KEY = process.env.OPENAI_API_KEY!;

export const generatePostContext = async (postUsername: string, originalCreatorUsername: string, postText: string): Promise<PostContextResponse | null> => {
    const body: GetPostContextArgs = {
        username: postUsername,
        contentCreator: originalCreatorUsername,
        postText: postText
    };

    try {
        const agentResponse = await fetch(AI_AGENT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": AI_AGENT_API_KEY,
            },
            body: JSON.stringify(body),
        });

        const context = await agentResponse.json() as PostContextResponse;
        return context;
    } catch (error) {
        console.error("Error generating post context:", error);
        return null;
    }
}

