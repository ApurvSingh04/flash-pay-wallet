import { NextResponse } from "next/server"
import client from "@repo/db/client";

export const GET = async () => {
    await client.user.create({
        data: {
            email: "asd",
            name: "adsads",
            number: "0123456789",
            password: "password"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}