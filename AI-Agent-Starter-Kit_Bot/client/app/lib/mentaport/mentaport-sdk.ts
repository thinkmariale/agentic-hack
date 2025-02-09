import { CertificateSDK } from '@mentaport/certificates';

let _mentaportSDK: CertificateSDK | null = null;

export async function _getMentaportSDK(): Promise<CertificateSDK> {
  if (_mentaportSDK != null) {
    return _mentaportSDK;
  }
 
  return await _initMentaportSdk();
}

async function _initMentaportSdk() {
  console.log('initMentaportSdk',process.env.NEXT_PUBLIC_MENTAPORT_API!)
  _mentaportSDK = new CertificateSDK(process.env.NEXT_PUBLIC_MENTAPORT_API!);
  if (!_mentaportSDK) {
    throw new Error(
      'It is not possible to create a CertificateSDK due to an initialization problem.'
    );
  }

  _mentaportSDK.setClient();
  return _mentaportSDK;
}