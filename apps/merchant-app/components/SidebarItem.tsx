"use client"
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return (
        <div className={`flex items-center gap-3 cursor-pointer p-3 pl-8 border-l-4 transition-all duration-200
            ${selected 
                ? "text-text-light border-accent bg-bg-dark font-semibold" 
                : "text-text-dim border-transparent hover:text-text-light hover:bg-bg-dark/50"
            }`} onClick={() => {
        router.push(href);
    }}>
        <div className="w-5 h-5">
            {icon}
        </div>
        <div className={`font-mono text-sm tracking-wide ${selected ? "text-accent" : ""}`}>
            {title}
        </div>
    </div>
    )
}
