"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"
import { z } from "zod";
import { revalidatePath } from "next/cache";

const p2pTransferSchema = z.object({
    to: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
    amount: z.number().positive("Amount must be greater than 0"),
    idempotencyKey: z.string().min(1, "Idempotency key is required")
});

export async function p2pTransfer(to: string, amount: number, idempotencyKey: string) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending: Unauthorized"
        };
    }

    const parsedInput = p2pTransferSchema.safeParse({ to, amount, idempotencyKey });
    if (!parsedInput.success) {
        return {
            message: parsedInput.error.issues[0]?.message || "Invalid input"
        };
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User Not Found"
        };
    }

    if (toUser.id === Number(from)) {
        return {
            message: "Cannot transfer money to yourself"
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Insert first to leverage DB unique constraints for concurrency
            await tx.p2pTransfer.create({
                data: {
                    fromUserId: Number(from),
                    toUserId: toUser.id,
                    amount,
                    timeStamp: new Date(),
                    idempotencyKey
                }
            });

            // 2. Lock balance row
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
            
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });
            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error("Insufficient funds");
            }

            // 3. Update balances
            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            });

            await tx.balance.upsert({
                where: { userId: toUser.id },
                update: { amount: { increment: amount } },
                create: { userId: toUser.id, amount, locked: 0 }
            });
        });
        revalidatePath('/transfer');
        revalidatePath('/dashboard');
        return {
            message: "Transfer successful"
        };
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed because concurrent request already created it.
            // Query the existing transaction to return a consistent response.
            const existingTransfer = await prisma.p2pTransfer.findUnique({
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