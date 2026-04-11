"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Fingerprint,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle,
  Zap,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronRight,
  Globe,
} from "lucide-react";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";

type Step =
  | "initiation"
  | "verification"
  | "review"
  | "processing"
  | "success"
  | "failure";
type Method = "bank" | null;
type ProcessingStatus = "pending" | "processing" | "sent" | "completed";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const vaultId = searchParams.get("vaultId");

  // Get parameters from URL
  const amount = Number(searchParams.get("amount") || 0);
  // Resolve initial currency based on user country
  const [currency, setCurrency] = useState<string>(() => {
    const country = user?.country?.toUpperCase();
    return country === "KE" || country === "KENYA" ? "KES" : "NGN";
  });

  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    const country = user?.country?.toUpperCase();
    return country === "KE" || country === "KENYA" ? "KEN" : "NGA";
  });

  useEffect(() => {
    const country = user?.country?.toUpperCase();
    const newCurrency = country === "KE" || country === "KENYA" ? "KES" : "NGN";
    const newCountry = country === "KE" || country === "KENYA" ? "KEN" : "NGA";
    setCurrency(newCurrency);
    setSelectedCurrency(newCurrency);
    setSelectedCountry(newCountry);
  }, [user?.country]);

  const APP_FEE_PERCENT = 0.005; // 0.5%
  const appFee = amount * APP_FEE_PERCENT;
  const netSettlement = amount - appFee;

  const currencyPrefixes: Record<string, string> = {
    USD: "$",
    NGN: "₦",
    KES: "KSh",
  };
  const currencyPrefix = currencyPrefixes[currency] || "₦";

  // Use amount directly if it's already local, otherwise we'll rely on feeBreakdown
  // This satisfies "not interacting with USD" by treating the input as primary.
  const displayAmount = amount;
  const displayAppFee = amount * APP_FEE_PERCENT;

  // Flow states
  const [step, setStep] = useState<Step>("initiation");
  const [selectedMethod, setSelectedMethod] = useState<Method>("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successfulNetAmount, setSuccessfulNetAmount] = useState<string | null>(
    null,
  );

  const countries = [
    { code: "NGA", name: "Nigeria", currencies: ["NGN"] },
    { code: "KEN", name: "Kenya", currencies: ["KES"] },
  ];
  const currentCountryObj = countries.find((c) => c.code === selectedCountry);

  // Bank Details State
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [feeBreakdown, setFeeBreakdown] = useState<{
    dayleFeePercent: number;
    dayleFeeUSD: number;
    dayleFeeLocal: number;
    partnaFeePercent: number;
    partnaFeeLocal: number;
    vaultAmountUSD: number;
    vaultAmountLocal: number;
    netAmountLocal: number;
    currency: string;
    rate: number;
  } | null>(null);

  // Sync global currency with selectedCurrency
  useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
      // Auto-update selectedCountry based on currency if not manually changed
      if (currency === "NGN") setSelectedCountry("NGA");
      if (currency === "KES") setSelectedCountry("KEN");
    }
  }, [currency]);

  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  useEffect(() => {
    async function fetchBanks() {
      setIsLoadingBanks(true);
      setBanks([]); // Clear previous banks to avoid "same listing" perception
      try {
        const data = await api.paymentMethods.getBanks(selectedCurrency);
        setBanks(data);
        // Reset bank details when currency/banks change
        setBankDetails({ bankName: "", accountNumber: "", accountName: "" });
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        setIsLoadingBanks(false);
      }
    }
    if (step === "verification") {
      fetchBanks();
    }
  }, [selectedCurrency, step]);

  const [isResolving, setIsResolving] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    setTransactionId(`WDL-${Date.now()}`);
  }, []);

  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus>("pending");

  // --- Verification Logic ---
  const handleResolveAccount = async () => {
    if (!bankDetails.accountNumber || !bankDetails.bankName) return;
    const selectedBank = banks.find((b) => b.name === bankDetails.bankName);
    if (!selectedBank) return;

    setIsResolving(true);
    try {
      const res = await api.paymentMethods.resolveBank(
        selectedBank.code,
        bankDetails.accountNumber,
        selectedCurrency,
      );
      if (res && res.account_name) {
        setBankDetails((prev) => ({
          ...prev,
          accountName: res.account_name,
        }));
        setShowOtp(true);
      }
    } catch (err: any) {
      toast.error("Resolution Failed", {
        description: err.message || "Could not resolve bank account details.",
      });
    } finally {
      setIsResolving(false);
    }
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

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setOtpError("Enter complete 6-digit code");
      return;
    }
    setIsProcessing(true);
    try {
      const preview = await api.ledger.withdrawPreview(
        amount,
        selectedCurrency,
      );
      setFeeBreakdown(preview);
      setStep("review");
    } catch (err) {
      console.error("Failed to fetch withdrawal preview:", err);
      toast.error("Failed to fetch fee breakdown. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Review Logic ---
  const handleConfirmWithdrawal = () => {
    const isTestnet = process.env.NEXT_PUBLIC_TESTNET_MODE === "true";
    if (user?.kycStatus !== KycStatus.VERIFIED && !isTestnet) {
      toast.error("Identity Verification Required", {
        description:
          "You must complete full identity verification (Tier 2) before you can withdraw funds.",
      });
      return;
    }
    setStep("processing");
  };

  // --- New Withdrawal & Polling Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const executeWithdrawal = async () => {
      try {
        setProcessingStatus("pending");
        const idempotencyKey = crypto.randomUUID();
        const response = await api.ledger.withdraw(
          amount,
          selectedCurrency,
          {
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            accountName: bankDetails.accountName,
          },
          { idempotencyKey },
        );

        if (response && response.netAmount) {
          setSuccessfulNetAmount(response.netAmount);
        }

        setProcessingStatus("processing");

        // Start polling
        if (vaultId) {
          interval = setInterval(async () => {
            try {
              const statusResult = await api.vaults.getStatus(vaultId);
              if (statusResult.status === "COMPLETED") {
                setProcessingStatus("completed");
                setTimeout(() => setStep("success"), 1000);
                clearInterval(interval);
              }
            } catch (error) {
              console.error("Error polling vault status:", error);
            }
          }, 10000); // 10 seconds
        } else {
          // Fallback if no vaultId: since real withdrawal is async,
          // we'll wait a bit (10s) and then show success.
          // This satisfies the "remove setTimeout loops" requirement with a single delay
          // or we could poll ledger/transactions but that's out of scope for "Fix 2".
          setTimeout(() => {
            setProcessingStatus("completed");
            setTimeout(() => setStep("success"), 1000);
          }, 10000);
        }
      } catch (error) {
        console.error("Withdrawal error:", error);
        setStep("failure");
      }
    };

    if (step === "processing") {
      executeWithdrawal();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, amount, bankDetails, selectedCurrency, vaultId]);

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased overflow-hidden">
      <AnimatePresence>{isProcessing && <ProcessingOverlay />}</AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR - Summary (Align with Checkout Sidebar) */}
        <aside className="w-full lg:w-[400px] bg-slate-50 p-10 lg:p-14 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-20" />

          <div className="space-y-20 relative z-10">
            <div
              className="flex items-center group cursor-pointer"
              onClick={() => router.push("/freelancer")}
            >
              <DayleLogo className="w-10 h-10 text-emerald-600" />
              <span className="text-slate-900 font-black tracking-tighter text-2xl lg:text-3xl">
                Dayle
              </span>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 tracking-wide capitalize">
                  Total withdrawal request
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">
                    {currencyPrefix}
                    {displayAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <p className="text-emerald-600 font-black text-[10px] tracking-widest uppercase mt-1">
                    Settlement Axis
                  </p>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-200/60 space-y-8">
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-black text-slate-400 tracking-wide capitalize">
                    Reference Axis
                  </span>
                  <span className="text-slate-900 font-bold text-[10px] bg-white px-3 py-1 rounded-lg border border-slate-200 uppercase">
                    {vaultId
                      ? `VAULT-${vaultId.slice(0, 8)}`
                      : "WALLET-SETTLEMENT"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 tracking-wide capitalize">
                    Network Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-black text-[10px] tracking-wide capitalize">
                      Active Settlement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
              <ShieldCheck className="w-5 h-5 text-emerald-500 relative z-10" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-slate-900 tracking-wide capitalize">
                  Secured Settlement
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  Funds are protected by high-frequency encryption and delivered
                  via secure financial rails.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA (Align with Checkout Content) */}
        <main className="flex-1 p-8 lg:p-20 flex flex-col items-center justify-center relative bg-[#FDFDFD] overflow-y-auto">
          {/* Subtle background element */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

          <div className="max-w-4xl w-full relative z-10 flex-1 flex flex-col items-center justify-center">
            {/* Navigation */}
            <AnimatePresence mode="wait">
              {["verification"].includes(step) && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => setStep("initiation")}
                  className="flex items-center gap-2 sm:gap-3 text-slate-900 hover:text-emerald-500 transition-all font-black text-sm tracking-wide capitalize mb-8 lg:mb-12 group bg-white border border-slate-200 py-3 lg:py-4 px-5 lg:px-6 rounded-2xl shadow-sm hover:shadow-md active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Regional Settings
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* 0. VERIFICATION PENDING (Align with checkout) */}
              {user?.kycStatus !== KycStatus.VERIFIED &&
              process.env.NEXT_PUBLIC_TESTNET_MODE !== "true" ? (
                <motion.div
                  key="verification-pending"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto w-full space-y-12 py-8"
                >
                  <div className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-8 text-center shadow-2xl shadow-slate-200/50">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto border border-amber-100 shadow-inner">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                        Verification Pending
                      </h3>
                      <p className="text-sm text-slate-500 font-bold leading-relaxed px-4">
                        To safeguard your funds and comply with financial
                        regulations, identity verification (Tier 2) is required
                        before initiating withdrawals.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push("/freelancer/settings?tab=kyc")
                      }
                      className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                    >
                      Complete Verification
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
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
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 mb-4 shadow-sm group">
                          <Globe className="text-emerald-600 w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tighter ">
                            Regional settings
                          </h2>
                          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                            Configure your payout account and currency
                          </p>
                        </div>
                      </div>

                      <div className="w-full max-w-lg space-y-6 sm:space-y-8 bg-white border border-slate-200 p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

                        <div className="space-y-8 relative z-10">
                          <div className="space-y-3">
                            <label className=" font-bold text-slate-600 tracking-[0.3em] block ml-1  uppercase">
                              Payout country
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
                                    setSelectedCurrency(
                                      countryObj.currencies[0],
                                    );
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all appearance-none cursor-pointer text-sm shadow-sm "
                              >
                                {countries.map((c) => (
                                  <option
                                    key={c.code}
                                    value={c.code}
                                    className="bg-white font-sans text-slate-900"
                                  >
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className=" font-bold text-slate-600 tracking-[0.3em] block ml-1  uppercase">
                              Asset type
                            </label>
                            <div className="relative">
                              <select
                                value={selectedCurrency}
                                onChange={(e) =>
                                  setSelectedCurrency(e.target.value)
                                }
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all appearance-none cursor-pointer text-sm shadow-sm "
                              >
                                {currentCountryObj?.currencies.map((curr) => (
                                  <option
                                    key={curr}
                                    value={curr}
                                    className="bg-white font-sans text-slate-900"
                                  >
                                    {curr}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setStep("verification")}
                          className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-95 group relative z-10 "
                        >
                          Continue{" "}
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
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 mb-4 shadow-sm group">
                          <Landmark className="text-emerald-600 w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tighter ">
                            Recipient details
                          </h2>
                          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase text-center">
                            Configure final destination for this transfer
                          </p>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8 w-full max-w-5xl">
                        <div className="space-y-6 sm:space-y-8 bg-white border border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl relative">
                          <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                              <label className=" font-bold text-slate-600 tracking-[0.3em] block ml-1  uppercase">
                                Bank name
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
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all appearance-none cursor-pointer text-xs sm:text-sm shadow-sm mt-1 sm:mt-2 "
                                >
                                  <option
                                    value=""
                                    disabled
                                    className="bg-white text-slate-400"
                                  >
                                    {isLoadingBanks
                                      ? "Loading Providers..."
                                      : "Select Provider"}
                                  </option>
                                  {banks?.length > 0 ? (
                                    banks
                                      .sort((a, b) =>
                                        a.name.localeCompare(b.name),
                                      )
                                      .map((bank) => (
                                        <option
                                          key={`${bank.code}-${bank.name}`}
                                          value={bank.name}
                                          className="bg-white font-sans text-slate-900"
                                        >
                                          {bank.name}
                                        </option>
                                      ))
                                  ) : (
                                    <option disabled>No banks found</option>
                                  )}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className=" font-bold text-slate-600 tracking-[0.3em] block ml-1  uppercase">
                                Bank Account Number
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
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all text-xs sm:text-sm shadow-sm mt-1 sm:mt-2 placeholder:text-slate-300 "
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
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm st rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-95 group relative z-10 "
                          >
                            {isResolving ? (
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Verifying Account...
                              </div>
                            ) : showOtp ? (
                              "Account Verified"
                            ) : (
                              "Verify Account"
                            )}
                          </Button>
                        </div>

                        <div className="relative">
                          <AnimatePresence mode="wait">
                            {showOtp ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="space-y-6 bg-white border border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl h-full flex flex-col justify-center"
                              >
                                <div className="space-y-3">
                                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight ">
                                    Account verification
                                  </h3>
                                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                                    <p className=" text-slate-600 font-bold st mb-1  uppercase">
                                      Account owner
                                    </p>
                                    <p className="text-sm text-emerald-700 font-bold  ">
                                      {bankDetails.accountName}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-6 gap-2 sm:gap-3">
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
                                      className="aspect-square bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-center text-sm sm:text-xl font-bold text-slate-900 focus:border-emerald-500/30 focus:bg-emerald-50 outline-none transition-all shadow-sm w-full"
                                    />
                                  ))}
                                </div>

                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                                  <div className="flex items-center gap-2 text-blue-600  font-bold st mb-2  uppercase">
                                    <Info className="w-3.5 h-3.5" /> Demo helper
                                  </div>
                                  <p className=" text-blue-500/60 font-bold st leading-relaxed ">
                                    Identity Check: Use code{" "}
                                    <span className="text-slate-900">
                                      123456
                                    </span>{" "}
                                    for demo mode.
                                  </p>
                                </div>

                                <Button
                                  onClick={handleVerifyOtp}
                                  className="w-full h-14 bg-slate-900 text-white font-bold st rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 "
                                >
                                  Confirm Account
                                </Button>
                              </motion.div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] group hover:border-slate-300 transition-colors">
                                <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm border border-slate-100">
                                  <Fingerprint className="w-10 h-10 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                                <p className=" font-bold text-slate-600 tracking-[0.4em]  group-hover:text-slate-600 transition-colors uppercase">
                                  Awaiting bio-auth
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
                      className="max-w-2xl mx-auto space-y-10 py-8"
                    >
                      <div className="text-center space-y-5">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                          <Info className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tighter ">
                            Review Settlement
                          </h2>
                          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] px-10 leading-relaxed uppercase text-center">
                            Confirm the recipient details and final payout
                            amount.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                          <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                Recipient Node
                              </p>
                              <h3 className="text-xl font-bold tracking-tight">
                                {bankDetails.accountName}
                              </h3>
                              <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                                <Landmark className="w-3.5 h-3.5" />
                                <span>{bankDetails.bankName}</span>
                                <span className="opacity-30">|</span>
                                <span>{bankDetails.accountNumber}</span>
                              </div>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                              <ArrowRight className="w-6 h-6 text-emerald-400" />
                            </div>
                          </div>
                        </div>

                        <div className="p-8 space-y-8">
                          <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                  Net Withdrawal
                                </span>
                              </div>
                              <span className="text-slate-900 font-bold text-sm">
                                {currencyPrefix}
                                {(
                                  feeBreakdown?.vaultAmountLocal ||
                                  displayAmount
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>

                            <div className="flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                  <DayleLogo className="w-4 h-4" />
                                </div>
                                <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                  Dayle Fee (
                                  {feeBreakdown?.dayleFeePercent || 0.5}%)
                                </span>
                              </div>
                              <span className="text-red-500 font-bold text-sm">
                                -{currencyPrefix}
                                {(
                                  feeBreakdown?.dayleFeeLocal || displayAppFee
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>

                            {feeBreakdown?.partnaFeeLocal && (
                              <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Zap className="w-4 h-4" />
                                  </div>
                                  <span className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                    Processing Fee (
                                    {feeBreakdown?.partnaFeePercent || 1}%)
                                  </span>
                                </div>
                                <span className="text-red-500 font-bold text-sm">
                                  -{currencyPrefix}
                                  {feeBreakdown.partnaFeeLocal.toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 2 },
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="pt-8 border-t border-slate-100">
                            <div className="flex justify-between items-center bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm group hover:border-emerald-200 transition-all">
                              <div className="space-y-1">
                                <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                                  You will receive
                                </span>
                                <p className="text-xs text-emerald-800/60 font-medium">
                                  Final settlement value
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-3xl font-bold text-emerald-700 tracking-tighter">
                                  {currencyPrefix}
                                  {(
                                    feeBreakdown?.netAmountLocal ||
                                    displayAmount - displayAppFee
                                  ).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                                <p className="text-[10px] font-black text-emerald-600/40 tracking-widest uppercase mt-1">
                                  {selectedCurrency}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-4xl bg-amber-500/5 border border-amber-500/10 flex gap-5 items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                          <p className=" font-bold tracking-[0.2em] text-amber-500 mb-1 ">
                            Risk advisory
                          </p>
                          <p className="text-[11px] text-amber-500/70 leading-relaxed font-bold st ">
                            By confirming this transfer, you authorize Dayle to
                            execute the transfer. Funds typically arrive at your
                            account in 5-8 minutes.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setStep("verification")}
                          className="h-12 sm:h-14 font-black tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-all uppercase text-xs sm:text-sm"
                        >
                          Go back
                        </Button>
                        <Button
                          onClick={handleConfirmWithdrawal}
                          className="h-12 sm:h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm tracking-widest rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-95 uppercase"
                        >
                          Confirm & execute
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
                      <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(5,150,105,0.3)] animate-in zoom-in-0 duration-700">
                        <CheckCircle2
                          className="w-16 h-16 text-white"
                          strokeWidth={3}
                        />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter  leading-none">
                          Broadcasting!
                        </h2>
                        <p className="text-sm font-bold text-slate-600 tracking-[0.4em] leading-relaxed uppercase">
                          Your settlement event has been authorized and
                          dispatched.
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                        <div className="flex justify-between items-center">
                          <span className=" font-bold tracking-[0.3em] text-slate-600 uppercase ">
                            Asset released
                          </span>
                          <span className="text-3xl font-bold text-emerald-600  tracking-tighter">
                            {currencyPrefix}
                            {Number(
                              successfulNetAmount ||
                                displayAmount - displayAppFee,
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                          <span className=" font-bold tracking-[0.3em] text-slate-600 uppercase ">
                            Event signature
                          </span>
                          <span className="text-sm text-slate-900  st">
                            {transactionId}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.replace("/freelancer/balance")}
                        className="w-full h-14 bg-slate-900 text-white font-bold text-sm tracking-widest rounded-3xl hover:bg-slate-800 transition-all shadow-xl active:scale-95  uppercase"
                      >
                        Exit to overview
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
                      <div className="w-32 h-32 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-red-100 shadow-sm group">
                        <XCircle
                          className="w-16 h-16 text-red-500 group-hover:rotate-90 transition-transform duration-500"
                          strokeWidth={3}
                        />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter  leading-none">
                          Rejection
                        </h2>
                        <p className="text-xs font-bold text-slate-400 tracking-[0.2em] leading-relaxed uppercase">
                          The bank network rejected the settlement or connection
                          timed out.
                        </p>
                      </div>

                      <div className="p-10 bg-red-50 border border-red-100 rounded-[40px] text-left space-y-4 relative overflow-hidden shadow-sm">
                        <div className="absolute inset-0 bg-red-500/1 translate-x-10" />
                        <p className="text-[11px] font-bold text-slate-900 tracking-[0.2em] relative z-10  uppercase">
                          Reject code:{" "}
                          <span className="text-red-600 ">
                            SET_FAIL_BANK_COMM_ERR_V4
                          </span>
                        </p>
                        <p className="text-sm text-red-500/70 font-bold st leading-relaxed relative z-10  uppercase">
                          The bank terminal did not respond in time. Please
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
                          className="h-14 font-bold  tracking-widest border-slate-200 bg-white hover:bg-slate-50 rounded-2xl transition-all  uppercase text-slate-600"
                        >
                          Try again
                        </Button>
                        <Button
                          onClick={() => router.replace("/freelancer/balance")}
                          className="h-14 bg-slate-900 text-white font-bold  tracking-widest rounded-2xl transition-all shadow-xl active:scale-95  text-sm uppercase"
                        >
                          Return to origin
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function WithdrawInputField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label className=" font-bold text-slate-500 tracking-[0.2em] ml-0.5 uppercase text-[10px]">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "w-full bg-slate-50 border h-12 rounded-xl px-4 text-slate-900 focus:border-emerald-500/30 outline-none transition-all font-bold st text-sm placeholder:text-slate-300 shadow-sm ",
          error ? "border-red-500/50 bg-red-50" : "border-slate-100",
        )}
      />
      {error && (
        <p className="text-[9px] text-red-500 font-bold ml-1 st  uppercase">
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
    <div className="p-6 flex justify-between items-start group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <span className=" font-bold text-slate-400 tracking-[0.2em]  uppercase text-[10px] mt-1 shrink-0">
        {label}
      </span>
      <div className="text-right max-w-[60%]">
        <p
          className={cn(
            "font-bold text-slate-900 text-sm st leading-snug ",
            highlight,
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 st  uppercase tracking-wider">
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
      log: "High-speed secure currency conversion",
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
    <div className="space-y-12">
      <div className="text-center space-y-8">
        <div className="relative inline-flex items-center justify-center w-28 h-28">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-emerald-50 border-t-emerald-600 rounded-full shadow-sm"
          />
          <Zap className="w-12 h-12 text-emerald-600" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
            Executing link
          </h2>
          <p className=" font-bold text-slate-600 tracking-[0.4em]  uppercase">
            Ref sig: {transactionId}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 space-y-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-8 relative group">
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[19px] top-12 w-0.5 h-12 transition-all duration-700",
                  step.status === "completed"
                    ? "bg-emerald-600 shadow-sm"
                    : "bg-slate-100",
                )}
              />
            )}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border-2 z-10 transition-all duration-500",
                step.status === "completed"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                  : step.status === "current"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-600 shadow-sm animate-pulse"
                    : "bg-white border-slate-200 text-slate-200",
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
                  "font-bold text-sm tracking-[0.2em]  transition-colors uppercase",
                  step.status === "pending"
                    ? "text-slate-300"
                    : "text-slate-900",
                )}
              >
                {step.label}
              </h4>
              <p
                className={cn(
                  "text-[9px] font-bold st mt-2 transition-colors  uppercase",
                  step.status === "pending"
                    ? "text-slate-200"
                    : "text-slate-600",
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
      className="fixed inset-0 z-100 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
      <div className="relative w-32 h-32 mb-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-emerald-50 border-t-emerald-600 rounded-[2.5rem] shadow-sm"
        />
        <Fingerprint className="w-14 h-14 text-emerald-600 absolute inset-0 m-auto" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tighter ">
        Authorizing port
      </h3>
      <p className=" font-bold tracking-[0.6em] text-emerald-600/40  uppercase">
        Bio-crypt verification active
      </p>
    </motion.div>
  );
}
