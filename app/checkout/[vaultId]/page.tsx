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

import { useVault, Vault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";

import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function CheckoutSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading: contextLoading } = useVault();
  const vaultId = params.vaultId as string;

  const [localVault, setLocalVault] = React.useState<Vault | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [currency, setCurrency] = React.useState<"USD" | "NGN">("USD");
  const EXCHANGE_RATE = 1500;

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
  const displayAmount = currency === "USD" ? amount : amount * EXCHANGE_RATE;
  const currencyPrefix = currency === "USD" ? "$" : "₦";

  return (
    <div className="min-h-screen bg-white text-slate-600 font-['Poppins',sans-serif] antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR (25%) */}
        <section className="w-full lg:w-[400px] bg-slate-50 p-12 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />

          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/10 active:scale-95 transition-transform cursor-pointer"
                onClick={() => router.push("/client")}
              >
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 font-bold tracking-tighter text-2xl ">
                Dayle
              </span>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className=" font-bold text-slate-600 tracking-[0.4em]  leading-none uppercase">
                    Total settlement
                  </p>
                  <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    <button
                      onClick={() => setCurrency("USD")}
                      className={`px-3 py-1  font-bold r rounded-md transition-all uppercase ${currency === "USD" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setCurrency("NGN")}
                      className={`px-3 py-1  font-bold r rounded-md transition-all uppercase ${currency === "NGN" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      NGN
                    </button>
                  </div>
                </div>
                <h1 className="text-6xl font-bold text-slate-900 tracking-tighter sm:text-4xl  flex items-baseline gap-2">
                  <span className="text-emerald-600 font-bold text-2xl">
                    {currencyPrefix}
                  </span>
                  {displayAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="text-emerald-600 font-bold text-xl ml-1">
                    {currency}
                  </span>
                </h1>
              </div>

              <div className="pt-10 border-t border-slate-200 space-y-6">
                <div className="flex justify-between items-center  font-bold tracking-[0.2em] text-slate-900 uppercase">
                  <span className="text-slate-600 ">Project ID</span>
                  <span className="text-emerald-600  tracking-normal text-[9px]">
                    VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center  font-bold tracking-[0.2em] text-slate-900 uppercase">
                  <span className="text-slate-600 ">Network fee</span>
                  <span className="text-emerald-600 ">Sponsored</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl relative group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-600  font-bold tracking-[0.3em] mb-3  uppercase">
                <ShieldCheck className="w-4 h-4" /> Secure checkout
              </div>
              <p className=" text-slate-600 leading-relaxed font-bold st mt-2  uppercase">
                Select your preferred method to complete the escrow deposit.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-24 flex items-center justify-center relative bg-slate-50/50">
          <div className="max-w-xl w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter ">
                  Authorize deposit
                </h2>
                <p className="text-sm font-bold text-slate-600 tracking-[0.3em] uppercase">
                  Select your preferred method
                </p>
              </div>

              {user?.kycStatus !== KycStatus.VERIFIED ? (
                <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-10 space-y-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900  tracking-tighter">
                      Identity Verification Required
                    </h3>
                    <p className="text-sm text-slate-600 font-bold   leading-relaxed px-4">
                      To comply with security and regulatory standards, you need
                      to verify your identity before you can deposit funds into
                      escrow.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/client/settings?tab=kyc")}
                    className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-[0.2em] "
                  >
                    Verify Identity Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Card Payment Selection */}
                  <button
                    onClick={() =>
                      router.push(
                        `/checkout/${vaultId}/card?currency=${currency}`,
                      )
                    }
                    className="w-full p-8 bg-white border border-slate-200 rounded-[2.5rem] flex items-center gap-6 group hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left relative z-10">
                      <p className="text-slate-900 font-bold text-xl tracking-tight  group-hover:text-emerald-950 transition-colors">
                        Credit / Debit Card
                      </p>
                      <p className=" font-bold text-slate-400 st group-hover:text-emerald-600 transition-colors uppercase  mt-1">
                        Instant payment via Partna Link
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                  </button>

                  {/* Bank Transfer Selection */}
                  <button
                    onClick={() =>
                      router.push(
                        `/checkout/${vaultId}/bank?currency=${currency}`,
                      )
                    }
                    className="w-full p-8 bg-white border border-slate-200 rounded-[2.5rem] flex items-center gap-6 group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-left relative z-10">
                      <p className="text-slate-900 font-bold text-xl tracking-tight  group-hover:text-blue-950 transition-colors">
                        Bank Transfer
                      </p>
                      <p className=" font-bold text-slate-400 st group-hover:text-blue-600 transition-colors uppercase  mt-1">
                        Direct transfer to virtual account
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
