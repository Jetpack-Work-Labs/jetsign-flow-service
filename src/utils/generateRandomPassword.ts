import { randomBytes } from "crypto";

export function generateRandomPassword(length: number = 6): string {
  return randomBytes(length)
    .toString("base64")
    .slice(0, Math.ceil(length * 1.33));
}
