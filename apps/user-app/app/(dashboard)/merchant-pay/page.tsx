import { MerchantPayCard } from "../../../components/MerchantPayCard";

export default function MerchantPayPage() {
    return <div className="w-full">
        <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold px-4">
            Pay Merchant
        </div>
        <div className="flex justify-center px-4">
            <div className="w-full max-w-md">
                <MerchantPayCard />
            </div>
        </div>
    </div>
}
