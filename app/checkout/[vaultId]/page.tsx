"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  ChevronRight,
} from "lucide-react";

import { useVault } from "@/lib/store/vault-context";

export default function CheckoutSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { vaults, loading } = useVault();
  const vaultId = params.vaultId as string;

  const vault = (vaults || []).find((v) => v.id === vaultId);
  const amount = vault?.totalAmount || 0;

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-['Poppins',sans-serif]">
        Loading...
      </div>
    );
  if (!vault)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-['Poppins',sans-serif]">
        Vault Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 font-['Poppins',sans-serif] antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR (25%) */}
        <section className="w-full lg:w-[350px] bg-[#080808] p-12 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />

          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
                onClick={() => router.push("/")}
              >
                <Lock className="w-5 h-5 text-black" />
              </div>
              <span className="text-white font-black tracking-tighter text-2xl uppercase italic">
                Dayle
              </span>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] italic leading-none">
                  TOTAL SETTLEMENT
                </p>
                <h1 className="text-6xl font-black text-white tracking-tighter sm:text-7xl font-mono flex items-baseline gap-2">
                  <span className="text-emerald-500 font-black text-3xl">
                    $
                  </span>
                  {amount.toLocaleString()}
                </h1>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  <span className="text-white/30 italic">Vault Reference</span>
                  <span className="text-white/70 italic font-mono tracking-normal">
                    {vaultId.slice(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  <span className="text-white/30 italic">Network Fee</span>
                  <span className="text-emerald-500 italic">$0.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">
                <ShieldCheck className="w-4 h-4" /> SECURE ESCROW
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-black uppercase tracking-widest">
                Funds are held in a secure multi-sig vault until milestone
                approval.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-24 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 via-transparent to-transparent">
          <div className="max-w-xl w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                  Funding Protocol
                </h2>
                <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                  Select your primary project liquidation method
                </p>
              </div>

              <div className="grid gap-6">
                <MethodBtn
                  icon={<CreditCard className="w-8 h-8" />}
                  title="Card Liquidity"
                  desc="Visa, Mastercard, Amex"
                  onClick={() => router.push(`/checkout/${vaultId}/card`)}
                />
                <MethodBtn
                  icon={<Building2 className="w-8 h-8" />}
                  title="Bank Settlement"
                  desc="Wire, ACH, SWIFT"
                  onClick={() => router.push(`/checkout/${vaultId}/bank`)}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

interface MethodBtnProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}

function MethodBtn({ icon, title, desc, onClick }: MethodBtnProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-8 bg-white/2 border border-white/5 rounded-[2.5rem] flex items-center gap-8 group hover:bg-emerald-500/3 hover:border-emerald-500/30 transition-all text-left shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-inner">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white font-black text-xl uppercase tracking-tighter italic group-hover:text-emerald-500 transition-colors">
          {title}
        </p>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors">
          {desc}
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/20 transition-all">
        <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}
