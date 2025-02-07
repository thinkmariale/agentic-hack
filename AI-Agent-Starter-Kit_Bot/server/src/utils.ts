/* eslint-disable @typescript-eslint/no-explicit-any */
import sharp from 'sharp';

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

export const verifyContent = async (
  contentURL: string,
  url: string,
  wallet: string = "na"
) => {
  try {
    let blob = await dataURItoBlob(contentURL);

    if(blob.type === 'application/octet-stream') {
      const fileExtension = contentURL.split('.').pop() || '';
      blob = new Blob([await blob.arrayBuffer()], { type: 'image/'+fileExtension });
    }
    const contentType = blob.type;
    const format = getContentFormat(contentType);

    const formData = new FormData();
    formData.append("content", blob, `verify.${format}`);

    const verifyUrl = `${process.env.VERIFY_API_URL}verify/scanners?scannerId=mentaportbot&contentFormat=${format}&url=${url}&wallet=${wallet}`;
    console.log("sending verify call: ", verifyUrl);
    const headers = new Headers({
      "x-api-key": process.env.VERIFY_API_KEY as string,
    });
    console.log(headers);
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("[MentaportService] Verification error:", error);
    throw error;
  }
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

export const queryVerificationStatus= async(verId: string): Promise<any> => {
  try {
    const response = await fetch(`${process.env.VERIFY_API_URL}verify/status?verId=${verId}`, {
      headers: {
        'x-api-key': process.env.VERIFY_API_KEY!
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error querying verification status:', error);
    throw error;
  }
 }
 
 export const pollVerificationStatus = async(verId: string, maxAttempts = 10, interval = 3000): Promise<any> => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await queryVerificationStatus(verId);
    console.log('veriy verId status call: ', status)
    if (status.data?.status?.status !== 'Processing' || status.message?.includes('Validation Error')) {
      return status.data?.status?.status ? status.data?.status?.status : "No Valid Certificate";
    }
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }
  throw new Error('Verification timed out');
 }

 export const createCertificate = async (
  contentURL: string,
  params: CertificateParams
 ) => {
  try {
    let blob = await dataURItoBlob(contentURL);

    const fileExtension = contentURL.split('.').pop() || '';
    if(blob.type === 'application/octet-stream') {
      const bytes = await blob.arrayBuffer()
      const buffer = Buffer.from(bytes)
      blob = new Blob([buffer], { type: 'image/'+fileExtension });
    }
    let imageBuffer = await resizeImage(blob);
    blob = new Blob([imageBuffer], { type: 'image/'+fileExtension });

    const formData = new FormData();
    formData.append("content", blob, `certificate.${params.contentFormat}`);
 
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
 
    const certUrl = `${process.env.VERIFY_API_URL}certificates/create?${queryString}`;

    const response = await fetch(certUrl, {
      method: "POST",
      headers: {
        "x-api-key": process.env.CERT_API_KEY!
      },
      body: formData
    });
 
    return await response.json();
  } catch (error) {
    console.error("[MentaportService] Certificate creation error:", error);
    throw error;
  }
 };

 const resizeImage = async (blob: Blob): Promise<Buffer> => {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return await sharp(buffer)
    .resize(1920, 1920, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .jpeg({ quality: 90 })
    .toBuffer();
 };

export interface VerificationResult {
  status: boolean;
  message: string;
  data: {
    verId: string;
  };
}

export interface CertificateParams {
  projectId: string,
  contentFormat: string,
  name: string;
  username: string;
  description: string;
  aiTrainingMiningInfo: string;
  usingAI: boolean;
  aiSoftware?: string;
  aiModel?: string;
 }
