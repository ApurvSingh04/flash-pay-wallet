"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"
import { z } from "zod";

const p2pTransferSchema = z.object({
    to: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
    amount: z.number().positive("Amount must be greater than 0")
});

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending: Unauthorized"
        };
    }

    const parsedInput = p2pTransferSchema.safeParse({ to, amount });
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
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
            // this will lock the specific row of the db table for this transaction so no other transaction can access it till the end of transaction
            // Without this, two users can check their balance at the same time and both can find that they have sufficient balance
            // and both can debit the amount and the balance can go negative.
            // The 'FOR UPDATE' command ensures that only one transaction can access the row at a time.
            
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
            });
            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error("Insufficient funds");
            }

            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            });

            await tx.balance.upsert({
                where: { userId: toUser.id },
                update: { amount: { increment: amount } },
                create: { userId: toUser.id, amount, locked: 0 }
            });

            await tx.p2pTransfer.create({
                data: {
                    fromUserId: Number(from),
                    toUserId: toUser.id,
                    amount,
                    timeStamp: new Date(),
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