"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

  const vault = (vaults || []).find((v) => v.id === vaultId);
  const amount = vault?.totalAmount || 0;

  // Flow states: verification → instructions → processing → success/failure
  const [step, setStep] = useState<any>("verification"); // verification, instructions, processing, success, failure
  const [isProcessing, setIsProcessing] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [requiresVerification, setRequiresVerification] = useState(true); // Toggle for testing
  const [transactionId] = useState(() => `TXN-${Date.now()}`);
  const [processingStatus, setProcessingStatus] = useState<any>("pending"); // pending, processing, completed
  const [copied, setCopied] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds

  // Skip verification if not required
  useEffect(() => {
    if (!requiresVerification) {
      const timer = setTimeout(() => setStep("instructions"), 0);
      return () => clearTimeout(timer);
    }
  }, [requiresVerification]);

  // Countdown timer for payment window
  useEffect(() => {
    if (step === "instructions" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeRemaining]);

  // Simulate status updates during processing
  useEffect(() => {
    if (step === "processing") {
      const processTransaction = async () => {
        try {
          setProcessingStatus("processing");

          // Call Backend to fund vault
          const idempotencyKey = crypto.randomUUID();
          const result = await api.vaults.fund(vaultId, {
            paymentMethod: "bank",
            paymentDetails: {
              refCode: transactionId,
              sender: "Client Bank Account",
            },
            idempotencyKey,
          });

          if (result.paymentUrl) {
            setProcessingStatus("completed");
            toast.success("Redirecting to secure payment terminal...");
            setTimeout(() => {
              window.location.href = result.paymentUrl;
            }, 1000);
            return;
          }

          setProcessingStatus("completed");
          setTimeout(() => setStep("success"), 1000);
        } catch (error) {
          console.error("Fund error:", error);
          setStep("failure");
        }
      };

      processTransaction();
    }
  }, [step, vaultId, transactionId]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // If current box has value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current box is empty, move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
      e.preventDefault();
    } else if (e.key === "Delete") {
      // Delete key clears current box
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleaned = pastedData.replace(/\D/g, "").slice(0, 6);

    if (cleaned.length === 6) {
      const newOtp = cleaned.split("");
      setOtp(newOtp);
      setOtpError("");
      // Focus the last input
      document.getElementById("otp-5")?.focus();
    }
  };

  const isKycVerified = user?.kycStatus === KycStatus.VERIFIED;

  const handleVerifyOtp = () => {
    if (!isKycVerified) {
      setOtpError(
        "Identity verification (KYC) required to authorize bank transfers.",
      );
      return;
    }
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Please enter complete 6-digit code");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (otpValue === "123456") {
        setStep("instructions");
      } else {
        setOtpError("Invalid OTP. Try 123456 for demo.");
      }
    }, 1500);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  const handlePaymentConfirmed = () => {
    setStep("processing");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 font-['Poppins',sans-serif] antialiased">
      <AnimatePresence>{isProcessing && <ProcessingOverlay />}</AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR */}
        <Sidebar amount={amount} transactionId={transactionId} step={step} />

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-20 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 via-transparent to-transparent">
          <div className="max-w-5xl w-full">
            {/* Back Button */}
            {(step === "verification" || step === "instructions") && (
              <button
                onClick={() => router.push(`/checkout/${vaultId}`)}
                className="flex items-center gap-3 text-white/40 hover:text-emerald-500 transition-all text-[10px] font-black uppercase tracking-[0.3em] mb-12 group bg-white/2 border border-white/5 py-4 px-6 rounded-2xl italic"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Modify Protocol Direction
              </button>
            )}

            <AnimatePresence mode="wait">
              {/* VERIFICATION SCREEN */}
              {step === "verification" && (
                <VerificationScreen
                  otp={otp}
                  otpError={otpError}
                  onOtpChange={handleOtpChange}
                  onOtpKeyDown={handleOtpKeyDown}
                  onOtpPaste={handleOtpPaste}
                  onVerify={handleVerifyOtp}
                  onResend={() => setOtpError("")}
                  isKycVerified={isKycVerified}
                />
              )}

              {/* PAYMENT INSTRUCTIONS SCREEN */}
              {step === "instructions" && (
                <PaymentInstructionsScreen
                  amount={amount}
                  transactionId={transactionId}
                  timeRemaining={timeRemaining}
                  formatTime={formatTime}
                  onCopy={handleCopy}
                  copied={copied}
                  onConfirm={handlePaymentConfirmed}
                  isKycVerified={isKycVerified}
                />
              )}

              {/* PROCESSING/STATUS SCREEN */}
              {step === "processing" && (
                <ProcessingStatusScreen
                  status={processingStatus}
                  transactionId={transactionId}
                  amount={amount}
                />
              )}

              {/* SUCCESS SCREEN */}
              {step === "success" && (
                <SuccessScreen
                  amount={amount}
                  transactionId={transactionId}
                  onContinue={() => router.push("/client")}
                />
              )}

              {/* FAILURE SCREEN */}
              {step === "failure" && (
                <FailureScreen
                  onRetry={() => setStep("instructions")}
                  onExit={() => router.push(`/checkout/${vaultId}`)}
                />
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
  transactionId: string;
  step: string;
}

function Sidebar({ amount, transactionId, step }: SidebarProps) {
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
              TOTAL TRANSFER
            </p>
            <h1 className="text-6xl font-black text-white tracking-tighter font-mono flex items-baseline gap-2">
              <span className="text-emerald-500 font-black text-3xl">$</span>
              {amount.toLocaleString()}
            </h1>
          </div>
          {step !== "verification" && (
            <div className="pt-10 border-t border-white/5 space-y-2">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] italic mb-2">
                AUTH REFERENCE
              </p>
              <p className="text-sm text-white/60 font-mono tracking-tight bg-white/2 p-4 rounded-xl border border-white/5 truncate">
                {transactionId}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] relative group overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic">
            <Shield className="w-4 h-4" /> SECURE ONRAMP
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-black uppercase tracking-widest italic">
            Bank-verified high-integrity onramp. Assets are securely
            secured.
          </p>
        </div>
      </div>
    </section>
  );
}

interface VerificationScreenProps {
  otp: string[];
  otpError: string;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onOtpPaste: (e: React.ClipboardEvent) => void;
  onVerify: () => void;
  onResend: () => void;
  isKycVerified: boolean;
}

function VerificationScreen({
  otp,
  otpError,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onVerify,
  onResend,
  isKycVerified,
}: VerificationScreenProps) {
  return (
    <motion.div
      key="verification"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto space-y-12"
    >
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-4xl flex items-center justify-center mx-auto border border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <Shield className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Identity Auth
        </h2>
        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] italic">
          Enter the secondary verification sequence
        </p>
      </div>

      <div className="space-y-10">
        <div className="flex gap-4 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onOtpChange(index, e.target.value)}
              onKeyDown={(e) => onOtpKeyDown(index, e)}
              onPaste={index === 0 ? onOtpPaste : undefined}
              className={`w-14 h-14 bg-white/2 border ${otpError ? "border-red-500" : "border-white/5"} rounded-2xl text-center text-2xl font-black text-white focus:border-emerald-500/30 outline-none transition-all shadow-inner font-mono italic`}
            />
          ))}
        </div>
        {otpError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest justify-center italic bg-red-500/5 p-4 rounded-xl border border-red-500/10"
          >
            <AlertCircle className="w-4 h-4" />
            {otpError}
          </motion.div>
        )}

        <button
          onClick={onVerify}
          disabled={!isKycVerified}
          className={`w-full h-16 ${isKycVerified ? "bg-emerald-500 hover:bg-emerald-400" : "bg-white/5 text-white/20 cursor-not-allowed"} text-black font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98]`}
        >
          {isKycVerified ? "Authorize & Proceduralize" : "KYC Required"}
        </button>

        <button
          onClick={onResend}
          className="w-full text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] italic"
        >
          Signal Lost?{" "}
          <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-4">
            Resend Protocol
          </span>
        </button>
      </div>

      <div className="p-6 bg-white/1 border border-white/5 rounded-2xl">
        <p className="text-[9px] text-white/20 text-center font-black uppercase tracking-[0.3em] italic leading-loose">
          💡 Simulated Protocol: Use bypass sequence{" "}
          <span className="text-emerald-500 font-mono">123456</span>
        </p>
      </div>
    </motion.div>
  );
}

interface PaymentInstructionsScreenProps {
  amount: number;
  transactionId: string;
  timeRemaining: number;
  formatTime: (s: number) => string;
  onCopy: (t: string, f: string) => void;
  copied: string;
  onConfirm: () => void;
  isKycVerified: boolean;
}

function PaymentInstructionsScreen({
  amount,
  transactionId,
  timeRemaining,
  formatTime,
  onCopy,
  copied,
  onConfirm,
  isKycVerified,
}: PaymentInstructionsScreenProps) {
  return (
    <motion.div
      key="instructions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid lg:grid-cols-2 gap-20 items-stretch"
    >
      {/* INFO CARD */}
      <div className="p-12 bg-[#0D0D0E] border border-white/5 rounded-[3rem] space-y-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/2 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-16 h-16 bg-emerald-500/10 rounded-4xl flex items-center justify-center border border-emerald-500/10 shadow-inner group">
          <Building2 className="text-emerald-500 w-8 h-8 group-hover:scale-110 transition-transform" />
        </div>
        <div className="space-y-4">
          <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Transfer Instructions
          </h4>
          <p className="text-xs text-white/40 leading-relaxed font-black uppercase tracking-[0.2em] italic">
            Initialize the asset transfer to the designated vault terminal.
            High-fidelity reference code is mandatory for automated liquidation.
          </p>
        </div>

        <div className="pt-10 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-white/60 tracking-[0.3em] italic">
            <Globe className="w-4 h-4 text-emerald-500" /> Global ACH / SWIFT
            NETWORK
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] italic bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
            <Clock className="w-4 h-4" /> {formatTime(timeRemaining)} TEMPORAL
            REMAINING
          </div>
        </div>
      </div>

      {/* BANK DETAILS */}
      <div className="space-y-8 flex flex-col">
        <div className="bg-[#0D0D0E] border border-white/5 rounded-[2.5rem] divide-y divide-white/5 overflow-hidden shadow-2xl">
          <BankInfo label="Financial Hub" value="Dayle Trust Terminal" />
          <BankInfo
            label="Vault Account"
            value="9920 1120 4452"
            copy
            onCopy={() => onCopy("9920 1120 4452", "account")}
            copied={copied === "account"}
          />
          <BankInfo
            label="Routing Vector"
            value="121000358"
            copy
            onCopy={() => onCopy("121000358", "routing")}
            copied={copied === "routing"}
          />
          <BankInfo
            label="Transfer Sum"
            value={`$${amount.toLocaleString()}`}
            highlight
          />
          <BankInfo
            label="Ref Code"
            value={transactionId}
            copy
            onCopy={() => onCopy(transactionId, "reference")}
            copied={copied === "reference"}
            highlight
          />
        </div>

        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl relative overflow-hidden group">
          <div className="flex items-start gap-4 relative z-10">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-500/80 leading-relaxed font-black uppercase tracking-widest italic">
              <span className="text-white">CRITICAL:</span> YOU MUST ATTACH THE
              REF CODE TO ENSURE AUTONOMOUS SETTLEMENT. ANONYMOUS TRANSFERS WILL
              BE RETRIEVED MANUALLY.
            </p>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={!isKycVerified}
          className={`w-full h-16 ${isKycVerified ? "bg-emerald-500 hover:bg-emerald-400" : "bg-white/5 text-white/20 cursor-not-allowed"} text-black font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] mt-auto`}
        >
          {isKycVerified ? "Transfer Verified & Initialized" : "KYC Required"}
        </button>
      </div>
    </motion.div>
  );
}

interface ProcessingStatusScreenProps {
  status: string;
  transactionId: string;
  amount: number;
}

function ProcessingStatusScreen({
  status,
  transactionId,
  amount,
}: ProcessingStatusScreenProps) {
  const [currentTime] = useState(new Date());

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "Synchronizing with financial terminal...";
      case "processing":
        return "Authenticating liquidity stream...";
      case "completed":
        return "Finalizing secure ledger update...";
      default:
        return "Executing financial protocol...";
    }
  };

  const getProgressPercentage = () => {
    switch (status) {
      case "pending":
        return 25;
      case "processing":
        return 65;
      case "completed":
        return 95;
      default:
        return 0;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const steps = [
    {
      id: "created",
      label: "Protocol Initiated",
      description: "Asset stream request logged",
      timestamp: formatTimestamp(currentTime),
      status: "completed",
    },
    {
      id: "initiated",
      label: "Network Verification",
      description: "Verifying liquidity parameters",
      timestamp:
        status !== "pending"
          ? formatTimestamp(new Date(currentTime.getTime() + 2000))
          : null,
      status: status === "pending" ? "current" : "completed",
    },
    {
      id: "received",
      label: "Liquidity Locked",
      description: "Assets confirmed in transit",
      timestamp:
        status === "completed"
          ? formatTimestamp(new Date(currentTime.getTime() + 5000))
          : null,
      status:
        status === "processing"
          ? "current"
          : status === "completed"
            ? "completed"
            : "pending",
    },
    {
      id: "credited",
      label: "Final Settlement",
      description: "Settling funds into vault terminal",
      timestamp: null,
      status: status === "completed" ? "current" : "pending",
    },
  ];

  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto space-y-12"
    >
      {/* HEADER */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/5 rounded-full border border-emerald-500/20 relative shadow-2xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-transparent border-t-emerald-500/40 rounded-full"
          />
          <Zap className="w-10 h-10 text-emerald-500 animate-pulse" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Executing Protocol
          </h2>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] max-w-md mx-auto italic leading-relaxed">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-[#0D0D0E] border border-white/5 rounded-4xl p-10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">
          <span className="text-white/30">SYNC PERCENTAGE</span>
          <span className="text-emerald-500">{getProgressPercentage()}%</span>
        </div>
        <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-600 via-emerald-400 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-[#0D0D0E] border border-white/5 rounded-[3rem] p-12 shadow-2xl">
        <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.5em] mb-12 italic">
          TRANSACTION LIFECYCLE
        </h3>
        <div className="space-y-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-8"
            >
              {/* ICON */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                    step.status === "completed"
                      ? "bg-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : step.status === "current"
                        ? "bg-emerald-500/10 border-emerald-500/20 shadow-inner"
                        : "bg-white/2 border-white/5"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-6 h-6 text-black" />
                  ) : step.status === "current" ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-4 h-4 bg-emerald-500 rounded-full"
                    />
                  ) : (
                    <div className="w-3 h-3 bg-white/10 rounded-full" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-16 mt-3 transition-all duration-700 ${
                      step.status === "completed"
                        ? "bg-emerald-500"
                        : "bg-white/5"
                    }`}
                  />
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between gap-6 mb-2">
                  <h4
                    className={`font-black text-xl uppercase tracking-tighter italic transition-colors ${
                      step.status === "completed" || step.status === "current"
                        ? "text-white"
                        : "text-white/20"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[10px] text-white/20 whitespace-nowrap font-black uppercase tracking-[0.2em] italic bg-white/2 p-2 rounded-lg border border-white/5">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-black uppercase tracking-widest italic transition-colors ${
                    step.status === "completed" || step.status === "current"
                      ? "text-white/40"
                      : "text-white/10"
                  }`}
                >
                  {step.description}
                </p>
                {step.status === "current" && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay,
                          }}
                          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.4em] italic">
                      Executing Internal Logic
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic text-white/20">
        <Clock className="w-4 h-4" />
        ESTIMATED CONSOLIDATION:{" "}
        <span className="text-white/60 font-mono">2 - 5 CYCLES</span>
      </div>

      {/* HELP TEXT */}
      <div className="text-center">
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] italic max-w-md mx-auto leading-relaxed border-t border-white/5 pt-8">
          Node stability confirmed. You may terminate this connection session;
          autonomous notification will manifest upon settlement.
        </p>
      </div>
    </motion.div>
  );
}

interface SuccessScreenProps {
  amount: number;
  transactionId: string;
  onContinue: () => void;
}

function SuccessScreen({
  amount,
  transactionId,
  onContinue,
}: SuccessScreenProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center max-w-xl mx-auto space-y-12"
    >
      <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)] relative">
        <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] animate-ping" />
        <CheckCircle2 className="w-16 h-16 text-black relative z-10" />
      </div>
      <div className="space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
          Protocol complete
        </h2>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.5em] italic">
          Liquidity successfully consolidated into vault
        </p>
      </div>

      <div className="w-full bg-[#0D0D0E] border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex justify-between items-center relative z-10">
          <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] italic">
            ASSET SETTLEMENT
          </span>
          <span className="text-4xl font-black text-white italic tracking-widest font-mono">
            ${amount.toLocaleString()}
          </span>
        </div>
        <div className="pt-8 border-t border-white/5 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] italic">
              LEDGER REFERENCE
            </span>
            <span className="text-[10px] text-white/70 font-mono tracking-normal uppercase border-b border-white/10 pb-1">
              {transactionId}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.3em] text-sm rounded-4xl hover:bg-slate-200 transition-all shadow-2xl active:scale-[0.98]"
      >
        Return to Origin Terminal
      </button>
    </motion.div>
  );
}

interface FailureScreenProps {
  onRetry: () => void;
  onExit: () => void;
}

function FailureScreen({ onRetry, onExit }: FailureScreenProps) {
  return (
    <motion.div
      key="failure"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center max-w-xl mx-auto space-y-12"
    >
      <div className="w-24 h-24 bg-red-500/10 rounded-4xl flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Protocol Interrupted
        </h2>
        <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] italic">
          Liquidity stream failed to manifest
        </p>
      </div>

      <div className="w-full bg-[#0D0D0E] border border-red-500/10 rounded-[2.5rem] p-10 space-y-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="text-left space-y-4">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] italic">
              DEVIATION PARAMETERS:
            </p>
            <ul className="text-[10px] text-white/40 font-black uppercase tracking-widest space-y-3 list-none italic">
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-red-500/30 rounded-full" /> Temporal
                timeout (24h Window Expired)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-red-500/30 rounded-full" />{" "}
                Reference Code Mismatch
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-red-500/30 rounded-full" /> Source
                Liquidity Insufficiency
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1 h-1 bg-red-500/30 rounded-full" /> Terminal
                Handshake Rejected
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button
          onClick={onRetry}
          className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <RefreshCcw className="w-5 h-5" />
          Reset Protocol
        </button>
        <button
          onClick={onExit}
          className="w-full h-16 border border-white/5 bg-white/2 text-white/30 hover:text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl transition-all"
        >
          Re-route Payment Vector
        </button>
      </div>

      <button className="text-[10px] text-white/20 hover:text-emerald-500 font-black uppercase tracking-[0.4em] italic transition-all border-b border-white/5 pb-2">
        Request Tech-Support Intervention →
      </button>
    </motion.div>
  );
}

interface BankInfoProps {
  label: string;
  value: string;
  copy?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
}

function BankInfo({
  label,
  value,
  copy,
  onCopy,
  copied,
  highlight,
}: BankInfoProps) {
  return (
    <div className="p-8 flex justify-between items-center group/info">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] italic group-hover/info:text-white/40 transition-colors">
          {label}
        </p>
        <p
          className={`text-sm font-black uppercase tracking-widest italic ${highlight ? "text-emerald-500 shadow-sm" : "text-white"}`}
        >
          {value}
        </p>
      </div>
      {copy && (
        <button
          onClick={onCopy}
          className="group/copy relative w-10 h-10 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center hover:bg-emerald-500 transition-all"
        >
          {copied ? (
            <Check className="w-5 h-5 text-black" />
          ) : (
            <Copy className="w-5 h-5 text-white/20 group-hover/copy:text-black transition-all" />
          )}
        </button>
      )}
    </div>
  );
}

function ProcessingOverlay() {
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
        Authenticating...
      </h3>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/40 italic">
        Biometric Handshake in Progress
      </p>
    </motion.div>
  );
}
