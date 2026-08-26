import express from "express";
import db from "@repo/db/client";
import { z } from "zod";
import { bankWebhookQueue } from "./queue";
import "./worker"; // Start the background worker

const app = express();

app.use(express.json());

// 1. Zod schema for webhook payload validation
const hdfcWebhookSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
    token: z.string().min(1, "Token is required"),
    user_identifier: z.union([z.string(), z.number()]).transform((val) => String(val)),
    amount: z.union([z.string(), z.number()]).transform((val) => String(val))
});

const SUPPORTED_BANKS = ["HDFC", "AXIS"];

app.post("/webhook/:bankName", async (req, res) => {
    const bankName = req.params.bankName.toUpperCase();

    if (!SUPPORTED_BANKS.includes(bankName)) {
        return res.status(400).json({
            message: `Unsupported Bank: ${bankName}`
        });
    }

    // 2. Webhook Secret Verification (Dynamic bank secret check)
    const expectedSecret = process.env[`${bankName}_WEBHOOK_SECRET`];
    const webhookSecret = req.headers["authorization"] || req.headers["x-webhook-secret"] || req.body?.secret;

    if (!expectedSecret || webhookSecret !== expectedSecret) {
        return res.status(403).json({
            message: `Unauthorized webhook request for ${bankName}: Invalid or missing secret`
        });
    }

    // 1. Validate payload with Zod
    const parsedData = hdfcWebhookSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid payload format",
            errors: parsedData.error.format()
        });
    }

    const paymentInformation = {
        eventId: parsedData.data.eventId,
        token: parsedData.data.token,
        userId: parsedData.data.user_identifier,
        amount: parsedData.data.amount
    };

    // 2. Inbox Pattern: Store the event durably and check for replay attacks
    try {
        await db.bankWebhookEvent.create({
            data: {
                eventId: paymentInformation.eventId,
                token: paymentInformation.token,
                payload: req.body as any,
                status: "Received"
            }
        });
    } catch (e: any) {
        if (e.code === 'P2002') {
            // Unique constraint failed, this is a replay attack or duplicate retry
            return res.status(200).json({
                message: "Event already received/processed (Idempotent response)"
            });
        }
        console.error("Failed to insert BankWebhookEvent:", e);
        return res.status(500).json({ message: "Internal server error during event ingestion" });
    }

    try {
        // 3. Push to BullMQ for asynchronous processing
        await bankWebhookQueue.add("process-webhook", {
            eventId: paymentInformation.eventId,
            token: paymentInformation.token,
            userId: paymentInformation.userId,
            amount: paymentInformation.amount
        });

        // 4. Return 200 OK immediately
        return res.json({
            message: "Captured and queued for processing"
        });
    } catch (e: any) {
        console.error("Failed to push to queue:", e);
        return res.status(500).json({
            message: "Error queueing webhook for processing"
        });
    }
});

app.listen(3003, () => {
    console.log("Bank webhook server running on port 3003");
    SUPPORTED_BANKS.forEach(bank => {
        const hasSecret = !!process.env[`${bank}_WEBHOOK_SECRET`];
        console.log(`${bank}_WEBHOOK_SECRET loaded:`, hasSecret ? "✅ YES" : "❌ NOT LOADED");
    });
});