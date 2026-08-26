"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import { createOnRampTransactions } from "../app/lib/actions/createOnRampTxn";

import { toast } from "sonner";

const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/"
}];

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl || "");    
    const [amount, setAmount] = useState(0);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || ""); 
    const [loading, setLoading] = useState(false);

    return <Card title="Add Money">
    <div className="w-full">
        <TextInput label={"Amount"} placeholder={"Amount"} value={amount || ""} onChange={(val) => {
            setAmount(Number(val));
        }} />
        <div className="py-2 text-sm font-mono text-text-dim">
            Bank
        </div>
        <Select value={provider} onSelect={(value) => {
            setRedirectUrl(SUPPORTED_BANKS.find(x => x.name === value)?.redirectUrl || "")
            setProvider(SUPPORTED_BANKS.find(x => x.name === value)?.name || "")
        }} options={SUPPORTED_BANKS.map(x => ({
            key: x.name,
            value: x.name
        }))} />
        <div className="flex justify-center pt-4">
            <Button onClick={async() => {
                if (loading) return;
                if (!amount || amount <= 0) {
                    toast.error("Please enter a valid amount greater than ₹0");
                    return;
                }
                setLoading(true);
                const res = await createOnRampTransactions(amount * 100, provider);
                setLoading(false);
                if (res.message === "On ramp transaction added") {
                    toast.success("Transaction processing");
                    window.location.href = redirectUrl || "";
                } else {
                    toast.error(res.message);
                }
            }}>
            {loading ? "Processing..." : "Add Money"}
            </Button>
        </div>
    </div>
</Card>
}