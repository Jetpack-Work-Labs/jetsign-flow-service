import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import https from "https";
import { SIGN_SERVER_URL, WORKER_NAME } from "../../const";

const metadata: Record<string, string> = {
  // REASON: "Document Approval",
  // LOCATION: "ktm nepal",
  // CONTACTINFO: "pradip@jetpacklab.com",
  // SIGNERNAME: "Pradip Kharal",
};

export async function signPDF({
  INPUT_PDF,
  OUTPUT_PDF,
  WORKER_NAME,
}: {
  INPUT_PDF: string;
  OUTPUT_PDF: string;
  WORKER_NAME: string;
}): Promise<void> {
  try {
    const fileStream = fs.createReadStream(INPUT_PDF);
    const form = new FormData();

    form.append("workerName", WORKER_NAME);
    form.append("datafile", fileStream, {
      filename: path.basename(INPUT_PDF),
      contentType: "application/pdf",
    });

    const metadataString = Object.entries(metadata)
      .map(([key, value]) => `${key}=${value}`)
      .join(";");

    if (metadataString) {
      form.append("REQUEST_METADATA", metadataString);
    }

    const response = await axios.post<ArrayBuffer>(SIGN_SERVER_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      responseType: "arraybuffer",
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Only for testing, enable in production
      }),
    });

    await fs.writeFileSync(OUTPUT_PDF, Buffer.from(response.data));
    console.log("✅ Signed PDF saved to:", OUTPUT_PDF);
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Error signing PDF:", err.message);
    } else {
      console.error("❌ Unknown error signing PDF");
    }
  }
}
