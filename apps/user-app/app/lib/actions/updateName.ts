"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function updateName(name: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user?.id) {
        return {
            message: "Unauthenticated request"
        }
    }
    
    try {
        await prisma.user.update({
            where: {
                id: Number(session.user.id)
            },
            data: {
                name: name
            }
        });
        return {
            message: "Name updated successfully"
        }
    } catch(e) {
        return {
            message: "Error while updating name"
        }
    }
}
