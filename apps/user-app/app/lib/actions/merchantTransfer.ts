"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"
import { z } from "zod";

const merchantTransferSchema = z.object({
    merchantEmail: z.string().email("Invalid merchant email address"),
    amount: z.number().positive("Amount must be greater than 0")
});

export async function merchantTransfer(merchantEmail: string, amount: number) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return {
            message: "Error while sending: Unauthorized"
        };
    }

    const parsedInput = merchantTransferSchema.safeParse({ merchantEmail, amount });
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
            // Lock the user's balance
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(userId)} FOR UPDATE`;
            
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(userId) },
            });

            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error("Insufficient funds");
            }

            // Debit user
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

            // Record transaction
            await tx.merchantTransaction.create({
                data: {
                    userId: Number(userId),
                    merchantId: merchant.id,
                    amount,
                    timestamp: new Date(),
                }
            });
        });
        return {
            message: "Transfer successful"
        };
    } catch (error: any) {
        return {
            message: error?.message || "Transfer failed"
        };
    }
}
