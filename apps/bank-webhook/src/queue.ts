import { Queue } from "bullmq";
import IORedis from "ioredis";

// Create a reusable Redis connection
export const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null
});

// Create the Webhook Queue
export const bankWebhookQueue = new Queue("BankWebhookQueue", {
    connection: redisConnection
});
