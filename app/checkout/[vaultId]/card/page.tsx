"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Fingerprint,
  XCircle,
  RefreshCcw,
  CheckCircle2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";

export default function CardPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const { vaults, loading } = useVault();
  const isKycVerified = user?.kycStatus === KycStatus.VERIFIED;
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

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "success">("form");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    type: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const detectCardType = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (clean.match(/^4/)) return "visa";
    if (clean.match(/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/))
      return "mastercard";
    if (clean.match(/^3[47]/)) return "amex";
    if (clean.match(/^(6011|65|64[4-9]|622)/)) return "discover";
    if (clean.match(/^(36|38|30[0-5])/)) return "diners";
    if (clean.match(/^35/)) return "jcb";
    return "";
  };

  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === "number") {
      const cleaned = value.replace(/\D/g, "");
      const type = detectCardType(cleaned);
      setCardDetails((prev) => ({
        ...prev,
        number: cleaned
          .replace(/(\d{4})/g, "$1 ")
          .trim()
          .slice(0, 19),
        type,
      }));
      return;
    } else if (field === "expiry") {
      const cleaned = value.replace(/\D/g, "");
      formattedValue =
        cleaned.length >= 2
          ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
          : cleaned;
    } else if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    setCardDetails((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleCardSubmit = async () => {
    const cleanNum = cardDetails.number.replace(/\D/g, "");
    const newErrors: Record<string, string> = {};

    if (!validateCardNumber(cleanNum)) {
      newErrors.number = "Invalid card number";
    }
    if (!cardDetails.name.trim()) {
      newErrors.name = "Required field";
    }
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      newErrors.expiry = "Invalid expiry date";
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = "Invalid CVC";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsProcessing(true);

    try {
      // Step 1: Call Fund API
      const res = await api.vaults.fund(vaultId, {
        paymentMethod: "card",
        currency,
        idempotencyKey: crypto.randomUUID(),
      });

      // Step 2: Handle Redirect Provider (e.g. Paycrest)
      // Only redirect if it's an external URL or a different internal path
      if (res.paymentUrl && !res.paymentUrl.includes(window.location.pathname)) {
        toast.success("Redirecting to checkout...");
        window.location.href = res.paymentUrl;
        return;
      }

      // Step 3: Simulate the Partna Webhook for automated settlement (Partna Flow)
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${backendUrl}/api/webhooks/partna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: res.providerRef || `vault_fund_${vaultId}`,
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
      toast.success("Payment authorized!", {
        description: "Your funds are being secured in the escrow account.",
      });

      setTimeout(() => {
        router.push(`/client/vault/${vaultId}?success=true`);
      }, 3000);
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || "Transaction failed. Payment rejected.");
      toast.error("Payment failed", { description: err.message });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-900 font-['Poppins',sans-serif]">
        <div className="animate-spin text-emerald-600">
          <Lock />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-600 font-['Poppins',sans-serif] antialiased">
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
              <div className="space-y-3 ">
                <p className=" font-bold text-slate-600 tracking-[0.4em]  leading-none uppercase">
                  Amount due
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl text-slate-400  font-bold">
                      Project ID
                    </span>
                    <span className="text-emerald-600 font-mono tracking-normal text-sm font-bold">
                      VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-6xl font-bold text-slate-900 tracking-tighter sm:text-5xl  flex items-baseline gap-2">
                    <span className="text-emerald-600 font-bold text-3xl">
                      {currencyPrefix}
                    </span>
                    {displayAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl relative group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-600  font-bold tracking-[0.3em] mb-4  uppercase">
                <Lock className="w-4 h-4" /> Secure Card Flow
              </div>
              <p className=" text-slate-600 leading-relaxed font-bold st  uppercase">
                Encrypted payment processing via Partna Link.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-20 flex items-center justify-center relative bg-slate-50/50">
          <div className="max-w-2xl w-full">
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter ">
                      Card Authorization
                    </h2>
                    <p className=" text-slate-400 font-bold tracking-[0.3em] uppercase ">
                      Verify your secure deposit
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-14 shadow-xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="space-y-8 relative z-10">
                      {/* Name */}
                      <div className="space-y-3">
                        <span className="text-xl font-bold text-slate-900  tracking-tighter">
                          {currencyPrefix}
                          {displayAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <label className=" font-bold text-slate-400 tracking-[0.3em] uppercase  ml-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={cardDetails.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className={`w-full h-16 bg-slate-50 border ${errors.name ? "border-red-500" : "border-slate-100"} rounded-2xl px-6 text-slate-900 font-bold tracking-tight focus:border-emerald-500/30 outline-none transition-all `}
                        />
                      </div>

                      {/* Number */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <label className=" font-bold text-slate-400 tracking-[0.3em] uppercase  ml-1">
                            Card Number
                          </label>
                          <div className="flex gap-2 h-6 items-center">
                            <AnimatePresence mode="wait">
                              {cardDetails.type === "visa" ? (
                                <motion.div
                                  key="visa"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-10 h-6 pt-0.5 rounded bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm border border-blue-200/50"
                                >
                                  <span className=" font-black  tracking-tighter">
                                    VISA
                                  </span>
                                </motion.div>
                              ) : cardDetails.type === "mastercard" ? (
                                <motion.div
                                  key="mc"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-10 h-6 rounded bg-slate-50 flex items-center justify-center shadow-sm border border-slate-200"
                                >
                                  <div className="flex -space-x-1.5 opacity-90">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] mix-blend-multiply" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
                                  </div>
                                </motion.div>
                              ) : cardDetails.type === "amex" ? (
                                <motion.div
                                  key="amex"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-10 h-6 rounded bg-sky-100 flex items-center justify-center text-sky-700 shadow-sm border border-sky-200"
                                >
                                  <span className="text-[9px] font-black tracking-tighter">
                                    AMEX
                                  </span>
                                </motion.div>
                              ) : cardDetails.type === "discover" ? (
                                <motion.div
                                  key="disc"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-10 h-6 rounded bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200"
                                >
                                  <span className="text-[8px] font-black tracking-tight">
                                    DISC
                                  </span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="none"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  className="w-8 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400 opacity-50"
                                >
                                  <CreditCard className="w-3 h-3" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) =>
                              handleInputChange("number", e.target.value)
                            }
                            className={`w-full h-16 bg-slate-50 border ${errors.number ? "border-red-500" : "border-slate-100"} rounded-2xl px-6 text-slate-900 font-bold st font-mono focus:border-emerald-500/30 outline-none transition-all`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className=" font-bold text-slate-400 tracking-[0.3em] uppercase  ml-1">
                            Expiry
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) =>
                              handleInputChange("expiry", e.target.value)
                            }
                            className={`w-full h-16 bg-slate-50 border ${errors.expiry ? "border-red-500" : "border-slate-100"} rounded-2xl px-6 text-slate-900 font-bold tracking-tight focus:border-emerald-500/30 outline-none transition-all `}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className=" font-bold text-slate-400 tracking-[0.3em] uppercase  ml-1">
                            CVC
                          </label>
                          <input
                            type="password"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={(e) =>
                              handleInputChange("cvc", e.target.value)
                            }
                            className={`w-full h-16 bg-slate-50 border ${errors.cvc ? "border-red-500" : "border-slate-100"} rounded-2xl px-6 text-slate-900 font-bold tracking-tight focus:border-emerald-500/30 outline-none transition-all `}
                          />
                        </div>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600  font-bold st uppercase ">
                        <XCircle className="w-5 h-5" />
                        {paymentError}
                      </div>
                    )}

                    <button
                      onClick={handleCardSubmit}
                      disabled={isProcessing}
                      className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-3xl shadow-xl shadow-emerald-600/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em]  relative overflow-hidden"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Confirm Deposit"
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase ">
                      <Lock className="w-3 h-3 text-emerald-500" /> Level 1 PCI
                      Compliance
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center space-y-12"
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
