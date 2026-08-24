"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PaymentEvent {
    type: "connected" | "payment";
    transactions?: {
        id: number;
        amount: number;
        from: string;
        timestamp: string;
    }[];
    balance?: number;
}

/**
 * Invisible client component that connects to the SSE stream and:
 *  1. Shows a toast notification for every incoming payment
 *  2. Calls router.refresh() so the server-component balance card re-renders
 *
 * Mount it once in the dashboard layout so it stays alive while the merchant
 * is navigating between pages.
 */
export function PaymentNotifier() {
    const router = useRouter();
    // Keep a stable ref to router so the effect closure doesn't go stale
    const routerRef = useRef(router);
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    useEffect(() => {
        let es: EventSource | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        function connect() {
            es = new EventSource("/api/payments/stream");

            es.onmessage = (event) => {
                const data: PaymentEvent = JSON.parse(event.data);

                if (data.type === "payment" && data.transactions) {
                    data.transactions.forEach((t) => {
                        toast.success("💰 Payment received!", {
                            description: `₹${(t.amount / 100).toLocaleString("en-IN")} from ${t.from}`,
                            duration: 6000,
                        });
                    });

                    // Flush the Next.js client-side router cache so the
                    // server-component balance card re-renders with fresh data
                    routerRef.current.refresh();
                }
            };

            es.onerror = () => {
                es?.close();
                // Auto-reconnect after 5 s in case the connection drops
                reconnectTimer = setTimeout(connect, 5000);
            };
        }

        connect();

        return () => {
            es?.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, []); // empty deps — run once on mount

    return null; // purely side-effect component
}
