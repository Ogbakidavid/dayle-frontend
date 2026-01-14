'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Clock, ShieldCheck, Zap } from "lucide-react";

export function WalletBalance({ balance, role = "client" }) {
    return (
        <div className="grid md:grid-cols-2 gap-6 p-4">
            {/* Available Funds - The High Value Side */}
            <Card className="bg-[#111111] border-gray-900 shadow-2xl overflow-hidden relative group rounded-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 ease-in-out">
                    <Wallet size={120} className="text-white rotate-12" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
                <CardContent className="p-8 relative z-10">
                    <div className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mb-5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        Available Funds
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-light text-gray-500">$</span>
                        <span className="text-5xl font-bold text-white tracking-tighter">
                            {balance?.available?.toLocaleString() || '0.00'}
                        </span>
                        <span className="text-sm font-bold text-gray-600 ml-1">USD</span>
                    </div>
                    <div className="mt-8 flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                            <Zap size={10} /> Fully Liquid
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Funds - Future Certainty */}
            <Card className="bg-[#111111] border-gray-900 shadow-2xl overflow-hidden relative group rounded-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 ease-in-out">
                    <Clock size={120} className="text-white rotate-12" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mb-5">
                        <ShieldCheck size={14} className="text-emerald-500/50" />
                        Pending in Vaults
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-light text-gray-500">$</span>
                        <span className="text-5xl font-bold text-gray-400 tracking-tighter">
                            {balance?.pending?.toLocaleString() || '0.00'}
                        </span>
                    </div>
                    <div className="mt-8 flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            {role === 'client' ? 'Reserved for project release' : 'Awaiting client release'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
