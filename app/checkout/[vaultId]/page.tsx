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
  const [currency, setCurrency] = React.useState<"USD" | "NGN" | "KES">("USD");
  const EXCHANGE_RATES = { USD: 1, NGN: 1500, KES: 135 };

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
  const displayAmount = amount * EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES];
  const currencyPrefixes = { USD: "$", NGN: "₦", KES: "KSh" };
  const currencyPrefix = currencyPrefixes[currency as keyof typeof currencyPrefixes];

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR (25%) */}
        <section className="w-full lg:w-[400px] bg-slate-50 p-12 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />

          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-0">
              <div
                className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                onClick={() => router.push("/client")}
              >
                <DayleLogo className="w-10 h-10 text-slate-900" />
              </div>
              <span className="text-slate-900 font-bold tracking-tighter text-2xl ">
                Dayle
              </span>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 justify-between items-start">
                    <p className=" font-bold text-slate-600 tracking-wide leading-none uppercase">
                      Total settlement
                    </p>
                    <div className="flex bg-slate-200/50 p-1 rounded-lg flex-wrap gap-1">
                      {["USD", "NGN", "KES"].map((curr) => (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr as any)}
                          className={`px-3 py-1 text-[10px] font-bold r rounded-md transition-all uppercase ${currency === curr ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          {curr}
                        </button>
                      ))}
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
                  Vault deposit
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
                      the project vault.
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
