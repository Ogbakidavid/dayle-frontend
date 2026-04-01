"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Copy,
  Building2,
  Fingerprint,
  Users,
  Zap,
  ShieldCheck,
  RefreshCcw,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/lib/store/vault-context";
import { VaultStatus } from "@/lib/domain/enums";
  import { cn } from "@/lib/utils";

function BankInfoElement({ label, value, icon, copyable, highlight }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "p-5 lg:p-7 rounded-[32px] border transition-all duration-500 group/card bg-white",
      highlight 
        ? "bg-emerald-50/40 border-emerald-100 shadow-sm" 
        : "border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5"
    )}>
      <div className="flex items-start justify-between mb-5">
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500",
          highlight 
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
            : "bg-slate-50 text-slate-400 border border-slate-100 group-hover/card:bg-emerald-50 group-hover/card:text-emerald-600 group-hover/card:border-emerald-100"
        )}>
          {React.cloneElement(icon, { className: "w-5 h-5 transition-transform group-hover/card:scale-110" })}
        </div>
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all",
              copied ? "bg-emerald-500 text-white" : "text-slate-200 hover:text-emerald-600 hover:bg-emerald-50"
            )}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        )}
      </div>
      <div className="space-y-1.5">
        <p className={cn(
          "text-[9px] font-black uppercase tracking-[0.2em] leading-none opacity-40",
          highlight ? "text-emerald-600" : "text-slate-400"
        )}>
          {label}
        </p>
        <p className={cn(
          "text-[13px] lg:text-[15px] font-black tracking-tight leading-snug wrap-break-word",
          highlight ? "text-emerald-900" : "text-slate-900"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function VaultPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const { vaults, loading: vaultsLoading, refreshVaults } = useVault();
  const [mockingDeposit, setMockingDeposit] = useState(false);

  const vault = vaults.find((v) => v.id === vaultId);

  useEffect(() => {
    if (vault?.status === VaultStatus.FUNDED || vault?.status === VaultStatus.PROCESSING_PAYMENT) {
      router.push(`/client/vault/${vaultId}`);
    }
  }, [vault?.status, vaultId, router]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshVaults({ isBackground: true });
    }, 5000);
    return () => clearInterval(intervalId);
  }, [refreshVaults]);

  const handleMockDeposit = async () => {
    if (!vault) return;
    setMockingDeposit(true);
    try {
      // Direct call to API since we don't have user context here easily
      const { api } = await import("@/lib/api-client");
      await api.vaults.mockDeposit(vault.id, {
        amount: vault.partnaFromAmount,
        accountName: vault.partnaAccountName
      });
      toast.success("Mock deposit triggered successfully");
    } catch (err: any) {
      toast.error("Failed to trigger mock deposit");
    } finally {
      setMockingDeposit(false);
    }
  };

  if (vaultsLoading && !vault) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin text-emerald-600">
          <RefreshCcw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <AlertCircle className="w-12 h-12 text-slate-200 mb-4" />
        <h1 className="text-xl font-black text-slate-900 mb-2">Vault not found</h1>
        <Button onClick={() => router.push("/client")}>Go back home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-16">
        <Link 
          href={`/client/vault/${vaultId}`}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Vault Details
        </Link>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/5 rounded-full border border-emerald-500/10 mb-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                    Pending Bank Transfer
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-3xl font-black text-slate-900 tracking-tight leading-[0.95]">
                  Complete your transfer
                </h1>
                
                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed ">
                  Please transfer the exact amount below to secure the funds. Once the bank confirms the transfer, the project will automatically move to <span className="text-emerald-600 font-black">"Funded"</span>.
                </p>
              </div>

              <div className="shrink-0">
                {process.env.NEXT_PUBLIC_NODE_ENV === "development" && (
                  <Button
                    variant="outline"
                    onClick={handleMockDeposit}
                    disabled={mockingDeposit}
                    className="h-12 px-6 bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black text-[11px] uppercase tracking-widest shadow-sm rounded-xl transition-all active:scale-95 group"
                  >
                    {mockingDeposit ? (
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin mr-2" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
                    )}
                    Trigger mock deposit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
              <BankInfoElement
                label="Bank name"
                value={vault.partnaBankName || "Processing..."}
                icon={<Building2 className="w-4 h-4" />}
              />
              <BankInfoElement
                label="Account number"
                value={vault.partnaAccountNumber || "..."}
                copyable
                icon={<Fingerprint className="w-4 h-4" />}
              />
              <BankInfoElement
                label="Beneficiary"
                value={vault.partnaAccountName || "..."}
                icon={<Users className="w-4 h-4" />}
              />
              <BankInfoElement
                label="Total to transfer"
                value={`${(vault.partnaFromAmount || 0).toLocaleString()} ${vault.partnaFromCurrency}`}
                highlight
                icon={<Zap className="w-4 h-4" />}
              />
            </div>

            <div className="pt-10 border-t border-slate-50 flex flex-wrap items-center justify-between gap-8">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase">
                    Secured by Partna
                  </span>
                </div>
                
                <div className="flex items-center gap-3 px-2">
                  <div className="relative">
                    <RefreshCcw className="w-4 h-4 text-emerald-400 animate-spin" />
                    <div className="absolute inset-0 bg-emerald-400/20 blur-sm animate-pulse rounded-full" />
                  </div>
                  <span className="text-xs font-black text-slate-400 tracking-wide uppercase">
                    Polling for bank confirmation...
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-amber-500 bg-amber-50/50 px-5 py-3 rounded-2xl border border-amber-100">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Instructions expire in 24 hours
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
