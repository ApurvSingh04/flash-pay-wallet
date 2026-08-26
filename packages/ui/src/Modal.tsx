"use client";
import React from "react";

export function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal Content */}
            <div className="relative z-50 w-full max-w-2xl mx-4 bg-card-bg border border-border-dark rounded-sm shadow-2xl p-6">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-dim hover:text-text-light transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                {children}
            </div>
        </div>
    );
}
