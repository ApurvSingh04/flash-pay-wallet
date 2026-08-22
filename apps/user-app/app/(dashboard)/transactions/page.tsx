import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { TransactionHistory } from "../../../components/TransactionHistory";

async function getTransactions() {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
        return [];
    }

    const onRampTxns = await prisma.onRampTransaction.findMany({
        where: { userId }
    });

    const p2pSentTxns = await prisma.p2pTransfer.findMany({
        where: { fromUserId: userId },
        include: { toUser: true }
    });

    const p2pReceivedTxns = await prisma.p2pTransfer.findMany({
        where: { toUserId: userId },
        include: { fromUser: true }
    });

    const transactions = [
        ...onRampTxns.map(t => ({
            time: t.startTime,
            amount: t.amount,
            status: t.status,
            provider: t.provider,
            type: 'Added' as const
        })),
        ...p2pSentTxns.map(t => ({
            time: t.timeStamp,
            amount: t.amount,
            status: 'Success',
            provider: t.toUser.name || t.toUser.number,
            type: 'Sent' as const
        })),
        ...p2pReceivedTxns.map(t => ({
            time: t.timeStamp,
            amount: t.amount,
            status: 'Success',
            provider: t.fromUser.name || t.fromUser.number,
            type: 'Received' as const
        }))
    ];

    return transactions.sort((a, b) => b.time.getTime() - a.time.getTime());
}

export default async function TransactionsPage() {
    const transactions = await getTransactions();

    return <div className="w-full">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transactions
        </div>
        <div className="p-4">
            <TransactionHistory transactions={transactions} />
        </div>
    </div>
}