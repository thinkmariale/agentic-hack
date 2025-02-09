/* eslint-disable @typescript-eslint/no-explicit-any */

import { resolve } from "path";
const __dirname = new URL(".", import.meta.url).pathname;
import { config } from "dotenv";
config();

export type AnyType = any;
export const chainMap: Record<string, string> = {
  ethereum: "11155111",
  base: "84532",
  linea: "59141",
  solana: "sol_dev",
};

export const getTokenMetadataPath = () => {
  const path = resolve(
    __dirname,
    "..",
    "..",
    process.env.TOKEN_DETAILS_PATH || "token_metadata.example.jsonc"
  );
  console.log("tokenMetadataPath:", path);
  return path;
};

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  websiteLink: string;
  twitter: string;
  discord: string;
  telegram: string;
  nsfw: boolean;
  image: string;
}

export interface MintResponse {
  response: {
    contract: {
      fungible: {
        object: string;
        name: string;
        symbol: string;
        media: string | null;
        address: string;
        decimals: number;
      };
    };
  };
}

export const getCollablandApiUrl = () => {
  return (
    process.env.COLLABLAND_API_URL || "https://api-qa.collab.land/accountkit/v1"
  );
};

export const getCardHTML = (botUsername: string, claimURL: string) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="twitter:card" content="player" />
	<meta name="twitter:site" content="@${botUsername}" />
	<meta name="twitter:title" content="AI Agent Starter Kit" />
	<meta name="twitter:description"
		content="This is a sample card for claiming airdrops with the AI Agent Starter Kit" />
	<meta name="twitter:image" content="https://assets.collab.land/collabland-logo.png" />
	<meta name="twitter:player" content="${claimURL}" />
	<meta name="twitter:player:width" content="480" />
	<meta name="twitter:player:height" content="480" />
</head>

<body>
	<title>Claim token airdrop.</title>
</body>

</html>`;
};

export const dataURItoBlob = async (dataURI: string): Promise<Blob> => {
  const response = await fetch(dataURI);
  return await response.blob();
};

export const getContentFormat = (contentType: string): string => {
  if (contentType.includes("image")) {
    if (contentType.includes("png")) return "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
  }
  if (contentType.includes("audio")) {
    if (contentType.includes("mp3") || contentType.includes("mpeg"))
      return "mp3";
    if (contentType.includes("wav")) return "wav";
  }
  if (contentType.includes("video") && contentType.includes("mp4"))
    return "mp4";

  throw new Error(`Unsupported content type: ${contentType}`);
};

// export const queryVerificationStatus= async(verId: string): Promise<any> => {
//   try {
//     const response = await fetch(`${process.env.VERIFY_API_URL}verify/status?verId=${verId}`, {
//       headers: {
//         'x-api-key': process.env.VERIFY_API_KEY!
//       }
//     });
//     return await response.json();
//   } catch (error) {
//     console.error('Error querying verification status:', error);
//     throw error;
//   }
//  }
 
//  export const pollVerificationStatus = async(verId: string, maxAttempts = 10, interval = 3000): Promise<any> => {
//   let attempts = 0;
  
//   while (attempts < maxAttempts) {
//     const status = await queryVerificationStatus(verId);
//     console.log('veriy verId status call: ', status)
//     if (status.data?.status?.status !== 'Processing' || status.message?.includes('Validation Error')) {
//       return status.data?.status?.status ? status.data?.status?.status : "No Valid Certificate";
//     }
//     await new Promise(resolve => setTimeout(resolve, interval));
//     attempts++;
//   }
//   throw new Error('Verification timed out');
//  }