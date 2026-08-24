"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"
import { z } from "zod";
import { revalidatePath } from "next/cache";

const merchantTransferSchema = z.object({
    merchantEmail: z.string().email("Invalid merchant email address"),
    amount: z.number().positive("Amount must be greater than 0"),
    idempotencyKey: z.string().min(1, "Idempotency key is required")
});

export async function merchantTransfer(merchantEmail: string, amount: number, idempotencyKey: string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return {
            message: "Error while sending: Unauthorized"
        };
    }

    const parsedInput = merchantTransferSchema.safeParse({ merchantEmail, amount, idempotencyKey });
    if (!parsedInput.success) {
        return {
            message: parsedInput.error.issues[0]?.message || "Invalid input"
        };
    }

    const merchant = await prisma.merchant.findUnique({
        where: {
            email: merchantEmail
        }
    });

    if (!merchant) {
        return {
            message: "Merchant Not Found"
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Insert first to leverage DB unique constraints for concurrency
            await tx.merchantTransaction.create({
                data: {
                    userId: Number(userId),
                    merchantId: merchant.id,
                    amount,
                    timestamp: new Date(),
                    idempotencyKey
                }
            });

            // 2. Lock the user's balance
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(userId)} FOR UPDATE`;
            
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(userId) },
            });

            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error("Insufficient funds");
            }

            // 3. Debit user
            await tx.balance.update({
                where: { userId: Number(userId) },
                data: { amount: { decrement: amount } },
            });

            // Credit merchant
            await tx.merchantBalance.upsert({
                where: { merchantId: merchant.id },
                update: { amount: { increment: amount } },
                create: { merchantId: merchant.id, amount, locked: 0 }
            });
        });
        revalidatePath('/merchant-pay');
        revalidatePath('/dashboard');
        return {
            message: "Transfer successful"
        };
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed because concurrent request already created it.
            const existingTransfer = await prisma.merchantTransaction.findUnique({
                where: { idempotencyKey }
            });
            if (existingTransfer) {
                return {
                    message: "Transfer successful"
                };
            }
        }
        return {
            message: error?.message || "Transfer failed"
        };
    }
}
