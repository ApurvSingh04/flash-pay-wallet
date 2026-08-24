import express from "express";
import db from "@repo/db/client";
import { z } from "zod";

const app = express();

app.use(express.json());

// 1. Zod schema for webhook payload validation
const hdfcWebhookSchema = z.object({
    token: z.string().min(1, "Token is required"),
    user_identifier: z.union([z.string(), z.number()]).transform((val) => String(val)),
    amount: z.union([z.string(), z.number()]).transform((val) => String(val))
});

app.post("/hdfcWebhook", async (req, res) => {
    // 2. Webhook Secret Verification (HDFC bank secret check)
    // Banks send a secret/signature in headers (e.g., authorization, x-hdfc-signature) or request body
    const webhookSecret = req.headers["authorization"] || req.headers["x-webhook-secret"] || req.body?.secret;
    const expectedSecret = process.env.HDFC_WEBHOOK_SECRET;

    if (!expectedSecret || webhookSecret !== expectedSecret) {
        return res.status(403).json({
            message: "Unauthorized webhook request: Invalid or missing secret"
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
        token: parsedData.data.token,
        userId: parsedData.data.user_identifier,
        amount: parsedData.data.amount
    };

    try {
        // 3. Check if transaction exists and is currently in 'Processing' status
        const transaction = await db.onRampTransaction.findUnique({
            where: {
                token: paymentInformation.token
            }
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        if (transaction.status !== "Processing") {
            return res.status(400).json({
                message: `Transaction has already been processed. Current status: ${transaction.status}`
            });
        }

        // Execute balance update & transaction status change in an atomic transaction
        // IMPORTANT: Use transaction.amount from DB — never trust the amount from the request body
        await db.$transaction([
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        increment: transaction.amount
                    }
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token,
                    status: "Processing" // Safeguard against race conditions / double processing
                },
                data: {
                    status: "Success",
                }
            })
        ]);

        return res.json({
            message: "Captured"
        });
    } catch (e) {
        console.error("Webhook processing error:", e);
        return res.status(411).json({
            message: "Error while processing webhook"
        });
    }
});

app.listen(3003, () => {
    console.log("Bank webhook server running on port 3003");
    console.log("HDFC_WEBHOOK_SECRET loaded:", !!process.env.HDFC_WEBHOOK_SECRET ? "✅ YES" : "❌ NOT LOADED");
});