import { Card } from "@repo/ui/card";

export const BalanceCard = ({amount, locked, showTotalOnly}: {
    amount: number;
    locked: number;
    showTotalOnly?: boolean;
}) => {
    return <Card title={"Balance"}>
        {!showTotalOnly && (
            <>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                    <div>
                        Unlocked balance
                    </div>
                    <div>
                        {amount / 100} INR
                    </div>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-2">
                    <div>
                        Total Locked Balance
                    </div>
                    <div>
                        {locked / 100} INR
                    </div>
                </div>
            </>
        )}
        <div className={`flex justify-between py-2 ${showTotalOnly ? '' : 'border-b border-slate-800'}`}>
            <div>
                Total Balance
            </div>
            <div className={showTotalOnly ? "text-2xl font-bold" : ""}>
                {(locked + amount) / 100} INR
            </div>
        </div>
    </Card>
}