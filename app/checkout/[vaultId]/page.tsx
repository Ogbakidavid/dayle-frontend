"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  ChevronRight,
} from "lucide-react";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";

import { useVault, Vault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";

import { api, VaultStatus } from "@/lib/api-client";
import { toast } from "sonner";

export default function CheckoutSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading: contextLoading } = useVault();
  const vaultId = params.vaultId as string;

  const [localVault, setLocalVault] = React.useState<Vault | null>(null);
  const [fetching, setFetching] = React.useState(false);

  const fetchVault = React.useCallback(async () => {
    setFetching(true);
    try {
      const v = await api.vaults.getById(vaultId);
      setLocalVault(v);
    } catch (err) {
      console.error("Failed to fetch vault:", err);
    } finally {
      setFetching(false);
    }
  }, [vaultId]);

  React.useEffect(() => {
    const cachedVault = (vaults || []).find((v) => v.id === vaultId);
    if (cachedVault) {
      setLocalVault(cachedVault);
    } else if (vaultId && !contextLoading) {
      fetchVault();
    }
  }, [vaults, vaultId, contextLoading, fetchVault]);

  const vault = localVault;
  const amount = vault?.formattedTotalAmount
    ? Number(vault.formattedTotalAmount)
    : 0;
  const displayAmount = vault?.localAmount || 0;
  const currencySymbol = vault?.localCurrency === "KES" ? "KSh" : (vault?.localCurrency === "NGN" ? "₦" : "$");
  const currencyCode = vault?.localCurrency || "USD";

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR (25%) */}
        <section className="w-full lg:w-[400px] bg-slate-50 p-10 lg:p-14 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-20" />
          
          <div className="space-y-20 relative z-10">
            <div className="flex items-center gap-0 group cursor-pointer" onClick={() => router.push("/client")}>
              <div className="w-10 h-10 flex items-center justify-center cursor-pointer">
                <DayleLogo className="w-10 h-10 text-emerald-600" />
              </div>
              <span className="text-slate-900 font-black tracking-tighter text-2xl lg:text-3xl">
                Dayle
              </span>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 tracking-wide capitalize">
                  Total settlement
                </p>
                <div className="flex flex-col gap-1">
                  <CurrencyEstimate 
                    usdAmount={Number(vault?.formattedTotalAmount || 0) * 1.005} 
                    className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter"
                    showNote={false}
                  />
                  {/* <p className="text-emerald-600 font-black text-xs tracking-widest uppercase mt-1">
                    {currencyCode}
                  </p> */}
                </div>
              </div>

              <div className="pt-10 border-t border-slate-200/60 space-y-8">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black text-slate-400 tracking-wide capitalize">Project ID</span>
                  <span className="text-slate-900 font-bold text-[10px] bg-white px-3 py-1 rounded-lg border border-slate-200">
                    VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 tracking-wide capitalize">Network fee</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-black text-[10px] tracking-wide capitalize">Sponsored</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-auto pt-10">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
              <ShieldCheck className="w-5 h-5 text-emerald-500 relative z-10" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-slate-900 tracking-wide capitalize">Secure Custody</p>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  Funds are protected by smart contracts and bank-grade security.
                </p>
              </div>
            </div>
          </div> */}
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-20 flex items-center justify-center relative bg-[#FDFDFD]">
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
          
          <div className="max-w-xl w-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-wide capitalize mb-4 shadow-xl shadow-slate-900/10">
                  Secure checkout
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                  Deposit Funds
                </h2>
                <p className="text-sm font-bold text-slate-500 tracking-[0.05em]">
                  Please choose a payment method to fund your vault.
                </p>
              </div>

              {!(user?.kycStatus === KycStatus.VERIFIED || user?.paymentAccountReady) ? (
                <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-8 text-center shadow-2xl shadow-slate-200/50">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto border border-amber-100 shadow-inner">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                      Verification Pending
                    </h3>
                    <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">
                      To safeguard your transactions, identity verification is required before initiating deposits.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/client/settings?tab=kyc")}
                    className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                  >
                    Complete Verification
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Bank Transfer Selection */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      router.push(
                        `/checkout/${vaultId}/bank?currency=${currencyCode}`,
                      )
                    }
                    className="w-full p-10 bg-white border border-slate-200 rounded-[3rem] flex items-center gap-8 group hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all shrink-0">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="text-left relative z-10">
                      <p className="text-slate-900 font-black text-2xl tracking-tight group-hover:text-slate-900 transition-colors">
                        Bank Transfer
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors tracking-wide uppercase mt-1">
                        Secure instant wire transfer
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 ml-auto text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
