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

export default function CheckoutSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading: contextLoading } = useVault();
  const vaultId = params.vaultId as string;

  const [localVault, setLocalVault] = React.useState<Vault | null>(null);
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    const cachedVault = (vaults || []).find((v) => v.id === vaultId);
    if (cachedVault) {
      setLocalVault(cachedVault);
    } else if (vaultId && !contextLoading) {
      fetchVault();
    }
  }, [vaults, vaultId, contextLoading]);

  const fetchVault = async () => {
    setFetching(true);
    try {
      const v = await api.vaults.getById(vaultId);
      setLocalVault(v);
    } catch (err) {
      console.error("Failed to fetch vault:", err);
    } finally {
      setFetching(false);
    }
  };

  const vault = localVault;
  const amount = vault?.totalAmount || 0;

  const [isDepositing, setIsDepositing] = React.useState(false);

  const simulateFiatPayment = async () => {
    setIsDepositing(true);
    try {
      // In production, this button would redirect to Partna/Paycrest UI.
      // For local testing, we send a mock webhook to our backend to simulate
      // the payment provider telling us the card charge was successful.

      const providerRef = `mock_fiat_${Date.now()}`;

      // Step 1: Create the pending ledger entry (normally done by the Fund API before redirecting)
      await api.vaults.fund(vaultId, {
        paymentMethod: "card",
        idempotencyKey: crypto.randomUUID(),
      });

      // Step 2: Simulate the Partna Webhook hitting our backend directly
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      await fetch(`${backendUrl}/api/webhooks/partna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: `vault_fund_${vaultId}`, // The vaults.service.ts uses this prefix
          status: "success",
          amount: String(amount),
          type: "collection",
        }),
      });

      // Redirect back to vault summary to see the FUNDED status
      router.push(`/client/vault/${vaultId}?success=true`);
    } catch (err) {
      console.error("Fiat simulation failed", err);
    } finally {
      setIsDepositing(false);
    }
  };

  if (contextLoading || fetching)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-['Poppins',sans-serif]">
        <div className="animate-spin text-emerald-500">
          <Lock />
        </div>
      </div>
    );
  if (!vault)
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-['Poppins',sans-serif] gap-6">
        <p className="text-xl font-black uppercase tracking-widest text-white/40">
          Vault Not Found
        </p>
        <button
          onClick={() => router.push("/client")}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );

  const isKycVerified = user?.kycStatus === KycStatus.VERIFIED;

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
                onClick={() => router.push("/client")}
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
                  <span className="text-white/30 italic">Vault Contract</span>
                  <span className="text-emerald-500 italic font-mono tracking-normal text-[9px]">
                    {vault?.vaultAddress || "Deployment Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  <span className="text-white/30 italic">Network Fee</span>
                  <span className="text-emerald-500 italic">Sponsored</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">
                <CreditCard className="w-4 h-4" /> SECURE CHECKOUT
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-black uppercase tracking-widest mt-2">
                Approving this transaction securely deposits your funds into the
                Web3 vault.
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
                  Authorize Deposit
                </h2>
                <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                  Complete Checkout via Partna / Paycrest
                </p>
              </div>

              <div className="grid gap-6">
                {/* Web3 Deposit Button */}
                <button
                  onClick={simulateFiatPayment}
                  disabled={isDepositing || !vault?.vaultAddress}
                  className="w-full p-8 bg-blue-500/10 border border-blue-500/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:bg-blue-500/20 transition-all text-center shadow-2xl relative overflow-hidden disabled:opacity-50"
                >
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all shadow-inner">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-blue-500 font-black text-2xl uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors">
                      {isDepositing
                        ? "Processing Payment..."
                        : "Simulate Fiat Payment"}
                    </p>
                    <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em] mt-2 group-hover:text-blue-500/80 transition-colors">
                      PAY WITH CREDIT CARD OR BANK TRANSFER
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
