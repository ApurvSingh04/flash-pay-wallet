export default function TransferLoading() {
    return <div className="w-full">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transfer
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                {/* Skeleton for Add Money Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 mt-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full mb-8"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
                </div>
            </div>
            <div>
                {/* Skeleton for Balance Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border animate-pulse mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="flex justify-between mb-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                    <div className="flex justify-between mb-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div>
                    <div className="flex justify-between"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-4 bg-gray-300 rounded w-1/4"></div></div>
                </div>
                {/* Skeleton for Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm p-6 border animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between py-2">
                                <div className="space-y-2 w-1/2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
