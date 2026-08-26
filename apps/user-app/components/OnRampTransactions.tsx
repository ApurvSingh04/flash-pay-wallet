"use client";
import { Card } from "@repo/ui/card";
import { useState } from "react";
import { TransactionModal, Transaction } from "./TransactionModal";

import Link from "next/link";

export const OnRampTransactions = ({
    transactions,
    title = "Recent Transactions",
    showViewAll = false
}: {
    transactions: Transaction[],
    title?: string,
    showViewAll?: boolean
}) => {
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

    if (!transactions.length) {
        return <Card title={title}>
            <div className="text-center pb-8 pt-8 text-text-dim font-mono text-sm">
                No Recent transactions
            </div>
        </Card>
    }

    return (
        <Card title={title}>
            <div className="pt-2 flex flex-col gap-2">
                {transactions.map((t, index) => {
                    const statusColor = t.status === 'Processing' ? 'text-amber-500 border-amber-500/30' : t.status === 'Failure' ? 'text-red-500 border-red-500/30' : 'text-green-500 border-green-500/30';
                    
                    return (
                        <div 
                            key={index} 
                            onClick={() => setSelectedTxn(t)}
                            className="flex justify-between items-center py-3 px-3 bg-bg-dark border border-border-dark rounded-sm cursor-pointer hover:border-accent transition-colors group"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="text-sm font-sans font-semibold text-text-light group-hover:text-accent transition-colors">
                                    {t.status === 'Processing' ? `Adding via ${t.provider}` : `Added via ${t.provider}`}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-text-dim font-mono text-xs">
                                        {t.time.toDateString()}
                                    </div>
                                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm border ${statusColor}`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                            <div className={`font-mono font-bold text-sm ${t.status === 'Processing' ? 'text-amber-500' : t.status === 'Failure' ? 'text-red-500' : 'text-green-500'}`}>
                                + {t.amount / 100}
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
            
            {showViewAll && (
                <div className="pt-4 mt-2 flex justify-center">
                    <Link href="/transactions" className="text-accent text-sm font-mono hover:underline">
                        View all →
                    </Link>
                </div>
            )}
        </Card>
    );
}