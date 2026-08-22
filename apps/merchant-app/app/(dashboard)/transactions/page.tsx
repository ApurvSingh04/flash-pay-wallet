import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
import { authOptions } from "../../../lib/auth";

async function getMerchantTransactions() {
    const session = await getServerSession(authOptions);
    const merchantId = (session?.user as any)?.id;
    
    if (!merchantId) {
        return [];
    }

    const txns = await prisma.merchantTransaction.findMany({
        where: { merchantId: Number(merchantId) },
        include: { user: true },
        orderBy: { timestamp: 'desc' }
    });
    
    return txns;
}

export default async function TransactionsPage() {
    const transactions = await getMerchantTransactions();
    
    return <div className="w-full">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Recent Payments
        </div>
        <div className="p-4 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border">
                {transactions.length === 0 ? (
                    <div className="text-center p-8 text-slate-500">No payments received yet.</div>
                ) : (
                    <div>
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0">
                                <div>
                                    <div className="font-semibold text-gray-800">
                                        Received from {t.user.name || t.user.number}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {t.timestamp.toLocaleString()}
                                    </div>
                                </div>
                                <div className="font-bold text-green-500">
                                    + Rs {t.amount / 100}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
}
