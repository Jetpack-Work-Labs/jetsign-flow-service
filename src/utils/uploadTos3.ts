import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./aws";
import { BUCKET_NAME } from "../const";
import { fileName } from "./path";

export const uploadFile = async ({
  filePath,
  type, // p12, digital_signature
}: {
  filePath: string;
  type: "p12" | "digital_signature";
}) => {
  const fileStream = fs.createReadStream(filePath);
  const Key = fileName(filePath, type);
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key,
    Body: fileStream,
    ContentType: "text/plain",
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return {
      file_url: Key,
      file_name: Key.split("/").reverse()[0],
      localFileUrl: filePath,
    };
  } catch (error) {
    console.error("Upload Error", error);
    throw error;
  }
};
