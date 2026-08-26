"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";

export async function linkWallet(phoneNumber: string) {
    const session = await getServerSession(authOptions);
    const merchantId = (session?.user as any)?.id;

    if (!merchantId) {
        return { message: "Unauthenticated request" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { number: phoneNumber }
        });

        if (!user) {
            return { message: "No Flash Pay wallet found with this number" };
        }

        await prisma.merchant.update({
            where: { id: Number(merchantId) },
            data: { linkedUserId: user.id }
        });

        return { message: "Wallet linked successfully!" };
    } catch (e) {
        return { message: "Error linking wallet" };
    }
}
