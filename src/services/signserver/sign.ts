import axios from "axios";
import FormData from "form-data";
import https from "https";
import { Readable } from "stream";
import { SIGN_SERVER_URL } from "../../const";

export async function signPDFStream({
  inputStream,
  outputStream,
  WORKER_NAME,
  filename = "document.pdf",
}: {
  inputStream: Readable;
  outputStream: NodeJS.WritableStream;
  WORKER_NAME: string;
  filename?: string;
}): Promise<void> {
  try {
    const form = new FormData();

    form.append("workerName", WORKER_NAME);
    form.append("datafile", inputStream, {
      filename,
      contentType: "application/pdf",
    });

    // Stream the response directly to the output stream
    const response = await axios.post(SIGN_SERVER_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      responseType: "stream",
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Only for testing, enable in production
      }),
    });
    response.data.pipe(outputStream);
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Error signing PDF stream:", err.message);
    } else {
      console.error("❌ Unknown error signing PDF stream");
    }
    throw err;
  }
}
