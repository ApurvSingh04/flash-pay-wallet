import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
import { authOptions } from "../../../lib/auth";

async function getMerchantBalance() {
  const session = await getServerSession(authOptions);
  const merchantId = (session?.user as any)?.id;

  if (!merchantId) {
    return { amount: 0, locked: 0 };
  }

  const balance = await prisma.merchantBalance.findUnique({
    where: { merchantId: Number(merchantId) },
  });

  return {
    amount: balance?.amount || 0,
    locked: balance?.locked || 0,
  };
}

export default async function DashboardPage() {
  const balance = await getMerchantBalance();

  return (
    <div className="w-full">
      <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold">
        Dashboard
      </div>
      <div className="p-4">
        <div className="bg-card-bg border-border-dark rounded-sm p-6 shadow-none border max-w-sm">
          <h3 className="text-lg font-semibold text-text-light font-sans mb-4">
            Total Balance
          </h3>
          <div className="text-3xl font-bold font-mono text-text-light">
            ₹{(balance.amount / 100).toLocaleString("en-IN")}
          </div>
          <div className="text-sm text-text-dim font-mono mt-2">
            Available for settlement
          </div>
        </div>
      </div>
    </div>
  );
}
