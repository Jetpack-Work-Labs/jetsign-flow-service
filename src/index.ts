import { createCertificate } from "./services/certificate";
import { createCryptoToken } from "./services/signserver";
import { signPDF } from "./services/signserver/sign";
import {
  enqueueSignJob,
  HandleQueue,
  pollAndProcessJobs,
} from "./services/sqs";
import { SignJob } from "./interfaces";
import { createP12Docker, uploadFile } from "./utils";
import { config } from "./config";
import { connectDB } from "./infrastructure";
import { EnvelopeModel } from "./model";
import mongoose, { ConnectOptions } from "mongoose";

(async () => {
  try {
    await connectDB(config.db);

    await enqueueSignJob({
      account_id: "6282335",
    });
  } catch (error) {
    console.log(error);
  }
})();

(async () => {
  try {
    await pollAndProcessJobs(HandleQueue);
  } catch (error) {
    console.log(error);
  }
})();
