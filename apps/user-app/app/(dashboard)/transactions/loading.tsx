export default function TransactionsLoading() {
    return <div className="w-full">
        <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold">
            Transactions
        </div>
        <div className="p-4">
            <div className="bg-slate-900 border-slate-800 rounded-xl shadow-sm p-6 border animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between py-3 border-b border-slate-800 last:border-0">
                            <div className="space-y-2 w-1/2">
                                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                            </div>
                            <div className="h-4 bg-slate-800 rounded w-1/6"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
}
