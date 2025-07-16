import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { SignJob } from "../../interfaces";
import { config } from "../../config";
import { sqs } from "../../utils";

export async function enqueueSignJob(job: SignJob): Promise<void> {
  const params = {
    QueueUrl: config.aws.queueUrl,
    MessageBody: JSON.stringify(job),
  };

  try {
    await sqs.send(new SendMessageCommand(params));
    console.log(`✅ Job enqueued for document ${job.accountId}`);
  } catch (error) {
    console.error(
      `❌ Failed to enqueue job for document ${job.accountId}`,
      error
    );
    throw error;
  }
}
