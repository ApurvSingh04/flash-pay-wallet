import { Card } from "@repo/ui/card"

type Transaction = {
    time: Date;
    amount: number;
    status: string;
    provider: string;
    type: 'Received' | 'Sent' | 'Added';
}

export const TransactionHistory = ({
    transactions
}: {
    transactions: Transaction[]
}) => {
    if (!transactions.length) {
        return <Card title="Transaction History">
            <div className="text-center pb-8 pt-8 text-slate-500">
                No transactions found
            </div>
        </Card>
    }
    
    return <Card title="Transaction History">
        <div className="pt-2">
            {transactions.map((t, index) => <div key={index} className="flex justify-between py-2 border-b border-slate-100 last:border-b-0">
                <div>
                    <div className="text-sm font-semibold text-slate-800">
                        {t.type === 'Added' && `Added via ${t.provider}`}
                        {t.type === 'Received' && `Received from ${t.provider}`}
                        {t.type === 'Sent' && `Sent to ${t.provider}`}
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                        {t.time.toLocaleString()}
                    </div>
                    {t.status && t.status !== 'Success' && (
                         <div className={`text-xs mt-1 font-medium ${t.status === 'Processing' ? 'text-yellow-600' : 'text-red-600'}`}>
                             {t.status}
                         </div>
                    )}
                </div>
                <div className={`flex flex-col justify-center font-semibold ${t.type === 'Sent' ? 'text-red-500' : 'text-green-500'}`}>
                    {t.type === 'Sent' ? '-' : '+'} Rs {t.amount / 100}
                </div>
            </div>)}
        </div>
    </Card>
}
