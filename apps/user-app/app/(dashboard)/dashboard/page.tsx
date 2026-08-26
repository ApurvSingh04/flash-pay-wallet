import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { BalanceCard } from "../../../components/BalanceCard";
import { AddNameBanner } from "../../../components/AddNameBanner";
import Link from "next/link";

async function getDashboardData() {
    const session = await getServerSession(authOptions);
    const userId = Number((session?.user as any)?.id);

    if (!userId) {
        return { balance: { amount: 0, locked: 0 }, recentTransactions: [], userName: null };
    }

    const [balance, onRampTxns, p2pSentTxns, p2pReceivedTxns, userDb] = await Promise.all([
        prisma.balance.findFirst({ where: { userId } }),
        prisma.onRampTransaction.findMany({ where: { userId }, orderBy: { startTime: 'desc' }, take: 5 }),
        prisma.p2pTransfer.findMany({ where: { fromUserId: userId }, include: { toUser: true }, orderBy: { timeStamp: 'desc' }, take: 5 }),
        prisma.p2pTransfer.findMany({ where: { toUserId: userId }, include: { fromUser: true }, orderBy: { timeStamp: 'desc' }, take: 5 }),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
    ]);

    const userName = userDb?.name || null;

    const allTransactions = [
        ...onRampTxns.map(t => ({
            time: t.startTime,
            amount: t.amount,
            label: t.status === 'Processing' ? `Adding via ${t.provider}` : `Added via ${t.provider}`,
            color: t.status === 'Failure' ? 'text-red-500' : t.status === 'Processing' ? 'text-amber-500' : 'text-green-500',
            prefix: '+',
        })),
        ...p2pSentTxns.map(t => ({
            time: t.timeStamp,
            amount: t.amount,
            label: `Sent to ${t.toUser.name || t.toUser.number}`,
            color: 'text-text-light',
            prefix: '-',
        })),
        ...p2pReceivedTxns.map(t => ({
            time: t.timeStamp,
            amount: t.amount,
            label: `Received from ${t.fromUser.name || t.fromUser.number}`,
            color: 'text-green-500',
            prefix: '+',
        })),
    ]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 5);

    return {
        balance: { amount: balance?.amount || 0, locked: balance?.locked || 0 },
        recentTransactions: allTransactions,
        userName,
    };
}

export default async function DashboardPage() {
    const { balance, recentTransactions, userName } = await getDashboardData();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const quickActions = [
        {
            href: "/transfer",
            label: "Add Money",
            icon: "M12 4.5v15m7.5-7.5h-15",
        },
        {
            href: "/p2p",
            label: "Send Money",
            icon: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5",
        },
        {
            href: "/merchant-pay",
            label: "Pay Merchant",
            icon: "M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z",
        },
        {
            href: "/transactions",
            label: "History",
            icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        },
    ];

    return (
        <div className="w-full p-6 max-w-5xl">
            {/* Optional Name Banner */}
            {!userName && <AddNameBanner />}

            {/* Greeting */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-sans text-text-light">
                    Welcome back{userName ? `, ${userName}` : ""}! 👋
                </h1>
                <p className="text-text-dim mt-1 text-sm font-mono">{dateStr}</p>
            </div>

            {/* Quick Actions — Flat, minimal styling */}
            <div className="flex items-center gap-4 mb-6">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-bg-dark border border-border-dark text-text-dim group-hover:text-accent group-hover:border-accent transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                            </svg>
                        </div>
                        <span className="text-[10px] text-text-dim font-mono tracking-widest uppercase group-hover:text-text-light transition-colors">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Main content — 2 column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Balance */}
                <BalanceCard amount={balance.amount} locked={balance.locked} showTotalOnly={true} />

                {/* Right — Recent Activity */}
                <div className="border border-border-dark p-6 bg-card-bg rounded-sm shadow-none">
                    <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-2">
                        <h2 className="text-base font-semibold text-text-light">Recent Activity</h2>
                        <Link href="/transactions" className="text-xs text-accent hover:underline font-mono">
                            View all →
                        </Link>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-text-dim">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-3 opacity-40">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            <p className="text-sm font-mono">No transactions yet.</p>
                            <Link href="/transfer" className="mt-2 text-xs text-accent hover:underline">Add money to get started</Link>
                        </div>
                    ) : (
                        <div>
                            {recentTransactions.map((t, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-border-dark last:border-b-0 hover:bg-bg-dark -mx-2 px-2 rounded-sm transition-colors cursor-default">
                                    <div>
                                        <div className="text-sm font-semibold font-sans text-text-light">{t.label}</div>
                                        <div className="text-xs text-text-dim mt-0.5 font-mono">
                                            {t.time.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold font-mono ${t.color}`}>
                                        {t.prefix} &#8377;{t.amount / 100}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
