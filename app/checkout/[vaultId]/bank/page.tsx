"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
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
import { DayleLogo } from "@/components/shared/DayleLogo";

import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { useVault, Vault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function BankTransferPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading: vaultsLoading } = useVault();
  const vaultId = params.vaultId as string;

  const searchParams = useSearchParams();
  const vault = (vaults || []).find((v) => v.id === vaultId);
  // Remove unused displayAmount
  // const displayAmount = vault?.localAmount || 0;
  const currencySymbol = vault?.localCurrency === "KES" ? "KSh" : (vault?.localCurrency === "NGN" ? "₦" : "$");
  const currencyCode = vault?.localCurrency || "USD";

  const [bankDetails, setBankDetails] = useState<any>(null);
  const [feeBreakdown, setFeeBreakdown] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [isMocking, setIsMocking] = useState(false);

  // Fetch bank details on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!vaultId || vaultsLoading || !vault) return;
      setIsProcessing(true);
      try {
        const res = await api.vaults.fund(vaultId, {
          paymentMethod: "bank",
          currency: currencyCode,
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
          if (res.feeBreakdown) setFeeBreakdown(res.feeBreakdown);
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
  }, [vaultId, router, currencyCode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingForConfirmation) {
      interval = setInterval(async () => {
        try {
          const res = await api.vaults.getStatus(vaultId);
          if (res.status === "FUNDED") {
            setIsWaitingForConfirmation(false);
            setIsProcessing(false);
            setStep("success");
            toast.success("Payment detected and confirmed!");
            setTimeout(() => {
              router.push(`/client/vault/${vaultId}?success=true`);
            }, 3000);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isWaitingForConfirmation, vaultId, router]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(""), 2000);
  };

  const [countdown, setCountdown] = useState(10);
  const [showStatusCheck, setShowStatusCheck] = useState(false);

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
    try {
      // 1. Signal payment to backend (triggers auto-mock in dev)
      await api.vaults.confirmPayment(vaultId);
      
      setIsWaitingForConfirmation(true);
      toast.info("Payment signal sent!", {
        description: "We are verifying the transfer. Please wait.",
      });

      // 2. Start 10 second countdown
      let count = 10;
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          checkFinalStatus();
        }
      }, 1000);

    } catch (err: any) {
      console.error("Confirmation failed", err);
      toast.error("Process Failed", {
        description: err.message || "Failed to initiate payment verification.",
      });
      setIsProcessing(false);
    }
  };

  const checkFinalStatus = async () => {
    setIsProcessing(true);
    try {
      const res = await api.vaults.getStatus(vaultId);
      if (res.status === "FUNDED") {
        setStep("success");
        toast.success("Payment confirmed!", {
          description: "Your funds are now secured in the vault.",
        });
        setTimeout(() => {
          router.push(`/client/vault/${vaultId}?success=true`);
        }, 3000);
      } else {
        setShowStatusCheck(true);
        toast.warning("Still waiting for final confirmation", {
          description: "The bank transfer is taking a bit longer. Please refresh in a moment.",
        });
      }
    } catch (err) {
      console.error("Status check failed", err);
      setShowStatusCheck(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualRefresh = () => {
    checkFinalStatus();
  };

  if (vaultsLoading || !bankDetails)
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <LogoLoader size="lg" />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR */}
        <section className="w-full lg:w-[350px] xl:w-[400px] bg-slate-50 p-6 lg:p-14 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-20" />
          
          <div className="space-y-20 relative z-10">
            <div className="flex items-center group cursor-pointer" onClick={() => router.push("/client")}>
              <DayleLogo className="w-12 h-12 text-emerald-600" />
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
                    usdAmount={Number(vault?.formattedTotalAmount || 0)} 
                    manualLocalAmount={vault?.localAmount}
                    className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter"
                    showNote={false}
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-slate-200/60 space-y-8">
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-black text-slate-400 tracking-wide capitalize">Project ID</span>
                  <span className="text-slate-900 font-bold text-[10px] bg-white px-3 py-1 rounded-lg border border-slate-200">
                    VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
              <Shield className="w-5 h-5 text-emerald-500 relative z-10" />
              <div className="space-y-1 relative z-10">
                <p className="text-sm font-black text-slate-900 tracking-wide capitalize">Secure Funding</p>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Bank-verified secure funding. Assets are protected in a secure vault via Partna.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 lg:p-10 xl:p-20 flex items-center justify-center relative bg-[#FDFDFD]">
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
          
          <div className="max-w-4xl w-full relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.push(`/checkout/${vaultId}`)}
              className="flex items-center gap-3 text-slate-900 hover:text-emerald-500 transition-all font-black text-sm tracking-wide capitalize mb-8 lg:mb-12 group bg-white border border-slate-200 py-3 lg:py-4 px-5 lg:px-6 rounded-2xl shadow-sm hover:shadow-md active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Change payment method
            </button>

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="grid xl:grid-cols-2 gap-16 items-start"
                >
                  {/* INFO CARD */}
                  <div className="p-6 lg:p-10 bg-white border border-slate-200 rounded-4xl lg:rounded-[2.5rem] space-y-8 lg:space-y-10 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-4xl flex items-center justify-center shadow-inner group">
                      <Building2 className="text-emerald-600 w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-2xl lg:text-3xl font-bold text-slate-900  tracking-tighter">
                        Transfer instructions
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-bold st ">
                        Please transfer the exact amount to the virtual bank
                        account below. Your funds will be automatically
                        detected and secured in the settlement vault upon bank
                        confirmation.
                      </p>
                    </div>

                    <div className="pt-8 lg:pt-10 border-t border-slate-100 space-y-6">
                      <div className="flex items-center gap-4 font-bold text-slate-600 tracking-wide">
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
                  <div className="space-y-6 lg:space-y-8 flex flex-col">
                    <div className="bg-white border border-slate-200 rounded-4xl lg:rounded-[2.5rem] divide-y divide-slate-50 overflow-hidden shadow-xl">
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
                        value={`${currencySymbol}${Number(bankDetails.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        highlight
                      />
                    </div>

                    {feeBreakdown && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Breakdown</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Vault amount</span>
                            <span className="text-xs font-black text-slate-900">
                              {currencySymbol}{feeBreakdown.vaultAmountLocal?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Depositing fee</span>
                            <span className="text-xs font-black text-slate-900">
                              {currencySymbol}{( (feeBreakdown.dayleFeeLocal || 0) + (feeBreakdown.partnaFeeLocal || 0) ).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                          </div>
                          <div className="h-px bg-slate-200" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-700 uppercase">Total to send</span>
                            <span className="text-sm font-black text-emerald-700">
                              {currencySymbol}{feeBreakdown.totalLocal?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {feeBreakdown.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6 lg:p-8 bg-white border border-slate-200 rounded-3xl flex flex-col items-center gap-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className=" font-bold text-slate-500 st uppercase ">
                          Awaiting confirmation from bank...
                        </p>
                      </div>
                      <button
                        onClick={handleConfirmTransfer}
                        disabled={isProcessing || isWaitingForConfirmation}
                        className={`w-full h-14 lg:h-16 font-bold text-sm rounded-2xl lg:rounded-3xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3 ${
                          isWaitingForConfirmation 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10"
                        }`}
                      >
                        {isWaitingForConfirmation ? (
                          <>
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                            Verifying... {countdown}s
                          </>
                        ) : (
                          "I've sent the transfer"
                        )}
                      </button>

                      {showStatusCheck && (
                        <div className="w-full pt-4 border-t border-slate-100 mt-2 text-center">
                           <p className="text-[11px] text-slate-500 font-bold mb-4">
                            Verification is taking longer than expected.
                          </p>
                          <button
                            onClick={handleManualRefresh}
                            disabled={isProcessing}
                            className="text-emerald-600 font-black text-[13px] uppercase tracking-widest hover:text-emerald-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                          >
                            <RefreshCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                            Refresh Status
                          </button>
                        </div>
                      )}

                      {(process.env.NEXT_PUBLIC_NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TESTNET_MODE === "true") && !isWaitingForConfirmation && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2">
                          Simulation mode active ⚙️
                        </p>
                      )}
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
                      Funds are being secured
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
      className={`p-5 lg:p-8 flex justify-between items-center group transition-colors hover:bg-slate-50 ${highlight ? "bg-emerald-50/30" : ""}`}
    >
      <div className="space-y-1">
        <p className=" font-bold text-slate-400 tracking-wide">
          {label}
        </p>
        <p
          className={`text-lg lg:text-xl font-medium tracking-tight break-all ${highlight ? "text-emerald-700" : "text-slate-900"}`}
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
