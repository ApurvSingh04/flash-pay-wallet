import express from "express";
import db from "@repo/db/client";
import { z } from "zod";

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
        await db.$transaction(async (tx) => {
            // 3. Lock the transaction row to prevent concurrent processing
            await tx.$queryRaw`SELECT * FROM "OnRampTransaction" WHERE token = ${paymentInformation.token} FOR UPDATE`;

            const transaction = await tx.onRampTransaction.findUnique({
                where: { token: paymentInformation.token }
            });

            if (!transaction) {
                throw new Error("404:Transaction not found");
            }

            if (transaction.status !== "Processing") {
                throw new Error(`400:Transaction has already been processed. Current status: ${transaction.status}`);
            }

            // 4. Validate amount to ensure it matches
            if (transaction.amount !== Number(paymentInformation.amount)) {
                throw new Error("400:Webhook amount does not match transaction amount");
            }

            if (transaction.userId !== Number(paymentInformation.userId)) {
                throw new Error("400:Webhook user does not match transaction user");
            }

            // 5. Update balance and transaction status
            await tx.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        increment: transaction.amount
                    }
                }
            });

            await tx.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                }
            });
            
            // Mark the event as processed within the same transaction
            await tx.bankWebhookEvent.update({
                where: { eventId: paymentInformation.eventId },
                data: { status: "Processed" }
            });
        });

        return res.json({
            message: "Captured and Processed"
        });
    } catch (e: any) {
        console.error("Webhook processing error:", e);
        
        // Mark event as failed if something went wrong during processing
        await db.bankWebhookEvent.update({
            where: { eventId: paymentInformation.eventId },
            data: { status: "Failed" }
        }).catch(err => console.error("Could not update event to Failed:", err));

        if (e.message?.startsWith("404:")) {
            return res.status(404).json({ message: e.message.split("404:")[1] });
        }
        if (e.message?.startsWith("400:")) {
            return res.status(400).json({ message: e.message.split("400:")[1] });
        }
        return res.status(500).json({
            message: "Error while processing webhook"
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