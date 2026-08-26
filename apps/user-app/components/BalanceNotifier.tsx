"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Invisible client component that connects to the SSE stream and:
 *  1. Shows a toast notification when the balance changes
 *  2. Calls router.refresh() so the server-component balance card re-renders
 */
export function BalanceNotifier() {
    const router = useRouter();
    const routerRef = useRef(router);
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    useEffect(() => {
        let es: EventSource | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        function connect() {
            es = new EventSource("/api/balance/stream");

            es.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "balance_updated") {
                    toast.success("Wallet Credited!", {
                        description: "Money has been added to your wallet.",
                        duration: 5000,
                    });

                    // Flush the Next.js client-side router cache so the
                    // server-component balance card re-renders with fresh data
                    routerRef.current.refresh();
                }
            };

            es.onerror = () => {
                es?.close();
                reconnectTimer = setTimeout(connect, 5000);
            };
        }

        connect();

        return () => {
            es?.close();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, []);

    return null;
}
