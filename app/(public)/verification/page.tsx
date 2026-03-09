"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { VaultStatus, getVaultDerivedLabel } from "@/lib/domain/enums";
import { Button } from "@/components/ui/button";

interface Vault {
  id: string;
  title: string;
  status: VaultStatus;
  clientName?: string;
}

function VerificationStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vaultId = searchParams?.get("vaultId");
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVault() {
      if (!vaultId) {
        setLoading(false);
        return;
      }
      try {
        // Direct API call for standalone page
        const data = (await api.vaults.getById(vaultId)) as Vault;
        setVault(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVault();
  }, [vaultId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-16 h-16 bg-white/3 border border-white/10 rounded-2xl flex items-center justify-center relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
          <Shield className="w-8 h-8 text-emerald-500 stroke-[2.5px] relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold tracking-[0.3em] text-emerald-500">
            Querying network
          </p>
          <div className="h-0.5 w-24 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/3 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vaultId || !vault) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500/50 mb-6" />
        <h1 className="text-3xl font-bold text-white tracking-tighter mb-4">
          Verification link invalid
        </h1>
        <p className="text-white max-w-sm font-bold  text-sm mb-12">
          The specific project account could not be located on the Dayle system.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className="text-emerald-500 font-bold  text-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to dashboard
        </Button>
      </div>
    );
  }

  const isVerified = vault.status === VaultStatus.RELEASED;
  const isReview = false;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-['Poppins',sans-serif]">
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Header Status */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="group relative">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center relative z-10 border transition-all duration-500 ${
                  isVerified
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : isReview
                      ? "bg-blue-500/10 border-blue-500/50"
                      : "bg-white/5 border-white/10"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : isReview ? (
                  <Clock className="w-10 h-10 text-blue-500 animate-pulse" />
                ) : (
                  <Clock className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-4">
            {isVerified ? (
              <>
                Capital <span className="text-emerald-500 ">Released.</span>
              </>
            ) : isReview ? (
              <>
                Verification <span className="text-blue-500 ">Active.</span>
              </>
            ) : (
              <>
                Project <span className="text-white ">Protected.</span>
              </>
            )}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-bold  text-white">
            <Lock className="w-3 h-3 text-emerald-500" /> Account ID: {vault.id}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-muted border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="space-y-8 relative z-10">
            <div className="space-y-2">
              <p className="text-sm font-bold text-white ">Active project</p>
              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                {vault.title}
              </h3>
            </div>

            <div className="py-8 border-y border-white/5 grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-white  mb-1">Status</p>
                <p
                  className={`text-sm font-bold  ${
                    isVerified
                      ? "text-emerald-500"
                      : isReview
                        ? "text-blue-500"
                        : "text-white"
                  }`}
                >
                  {getVaultDerivedLabel(vault.status)}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-white  mb-1">Identity</p>
                <p className="text-sm font-bold text-white  truncate">
                  {vault.clientName || "Dayle Native Client"}
                </p>
              </div>
            </div>

            {isVerified ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-sm font-bold text-emerald-500  mb-2">
                  Final settlement reached
                </p>
                <p className="text-sm font-bold text-white  leading-relaxed font-['Poppins',sans-serif]">
                  The objective requirements have been validated. Funds have
                  been distributed to the recipient account.
                </p>
              </div>
            ) : isReview ? (
              <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-sm font-bold text-blue-500  mb-2">
                  System review
                </p>
                <p className="text-sm font-bold text-white  leading-relaxed font-['Poppins',sans-serif]">
                  Our system is currently verifying the submitted evidence
                  against the project requirements.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-sm font-bold text-white  mb-2">
                  Waiting for submission
                </p>
                <p className="text-sm font-bold text-white  leading-relaxed font-['Poppins',sans-serif]">
                  Payment is locked and secured. Recipient has not yet submitted
                  work for verification.
                </p>
              </div>
            )}

            <Button
              onClick={() => router.push("/")}
              className="w-full h-16 bg-white/3 border border-white/10 hover:bg-white/5 text-white font-bold  text-sm rounded-2xl transition-all"
            >
              Close transmission
            </Button>
          </div>
        </div>

        {/* Footer Badges */}
        <div className="mt-12 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-white" />
            <span className="text-sm font-bold  text-white">
              Global Settlement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3 text-white" />
            <span className="text-sm font-bold  text-white">
              Audit-Proof Ledger
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-emerald-500/20" />
          </div>
        </div>
      }
    >
      <VerificationStatusContent />
    </Suspense>
  );
}
