"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";

export async function withdrawToWallet(amount: number) {
    const session = await getServerSession(authOptions);
    const merchantId = (session?.user as any)?.id;

    if (!merchantId) {
        return { message: "Unauthenticated request" };
    }

    try {
        const merchant = await prisma.merchant.findUnique({
            where: { id: Number(merchantId) },
            include: { balance: true }
        });

        if (!merchant || !merchant.linkedUserId) {
            return { message: "No linked wallet found" };
        }

        if (!merchant.balance || merchant.balance.amount < amount) {
            return { message: "Insufficient merchant balance" };
        }

        // Execute transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Lock the merchant balance row
            await tx.$queryRaw`SELECT * FROM "MerchantBalance" WHERE "merchantId" = ${Number(merchantId)} FOR UPDATE`;

            // Deduct from merchant
            await tx.merchantBalance.update({
                where: { merchantId: Number(merchantId) },
                data: { amount: { decrement: amount } }
            });

            // Add to user
            await tx.balance.update({
                where: { userId: merchant.linkedUserId! },
                data: { amount: { increment: amount } }
            });

            // Record withdrawal history
            await tx.merchantWithdrawal.create({
                data: {
                    merchantId: Number(merchantId),
                    userId: merchant.linkedUserId!,
                    amount: amount
                }
            });
        });

        return { message: "Withdrawal successful!" };
    } catch (e) {
        console.error(e);
        return { message: "Error processing withdrawal" };
    }
}
