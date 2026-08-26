"use client";
import { Modal } from "@repo/ui/modal";

export type Transaction = {
  time: Date;
  amount: number;
  status: string;
  provider: string;
  type?: "Received" | "Sent" | "Added" | "Paid";
};

export const TransactionModal = ({
  transaction,
  isOpen,
  onClose,
}: {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!transaction) return null;

  const isNegative = transaction.type === "Sent" || transaction.type === "Paid";
  const amountColor =
    transaction.status === "Failure"
      ? "text-red-500"
      : transaction.status === "Processing"
        ? "text-amber-500"
        : "text-green-500";
  const prefix = isNegative ? "-" : "+";

  let displayType: string = transaction.type || "Added";
  if (transaction.status === "Processing") {
    if (displayType === "Added") displayType = "Adding";
    if (displayType === "Sent") displayType = "Sending";
    if (displayType === "Received") displayType = "Receiving";
    if (displayType === "Paid") displayType = "Paying";
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
          <div className="w-24 h-24 rounded-full bg-border-dark flex items-center justify-center text-4xl mb-4 font-mono shadow-inner border border-slate-700">
            💸
          </div>
          <div className="text-xl font-sans font-bold text-text-light text-center md:text-left leading-tight mb-1">
            {transaction.provider}
          </div>
          <div className="text-text-dim font-mono text-sm mb-6">
            {transaction.time.toDateString()}
          </div>

          <div className="flex flex-col items-center md:items-start w-full">
            <div className={`text-2xl font-mono font-bold ${amountColor}`}>
              {prefix} {transaction.amount / 100}
            </div>
            <div className="text-text-dim text-xs mt-1 uppercase tracking-widest font-mono">
              INR Total
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          <div className="flex justify-between items-center border-b border-border-dark pb-2 mb-4">
            <div className="font-mono font-semibold text-text-light text-lg">
              Details
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="text-text-dim text-sm font-sans flex items-center">
              Status
            </div>
            <div>
              <span
                className={`inline-block font-mono text-xs border border-border-dark px-2 py-1 rounded-sm bg-bg-dark ${amountColor}`}
              >
                {transaction.status}
              </span>
            </div>

            <div className="text-text-dim text-sm font-sans flex items-center">
              Type
            </div>
            <div className="font-mono text-sm text-text-light bg-bg-dark border border-border-dark px-2 py-1 rounded-sm inline-block w-fit">
              {displayType}
            </div>

            <div className="text-text-dim text-sm font-sans flex items-center">
              Entity
            </div>
            <div className="font-mono text-sm text-text-light break-all">
              {transaction.provider}
            </div>

            <div className="text-text-dim text-sm font-sans flex items-center">
              Timestamp
            </div>
            <div className="font-mono text-sm text-text-light">
              {transaction.time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
