import { HandleQueue, pollAndProcessJobs } from "./services/sqs";
import { config } from "./config";
import { connectDB } from "./infrastructure";

(async () => {
  try {
    await connectDB(config.db);
    await pollAndProcessJobs(HandleQueue);
  } catch (error) {
    console.log(error);
  }
})();
