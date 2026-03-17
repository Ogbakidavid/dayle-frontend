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
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";
import { DayleLogo } from "@/components/shared/DayleLogo";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
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
type CardStep = "DETAILS" | "ADDRESS";
type Method = "bank" | "card" | null;
type ProcessingStatus = "pending" | "processing" | "sent" | "completed";

interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  firstName: string;
  lastName: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const amount = Number(searchParams.get("amount") || 0);
  const [currency, setCurrency] = React.useState<"USD" | "NGN">("USD");
  const EXCHANGE_RATE = 1500;
  const PROVIDER_FEE_PERCENT = 0.01; // 1%
  const APP_FEE_PERCENT = 0.005; // 0.5%

  const providerFee = amount * PROVIDER_FEE_PERCENT;
  const appFee = amount * APP_FEE_PERCENT;
  const totalFees = providerFee + appFee;
  const netSettlement = amount - totalFees;

  const displayAmount =
    currency === "USD" ? netSettlement : netSettlement * EXCHANGE_RATE;
  const displayFees =
    currency === "USD" ? totalFees : totalFees * EXCHANGE_RATE;
  const displayProviderFee =
    currency === "USD" ? providerFee : providerFee * EXCHANGE_RATE;
  const displayAppFee = currency === "USD" ? appFee : appFee * EXCHANGE_RATE;

  const currencyPrefix = currency === "USD" ? "$" : "₦";

  // Flow states
  const [step, setStep] = useState<Step>("method_selection");
  const [cardStep, setCardStep] = useState<CardStep>("DETAILS");
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successfulNetAmount, setSuccessfulNetAmount] = useState<string | null>(null);

  // Card Details State
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    type: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
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
    if (clean.match(/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/))
      return "mastercard";
    if (clean.match(/^(506|507|650|501)/)) return "verve";
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
    if (!cardDetails.firstName.trim()) newErrors.firstName = "Required";
    if (!cardDetails.lastName.trim()) newErrors.lastName = "Required";
    if (!cardDetails.expiry || cardDetails.expiry.length < 5)
      newErrors.expiry = "Invalid date";
    if (!cardDetails.cvc || cardDetails.cvc.length < 3)
      newErrors.cvc = "Invalid CVC";

    if (Object.keys(newErrors).length > 0) {
      setCardErrors(newErrors);
      return;
    }

    setCardErrors({});
    setCardStep("ADDRESS");
  };

  const handleAddressSubmit = () => {
    if (!cardDetails.addressLine1.trim() || !cardDetails.city.trim()) {
      toast.error("Required fields missing", {
        description: "Please fill in all required address fields.",
      });
      return;
    }
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
          setTimeout(async () => {
            setProcessingStatus(statusFlow[currentIndex].status);
            currentIndex++;
            if (currentIndex < statusFlow.length) {
              updateStatus();
            } else {
              try {
                // Call Backend to withdraw
                const idempotencyKey = crypto.randomUUID();
                const response = await api.ledger.withdraw(
                  amount,
                  selectedCurrency,
                  {
                    bankName: bankDetails.bankName,
                    accountNumber: bankDetails.accountNumber,
                    accountName: bankDetails.accountName,
                    routingNumber: "121000358", // Mock routing for now
                  },
                  { idempotencyKey },
                );

                if (response && response.netAmount) {
                  setSuccessfulNetAmount(response.netAmount);
                }

                setProcessingStatus("completed");
                setTimeout(() => setStep("success"), 1000);
              } catch (error) {
                console.error("Withdrawal error:", error);
                setStep("failure");
              }
            }
          }, statusFlow[currentIndex].delay);
        }
      };
      updateStatus();
    }
  }, [step, amount, bankDetails, selectedCurrency]);

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased overflow-hidden">
      <AnimatePresence>{isProcessing && <ProcessingOverlay />}</AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR - Summary */}
        <aside className="w-full lg:w-[340px] bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />

          <div className="space-y-10 relative z-10">
            <div className="flex items-center gap-0">
              <div
                className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                onClick={() => router.push("/freelancer")}
              >
                <DayleLogo className="w-10 h-10 text-slate-900" />
              </div>
              <span className="text-slate-900 font-bold tracking-tighter text-2xl ">
                Dayle
              </span>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className=" font-bold text-slate-600 tracking-[0.4em]  leading-none uppercase">
                    Total settlement
                  </p>
                  <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    <button
                      onClick={() => setCurrency("USD")}
                      className={`px-3 py-1  font-bold r rounded-md transition-all uppercase ${currency === "USD" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      USD
                    </button>
                    <button
                      onClick={() => setCurrency("NGN")}
                      className={`px-3 py-1  font-bold r rounded-md transition-all uppercase ${currency === "NGN" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      NGN
                    </button>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tighter sm:text-3xl flex items-baseline gap-2">
                  <span className="text-emerald-600 font-bold text-2xl">
                    {currency === "USD" ? "$" : "₦"}
                  </span>
                  {(currency === "USD" ? amount : amount * EXCHANGE_RATE).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="text-emerald-600 font-bold text-xl ml-1">
                    {currency}
                  </span>
                </h1>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-100">
                <SummaryItem
                  label="Service Fees"
                  value={`${currencyPrefix}${displayFees.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                />
                <SummaryItem
                  label="Transaction ID"
                  value={transactionId}
                  valueClassName="text-emerald-600 tracking-normal text-[9px]"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl relative group overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-600  font-bold tracking-[0.3em] mb-3  uppercase">
                <ShieldCheck className="w-4 h-4" /> Secure withdrawal
              </div>
              <p className=" text-slate-500 leading-relaxed font-bold st mt-2 text-[10px] uppercase">
                Select your preferred method to bridge assets to your regional account.
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-12 lg:p-16 relative overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto w-full">
            {/* Navigation */}
            <AnimatePresence mode="wait">
              {["initiation", "card", "verification"].includes(step) && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => {
                    if (step === "card") {
                      if (cardStep === "ADDRESS") {
                        setCardStep("DETAILS");
                        return;
                      }
                    }
                    setStep(
                      step === "verification"
                        ? selectedMethod === "bank"
                          ? "initiation"
                          : "card"
                        : "method_selection",
                    );
                  }}
                  className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-all  font-bold tracking-wide mb-12 group bg-white border border-slate-200 py-3 px-6 rounded-2xl shadow-sm hover:border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {step === "card" && cardStep === "ADDRESS"
                    ? "Back to Card Details"
                    : "Method Selection"}
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
                  className="max-w-xl mx-auto w-full space-y-12 py-8"
                >
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter ">
                      Withdrawal method
                    </h2>
                    <p className="text-xs font-bold text-slate-600 tracking-[0.2em] uppercase">
                      Select your primary payout method
                    </p>
                  </div>

                  {user?.kycStatus !== KycStatus.VERIFIED ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-10 space-y-6 text-center shadow-sm">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-900  tracking-tighter">
                          Identity Verification Required
                        </h3>
                        <p className="text-sm text-slate-600 font-bold   leading-relaxed px-4">
                          To comply with security and regulatory standards, you need
                          to verify your identity before you can withdraw funds from
                          your balance.
                        </p>
                      </div>
                      <button
                        onClick={() => router.push("/onboarding")}
                        className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-[0.2em] "
                      >
                        Verify Identity Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      <MethodBtn
                        icon={<CreditCard />}
                        title="Card Payout"
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
                        variant="blue"
                        onClick={() => {
                          setSelectedMethod("bank");
                          setStep("initiation");
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* 1. CARD WITHDRAWAL STEP */}
              {step === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tighter">
                      Card Authorization
                    </h2>
                    <p className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs">
                      {cardStep === "ADDRESS"
                        ? "Step 2 · Billing Address"
                        : "Step 1 · Card Details"}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div
                        className={`h-1.5 w-8 rounded-full transition-colors ${cardStep === "DETAILS" ? "bg-emerald-500" : "bg-slate-200"}`}
                      />
                      <div
                        className={`h-1.5 w-8 rounded-full transition-colors ${cardStep === "ADDRESS" ? "bg-emerald-500" : "bg-slate-200"}`}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-xl space-y-6 relative overflow-hidden max-w-2xl mx-auto w-full">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32" />

                    {cardStep === "DETAILS" ? (
                      <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <WithdrawInputField
                            label="First Name"
                            placeholder="John"
                            value={cardDetails.firstName}
                            onChange={(e) =>
                              handleCardInputChange("firstName", e.target.value)
                            }
                          />
                          <WithdrawInputField
                            label="Last Name"
                            placeholder="Doe"
                            value={cardDetails.lastName}
                            onChange={(e) =>
                              handleCardInputChange("lastName", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">
                              Card Number
                            </label>
                            <div className="flex gap-2 h-5 items-center">
                              {cardDetails.type === "visa" && (
                                <Image
                                  src="/visa.svg"
                                  alt="Visa"
                                  width={40}
                                  height={14}
                                  className="h-4 w-auto"
                                />
                              )}
                              {cardDetails.type === "mastercard" && (
                                <Image
                                  src="/mastercard.svg"
                                  alt="Mastercard"
                                  width={34}
                                  height={20}
                                  className="h-5 w-auto"
                                />
                              )}
                              {cardDetails.type === "verve" && (
                                <Image
                                  src="/verve.svg"
                                  alt="Verve"
                                  width={34}
                                  height={20}
                                  className="h-5 w-auto"
                                />
                              )}
                              {!cardDetails.type && (
                                <CreditCard className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) =>
                              handleCardInputChange("number", e.target.value)
                            }
                            className={`w-full h-14 bg-slate-50 border ${cardErrors.number ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold font-mono focus:border-emerald-500/30 outline-none transition-all`}
                          />
                          {cardErrors.number && (
                            <p className="text-xs text-red-500 font-bold ml-1">
                              {cardErrors.number}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <WithdrawInputField
                            label="Expiry"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            error={cardErrors.expiry}
                            onChange={(e) =>
                              handleCardInputChange("expiry", e.target.value)
                            }
                          />
                          <WithdrawInputField
                            label="CVC"
                            placeholder="123"
                            type="password"
                            value={cardDetails.cvc}
                            error={cardErrors.cvc}
                            onChange={(e) =>
                              handleCardInputChange("cvc", e.target.value)
                            }
                          />
                        </div>

                        <Button
                          onClick={handleCardSubmit}
                          className="w-full h-14 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] uppercase tracking-widest"
                        >
                          <div className="flex items-center justify-center gap-2">
                            Continue to Billing Address
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5 relative z-10">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            Billing Address
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Required for card verification and fraud prevention.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <WithdrawInputField
                            label="Address Line 1 *"
                            placeholder="123 Main Street"
                            value={cardDetails.addressLine1}
                            onChange={(e) =>
                              handleCardInputChange(
                                "addressLine1",
                                e.target.value,
                              )
                            }
                          />
                          <WithdrawInputField
                            label="Address Line 2 (Optional)"
                            placeholder="Apt, Suite, etc."
                            value={cardDetails.addressLine2}
                            onChange={(e) =>
                              handleCardInputChange(
                                "addressLine2",
                                e.target.value,
                              )
                            }
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <WithdrawInputField
                              label="City *"
                              placeholder="Lagos"
                              value={cardDetails.city}
                              onChange={(e) =>
                                handleCardInputChange("city", e.target.value)
                              }
                            />
                            <WithdrawInputField
                              label="State"
                              placeholder="Lagos"
                              value={cardDetails.state}
                              onChange={(e) =>
                                handleCardInputChange("state", e.target.value)
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <WithdrawInputField
                              label="Postal Code"
                              placeholder="100001"
                              value={cardDetails.postalCode}
                              onChange={(e) =>
                                handleCardInputChange(
                                  "postalCode",
                                  e.target.value,
                                )
                              }
                            />
                            <div className="space-y-2">
                              <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">
                                Country *
                              </label>
                              <select
                                value={cardDetails.country}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    "country",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                              >
                                <option>Nigeria</option>
                                <option>Ghana</option>
                                <option>Kenya</option>
                                <option>South Africa</option>
                                <option>United States</option>
                                <option>United Kingdom</option>
                                <option>Canada</option>
                                <option>Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleAddressSubmit}
                          className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-3xl shadow-xl shadow-emerald-600/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Confirm Withdrawal
                          </div>
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                      <DayleLogo className="w-4 h-4 text-emerald-500" /> Level 1 PCI
                      Compliance
                    </div>
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
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 mb-4 shadow-sm group">
                      <Globe className="text-emerald-600 w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
                        Regional settings
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                        Configure your payout account and currency
                      </p>
                    </div>
                  </div>

                   <div className="w-full max-w-lg space-y-8 bg-white border border-slate-200 p-8 lg:p-10 rounded-3xl shadow-xl relative">
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
                                setSelectedCurrency(countryObj.currencies[0]);
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
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
                        Recipient details
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase text-center">
                        Configure final destination for this transfer
                      </p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 w-full max-w-5xl">
                    <div className="space-y-8 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative">
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all appearance-none cursor-pointer text-sm shadow-sm mt-2 "
                            >
                              <option
                                value=""
                                disabled
                                className="bg-white text-slate-400"
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
                                    className="bg-white font-sans text-slate-900"
                                  >

                                    {bank}
                                  </option>
                                ))}
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:border-emerald-500/30 outline-none text-slate-900 font-bold st transition-all text-sm shadow-sm mt-2 placeholder:text-slate-300 "
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
                            className="space-y-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl h-full flex flex-col justify-center"
                          >
                            <div className="space-y-3">
                              <h3 className="text-2xl font-bold text-slate-900 tracking-tight ">
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
                                  className="aspect-square bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-900 focus:border-emerald-500/30 focus:bg-emerald-50 outline-none transition-all shadow-sm"
                                />
                              ))}
                            </div>

                            <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
                              <div className="flex items-center gap-2 text-blue-600  font-bold st mb-2  uppercase">
                                <Info className="w-3.5 h-3.5" /> Demo helper
                              </div>
                              <p className=" text-blue-500/60 font-bold st leading-relaxed ">
                                Identity Check: Use code{" "}
                                <span className="text-slate-900">123456</span>{" "}
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
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
                        Final manifest
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] px-10 leading-relaxed uppercase text-center">
                        Confirm the settlement event below. Transactions are
                        irreversible once broadcast to the network.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-600 to-emerald-500/0 opacity-20" />
                    <div className="divide-y divide-slate-100">
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
                            value={`${cardDetails.firstName} ${cardDetails.lastName}`}
                          />
                          <ReviewItem
                            label="Billing Node"
                            value={`${cardDetails.city}, ${cardDetails.country}`}
                            subValue={cardDetails.addressLine1}
                          />
                        </>
                      )}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                            Gross Withdrawal
                          </span>
                          <span className="text-slate-900 font-bold">
                            ${amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                            Total Fees (1.5%)
                          </span>
                          <span className="text-emerald-600 font-bold">
                            -${totalFees.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-8">
                          <span className="text-slate-900 font-bold uppercase tracking-wider text-sm">
                            Net Settlement
                          </span>
                          <div className="text-right">
                            <span className="text-4xl font-bold text-slate-900 st ">
                              ${netSettlement.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <p className=" text-slate-600 font-black st mt-1">
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
                      className="h-14 font-black  tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all  uppercase"
                    >
                      Go back
                    </Button>
                    <Button
                      onClick={handleConfirmWithdrawal}
                      className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-95  uppercase"
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
                      Your settlement event has been authorized and dispatched.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
                    <div className="flex justify-between items-center">
                      <span className=" font-bold tracking-[0.3em] text-slate-600 uppercase ">
                        Asset released
                      </span>
                      <span className="text-3xl font-bold text-emerald-600  tracking-tighter">
                        {currencyPrefix}{Number(successfulNetAmount || netSettlement).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                      The bank terminal did not respond in time. Please verify
                      endpoints or contact protocol support if error persists.
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
  valueClassName,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center  font-bold tracking-tight text-slate-900 uppercase">
      <span className="text-slate-600 ">{label}</span>
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn("text-slate-900 ", valueClassName)}>
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
  variant = "emerald",
}: {
  icon: React.ReactElement;
  title: string;
  desc: string;
  onClick: () => void;
  variant?: "emerald" | "blue";
}) {
  const colors = {
    emerald: {
      hoverBorder: "hover:border-emerald-200",
      hoverShadow: "hover:shadow-emerald-600/5",
      bgCircle: "bg-emerald-50",
      iconActive: "group-hover:bg-emerald-600",
      iconBorder: "group-hover:border-emerald-500",
      textActive: "group-hover:text-emerald-950",
      subActive: "group-hover:text-emerald-600",
      chevron: "group-hover:text-emerald-500",
    },
    blue: {
      hoverBorder: "hover:border-blue-200",
      hoverShadow: "hover:shadow-blue-600/5",
      bgCircle: "bg-blue-50",
      iconActive: "group-hover:bg-blue-600",
      iconBorder: "group-hover:border-blue-500",
      textActive: "group-hover:text-blue-950",
      subActive: "group-hover:text-blue-600",
      chevron: "group-hover:text-blue-500",
    },
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 group transition-all relative overflow-hidden",
        colors.hoverBorder,
        colors.hoverShadow,
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity",
          colors.bgCircle,
        )}
      />

      <div
        className={cn(
          "w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 transition-all shrink-0",
          colors.iconActive,
          "group-hover:text-white",
          colors.iconBorder,
        )}
      >
        {React.cloneElement(icon, { className: "w-5 h-5" } as any)}
      </div>

      <div className="text-left relative z-10 flex-1">
        <p
          className={cn(
            "text-slate-900 font-bold text-lg tracking-tight transition-colors",
            colors.textActive,
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "font-bold text-slate-400 st transition-colors uppercase mt-0.5 text-[10px]",
            colors.subActive,
          )}
        >
          {desc}
        </p>
      </div>

      <ChevronRight
        className={cn(
          "w-5 h-5 ml-auto text-slate-300 transition-all group-hover:translate-x-1",
          colors.chevron,
        )}
      />
    </button>
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
    <div className="p-6 flex justify-between items-center group hover:bg-slate-50 transition-colors">
      <span className=" font-bold text-slate-600 tracking-[0.3em]  uppercase">
        {label}
      </span>
      <div className="text-right">
        <p className={cn("font-bold text-slate-900 text-sm st ", highlight)}>
          {value}
        </p>
        {subValue && (
          <p className="text-[9px] text-slate-600 font-bold mt-1.5 st  uppercase">
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
