import path from "path";
import { tempPath } from "./path";
import * as fs from "fs/promises";
import { s3 } from "./aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";

export const DownloadFile = async ({
  file,
  file_name,
}: {
  file: string;
  file_name: string;
}) => {
  try {
    const params = {
      Bucket: "jetsign-bucket",
      Key: file,
    };
    const command = new GetObjectCommand(params);
    const response = await s3.send(command);
    const fileStream = response.Body as NodeJS.ReadableStream;
    const localPath = path.join(tempPath, file_name);
    const writeStream = createWriteStream(localPath);
    await new Promise((resolve, reject) => {
      fileStream.pipe(writeStream);
      writeStream.on("finish", () => resolve(true));
      writeStream.on("error", (err) => reject(err));
      fileStream.on("error", (err) => reject(err));
    });
    return localPath;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const DeleteTempFiles = async () => {
  try {
    const files = await fs.readdir(tempPath);
    for (const file in files) {
      if (Object.prototype.hasOwnProperty.call(files, file)) {
        const filePath = path.join(tempPath, files[file]);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          await fs.unlink(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      }
    }
    console.log("All files in tmp folder deleted.");
  } catch (error) {
    throw error;
  }
};
