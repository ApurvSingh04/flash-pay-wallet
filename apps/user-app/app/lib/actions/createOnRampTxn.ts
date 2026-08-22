"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { z } from "zod";

const onRampSchema = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    provider: z.string().min(1, "Provider is required")
});

export async function createOnRampTransactions(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return {
            message: "User not logged in"
        };
    } 

    const parsedInput = onRampSchema.safeParse({ amount, provider });
    if (!parsedInput.success) {
        return {
            message: parsedInput.error.issues[0]?.message || "Invalid input"
        };
    }

    const token = Math.random().toString();
    await prisma.onRampTransaction.create({
        data: {
            userId: Number(userId),
            amount: amount,
            status: "Processing",
            startTime: new Date(),
            provider,
            token: token
        }
    });

    return {
        message: "On ramp transaction added"
    };
}