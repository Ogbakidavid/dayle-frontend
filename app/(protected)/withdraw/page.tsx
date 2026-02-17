"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Building2,
  Globe,
  Fingerprint,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Zap,
  Check,
  CreditCard,
  Landmark,
  ArrowRight,
  ArrowUpRight,
  Info,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { toast } from "sonner";

type Step =
  | "method_selection"
  | "card"
  | "initiation"
  | "verification"
  | "review"
  | "processing"
  | "success"
  | "failure";
type Method = "bank" | "card" | null;
type ProcessingStatus = "pending" | "processing" | "sent" | "completed";

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  type: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function FreelancerWithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const amount = parseFloat(searchParams.get("amount") || "0");

  // Flow states
  const [step, setStep] = useState<Step>("method_selection");
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card Details State
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    type: "",
  });
  const [cardErrors, setCardErrors] = useState<
    Partial<Record<keyof CardDetails, string>>
  >({});

  // Initiation State
  const [selectedCountry, setSelectedCountry] = useState("NGA");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  const countries = [
    { code: "NGA", name: "Nigeria", currencies: ["NGN", "USD"] },
    { code: "GHA", name: "Ghana", currencies: ["GHS", "USD"] },
    { code: "KEN", name: "Kenya", currencies: ["KES"] },
    { code: "ZAF", name: "South Africa", currencies: ["ZAR"] },
  ];
  const currentCountryObj = countries.find((c) => c.code === selectedCountry);

  // Bank Details State
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [isResolving, setIsResolving] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // --- Card Logic ---
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

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
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

  const handleCardSubmit = () => {
    const cleanNum = cardDetails.number.replace(/\D/g, "");
    const newErrors: Partial<Record<keyof CardDetails, string>> = {};

    if (!validateCardNumber(cleanNum)) newErrors.number = "Invalid card number";
    if (!cardDetails.name.trim()) newErrors.name = "Required";
    if (!cardDetails.expiry || cardDetails.expiry.length < 5)
      newErrors.expiry = "Invalid date";
    if (!cardDetails.cvc || cardDetails.cvc.length < 3)
      newErrors.cvc = "Invalid CVC";

    if (Object.keys(newErrors).length > 0) {
      setCardErrors(newErrors);
      return;
    }

    setCardErrors({});
    setStep("review");
  };

  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    setTransactionId(`WDL-${Date.now()}`);
  }, []);

  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>("pending");

  // --- Verification Logic ---
  const handleResolveAccount = () => {
    if (!bankDetails.accountNumber || !bankDetails.bankName) return;
    setIsResolving(true);
    // Simulate account resolution
    setTimeout(() => {
      setBankDetails((prev) => ({
        ...prev,
        accountName: "DEMILADE A. SKENOS",
      }));
      setIsResolving(false);
      setShowOtp(true);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Enter complete 6-digit code");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("review");
    }, 1500);
  };

  // --- Review Logic ---
  const handleConfirmWithdrawal = () => {
    if (user?.kycStatus !== KycStatus.VERIFIED) {
      toast.error("KYC Verification Required", {
        description:
          "You must complete KYC verification before you can withdraw funds.",
      });
      return;
    }
    setStep("processing");
  };

  // --- Status Logic ---
  useEffect(() => {
    if (step === "processing") {
      const statusFlow: { status: ProcessingStatus; delay: number }[] = [
        { status: "pending", delay: 2000 },
        { status: "processing", delay: 3000 },
        { status: "sent", delay: 2500 },
      ];

      let currentIndex = 0;
      const updateStatus = () => {
        if (currentIndex < statusFlow.length) {
          setTimeout(() => {
            setProcessingStatus(statusFlow[currentIndex].status);
            currentIndex++;
            if (currentIndex < statusFlow.length) {
              updateStatus();
            } else {
              setTimeout(() => {
                const isSuccess = Math.random() > 0.1;
                if (isSuccess) {
                  setProcessingStatus("completed");
                  setTimeout(() => setStep("success"), 1000);
                } else {
                  setStep("failure");
                }
              }, 2000);
            }
          }, statusFlow[currentIndex].delay);
        }
      };
      updateStatus();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#050505] text-white/80 font-['Poppins',sans-serif] antialiased overflow-hidden">
      <AnimatePresence>{isProcessing && <ProcessingOverlay />}</AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR - Summary */}
        <aside className="w-full lg:w-[400px] bg-[#080808] p-12 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />

          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer group"
                onClick={() => router.push("/freelancer/balance")}
              >
                <Lock className="w-5 h-5 text-black group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-white font-black tracking-tighter text-2xl uppercase italic">
                Dayle
              </span>
            </div>

            <div className="space-y-10">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] italic leading-none">
                  WITHDRAWAL VALUE
                </p>
                <h1 className="text-6xl font-black text-white tracking-tighter sm:text-7xl font-mono flex items-baseline gap-2">
                  <span className="text-emerald-500 font-black text-3xl">
                    $
                  </span>
                  {amount.toLocaleString()}
                </h1>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/5">
                <SummaryItem
                  label="Region / Apex"
                  value={`${selectedCountry} / ${selectedCurrency}`}
                />
                <SummaryItem
                  label="Exchange Protocol"
                  value={`1.00 USD = 1.00 ${selectedCurrency}`}
                />
                <SummaryItem
                  label="Network Node"
                  value="Partna High-Speed Rails"
                  icon={<Shield className="w-3.5 h-3.5 text-emerald-500" />}
                />
                <SummaryItem
                  label="Signature ID"
                  value={transactionId}
                  isMono
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic">
                <Shield className="w-4 h-4" /> SECURE SETTLEMENT V2
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-black uppercase tracking-widest">
                Assets are migrated through high-speed bank-transfer rails with
                encryption at every node.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-24 relative overflow-y-auto bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/2 via-transparent to-transparent">
          <div className="max-w-4xl mx-auto w-full">
            {/* Navigation */}
            <AnimatePresence mode="wait">
              {["initiation", "card", "verification"].includes(step) && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() =>
                    setStep(
                      step === "verification"
                        ? selectedMethod === "bank"
                          ? "initiation"
                          : "card"
                        : "method_selection",
                    )
                  }
                  className="flex items-center gap-3 text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-12 group bg-white/2 border border-white/5 py-3 px-6 rounded-2xl shadow-xl hover:border-white/10"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {step === "verification"
                    ? "Node Configuration"
                    : "Selection Layer"}
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* 0. METHOD SELECTION STEP */}
              {step === "method_selection" && (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-xl mx-auto w-full space-y-16 py-12"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                      Withdrawal Layer
                    </h2>
                    <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                      Select your primary liquidation protocol
                    </p>
                  </div>
                  <div className="grid gap-6">
                    <MethodBtn
                      icon={<CreditCard />}
                      title="Card Push Protocol"
                      desc="Direct to Visa or Mastercard"
                      onClick={() => {
                        setSelectedMethod("card");
                        setStep("card");
                      }}
                    />
                    <MethodBtn
                      icon={<Building2 />}
                      title="Bank Transfer"
                      desc="High-speed local bank transfer"
                      onClick={() => {
                        setSelectedMethod("bank");
                        setStep("initiation");
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* 1. CARD WITHDRAWAL STEP */}
              {step === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid lg:grid-cols-2 gap-20 items-center"
                >
                  <div className="perspective-[2000px]">
                    <CardPreview details={cardDetails} />
                  </div>

                  <div className="space-y-10 bg-[#0D0D0E] border border-white/5 p-10 rounded-3xl shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/3 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                    <div className="space-y-3 relative z-10">
                      <h2 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Zap className="w-6 h-6 text-emerald-500" />
                        Card Data
                      </h2>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        Pushed via real-time visa/mastercard rails.
                      </p>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <WithdrawInputField
                        label="Card Signature"
                        value={cardDetails.number}
                        error={cardErrors.number}
                        onChange={(e) =>
                          handleCardInputChange("number", e.target.value)
                        }
                        placeholder="0000 0000 0000 0000"
                      />
                      <WithdrawInputField
                        label="Registry Name"
                        value={cardDetails.name}
                        error={cardErrors.name}
                        onChange={(e) =>
                          handleCardInputChange(
                            "name",
                            e.target.value.toUpperCase(),
                          )
                        }
                        placeholder="HOLDER NAME"
                      />
                      <div className="grid grid-cols-2 gap-6">
                        <WithdrawInputField
                          label="Validity"
                          value={cardDetails.expiry}
                          error={cardErrors.expiry}
                          onChange={(e) =>
                            handleCardInputChange("expiry", e.target.value)
                          }
                          placeholder="MM/YY"
                        />
                        <WithdrawInputField
                          label="Security Key"
                          type="password"
                          value={cardDetails.cvc}
                          error={cardErrors.cvc}
                          onChange={(e) =>
                            handleCardInputChange("cvc", e.target.value)
                          }
                          placeholder="•••"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCardSubmit}
                      className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group relative z-10"
                    >
                      Proceed to Verification{" "}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 2. INITIATION STEP (BANK) */}
              {step === "initiation" && (
                <motion.div
                  key="initiation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16 flex flex-col items-center py-12"
                >
                  <div className="space-y-5 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-3xl flex items-center justify-center border border-white/5 mb-4 shadow-inner group">
                      <Globe className="text-emerald-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Regional Config
                      </h2>
                      <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                        Configure your payout node and currency mesh
                      </p>
                    </div>
                  </div>

                  <div className="w-full max-w-lg space-y-10 bg-[#0D0D0E] border border-white/5 p-12 rounded-[40px] shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/2 rounded-full -mr-24 -mt-24 blur-3xl" />

                    <div className="space-y-8 relative z-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1 italic">
                          Settlement Country
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCountry}
                            onChange={(e) => {
                              const newCountry = e.target.value;
                              setSelectedCountry(newCountry);
                              const countryObj = countries.find(
                                (c) => c.code === newCountry,
                              );
                              if (
                                countryObj &&
                                !countryObj.currencies.includes(
                                  selectedCurrency,
                                )
                              ) {
                                setSelectedCurrency(countryObj.currencies[0]);
                              }
                            }}
                            className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-white font-black uppercase tracking-widest transition-all appearance-none cursor-pointer text-sm shadow-inner"
                          >
                            {countries.map((c) => (
                              <option
                                key={c.code}
                                value={c.code}
                                className="bg-[#0D0D0E] font-sans"
                              >
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1 italic">
                          Asset Type
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCurrency}
                            onChange={(e) =>
                              setSelectedCurrency(e.target.value)
                            }
                            className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-white font-black uppercase tracking-widest transition-all appearance-none cursor-pointer text-sm shadow-inner"
                          >
                            {currentCountryObj?.currencies.map((curr) => (
                              <option
                                key={curr}
                                value={curr}
                                className="bg-[#0D0D0E] font-sans"
                              >
                                {curr}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setStep("verification")}
                      className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group relative z-10"
                    >
                      Initialize Payout{" "}
                      <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 1. BANK VERIFICATION STEP */}
              {step === "verification" && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16 flex flex-col items-center py-12"
                >
                  <div className="space-y-5 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-3xl flex items-center justify-center border border-white/5 mb-4 shadow-inner group">
                      <Landmark className="text-emerald-500 w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Beneficiary Link
                      </h2>
                      <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                        Configure final destination for this settlement event
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12 w-full max-w-5xl">
                    <div className="space-y-10 bg-[#0D0D0E] border border-white/5 p-10 rounded-[32px] shadow-2xl relative">
                      <div className="space-y-8 relative z-10">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1 italic">
                            Bank Authority
                          </label>
                          <div className="relative">
                            <select
                              value={bankDetails.bankName}
                              onChange={(e) =>
                                setBankDetails({
                                  ...bankDetails,
                                  bankName: e.target.value,
                                })
                              }
                              className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-white font-black uppercase tracking-widest transition-all appearance-none cursor-pointer text-sm shadow-inner mt-2"
                            >
                              <option
                                value=""
                                disabled
                                className="bg-[#0D0D0E]"
                              >
                                Select Provider
                              </option>
                              {[
                                "Access Bank",
                                "Fidelity Bank",
                                "First Bank",
                                "FCMB",
                                "GTBank",
                                "Heritage Bank",
                                "Keystone Bank",
                                "Opay",
                                "Palmpay",
                                "Polaris Bank",
                                "Providus Bank",
                                "Stanbic IBTC",
                                "Standard Chartered",
                                "Sterling Bank",
                                "SunTrust Bank",
                                "Union Bank",
                                "UBA",
                                "Unity Bank",
                                "Wema Bank",
                                "Zenith Bank",
                                "Kuda Bank",
                                "Moniepoint",
                              ]
                                .sort()
                                .map((bank) => (
                                  <option
                                    key={bank}
                                    value={bank}
                                    className="bg-[#0D0D0E] font-sans"
                                  >
                                    {bank}
                                  </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block ml-1 italic">
                            Node Address (Acc Num)
                          </label>
                          <input
                            type="text"
                            placeholder="0000000000"
                            value={bankDetails.accountNumber}
                            onChange={(e) =>
                              setBankDetails({
                                ...bankDetails,
                                accountNumber: e.target.value,
                              })
                            }
                            className="w-full bg-white/2 border border-white/5 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-white font-black uppercase tracking-widest transition-all text-sm shadow-inner mt-2 placeholder:text-white/5"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleResolveAccount}
                        disabled={
                          !bankDetails.accountNumber ||
                          !bankDetails.bankName ||
                          isResolving ||
                          showOtp
                        }
                        className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group relative z-10"
                      >
                        {isResolving ? (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Resolving Node...
                          </div>
                        ) : showOtp ? (
                          "Node Authenticated"
                        ) : (
                          "Authorize Endpoint"
                        )}
                      </Button>
                    </div>

                    <div className="relative">
                      <AnimatePresence mode="wait">
                        {showOtp ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="space-y-8 bg-[#0D0D0E] border border-white/5 p-10 rounded-[32px] shadow-2xl h-full flex flex-col justify-center"
                          >
                            <div className="space-y-3">
                              <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">
                                Owner Verification
                              </h3>
                              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 italic">
                                  RESOLVED IDENTITY
                                </p>
                                <p className="text-sm text-emerald-500 font-black uppercase tracking-wide italic">
                                  {bankDetails.accountName}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-6 gap-3">
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`otp-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) =>
                                    handleOtpChange(index, e.target.value)
                                  }
                                  className="aspect-square bg-white/2 border border-white/5 rounded-xl text-center text-xl font-black text-white focus:border-emerald-500/30 focus:bg-emerald-500/5 outline-none transition-all shadow-inner"
                                />
                              ))}
                            </div>

                            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                              <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 italic">
                                <Info className="w-3.5 h-3.5" /> SECURITY BYPASS
                              </div>
                              <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest leading-relaxed">
                                Identity Check: Use code{" "}
                                <span className="text-white">123456</span> for
                                sandbox verification.
                              </p>
                            </div>

                            <Button
                              onClick={handleVerifyOtp}
                              className="w-full h-14 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/90 transition-all shadow-xl active:scale-95"
                            >
                              Confirm Identity Node
                            </Button>
                          </motion.div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/1 border border-dashed border-white/5 rounded-[32px] group hover:border-white/10 transition-colors">
                            <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                              <Fingerprint className="w-10 h-10 text-white/20 group-hover:text-white transition-colors" />
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-colors">
                              Awaiting Bio-Auth
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. REVIEW STEP */}
              {step === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl mx-auto space-y-12 py-12"
                >
                  <div className="text-center space-y-5">
                    <div className="w-20 h-20 bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/10 shadow-inner">
                      <Info className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Final Manifest
                      </h2>
                      <p className="text-xs font-black text-white/30 uppercase tracking-[0.3em] px-10 leading-relaxed">
                        Confirm the settlement event below. Transactions are
                        irreversible once broadcast to the network.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0D0D0E] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />
                    <div className="divide-y divide-white/5">
                      {selectedMethod === "bank" ? (
                        <>
                          <ReviewItem
                            label="Apex Destination"
                            value={bankDetails.bankName}
                            subValue={bankDetails.accountNumber}
                          />
                          <ReviewItem
                            label="Beneficiary Node"
                            value={bankDetails.accountName}
                          />
                        </>
                      ) : (
                        <>
                          <ReviewItem
                            label="Payout Vector"
                            value={`•••• •••• •••• ${cardDetails.number.slice(-4)}`}
                            subValue={
                              cardDetails.type?.toUpperCase() || "EXTERNAL CARD"
                            }
                          />
                          <ReviewItem
                            label="Registry Holder"
                            value={cardDetails.name}
                          />
                        </>
                      )}
                      <ReviewItem
                        label="Gross Migration"
                        value={`$${amount.toLocaleString()}`}
                      />
                      <ReviewItem
                        label="Gas / Network Fee"
                        value="$0.00"
                        subValue="Dayle Pro active"
                        highlight="text-emerald-500"
                      />
                      <div className="p-8 bg-white/2 flex justify-between items-center relative overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                        <span className="text-xs font-black uppercase text-white/40 tracking-[0.3em] italic">
                          NET SETTLEMENT
                        </span>
                        <div className="text-right">
                          <span className="text-4xl font-black text-white tracking-widest font-mono italic">
                            ${amount.toLocaleString()}
                          </span>
                          <p className="text-[10px] text-white/20 font-black tracking-widest mt-1">
                            {selectedCurrency}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-4xl bg-amber-500/5 border border-amber-500/10 flex gap-5 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1 italic">
                        RISK ADVISORY
                      </p>
                      <p className="text-[11px] text-amber-500/70 leading-relaxed font-black uppercase tracking-widest italic">
                        By broadcasting this event, you authorize Dayle to
                        execute the transfer. Funds typically arrive at the node
                        in 5-8 minutes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setStep("verification")}
                      className="h-16 font-black uppercase text-[10px] tracking-[0.3em] text-white/30 hover:text-white hover:bg-white/5 rounded-2xl transition-all italic"
                    >
                      Modify Vector
                    </Button>
                    <Button
                      onClick={handleConfirmWithdrawal}
                      className="h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 italic"
                    >
                      Confirm & Execute
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 3. PROCESSING STATUS SCREEN */}
              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto py-12"
                >
                  <ProcessingStatusScreen
                    status={processingStatus}
                    transactionId={transactionId}
                  />
                </motion.div>
              )}

              {/* 4. SUCCESS SCREEN */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto text-center space-y-12 py-12"
                >
                  <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-in zoom-in-0 duration-700">
                    <CheckCircle2
                      className="w-16 h-16 text-black"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                      Broadcasting!
                    </h2>
                    <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] leading-relaxed">
                      Your settlement event has been authorized and dispatched.
                    </p>
                  </div>

                  <div className="bg-[#0D0D0E] border border-white/5 rounded-[40px] p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/3 rounded-full -mr-24 -mt-24 blur-3xl" />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">
                        Asset Released
                      </span>
                      <span className="text-3xl font-black text-emerald-500 font-mono italic tracking-tighter">
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">
                        Event Signature
                      </span>
                      <span className="text-xs text-white font-mono tracking-widest">
                        {transactionId}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push("/freelancer/balance")}
                    className="w-full h-18 bg-white text-black font-black uppercase text-xs tracking-[0.3em] rounded-4xl hover:bg-white/90 transition-all shadow-2xl active:scale-95 italic"
                  >
                    Exit to Overview
                  </Button>
                </motion.div>
              )}

              {/* 5. FAILURE SCREEN */}
              {step === "failure" && (
                <motion.div
                  key="failure"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto text-center space-y-12 py-12"
                >
                  <div className="w-32 h-32 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-red-500/20 shadow-xl group">
                    <XCircle
                      className="w-16 h-16 text-red-500 group-hover:rotate-90 transition-transform duration-500"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                      Rejection
                    </h2>
                    <p className="text-xs font-black text-white/30 uppercase tracking-[0.4em] leading-relaxed">
                      The bank network rejected the settlement or connection
                      timed out.
                    </p>
                  </div>

                  <div className="p-10 bg-red-500/5 border border-red-500/10 rounded-[40px] text-left space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/1 translate-x-10" />
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] relative z-10 italic">
                      REJECT CODE:{" "}
                      <span className="text-red-500">
                        SET_FAIL_BANK_COMM_ERR_V4
                      </span>
                    </p>
                    <p className="text-xs text-red-500/60 font-black uppercase tracking-widest leading-relaxed relative z-10 italic">
                      The destination node did not respond in time. Please
                      verify endpoints or contact protocol support if error
                      persists.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep("verification");
                        setShowOtp(false);
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="h-16 font-black uppercase text-[10px] tracking-[0.3em] border-white/5 bg-white/2 hover:bg-white/5 rounded-2xl transition-all italic"
                    >
                      Retry Vector
                    </Button>
                    <Button
                      onClick={() => router.push("/freelancer/balance")}
                      className="h-16 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95 italic text-xs"
                    >
                      Return to Origin
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryItem({
  label,
  value,
  icon,
  isMono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isMono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
      <span className="text-white/30 italic">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span
          className={cn(
            "text-white/70 italic",
            isMono && "font-mono tracking-normal",
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function MethodBtn({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactElement;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-8 bg-white/2 border border-white/5 rounded-[2.5rem] flex items-center gap-8 group hover:bg-emerald-500/3 hover:border-emerald-500/30 transition-all text-left shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-inner">
        {React.cloneElement(icon, { className: "w-8 h-8" } as any)}
      </div>
      <div className="flex-1">
        <p className="text-white font-black text-xl uppercase tracking-tighter italic group-hover:text-emerald-500 transition-colors">
          {title}
        </p>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors">
          {desc}
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/20 transition-all">
        <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}

function CardPreview({ details }: { details: CardDetails }) {
  return (
    <div className="relative aspect-[1.586/1] w-full rounded-[40px] bg-muted p-10 text-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-emerald-900/10 opacity-50 group-hover:opacity-60 transition-opacity" />
      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
        <CreditCard className="w-48 h-48 rotate-12" />
      </div>
      <div className="relative h-full flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="w-16 h-12 bg-white/10 rounded-xl backdrop-blur-3xl border border-white/20 shadow-inner" />
          <div className="flex flex-col items-end">
            {details.type === "visa" && (
              <div className="font-black italic text-3xl tracking-tighter">
                VISA
              </div>
            )}
            {details.type === "mastercard" && (
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                <div className="w-8 h-8 rounded-full bg-amber-500/90 -ml-4 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
              </div>
            )}
            {!details.type && (
              <span className="font-black italic text-xl text-white/20 tracking-[0.2em]">
                EXTERNAL_AXIS
              </span>
            )}
          </div>
        </div>
        <div className="space-y-8">
          <p className="text-3xl tracking-[0.15em] font-mono font-black text-white shadow-sm">
            {details.number || "•••• •••• •••• ••••"}
          </p>
          <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] italic">
            <div>
              <p className="text-white/20 mb-2">HOLDER SIGNATURE</p>
              <p className="text-white tracking-widest">
                {details.name || "UNREGISTERED"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/20 mb-2">VALID_THRU</p>
              <p className="text-white tracking-widest">
                {details.expiry || "MM/YY"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WithdrawInputField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] ml-1 italic">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "w-full bg-white/2 border h-16 rounded-2xl px-6 text-white focus:border-emerald-500/30 outline-none transition-all font-black uppercase tracking-widest text-xs placeholder:text-white/5 shadow-inner",
          error ? "border-red-500/50 bg-red-500/2" : "border-white/5",
        )}
      />
      {error && (
        <p className="text-[9px] text-red-500 font-black ml-1 uppercase tracking-widest italic">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewItem({
  label,
  value,
  subValue,
  highlight,
}: {
  label: string;
  value: string;
  subValue?: string;
  highlight?: string;
}) {
  return (
    <div className="p-8 flex justify-between items-center group hover:bg-white/1 transition-colors">
      <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] italic">
        {label}
      </span>
      <div className="text-right">
        <p
          className={cn(
            "font-black text-white text-sm uppercase tracking-widest italic",
            highlight,
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-[9px] text-white/20 font-black uppercase mt-1.5 tracking-widest italic">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

function ProcessingStatusScreen({
  status,
  transactionId,
}: {
  status: ProcessingStatus;
  transactionId: string;
}) {
  const steps = [
    {
      id: "initiated",
      label: "Auth Received",
      log: "Handshake with Partna Node complete",
      status: "completed",
    },
    {
      id: "resolving",
      label: "Identity Mesh",
      log: "Beneficiary credentials confirmed",
      status: status === "pending" ? "current" : "completed",
    },
    {
      id: "processing",
      label: "Asset Liquidation",
      log: "High-speed crypto-to-fiat conversion",
      status:
        status === "processing"
          ? "current"
          : status === "sent" || status === "completed"
            ? "completed"
            : "pending",
    },
    {
      id: "sent",
      label: "Network Release",
      log: "Transaction broadcast to ACH subnet",
      status:
        status === "sent"
          ? "current"
          : status === "completed"
            ? "completed"
            : "pending",
    },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-8">
        <div className="relative inline-flex items-center justify-center w-28 h-28">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-emerald-500/5 border-t-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          />
          <Zap className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Executing Link
          </h2>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">
            REF_SIG: {transactionId}
          </p>
        </div>
      </div>

      <div className="bg-[#0D0D0E] border border-white/5 rounded-[40px] p-12 space-y-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/1 rounded-full -mr-32 -mt-32 blur-3xl" />
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-8 relative group">
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[19px] top-12 w-0.5 h-12 transition-all duration-700",
                  step.status === "completed"
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : "bg-white/5",
                )}
              />
            )}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border-2 z-10 transition-all duration-500",
                step.status === "completed"
                  ? "bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : step.status === "current"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"
                    : "bg-black border-white/5 text-white/10",
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-5 h-5" strokeWidth={4} />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <div className="pt-1.5 flex-1">
              <h4
                className={cn(
                  "font-black text-sm tracking-[0.2em] uppercase italic transition-colors",
                  step.status === "pending" ? "text-white/20" : "text-white",
                )}
              >
                {step.label}
              </h4>
              <p
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest mt-2 transition-colors italic",
                  step.status === "pending" ? "text-white/5" : "text-white/40",
                )}
              >
                {step.log}
              </p>
            </div>
          </div>
        ))}
      </div>
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
      <div className="relative w-32 h-32 mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-emerald-500/5 border-t-emerald-500 rounded-[2.5rem] shadow-[0_0_40px_rgba(16,185,129,0.3)]"
        />
        <Fingerprint className="w-14 h-14 text-emerald-500 absolute inset-0 m-auto" />
      </div>
      <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">
        Authorizing Port
      </h3>
      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500/40 italic">
        BIO-CRYPT VERIFICATION ACTIVE
      </p>
    </motion.div>
  );
}
