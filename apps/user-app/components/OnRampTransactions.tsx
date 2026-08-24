import { Card } from "@repo/ui/card"

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        // TODO: Can the type of `status` be more specific?
        status: string,
        provider: string
    }[]
}) => {
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8 text-slate-400">
                No Recent transactions
            </div>
        </Card>
    }
    return <Card title="Recent Transactions">
        <div className="pt-2">
            {transactions.map((t, index) => <div key={index} className="flex justify-between py-1 border-b border-slate-800 last:border-b-0">
                <div>
                    <div className="text-sm font-semibold">
                        {t.status === 'Processing' ? `Adding via ${t.provider}` : `Added via ${t.provider}`}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                        {t.time.toDateString()}
                    </div>
                    {t.status && t.status !== 'Success' && (
                         <div className={`text-xs mt-1 font-medium ${t.status === 'Processing' ? 'text-amber-500' : 'text-red-600'}`}>
                             {t.status}
                         </div>
                    )}
                </div>
                <div className={`flex flex-col justify-center font-semibold ${t.status === 'Processing' ? 'text-amber-500' : t.status === 'Failure' ? 'text-red-500' : 'text-green-500'}`}>
                    + Rs {t.amount / 100}
                </div>

            </div>)}
        </div>
    </Card>
}