"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { linkWallet } from "../app/lib/actions/linkWallet";
import { toast } from "sonner";

export function LinkWalletCard({ currentLinkedNumber }: { currentLinkedNumber?: string }) {
    const router = useRouter();
    const [number, setNumber] = useState(currentLinkedNumber || "");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(!currentLinkedNumber);

    return (
        <Card title="Link Flash Pay Wallet">
            <div className="min-w-72 pt-2">
                <div className="text-sm text-text-dim mb-4 font-mono">
                    {currentLinkedNumber 
                        ? "Your merchant balance is currently linked to this phone number." 
                        : "Enter a Flash Pay user's phone number to link it for withdrawals."}
                </div>
                
                {!isEditing && currentLinkedNumber ? (
                    <div className="flex justify-between items-center bg-bg-dark border border-border-dark p-2.5 rounded-sm">
                        <span className="font-mono text-sm text-text-light">{currentLinkedNumber}</span>
                        <button 
                            className="text-xs text-accent hover:underline font-mono"
                            onClick={() => setIsEditing(true)}
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <>
                        <TextInput 
                            placeholder="Phone Number" 
                            label="Wallet Phone Number" 
                            value={number} 
                            onChange={(value) => setNumber(value)} 
                        />
                        <div className="pt-4 flex justify-center">
                            <Button onClick={async () => {
                                if (loading || !number.trim()) return;
                                if (number === currentLinkedNumber) {
                                    setIsEditing(false);
                                    return;
                                }
                                setLoading(true);
                                const res = await linkWallet(number);
                                setLoading(false);
                                if (res.message === "Wallet linked successfully!") {
                                    toast.success(res.message);
                                    setIsEditing(false);
                                    router.refresh();
                                } else {
                                    toast.error(res.message);
                                }
                            }}>
                                {loading ? "Linking..." : (currentLinkedNumber ? "Save New Wallet" : "Link Wallet")}
                            </Button>
                        </div>
                        {currentLinkedNumber && (
                            <div className="pt-3 flex justify-center">
                                <button 
                                    className="text-xs text-text-dim hover:text-text-light transition-colors" 
                                    onClick={() => {
                                        setNumber(currentLinkedNumber);
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
}
