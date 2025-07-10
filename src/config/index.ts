import { IServerEnv } from "../interfaces";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const LoadFromEnv = (key: string) => {
  if (typeof process.env[key] !== "undefined") {
    return process.env[key];
  }
  throw new Error(`process.env doesn't have the key ${key}`);
};

export const config: IServerEnv = {
  env: LoadFromEnv("ENVIRONMENT") as "development" | "production",
  aws: {
    region: LoadFromEnv("AWS_REGION")!,
    credentials: {
      accessKeyId: LoadFromEnv("AWS_ACCESS_KEY_ID")!,
      secretAccessKey: LoadFromEnv("AWS_SECRET_ACCESS_KEY")!,
    },
    queueUrl: LoadFromEnv("SQS_SIGNING_QUEUE_URL"),
  },
  db: LoadFromEnv("DB_URL"),
  encryption: {
    encKey: LoadFromEnv("SOME_32BYTE_BASE64_STRING"),
    sigKey: LoadFromEnv("SOME_64BYTE_BASE64_STRING"),
  },
};
