export interface CertificateDto {
  serialNumber: string;
  commonName: string;
  countryName: string;
  state: string;
  localityName: string;
  organizationName: string;
}

export interface Icertificate {
  file_url: string;
  file_name: string;
  password: string;
  account_id: number | string;
  docker_file_path: string;
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
