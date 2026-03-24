"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Clock, ShieldCheck, Zap } from "lucide-react";
import { CurrencyEstimate } from "./currency-estimate";
import type { LedgerBalance as LedgerBalanceType } from "@/lib/store/ledger-context";

export interface LedgerBalanceProps {
  balance?: LedgerBalanceType | null;
  role?: "client" | "freelancer";
}

export function LedgerBalance({
  balance,
  role = "client",
}: LedgerBalanceProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 p-4">
      {/* Available Funds - The High Value Side */}
      <Card className="bg-muted border-white/5 shadow-2xl overflow-hidden relative group rounded-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 ease-in-out">
          <Landmark size={120} className="text-black rotate-12" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-transparent" />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-900 font-bold  text-sm mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            {role === "client" ? "Total investment" : "Available balance"}
          </div>
          <CurrencyEstimate 
            usdAmount={Number(balance?.formattedAvailable || "0")} 
            className="text-slate-900 text-5xl font-bold"
          />
          <div className="mt-8 flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-sm font-bold text-emerald-500  border border-emerald-500/20 flex items-center gap-2">
              <Zap size={10} /> {role === "client" ? "All-time project worth" : "Fully liquid"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Funds - Future Certainty */}
      <Card className="bg-muted border-white/5 shadow-2xl overflow-hidden relative group rounded-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 ease-in-out">
          <Clock size={120} className="text-black rotate-12" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-900 font-bold  text-sm mb-5">
            <ShieldCheck size={14} className="text-emerald-500/50" />
            Pending settlement
          </div>
          <CurrencyEstimate 
            usdAmount={Number(balance?.formattedPending || "0")} 
            className="text-slate-900 text-5xl font-bold"
          />
          <div className="mt-8 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900  flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/10" />
              {role === "client"
                ? "Reserved for project release"
                : "Awaiting client release"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
