import { SignJob } from "..//../interfaces";
import { config } from "../../config";
import { sqsClient } from "../../utils";
import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

export async function pollAndProcessJobs(
  handler: (job: SignJob) => Promise<void>,
  options?: { waitTimeSeconds?: number; maxMessages?: number }
): Promise<void> {
  const waitTimeSeconds = options?.waitTimeSeconds ?? 20;
  const maxMessages = options?.maxMessages ?? 5;
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: config.aws.queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: waitTimeSeconds,
      });
      const resp = await sqsClient.send(command);
      if (!resp.Messages || resp.Messages.length === 0) {
        continue;
      }
      for (const msg of resp.Messages) {
        if (!msg.Body || !msg.ReceiptHandle) continue;
        const job: SignJob = JSON.parse(msg.Body);
        try {
          await handler(job);
          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: config.aws.queueUrl,
              ReceiptHandle: msg.ReceiptHandle,
            })
          );
          console.log(
            `✅ Processed and deleted job for document ${job.accountId}`
          );
        } catch (err) {
          console.error(`❌ Failed to process job ${job.accountId}`, err);
        }
      }
    } catch (err) {
      console.error("❌ Error polling SQS", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
