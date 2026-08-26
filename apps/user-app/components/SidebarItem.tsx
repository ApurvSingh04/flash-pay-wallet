"use client"
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return <div className={`flex items-center cursor-pointer p-3 pl-8 transition-colors ${selected ? "bg-card-bg border-l-4 border-accent text-text-light" : "text-text-dim hover:bg-card-bg hover:text-text-light border-l-4 border-transparent"}`} onClick={() => {
        router.push(href);
    }}>
        <div className="pr-4">
            {icon}
        </div>
        <div className={`font-mono text-sm tracking-wide ${selected ? "font-bold" : "font-medium"}`}>
            {title}
        </div>
    </div>
}