'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AmountDisplay } from "@/components/ui/amount-display";
import { Wallet, Clock } from "lucide-react";

export function WalletBalance({ balance, role = "client" }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Available Funds - The Dopamine Hit */}
            <Card className="bg-slate-900 border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet size={120} className="text-white rotate-12" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Available Funds
                    </div>
                    <AmountDisplay
                        amount={balance?.available || 0}
                        size="large"
                        className="text-white text-4xl"
                    />
                    <div className="mt-6 flex items-center gap-3">
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                            Instant Processing
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pending Funds - Future Certainty */}
            <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                        <Clock size={14} className="text-slate-400" />
                        Pending in Vaults
                    </div>
                    <AmountDisplay
                        amount={balance?.pending || 0}
                        size="large"
                        className="text-slate-900 text-4xl"
                    />
                    <div className="mt-6 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {role === 'client' ? 'Locked for verification' : 'Awating client release'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
