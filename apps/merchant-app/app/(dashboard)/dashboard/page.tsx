import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
import { authOptions } from "../../../lib/auth";

import { LinkWalletCard } from "../../../components/LinkWalletCard";
import { WithdrawCard } from "../../../components/WithdrawCard";

async function getMerchantDashboardData() {
  const session = await getServerSession(authOptions);
  const merchantId = (session?.user as any)?.id;

  if (!merchantId) {
    return null;
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: Number(merchantId) },
    include: { 
      balance: true,
      linkedUser: true,
      merchantWithdrawals: {
        orderBy: { timestamp: 'desc' },
        take: 5
      }
    },
  });

  return merchant;
}

export default async function DashboardPage() {
  const merchant = await getMerchantDashboardData();

  if (!merchant) return <div>Not logged in</div>;

  const balanceAmount = merchant.balance?.amount || 0;
  const currentLinkedNumber = merchant.linkedUser?.number;

  return (
    <div className="w-full">
      <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold">
        Dashboard
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <div className="flex flex-col gap-6">
          <div className="bg-card-bg border-border-dark rounded-sm p-6 shadow-none border">
            <h3 className="text-lg font-semibold text-text-light font-sans mb-4">
              Total Balance
            </h3>
            <div className="text-3xl font-bold font-mono text-text-light">
              ₹{(balanceAmount / 100).toLocaleString("en-IN")}
            </div>
            <div className="text-sm text-text-dim font-mono mt-2">
              Available for settlement
            </div>
          </div>
          
          <WithdrawCard maxAmount={balanceAmount} disabled={!currentLinkedNumber} />
        </div>

        <div className="flex flex-col gap-6">
          <LinkWalletCard currentLinkedNumber={currentLinkedNumber} />
          
          <div className="bg-card-bg border-border-dark rounded-sm p-6 shadow-none border">
            <h3 className="text-lg font-semibold text-text-light font-sans mb-4 border-b border-border-dark pb-2">
              Recent Withdrawals
            </h3>
            <div className="pt-2 flex flex-col gap-2">
              {merchant.merchantWithdrawals.length === 0 ? (
                 <div className="text-center pb-8 pt-8 text-text-dim font-mono text-sm">
                   No Recent withdrawals
                 </div>
              ) : (
                merchant.merchantWithdrawals.map(w => (
                  <div key={w.id} className="flex justify-between items-center py-3 px-3 bg-bg-dark border border-border-dark rounded-sm">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-sans font-semibold text-text-light">
                        Withdrew to Wallet
                      </div>
                      <div className="text-text-dim font-mono text-xs">
                        {w.timestamp.toDateString()}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm text-amber-500">
                      - {w.amount / 100}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
