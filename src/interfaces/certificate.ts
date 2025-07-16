export interface CertificateDto {
  serialNumber: string;
  commonName: string;
  countryName: string;
  state: string;
  localityName: string;
  organizationName: string;
}

export interface Icertificate {
  fileUrl: string;
  fileName: string;
  password: string;
  accountId: number | string;
  dockerFilePath: string;
  workerId?: string;
  tokenId?: string;
}

interface FileData {
  name?: string;
  type: string;
  bytes: ArrayBuffer;
}

export interface UploadMondayFIle {
  itemId: number;
  columnId: string;
  file: FileData;
  token: string;
}
