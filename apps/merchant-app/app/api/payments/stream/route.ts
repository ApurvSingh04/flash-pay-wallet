import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "@repo/db/client";

// Force dynamic so Next.js never caches this streaming route
export const dynamic = "force-dynamic";

/**
 * SSE endpoint — merchant browser connects here and receives push events
 * whenever a new payment arrives. The stream polls the DB every 3 seconds
 * and sends a 'payment' event if new MerchantTransaction rows are found.
 */
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const merchantId = (session?.user as any)?.id;

    if (!merchantId) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Snapshot the latest transaction ID so we only emit truly NEW ones
    const latestTxn = await prisma.merchantTransaction.findFirst({
        where: { merchantId: Number(merchantId) },
        orderBy: { timestamp: "desc" },
    });

    let lastSeenId = latestTxn?.id ?? 0;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send a heartbeat immediately so the browser knows the connection is live
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
            );

            const poll = setInterval(async () => {
                try {
                    // Look for any new transactions since the last one we already know about
                    const newTxns = await prisma.merchantTransaction.findMany({
                        where: {
                            merchantId: Number(merchantId),
                            id: { gt: lastSeenId },
                        },
                        include: { user: true },
                        orderBy: { timestamp: "asc" },
                    });

                    if (newTxns.length > 0) {
                        // Advance the cursor so we don't re-emit on next tick
                        lastSeenId = newTxns[newTxns.length - 1]!.id;

                        // Fetch the fresh balance to send along with the event
                        const balance = await prisma.merchantBalance.findUnique({
                            where: { merchantId: Number(merchantId) },
                        });

                        const payload = {
                            type: "payment",
                            transactions: newTxns.map((t) => ({
                                id: t.id,
                                amount: t.amount,
                                from: t.user.name || t.user.number,
                                timestamp: t.timestamp.toISOString(),
                            })),
                            balance: balance?.amount ?? 0,
                        };

                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
                        );
                    }
                } catch {
                    // DB error — stop the stream gracefully
                    clearInterval(poll);
                    controller.close();
                }
            }, 3000); // poll every 3 s

            // Clean up when the browser tab closes / navigates away
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
