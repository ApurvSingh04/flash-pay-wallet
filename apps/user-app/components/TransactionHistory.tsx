"use client";
import { Card } from "@repo/ui/card";
import { useState } from "react";
import { TransactionModal, Transaction } from "./TransactionModal";

export const TransactionHistory = ({
    transactions
}: {
    transactions: Transaction[]
}) => {
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    if (!transactions.length) {
        return <Card title="Transaction History">
            <div className="text-center pb-8 pt-8 text-text-dim font-mono text-sm">
                No transactions found
            </div>
        </Card>
    }
    
    return (
        <Card title="Transaction History">
            <div className="pt-2 flex flex-col gap-2">
                {transactions.map((t, index) => {
                    const isNegative = t.type === 'Sent' || t.type === 'Paid';
                    const amountColor = t.status === 'Failure' ? 'text-red-500' : t.status === 'Processing' ? 'text-amber-500' : 'text-green-500';
                    const statusColor = t.status === 'Failure' ? 'text-red-500 border-red-500/30' : t.status === 'Processing' ? 'text-amber-500 border-amber-500/30' : 'text-green-500 border-green-500/30';
                    const prefix = isNegative ? '-' : '+';

                    return (
                        <div 
                            key={index} 
                            onClick={() => setSelectedTxn(t)}
                            className="flex justify-between items-center py-3 px-3 bg-bg-dark border border-border-dark rounded-sm cursor-pointer hover:border-accent transition-colors group"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="text-sm font-sans font-semibold text-text-light group-hover:text-accent transition-colors">
                                    {t.type === 'Added' && (t.status === 'Processing' ? `Adding via ${t.provider}` : `Added via ${t.provider}`)}
                                    {t.type === 'Received' && (t.status === 'Processing' ? `Receiving from ${t.provider}` : `Received from ${t.provider}`)}
                                    {t.type === 'Sent' && (t.status === 'Processing' ? `Sending to ${t.provider}` : `Sent to ${t.provider}`)}
                                    {t.type === 'Paid' && `Paid to ${t.provider}`}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-text-dim font-mono text-xs">
                                        {t.time.toLocaleDateString()}
                                    </div>
                                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm border ${statusColor}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                            <div className={`font-mono font-bold text-sm ${amountColor}`}>
                                {prefix} {t.amount / 100}
                            </div>
                        </div>
                    );
                })}
            </div>

            <TransactionModal 
                transaction={selectedTxn} 
                isOpen={!!selectedTxn} 
                onClose={() => setSelectedTxn(null)} 
            />
        </Card>
    );
}
