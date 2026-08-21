"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function createOnRampTransactions(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const token = Math.random().toString();
    // in real world token comes from banking api
    // it would look something like await axios.get("https://api.hdfcbank.com/getToken", {
    //   headers: {
    //     Authorization: "Bearer " + process.env.BANKING_API_KEY
    //   },
    //   body: {
    //     amount: amount,
    //     userId
    //   }
    // })
    if (!userId) {
        return {
            message: "User not logged in"
        };
    } 
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