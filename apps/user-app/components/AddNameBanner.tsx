"use client";
import { useState } from "react";
import { updateName } from "../app/lib/actions/updateName";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const AddNameBanner = () => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const res = await updateName(name);
        setLoading(false);
        
        if (res.message === "Name updated successfully") {
            toast.success("Name updated!");
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-6 bg-accent/10 border border-accent rounded-sm gap-4">
            <div className="text-sm font-sans text-text-light font-medium flex items-center gap-2">
                <span className="text-accent text-lg">✦</span>
                Complete your profile by adding your name!
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 sm:w-48 bg-bg-dark border border-border-dark text-text-light font-mono text-sm rounded-sm focus:ring-0 focus:border-accent p-2 outline-none transition-colors"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSave();
                        }
                    }}
                />
                <button 
                    onClick={handleSave}
                    disabled={loading || !name.trim()}
                    className="bg-accent text-bg-dark px-4 py-2 rounded-sm font-mono font-bold text-sm hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:hover:bg-accent cursor-pointer"
                >
                    {loading ? "..." : "SAVE"}
                </button>
            </div>
        </div>
    );
};
