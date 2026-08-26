"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { withdrawToWallet } from "../app/lib/actions/withdraw";
import { toast } from "sonner";

export function WithdrawCard({ maxAmount, disabled }: { maxAmount: number, disabled?: boolean }) {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <Card title="Withdraw to Wallet">
            <div className="min-w-72 pt-2">
                <div className="text-sm text-text-dim mb-4 font-mono">
                    Transfer funds directly to your linked Flash Pay wallet.
                </div>
                <TextInput 
                    placeholder="Amount" 
                    label="Amount (₹)" 
                    value={amount} 
                    onChange={(value) => setAmount(value)} 
                />
                <div className="pt-4 flex justify-center">
                    <Button onClick={async () => {
                        if (disabled) {
                            toast.error("Please link a wallet first.");
                            return;
                        }
                        const numAmount = Number(amount) * 100;
                        if (isNaN(numAmount) || numAmount <= 0) {
                            toast.error("Invalid amount");
                            return;
                        }
                        if (numAmount > maxAmount) {
                            toast.error("Amount exceeds current balance");
                            return;
                        }
                        
                        setLoading(true);
                        const res = await withdrawToWallet(Number(amount) * 100);
                        setLoading(false);
                        
                        if (res.message === "Withdrawal successful!") {
                            toast.success(res.message);
                            setAmount("");
                            router.refresh();
                        } else {
                            toast.error(res.message);
                        }
                    }}>
                        {loading ? "Processing..." : "Withdraw"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
