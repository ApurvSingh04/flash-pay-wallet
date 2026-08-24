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

    const [onRampTxns, p2pSentTxns, p2pReceivedTxns, merchantTxns] = await Promise.all([
        prisma.onRampTransaction.findMany({
            where: { userId }
        }),
        prisma.p2pTransfer.findMany({
            where: { fromUserId: userId },
            include: { toUser: true }
        }),
        prisma.p2pTransfer.findMany({
            where: { toUserId: userId },
            include: { fromUser: true }
        }),
        // Bug fix: merchant payments were previously missing from user history
        prisma.merchantTransaction.findMany({
            where: { userId },
            include: { merchant: true }
        }),
    ]);

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
        })),
        ...merchantTxns.map(t => ({
            time: t.timestamp,
            amount: t.amount,
            status: 'Success',
            provider: t.merchant.name || t.merchant.email,
            type: 'Paid' as const
        })),
    ];

    return transactions.sort((a, b) => b.time.getTime() - a.time.getTime());
}

export default async function TransactionsPage() {
    const transactions = await getTransactions();

    return <div className="w-full">
        <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold">
            Transactions
        </div>
        <div className="p-4">
            <TransactionHistory transactions={transactions} />
        </div>
    </div>
}