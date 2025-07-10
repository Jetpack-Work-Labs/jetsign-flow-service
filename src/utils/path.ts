import path from "path";
import { config } from "../config";

export const tempPath = path.resolve(__dirname, "../", "tmp");
export const certificatePath = path.resolve(__dirname, "../", "certificates");
export const fileName = (filePath: string, type: string): string => {
  return `${
    config.env === "production" ? "prod" : "dev"
  }/${type}/${path.basename(filePath)}`;
};
