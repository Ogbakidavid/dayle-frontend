"use client";

import Link from "next/link";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CreateVaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Centered Minimalist Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/client" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-xl text-white tracking-tight font-black uppercase">Dayle</h1>
                    </Link>

                    <Link href="/client">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Exit to Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.header>

            {/* Focused Content Wrapper */}
            <main className="relative pt-20 pb-12 overflow-x-hidden">
                {children}
            </main>

            {/* Footer Branding */}
            <footer className="py-8 text-center border-t border-white/5">
                <div className="flex items-center justify-center gap-3 text-white/10">
                    <Shield className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                        Secured by Dayle Escrow Protocol
                    </span>
                </div>
            </footer>
        </div>
    );
}
