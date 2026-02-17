"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Fingerprint,
  XCircle,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

import { useVault, Vault } from "@/lib/store/vault-context";
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

  const vault = (vaults || []).find((v) => v.id === vaultId);
  const amount = vault?.totalAmount || 0;

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
    if (clean.match(/^5[1-5]/)) return "mastercard";
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
      newErrors.number = "Invalid card sequence";
    }
    if (!cardDetails.name.trim()) {
      newErrors.name = "Required field";
    }
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      newErrors.expiry = "Invalid temporal limit";
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = "Invalid CVC sequence";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isKycVerified) {
      setPaymentError(
        "Identity verification (KYC) required to initialize deposit stream.",
      );
      return;
    }

    setErrors({});
    setIsProcessing(true);

    try {
      // Generate unique idempotency key
      const idempotencyKey = crypto.randomUUID();

      await api.vaults.fund(vaultId, {
        paymentMethod: "card",
        paymentDetails: {
          number: cleanNum.slice(-4), // Only send last 4 digits for reference
          brand: cardDetails.type || "unknown",
          expiry: cardDetails.expiry,
        },
        idempotencyKey,
      });

      setIsProcessing(false);
      setStep("success");
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || "Transaction failed. Protocol rejected.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 font-['Poppins',sans-serif] antialiased">
      <AnimatePresence>
        {isProcessing && <ProcessingOverlay amount={amount} />}
        {paymentError && (
          <FailureModal
            message={paymentError}
            onClose={() => setPaymentError(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR */}
        <Sidebar amount={amount} />

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-24 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 via-transparent to-transparent">
          <div className="max-w-5xl w-full">
            {/* Back Button */}
            {step === "form" && (
              <button
                onClick={() => router.push(`/checkout/${vaultId}`)}
                className="flex items-center gap-3 text-white/40 hover:text-emerald-500 transition-all text-[10px] font-black uppercase tracking-[0.3em] mb-12 group bg-white/2 border border-white/5 py-4 px-6 rounded-2xl italic"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Reroute Payment Vector
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid lg:grid-cols-2 gap-20 items-center"
                >
                  {/* CARD PREVIEW */}
                  <div className="relative aspect-[1.586/1] w-full rounded-[2.5rem] bg-linear-to-br from-emerald-600 to-emerald-950 p-12 text-white shadow-[0_0_60px_rgba(16,185,129,0.2)] border border-white/10 overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CreditCard className="w-48 h-48 rotate-15 group-hover:rotate-25 transition-transform duration-1000" />
                    </div>
                    <div className="relative h-full flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                        <div className="w-16 h-12 bg-white/10 rounded-xl backdrop-blur-xl border border-white/10 shadow-inner flex items-center justify-center">
                          <div className="w-10 h-6 bg-linear-to-r from-amber-400 to-amber-600 rounded-sm opacity-60" />
                        </div>
                        {cardDetails.type === "visa" && (
                          <div className="italic font-black text-2xl tracking-tighter opacity-80">
                            VISA
                          </div>
                        )}
                        {cardDetails.type === "mastercard" && (
                          <div className="flex -space-x-4 opacity-80">
                            <div className="w-8 h-8 rounded-full bg-red-600" />
                            <div className="w-8 h-8 rounded-full bg-amber-500" />
                          </div>
                        )}
                        {!cardDetails.type && (
                          <div className="font-black italic text-xl opacity-20 tracking-widest uppercase">
                            Terminal Card
                          </div>
                        )}
                      </div>
                      <div className="space-y-10">
                        <p className="text-3xl tracking-widest font-mono italic shadow-sm leading-none truncate">
                          {cardDetails.number || "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] italic">
                              Auth Holder
                            </p>
                            <p className="text-sm font-black uppercase tracking-widest italic truncate max-w-[180px]">
                              {cardDetails.name || "UNIDENTIFIED ID"}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] italic">
                              Exp Limit
                            </p>
                            <p className="text-sm font-black tracking-widest italic font-mono">
                              {cardDetails.expiry || "MM/YY"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD FORM */}
                  <div className="space-y-8">
                    <div className="text-left space-y-2 mb-8">
                      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Liquid Input
                      </h2>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] italic">
                        Enter cryptographic card parameters
                      </p>
                    </div>
                    <div className="space-y-6">
                      <InputField
                        label="Card Sequence"
                        value={cardDetails.number}
                        error={errors.number}
                        onChange={(e) =>
                          handleInputChange("number", e.target.value)
                        }
                        placeholder="0000 0000 0000 0000"
                      />
                      <InputField
                        label="Identity Authorization"
                        value={cardDetails.name}
                        error={errors.name}
                        onChange={(e) =>
                          handleInputChange(
                            "name",
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="AUTHORIZED USER"
                      />
                      <div className="grid grid-cols-2 gap-6">
                        <InputField
                          label="Temporal Limit"
                          value={cardDetails.expiry}
                          error={errors.expiry}
                          onChange={(e) =>
                            handleInputChange("expiry", e.target.value)
                          }
                          placeholder="MM/YY"
                        />
                        <InputField
                          label="CVC Code"
                          type="password"
                          value={cardDetails.cvc}
                          error={errors.cvc}
                          onChange={(e) =>
                            handleInputChange("cvc", e.target.value)
                          }
                          placeholder="•••"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCardSubmit}
                      disabled={!isKycVerified}
                      className={`w-full h-20 ${isKycVerified ? "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "bg-white/5 text-white/20 cursor-not-allowed"} text-black font-black uppercase tracking-[0.2em] text-xs rounded-4xl transition-all active:scale-[0.98]`}
                    >
                      {isKycVerified
                        ? "Initialize Deposit stream"
                        : "KYC Required"}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <SuccessScreen onContinue={() => router.push("/client")} />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

interface SidebarProps {
  amount: number;
}

function Sidebar({ amount }: SidebarProps) {
  return (
    <section className="w-full lg:w-[350px] bg-[#080808] p-12 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />
      <div className="space-y-16 relative z-10">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
            onClick={() => (window.location.href = "/client")}
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
            <h1 className="text-6xl font-black text-white tracking-tighter font-mono flex items-baseline gap-2">
              <span className="text-emerald-500 font-black text-3xl">$</span>
              {amount.toLocaleString()}
            </h1>
          </div>
        </div>
      </div>
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] relative group overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">
            <Lock className="w-4 h-4" /> SECURE ESCROW
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-black uppercase tracking-widest italic">
            Assets are held in a high-integrity multi-sig vault terminal.
            Settlement follows approval.
          </p>
        </div>
      </div>
    </section>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] italic ml-1">
        {label}
      </label>
      <input
        {...props}
        className={`w-full bg-white/2 border ${error ? "border-red-500" : "border-white/5"} h-16 rounded-2xl px-6 text-white focus:border-emerald-500/30 outline-none transition-all placeholder:text-white/10 font-bold uppercase tracking-widest text-xs italic shadow-inner`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1 italic"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function ProcessingOverlay({ amount }: { amount: number }) {
  const messages = [
    "Encrypting details...",
    "Authorizing with bank...",
    "Locking vault deposit...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setMsgIdx((s) => (s + 1) % 3), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-100 bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center text-center"
    >
      <div className="relative w-32 h-32 mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-emerald-500/10 border-t-emerald-500 rounded-full"
        />
        <Fingerprint className="w-12 h-12 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
      </div>
      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
        Securing Sum: ${amount}
      </h3>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/40 italic">
        {messages[msgIdx]}
      </p>
    </motion.div>
  );
}

function FailureModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-110 bg-black/80 backdrop-blur-3xl flex items-center justify-center p-6"
    >
      <div className="bg-[#0D0D0E] border border-white/5 w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
        <div className="w-20 h-20 bg-red-500/5 border border-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-3">
          Interruption
        </h3>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed italic">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-white text-black h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl"
        >
          <RefreshCcw className="w-4 h-4" /> Synchronize Retry
        </button>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center max-w-xl mx-auto space-y-12"
    >
      <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)] relative">
        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] animate-ping" />
        <CreditCard className="w-16 h-16 text-black relative z-10" />
      </div>
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Deposit Locked
        </h2>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.5em] italic">
          Project Node is now fully liquified. Assets in Dayle Escrow.
        </p>
      </div>
      <button
        onClick={onContinue}
        className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-4xl hover:bg-slate-200 transition-all shadow-2xl active:scale-[0.98]"
      >
        Procedural Dashboard
      </button>
    </motion.div>
  );
}
