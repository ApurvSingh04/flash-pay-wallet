import { Worker, Job } from "bullmq";
import { redisConnection } from "./queue";
import db from "@repo/db/client";

console.log("Worker started: Listening to BankWebhookQueue...");

export const bankWebhookWorker = new Worker(
    "BankWebhookQueue",
    async (job: Job) => {
        const { eventId, token, userId, amount } = job.data;
        console.log(`Processing job ${job.id} for event ${eventId}`);

        try {
            await db.$transaction(async (tx) => {
                // 1. Lock the transaction row to prevent concurrent processing
                await tx.$queryRaw`SELECT * FROM "OnRampTransaction" WHERE token = ${token} FOR UPDATE`;

                const transaction = await tx.onRampTransaction.findUnique({
                    where: { token: token }
                });

                if (!transaction) {
                    throw new Error("404:Transaction not found");
                }

                if (transaction.status !== "Processing") {
                    throw new Error(`400:Transaction has already been processed. Current status: ${transaction.status}`);
                }

                // 2. Validate amount to ensure it matches
                if (transaction.amount !== Number(amount)) {
                    throw new Error("400:Webhook amount does not match transaction amount");
                }

                if (transaction.userId !== Number(userId)) {
                    throw new Error("400:Webhook user does not match transaction user");
                }

                // 3. Update balance and transaction status
                await tx.balance.updateMany({
                    where: {
                        userId: Number(userId)
                    },
                    data: {
                        amount: {
                            increment: transaction.amount
                        }
                    }
                });

                await tx.onRampTransaction.update({
                    where: {
                        token: token
                    },
                    data: {
                        status: "Success",
                    }
                });

                // 4. Mark the event as processed within the same transaction
                await tx.bankWebhookEvent.update({
                    where: { eventId: eventId },
                    data: { status: "Processed" }
                });
            });

            console.log(`Job ${job.id} (Event ${eventId}) processed successfully!`);

        } catch (e: any) {
            console.error(`Error processing job ${job.id}:`, e);
            
            // Mark event as failed if something went wrong during processing
            await db.bankWebhookEvent.update({
                where: { eventId: eventId },
                data: { status: "Failed" }
            }).catch(err => console.error("Could not update event to Failed:", err));
            
            // Re-throw so BullMQ knows the job failed and can handle retries/DLQ
            throw e;
        }
    },
    {
        connection: redisConnection,
        // Optional: configure retries, backoff, etc.
        // attempts: 3,
        // backoff: { type: 'exponential', delay: 1000 }
    }
);

bankWebhookWorker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});

bankWebhookWorker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});
