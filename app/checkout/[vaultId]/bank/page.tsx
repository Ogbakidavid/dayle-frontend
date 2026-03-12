"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Building2,
  Copy,
  Globe,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCcw,
  Shield,
  Zap,
  Check,
} from "lucide-react";

import { useVault, Vault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function BankTransferPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading: vaultsLoading } = useVault();
  const vaultId = params.vaultId as string;

  const searchParams = useSearchParams();
  const currency = searchParams.get("currency") || "USD";
  const EXCHANGE_RATE = 1500;

  const vault = (vaults || []).find((v) => v.id === vaultId);
  const amount = vault?.formattedTotalAmount
    ? Number(vault.formattedTotalAmount)
    : 0;
  const displayAmount = currency === "USD" ? amount : amount * EXCHANGE_RATE;
  const currencyPrefix = currency === "USD" ? "$" : "₦";

  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  // Fetch bank details on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      setIsProcessing(true);
      try {
        const res = await api.vaults.fund(vaultId, {
          paymentMethod: "bank",
          currency,
          idempotencyKey: crypto.randomUUID(),
        });

        if (
          res.paymentUrl &&
          !res.paymentUrl.includes(window.location.pathname)
        ) {
          toast.success("Redirecting to payment provider...");
          window.location.href = res.paymentUrl;
          return;
        }

        if (res.bankDetails) {
          setBankDetails(res.bankDetails);
        } else {
          toast.error("Failed to generate bank details");
          router.push(`/checkout/${vaultId}`);
        }
      } catch (err) {
        console.error("Fetch bank details failed", err);
        toast.error("Error generating bank details");
        router.push(`/checkout/${vaultId}`);
      } finally {
        setIsProcessing(false);
      }
    };
    fetchBankDetails();
  }, [vaultId, router, currency]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    try {
      // Simulate the Partna Webhook for automated settlement
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${backendUrl}/api/webhooks/partna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: bankDetails?.providerRef || `vault_fund_${vaultId}`,
          status: "success",
          amount: String(vault?.totalAmount || amount),
          type: "collection",
        }),
      });

      if (!response.ok) {
        throw new Error("On-chain settlement failed. Please try again.");
      }

      setIsProcessing(false);
      setStep("success");
      toast.success("Payment detected!", {
        description: "Your funds are being secured in the escrow account.",
      });

      setTimeout(() => {
        router.push(`/client/vault/${vaultId}?success=true`);
      }, 3000);
    } catch (err: any) {
      console.error("Confirmation failed", err);
      toast.error("Confirmation Failed", {
        description: err.message || "Failed to process on-chain deposit.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (vaultsLoading || !bankDetails)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 font-primary">
        <div className="animate-spin text-emerald-600">
          <Lock />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR */}
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
                <p className=" font-bold text-slate-600 tracking-[0.4em]  leading-none uppercase">
                  Total transfer
                </p>
                <h1 className="text-6xl font-bold text-slate-900 tracking-tighter sm:text-4xl  flex items-baseline gap-2">
                  <span className="text-emerald-600 font-bold text-2xl">
                    {currencyPrefix}
                  </span>
                  {displayAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h1>
              </div>
              <div className="pt-10 border-t border-slate-200 space-y-6">
                <div className="flex justify-between items-center  font-bold tracking-[0.2em] text-slate-900 uppercase">
                  <span className="text-slate-600 ">Project ID</span>
                  <span className="text-emerald-600  tracking-normal text-[9px]">
                    VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl relative group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-600  font-bold tracking-[0.3em] mb-4  uppercase">
                <Shield className="w-4 h-4" /> Secure Funding
              </div>
              <p className=" text-slate-600 leading-relaxed font-bold st  uppercase">
                Bank-verified secure funding. Assets are protected in escrow via
                Partna.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-20 flex items-center justify-center relative bg-slate-50/50">
          <div className="max-w-4xl w-full">
            {/* Back Button */}
            <button
              onClick={() => router.push(`/checkout/${vaultId}`)}
              className="flex items-center gap-3 text-slate-900 hover:text-emerald-500 transition-all  font-bold tracking-[0.3em] mb-12 group bg-white border border-slate-200 py-4 px-6 rounded-2xl  shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Change payment method
            </button>

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="grid lg:grid-cols-2 gap-16 items-start"
                >
                  {/* INFO CARD */}
                  <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] space-y-10 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-4xl flex items-center justify-center shadow-inner group">
                      <Building2 className="text-emerald-600 w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-3xl font-bold text-slate-900  tracking-tighter">
                        Transfer instructions
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-bold st ">
                        Please transfer the exact amount to the virtual bank
                        account below. Your funds will be automatically
                        detected and secured in the escrow contract upon bank
                        confirmation.
                      </p>
                    </div>

                    <div className="pt-10 border-t border-slate-100 space-y-6">
                      <div className="flex items-center gap-4  font-bold text-slate-600 tracking-[0.3em]  uppercase">
                        <Globe className="w-4 h-4 text-emerald-600" /> Partna
                        Direct Settlement
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-bold  ">
                          Account expires in{" "}
                          <span className="text-amber-900 font-extrabold">
                            24 hours
                          </span>
                          . Please complete your transfer before then.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BANK DETAILS */}
                  <div className="space-y-8 flex flex-col">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] divide-y divide-slate-50 overflow-hidden shadow-xl">
                      <BankInfo
                        label="Bank Name"
                        value={bankDetails.bankName}
                      />
                      <BankInfo
                        label="Account Number"
                        value={bankDetails.accountNumber}
                        copy
                        onCopy={() =>
                          handleCopy(
                            bankDetails.accountNumber,
                            "Account Number",
                          )
                        }
                        copied={copied === "Account Number"}
                      />
                      <BankInfo
                        label="Account Name"
                        value={bankDetails.accountName}
                      />
                      <BankInfo
                        label="Amount to Transfer"
                        value={`${currencyPrefix}${Number(bankDetails.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        highlight
                      />
                    </div>

                    <div className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col items-center gap-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className=" font-bold text-slate-500 st uppercase ">
                          Awaiting confirmation from bank...
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmTransfer}
                        disabled={isProcessing}
                        className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-3xl shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em]  disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "I've sent the transfer"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto"
                >
                  <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative">
                    <div className="absolute inset-0 bg-emerald-600/20 rounded-[2.5rem] animate-ping" />
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl font-bold text-slate-900 tracking-tighter ">
                      Payment Accepted
                    </h2>
                    <p className=" text-emerald-600 font-bold tracking-[0.5em] uppercase ">
                      Funds are being secured on-chain
                    </p>
                  </div>
                  <p className=" font-bold text-slate-400 tracking-[0.2em] uppercase ">
                    Redirecting to your project in a few seconds...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function BankInfo({ label, value, copy, onCopy, copied, highlight }: any) {
  return (
    <div
      className={`p-8 flex justify-between items-center group transition-colors hover:bg-slate-50 ${highlight ? "bg-emerald-50/30" : ""}`}
    >
      <div className="space-y-1">
        <p className=" font-bold text-slate-400 tracking-[0.3em] uppercase ">
          {label}
        </p>
        <p
          className={`text-xl font-bold tracking-tight  ${highlight ? "text-emerald-700" : "text-slate-900"}`}
        >
          {value}
        </p>
      </div>
      {copy && (
        <button
          onClick={onCopy}
          className={`p-3 rounded-xl transition-all ${copied ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-sm"}`}
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
}
