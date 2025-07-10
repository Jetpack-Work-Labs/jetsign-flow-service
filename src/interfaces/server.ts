export interface IServerEnv {
  env: "development" | "production";
  db: string;
  aws: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    queueUrl: string;
  };
  encryption: {
    encKey: string | undefined;
    sigKey: string | undefined;
  };
}
