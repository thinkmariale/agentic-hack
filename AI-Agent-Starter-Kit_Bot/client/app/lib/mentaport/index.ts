import { _getMentaportSDK } from '@/app/lib/mentaport/mentaport-sdk.ts';
import {
  ICertificateArg,
  ContentTypes,
  ContentFormat,
  ICertificate,
  IResults,
  VerificationStatus,
  CertificateStatus,
} from '@mentaport/certificates';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const getFileTypeStr = (fileType: string) => {
  const types = fileType.split('/');
  let type = ""
  let format: ContentFormat = ContentFormat[types[1] as keyof typeof ContentFormat];
  if (!format && types[1] == 'jpeg')
    format = ContentFormat.jpg;
  for (const key in ContentTypes) {
    if (ContentTypes[key as keyof typeof ContentTypes].toLowerCase() === types[0]) {
      type = ContentTypes[key as keyof typeof ContentTypes];
    }
  }

  return { type, format };
};

// Create new certificate
export async function CreateCertificate(file: File, initCertificateArgs: ICertificateArg): Promise<IResults<ICertificate>> {
  try {

    if (!file) {
      throw new Error('No file uploaded')
    }
  
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const blob = new Blob([buffer], { type: file.type });
    const typeInfo = getFileTypeStr(file.type)
    initCertificateArgs.contentFormat = typeInfo.format as ContentFormat;
    initCertificateArgs.aiTrainingMiningInfo = 'not_allowed';
    initCertificateArgs.projectId = process.env.NEXT_PUBLIC_MENTAPORT_PROJECT_ID || '';
    const sdk = await _getMentaportSDK();
    // 1. Create certificate by setting information and uploading content
    const genRes = await sdk.createCertificate(initCertificateArgs, blob);
    if (!genRes.status || genRes.data == null) {
      console.error('There was a problem uploading content for certificate')
      return genRes
    }
    const projectId = initCertificateArgs.projectId;
    const certId = genRes.data.certId;
    let status = genRes.data.status;
    console.log("creation started", genRes.data)
    // 2. Check status until is ready (Pending if successful or NonActive if failed)
    let resCertStatus = await sdk.getCertificateStatus(projectId, certId);
    while (status !== CertificateStatus.Pending &&
      status !== CertificateStatus.NonActive
    ) {
      await sleep(2000);
      resCertStatus = await sdk.getCertificateStatus(projectId, certId);
      console.log(resCertStatus)
      if (!resCertStatus.status) {
        console.log('error', resCertStatus)
        return { status: resCertStatus.status, message: resCertStatus.message, statusCode: resCertStatus.statusCode }
      }
      if (resCertStatus.data) {
        if (resCertStatus.data.status.error) {
          // break error creating certificate
          console.log(resCertStatus)
          return { status: false, message: resCertStatus.data.status.statusMessage, statusCode: resCertStatus.statusCode }
        }
        status = resCertStatus.data.status.status;
      }
    }

    console.log("Now approving certificate");
    // TODO: Before approving, confirm the data from the above call to ensure everything looks good.
    // 3. Approve certificate for it to be ready for download
    const appRes = await sdk.approveCertificate(initCertificateArgs.projectId, certId, true);
    return appRes;

  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    console.log(error)
    let message = "Error creating certificate"
    if (error.response && error.response.data) {
      message = error.response.data.message
    }
    return { status: false, message, statusCode: 501 }
  }
}

  // Verify content 
  export async function Verify(file: File) {
    try {
     
      if (!file) {
        throw new Error('No file uploaded')
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const blob = new Blob([buffer], { type: file.type });
      const typeInfo = getFileTypeStr(file.type)
      const sdk = await _getMentaportSDK();
      const url = "https://ipdefender.chat.mentaport.com";
      // 1. Verify content by uploading content
      const verRes = await sdk.verifyContent(typeInfo.format, url, blob);
      // check for result:
      if (!verRes.status || !verRes.data) {
        return verRes
      }
      // 2. Check status until is ready
      const verId = verRes.data.verId
      let status = VerificationStatus.Initiating;
      let resVerStatus = null
      while (
        status !== VerificationStatus.NoCertificate &&
        status !== VerificationStatus.Certified
      ) {
        await sleep(2000);
        resVerStatus = await sdk.getVerificationStatus(verId);
        console.log(resVerStatus)
        if (resVerStatus.data) {
          status = resVerStatus.data.status.status
        }
      }
      return resVerStatus

    } // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      console.log(error)
      let message = "Error verifying content"
      if (error.response && error.response.data) {
        message = error.response.data.message
      }
      return { status: false, message, statusCode: 501 }
    }
  }

  // Get Certificates
  export async function GetCertificates(projectId?: string, certId?: string) {
    try {
      const sdk = await _getMentaportSDK();
      if (projectId && certId) {
        const result = await sdk.getCertificates(projectId, certId);
        console.log(result);
        return result
      }
      const result = await sdk.getCertificates();
      console.log(result);
      return result
    }  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      let message = "Error getting certificates"
      if (error.response && error.response.data) {
        message = error.response.data.message
      }
      console.log(error)
      return { status: false, message, statusCode: 501 }
    }
  }


  export async function GetDownloadUrl(
    projectId: string,
    certId: string,
  ): Promise<IResults<string>> {
    try {
      const sdk = await _getMentaportSDK();
      const result = await sdk.getDownloadUrl(projectId, certId);
      return result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = 'Error getting URL';
      if (error.response && error.response.data) {
        message = error.response.data.message;
      }
      console.log(error);
      return { status: false, message, statusCode: 501 };
    }
  }