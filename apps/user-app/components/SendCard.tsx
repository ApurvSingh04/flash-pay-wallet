"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

import { toast } from "sonner";

export function SendCard() {
    const router = useRouter();
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState("");

    useEffect(() => {
        setIdempotencyKey(crypto.randomUUID());
    }, []);

    return <Card title="Send Money">
        <div className="min-w-72 pt-2">
            <TextInput placeholder={"Phone Number"} label="Recipient's Number" onChange={(value) => {
                setNumber(value)
            }} />
            <TextInput placeholder={"Amount"} label="Amount (₹)" onChange={(value) => {
                setAmount(value)
            }} />
            <div className="pt-4 flex justify-center">
                <Button onClick={async () => {
                    if (loading || !idempotencyKey) return;
                    setLoading(true);
                    const res = await p2pTransfer(number, Number(amount) * 100, idempotencyKey);
                    setLoading(false);
                    if (res?.message === "Transfer successful") {
                        toast.success(res.message);
                        setIdempotencyKey(crypto.randomUUID());
                        router.refresh(); // flush client-side router cache so balance updates instantly
                    } else if (res?.message) {
                        toast.error(res.message);
                    }
                }}>{loading ? "Sending..." : "Send"}</Button>
            </div>
        </div>
    </Card>
}