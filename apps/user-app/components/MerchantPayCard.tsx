"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { merchantTransfer } from "../app/lib/actions/merchantTransfer";
import { toast } from "sonner";

export function MerchantPayCard() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState("");

    useEffect(() => {
        setIdempotencyKey(crypto.randomUUID());
    }, []);

    return <Card title="Pay Merchant">
        <div className="min-w-72 pt-2">
            <TextInput placeholder={"Merchant Email"} label="Merchant Email" onChange={(value) => {
                setEmail(value)
            }} />
            <TextInput placeholder={"Amount"} label="Amount (₹)" onChange={(value) => {
                setAmount(value)
            }} />
            <div className="pt-4 flex justify-center">
                <Button onClick={async () => {
                    if (loading || !idempotencyKey) return;
                    setLoading(true);
                    const res = await merchantTransfer(email, Number(amount) * 100, idempotencyKey);
                    setLoading(false);
                    if (res?.message === "Transfer successful") {
                        toast.success(res.message);
                        setIdempotencyKey(crypto.randomUUID());
                        router.refresh(); // flush client-side router cache so balance updates instantly
                    } else if (res?.message) {
                        toast.error(res.message);
                    }
                }}>{loading ? "Processing..." : "Pay"}</Button>
            </div>
        </div>
    </Card>
}

