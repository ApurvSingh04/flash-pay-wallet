import { SendCard } from "../../../components/SendCard";

export default function P2P() {
    return <div className="w-full">
        <div className="text-4xl text-purple-400 pt-8 mb-8 font-bold px-4">
            Send Money
        </div>
        <div className="flex justify-center px-4">
            <div className="w-full max-w-md">
                <SendCard />
            </div>
        </div>
    </div>
}