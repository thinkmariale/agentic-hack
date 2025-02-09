
import sharp from 'sharp';

import {dataURItoBlob, getContentFormat} from "../utils.js";

export interface CertificateParams {
  projectId?: string,
  contentFormat?: string,
  name: string;
  username: string;
  description: string;
  aiTrainingMiningInfo: string;
  usingAI: boolean;
  aiSoftware?: string;
  aiModel?: string;
 }
//  export interface VerificationResult {
//   status: boolean;
//   message: string;
//   data: {
//     verId: string;
//   };
// }

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

export class MentaportService{
  private static instance: MentaportService;
   private constructor() {
  
  }
  public static getInstance(): MentaportService {
    if (!MentaportService.instance) {
      MentaportService.instance = new MentaportService();
    }
    return MentaportService.instance;
  }
  

  public async createCertificate(contentURL: string, params: CertificateParams) {
    try {
      params.projectId = process.env.MENTAPORT_PROJECT_ID || '';
      let blob = await dataURItoBlob(contentURL);
  
      const fileExtension = contentURL.split('.').pop() || '';
      if(blob.type === 'application/octet-stream') {
        const bytes = await blob.arrayBuffer()
        const buffer = Buffer.from(bytes)
        blob = new Blob([buffer], { type: 'image/'+fileExtension });
      }
      let imageBuffer = await resizeImage(blob);
      blob = new Blob([imageBuffer], { type: 'image/'+fileExtension });
      
      if(!params.contentFormat) {
        const contentType = blob.type;
        const format = getContentFormat(contentType) || 'jpg';
        params.contentFormat = format;
      }
    
      const formData = new FormData();
      formData.append("content", blob, `certificate.${params.contentFormat}`);
   
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
   
      const certUrl = `${process.env.MENTAPORT_API_URL}/certificates/create?${queryString}`;
      const response = await fetch(certUrl, {
        method: "POST",
        headers: {
          "x-api-key": process.env.MENTAPORT_API_KEY!
        },
        body: formData
      });
      if(response.status !== 200) {
        return {
          status: false,
          message: "Certificate creation failed",
        }
      }
      const certificate = await response.json() as any;
      const certId = certificate.data.certId;
      const status = await this.queryCertificateStatus(certId)
      if (status.data.status.status === 'Pending') {
        return await this.queryApproveAndDownloadCertificate(certId);
      }
      return {
        status: false,
        message: "Certificate creation failed",
      }
    } catch (error) {
      console.error("[MentaportService] Certificate creation error:", error);
      return {
        status: false,
        message: "Certificate creation failed",
      }
    }
  }

  public async createCertificateBlob(blob: Blob, params: CertificateParams) {
    try {
      params.projectId = process.env.MENTAPORT_PROJECT_ID || '';
      
      let imageBuffer = await resizeImage(blob);
      blob = new Blob([imageBuffer], { type: 'image/jpg' });
      
      if(!params.contentFormat) {
        const contentType = blob.type;
        const format = getContentFormat(contentType) || 'jpg';
        params.contentFormat = format;
      }
    
      const formData = new FormData();
      formData.append("content", blob, `certificate.${params.contentFormat}`);
   
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
   
      const certUrl = `${process.env.MENTAPORT_API_URL}/certificates/create?${queryString}`;
      const response = await fetch(certUrl, {
        method: "POST",
        headers: {
          "x-api-key": process.env.MENTAPORT_API_KEY!
        },
        body: formData
      });
      if(response.status !== 200) {
        return {
          status: false,
          message: "Certificate creation failed",
        }
      }
      const certificate = await response.json() as any;
      const certId = certificate.data.certId;
      const status = await this.queryCertificateStatus(certId)
      if (status.data.status.status === 'Pending') {
        return await this.queryApproveAndDownloadCertificate(certId);
      }
      return {
        status: false,
        message: "Certificate creation failed",
      }
    } catch (error) {
      console.error("[MentaportService] Certificate creation error:", error);
      return {
        status: false,
        message: "Certificate creation failed",
      }
    }
  }
  public async verifyContent( contentURL: string, url: string, wallet: string = "na") {
    console.log('verifyContent', contentURL, url, wallet)
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
  
      const verifyUrl = `${process.env.MENTAPORT_API_URL}/verify?contentFormat=${format}&url=${url}&wallet=${wallet}`;
      console.log("sending verify call: ", verifyUrl);
      const headers = new Headers({
        "x-api-key": process.env.MENTAPORT_API_KEY!,
      });
      console.log(headers);
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers,
        body: formData,
      });
  
      // check status:
      if(response.status !== 200) {
        return {
          status: false,
          message: "Verification failed",
        }
      }
      const verification = await response.json() as any;
      const verId = verification.data.verId;
      return await this.queryVerificationStatus(verId);
     
      //--
      return await response.json();
    } catch (error) {
      console.error("[MentaportService] Verification error:", error);
      throw error;
    }
  };
  
  public async verifyContentBlob( blob: Blob, url: string, wallet: string = "na") {
    console.log('verifyContentBlob', url, wallet)
    try {
    
      const contentType = blob.type;
      const format = getContentFormat(contentType);
  
      const formData = new FormData();
      formData.append("content", blob, `verify.${format}`);
  
      const verifyUrl = `${process.env.MENTAPORT_API_URL}/verify?contentFormat=${format}&url=${url}&wallet=${wallet}`;
      console.log("sending verify call: ", verifyUrl);
      const headers = new Headers({
        "x-api-key": process.env.MENTAPORT_API_KEY!,
      });
      console.log(headers);
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers,
        body: formData,
      });
  
      // check status:
      if(response.status !== 200) {
        return {
          status: false,
          message: "Verification failed",
        }
      }
      const verification = await response.json() as any;
      const verId = verification.data.verId;
      return await this.queryVerificationStatus(verId);
     
      //--
      return await response.json();
    } catch (error) {
      console.error("[MentaportService] Verification error:", error);
      throw error;
    }
  };
  
  private async queryVerificationStatus(verId: string) {
    try {
      let status;
      do {
        const statusResponse = await fetch(`${process.env.MENTAPORT_API_URL}/verify/status?verId=${verId}`, {
          headers: {
            'x-api-key': process.env.MENTAPORT_API_KEY!
          }
        });
        status = await statusResponse.json() as any;
        await new Promise(r => setTimeout(r, 3000));
      } while (status.data.status.status == 'Processing' || status.data.status.status == 'Initializing');
      
      
      return status;
    } catch (error) {
      console.error('Error querying verification status:', error);
      return {
        status: false,
        message: "Verification failed",
      }
    }
   }

   private async queryCertificateStatus(certId: string) {
    try {
      let status;
      do {
        const statusResponse = await fetch(
          `${process.env.MENTAPORT_API_URL}/certificates/status?projectId=${process.env.MENTAPORT_PROJECT_ID}&certId=${certId}`,
          { headers: { 'x-api-key': process.env.MENTAPORT_API_KEY! } }
        );
        status = await statusResponse.json() as any;
        await new Promise(r => setTimeout(r, 3000));
      } while (status.data.status.status == 'Processing' || status.data.status.status == 'Initializing');
      
      return status;

    } catch (error) {
      console.error('Error querying verification status:', error);
      throw error;
    }
   }

   private async queryApproveAndDownloadCertificate(certId: string) {
    try {
      const approveResponse = await fetch(
        `${process.env.MENTAPORT_API_URL}/certificates/approve?projectId=${process.env.MENTAPORT_PROJECT_ID}&certId=${certId}&approved=true`,
        {
          method: 'POST',
          headers: { 'x-api-key': process.env.MENTAPORT_API_KEY! }
        }
      );
      
      if(approveResponse.status !== 200) {
        return {
          status: false,
          message: "Approving Certificate Failed",
        }
      }
      const approved = await approveResponse.json() as any;
      console.log(approved);
      const downloadResponse = await fetch(
        `${process.env.MENTAPORT_API_URL}/download?projectId=${process.env.MENTAPORT_PROJECT_ID}&certId=${certId}`,
        {
          headers: { 'x-api-key': process.env.MENTAPORT_API_KEY! }
        }
      );
      const downloadData = await downloadResponse.json() as any;
      return {
        status: true,
        message: "Certificate Approved",
        data: {
          certId:certId,
          approved:approved,
          downloadData:downloadData
        }
      }
    } catch (error) {
      console.error('Error querying verification status:', error);
      return {
        status: false,
        message: "Approving Certificate Failed",
      }
    }
   }
}