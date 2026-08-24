import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";

// Force dynamic so Next.js never caches this streaming route
export const dynamic = "force-dynamic";

/**
 * SSE endpoint — user browser connects here and receives push events
 * whenever the balance changes (e.g., from a bank webhook).
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    let lastKnownBalance = -1;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
            );

            const poll = setInterval(async () => {
                try {
                    const balance = await prisma.balance.findUnique({
                        where: { userId: Number(userId) },
                    });

                    const currentBalance = balance?.amount ?? 0;

                    if (lastKnownBalance === -1) {
                        lastKnownBalance = currentBalance;
                    } else if (currentBalance !== lastKnownBalance) {
                        lastKnownBalance = currentBalance;
                        
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ type: "balance_updated" })}\n\n`)
                        );
                    }
                } catch {
                    clearInterval(poll);
                    controller.close();
                }
            }, 3000); // poll every 3 seconds

            req.signal.addEventListener("abort", () => {
                clearInterval(poll);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}
