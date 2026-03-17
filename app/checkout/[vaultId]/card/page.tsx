"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Lock,
  CreditCard,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { toast } from "sonner";
import { useVault } from "@/lib/store/vault-context";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
import { LogoLoader } from "@/components/ui/logo-loader";

type CheckoutStep = "SELECT_CARD" | "NEW_CARD_DETAILS" | "NEW_CARD_ADDRESS" | "success";

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
  const amount = vault?.formattedTotalAmount ? Number(vault.formattedTotalAmount) : 0;
  const displayAmount = currency === "USD" ? amount : amount * EXCHANGE_RATE;
  const currencyPrefix = currency === "USD" ? "$" : "₦";

  const [step, setStep] = useState<CheckoutStep>("SELECT_CARD");
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [cardDetails, setCardDetails] = useState({
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchMethods() {
      try {
        const data = await api.paymentMethods.list();
        const cards = data.filter((m: any) => m.type === "CARD");
        setSavedMethods(cards);
        if (cards.length > 0) {
          setSelectedSavedId(cards.find((c: any) => c.isDefault)?.id || cards[0].id);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingMethods(false);
      }
    }
    fetchMethods();
  }, []);

  const detectCardType = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (clean.match(/^4/)) return "visa";
    if (clean.match(/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/)) return "mastercard";
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
      if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
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
        number: cleaned.replace(/(\d{4})/g, "$1 ").trim().slice(0, 19),
        type,
      }));
      return;
    } else if (field === "expiry") {
      const cleaned = value.replace(/\D/g, "");
      formattedValue = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
    } else if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }
    setCardDetails((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleValidateCardDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!cardDetails.firstName.trim()) newErrors.firstName = "Required";
    if (!cardDetails.lastName.trim()) newErrors.lastName = "Required";
    if (!validateCardNumber(cardDetails.number)) newErrors.number = "Invalid card number";
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) newErrors.expiry = "Invalid expiry";
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) newErrors.cvc = "Invalid CVC";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setStep("NEW_CARD_ADDRESS");
  };

  const processPayment = async (useSavedCardId?: string) => {
    if (!useSavedCardId) {
      if (!cardDetails.addressLine1.trim() || !cardDetails.city.trim()) {
        setErrors({ address: "Please fill in all required address fields." });
        return;
      }
    }
    setErrors({});
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Save new card if using one
      if (!useSavedCardId) {
        const expiryParts = cardDetails.expiry.split("/");
        await api.paymentMethods.addCard({
          brand: cardDetails.type?.toUpperCase() || "CARD",
          last4: cardDetails.number.replace(/\s+/g, "").slice(-4),
          expiryMonth: parseInt(expiryParts[0]),
          expiryYear: parseInt(expiryParts[1]),
          firstName: cardDetails.firstName,
          lastName: cardDetails.lastName,
          addressLine1: cardDetails.addressLine1,
          addressLine2: cardDetails.addressLine2,
          city: cardDetails.city,
          state: cardDetails.state,
          postalCode: cardDetails.postalCode,
          country: cardDetails.country,
          isDefault: false,
        });
      }

      // Fund the vault
      const res = await api.vaults.fund(vaultId, {
        paymentMethod: "card",
        currency,
        idempotencyKey: crypto.randomUUID(),
      });

      if (res.paymentUrl && !res.paymentUrl.includes(window.location.pathname)) {
        toast.success("Redirecting to checkout...");
        window.location.href = res.paymentUrl;
        return;
      }

      // Simulate the Partna Webhook
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
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

      if (!response.ok) throw new Error("On-chain settlement failed. Please try again.");

      setIsProcessing(false);
      setStep("success");
      toast.success("Payment authorized!", { description: "Your funds are being secured in the escrow account." });
      setTimeout(() => { router.push(`/client/vault/${vaultId}?success=true`); }, 3000);
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || "Transaction failed. Payment rejected.");
      toast.error("Payment failed", { description: err.message });
    }
  };

  const getBrandLogo = (brand: string) => {
    const b = brand?.toUpperCase();
    if (b === "VISA") return <Image src="/visa.svg" alt="Visa" width={40} height={14} className="h-4 w-auto" />;
    if (b === "MASTERCARD") return <Image src="/mastercard.svg" alt="Mastercard" width={34} height={20} className="h-5 w-auto" />;
    if (b === "VERVE") return <Image src="/verve.svg" alt="Verve" width={34} height={20} className="h-5 w-auto" />;
    return <CreditCard className="w-5 h-5 text-slate-400" />;
  };

  if (loading || loadingMethods)
    return (
      <LogoLoader />
    );

  return (
    <div className="min-h-screen bg-white text-slate-600 font-primary antialiased">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT SIDEBAR */}
        <section className="w-full lg:w-[400px] bg-slate-50 p-12 border-r border-slate-100 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />
          <div className="space-y-16 relative z-10">
            <div className="flex items-center gap-0">
              <div
                className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                onClick={() => router.push("/client")}
              >
                <DayleLogo className="w-10 h-10 text-slate-900" />
              </div>
              <span className="text-slate-900 font-bold tracking-tighter text-2xl ">
                Dayle
              </span>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-slate-600 tracking-[0.4em] leading-none uppercase">Amount due</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-slate-400 font-bold">Project ID</span>
                  <span className="text-emerald-600 font-mono tracking-normal text-sm font-bold">
                    VAULT-{vault?.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-6xl font-bold text-slate-900 tracking-tighter sm:text-5xl flex items-baseline gap-2">
                  <span className="text-emerald-600 font-bold text-3xl">{currencyPrefix}</span>
                  {displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              </div>
            </div>
          </div>
          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl relative group overflow-hidden shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-emerald-600 font-bold tracking-[0.3em] mb-4 uppercase">
                <DayleLogo className="w-6 h-6 text-emerald-600" /> Secure Card Flow
              </div>
              <p className="text-slate-600 leading-relaxed font-bold st uppercase">
                Encrypted payment processing via Partna Link.
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 lg:p-20 flex items-center justify-center relative bg-slate-50/50">
          <div className="max-w-2xl w-full">
            <button
              onClick={() => {
                if (step === "NEW_CARD_ADDRESS") { setStep("NEW_CARD_DETAILS"); return; }
                if (step === "NEW_CARD_DETAILS") { setStep("SELECT_CARD"); return; }
                router.push(`/checkout/${vaultId}`);
              }}
              className="flex items-center gap-3 text-slate-900 hover:text-emerald-500 transition-all font-bold tracking-[0.3em] mb-12 group bg-white border border-slate-200 py-4 px-6 rounded-2xl shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {step === "NEW_CARD_ADDRESS" ? "Back to Card Details" : step === "NEW_CARD_DETAILS" ? "Back to Saved Cards" : "Change payment method"}
            </button>

            <AnimatePresence mode="wait">
              {step === "success" ? (
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
                    <h2 className="text-5xl font-bold text-slate-900 tracking-tighter">Payment Accepted</h2>
                    <p className="text-emerald-600 font-bold tracking-[0.5em] uppercase">Funds are being secured on-chain</p>
                  </div>
                  <p className="font-bold text-slate-400 tracking-[0.2em] uppercase">Redirecting to your project in a few seconds...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form-area"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">Card Authorization</h2>
                    <p className="text-slate-400 font-bold tracking-[0.3em] uppercase">
                      {step === "SELECT_CARD" ? "Select or add a card" : step === "NEW_CARD_ADDRESS" ? "Step 2 · Billing Address" : "Step 1 · Card Details"}
                    </p>
                    {(step === "NEW_CARD_DETAILS" || step === "NEW_CARD_ADDRESS") && (
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === "NEW_CARD_DETAILS" ? "bg-emerald-500" : "bg-slate-200"}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step === "NEW_CARD_ADDRESS" ? "bg-emerald-500" : "bg-slate-200"}`} />
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[3rem] p-10 lg:p-12 shadow-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32" />

                    {/* ── SELECT CARD ── */}
                    {step === "SELECT_CARD" && (
                      <div className="space-y-4 relative z-10">
                        {/* Supported logos */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">We accept</span>
                          <Image src="/visa.svg" alt="Visa" width={40} height={14} className="h-4 w-auto opacity-80" />
                          <Image src="/mastercard.svg" alt="Mastercard" width={34} height={20} className="h-5 w-auto opacity-80" />
                          <Image src="/verve.svg" alt="Verve" width={34} height={20} className="h-5 w-auto opacity-80" />
                        </div>

                        {savedMethods.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Cards</p>
                            {savedMethods.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => setSelectedSavedId(m.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedSavedId === m.id ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    {getBrandLogo(m.brand)}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-slate-800">
                                      {m.brand} •••• {m.last4}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      Expires {String(m.expiryMonth).padStart(2, "0")}/{m.expiryYear}
                                      {m.firstName ? ` · ${m.firstName} ${m.lastName}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSavedId === m.id ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                                  {selectedSavedId === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Add new card option */}
                        <button
                          onClick={() => { setSelectedSavedId(null); setStep("NEW_CARD_DETAILS"); }}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Plus className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Add a new card</span>
                        </button>

                        {paymentError && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
                            <XCircle className="w-5 h-5 shrink-0" />
                            {paymentError}
                          </div>
                        )}

                        <button
                          onClick={() => selectedSavedId && processPayment(selectedSavedId)}
                          disabled={isProcessing || !selectedSavedId}
                          className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-3xl shadow-xl shadow-emerald-600/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : "Confirm Deposit"}
                        </button>
                        <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                          <DayleLogo className="w-4 h-4 text-emerald-500" /> Level 1 PCI Compliance
                        </div>
                      </div>
                    )}

                    {/* ── NEW CARD: STEP 1 — Card Details ── */}
                    {step === "NEW_CARD_DETAILS" && (
                      <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">First Name</label>
                            <input
                              type="text"
                              placeholder="John"
                              value={cardDetails.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className={`w-full h-14 bg-slate-50 border ${errors.firstName ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Last Name</label>
                            <input
                              type="text"
                              placeholder="Doe"
                              value={cardDetails.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className={`w-full h-14 bg-slate-50 border ${errors.lastName ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Card Number</label>
                            <div className="flex gap-2 h-5 items-center">
                              {cardDetails.type === "visa" && <Image src="/visa.svg" alt="Visa" width={40} height={14} className="h-4 w-auto" />}
                              {cardDetails.type === "mastercard" && <Image src="/mastercard.svg" alt="Mastercard" width={34} height={20} className="h-5 w-auto" />}
                              {cardDetails.type === "verve" && <Image src="/verve.svg" alt="Verve" width={34} height={20} className="h-5 w-auto" />}
                              {!cardDetails.type && <CreditCard className="w-5 h-5 text-slate-300" />}
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={(e) => handleInputChange("number", e.target.value)}
                            className={`w-full h-14 bg-slate-50 border ${errors.number ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold font-mono focus:border-emerald-500/30 outline-none transition-all`}
                          />
                          {errors.number && <p className="text-xs text-red-500 font-bold ml-1">{errors.number}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Expiry</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => handleInputChange("expiry", e.target.value)}
                              className={`w-full h-14 bg-slate-50 border ${errors.expiry ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold tracking-tight focus:border-emerald-500/30 outline-none transition-all`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">CVC</label>
                            <input
                              type="password"
                              placeholder="123"
                              value={cardDetails.cvc}
                              onChange={(e) => handleInputChange("cvc", e.target.value)}
                              className={`w-full h-14 bg-slate-50 border ${errors.cvc ? "border-red-500" : "border-slate-100"} rounded-2xl px-5 text-slate-900 font-bold tracking-tight focus:border-emerald-500/30 outline-none transition-all`}
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleValidateCardDetails}
                          className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-3xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                        >
                          <div className="flex items-center justify-center gap-2">
                            Continue to Billing Address
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </button>
                        <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                          <DayleLogo className="w-4 h-4 text-emerald-500" /> Level 1 PCI Compliance
                        </div>
                      </div>
                    )}

                    {/* ── NEW CARD: STEP 2 — Billing Address ── */}
                    {step === "NEW_CARD_ADDRESS" && (
                      <div className="space-y-5 relative z-10">
                        <div>
                          <h3 className="font-bold text-slate-800">Billing Address</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Required for card verification and fraud prevention.</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Address Line 1 *</label>
                            <input
                              type="text"
                              placeholder="123 Main Street"
                              value={cardDetails.addressLine1}
                              onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Address Line 2 <span className="text-slate-300 lowercase">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="Apt, Suite, etc."
                              value={cardDetails.addressLine2}
                              onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">City *</label>
                              <input
                                type="text"
                                placeholder="Lagos"
                                value={cardDetails.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">State</label>
                              <input
                                type="text"
                                placeholder="Lagos"
                                value={cardDetails.state}
                                onChange={(e) => handleInputChange("state", e.target.value)}
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Postal Code</label>
                              <input
                                type="text"
                                placeholder="100001"
                                value={cardDetails.postalCode}
                                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-slate-900 font-bold focus:border-emerald-500/30 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-bold text-slate-400 tracking-[0.3em] uppercase text-xs ml-1">Country *</label>
                              <select
                                value={cardDetails.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
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

                        {(paymentError || errors.address) && (
                          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
                            <XCircle className="w-5 h-5 shrink-0" />
                            {paymentError || errors.address}
                          </div>
                        )}

                        <button
                          onClick={() => processPayment()}
                          disabled={isProcessing}
                          className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-3xl shadow-xl shadow-emerald-600/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em] disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <ShieldCheck className="w-4 h-4" />
                              Confirm Deposit
                            </div>
                          )}
                        </button>
                        <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                          <Lock className="w-3 h-3 text-emerald-500" /> Level 1 PCI Compliance
                        </div>
                      </div>
                    )}
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
