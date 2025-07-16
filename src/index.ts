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

// (async () => {
//   try {
//     await signPDF({
//       INPUT_PDF:
//         "/Users/clyde/Documents/office/jetpack_lab/getsign/getsign-flow_service/sample.pdf",
//       OUTPUT_PDF:
//         "/Users/clyde/Documents/office/jetpack_lab/getsign/getsign-flow_service/signed.pdf",
//       WORKER_NAME: "6282336",
//     });
//   } catch (error) {
//     console.log(error);
//   }
// })();
