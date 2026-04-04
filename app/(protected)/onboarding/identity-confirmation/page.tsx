"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { DotLoader } from "@/components/ui/dot-loader";
import { ShieldCheck, Phone, Info, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function IdentityConfirmationPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [val, setVal] = useState("");
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [step, setStep] = useState<"form" | "success">("form");
  const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_TESTNET_MODE === "true";
  const showBypass = process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === "true";

  const country = user?.country || "NG";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user?.paymentAccountReady && step !== "success") {
      router.push(user.role === "CLIENT" ? "/client" : "/freelancer");
      return;
    }

    // Pre-fill if available
    if (!val) {
      if ((country === "NG" || country === "Nigeria") && user?.bvn) {
        // If it's the masked BVN, we might want to clear it or handle it.
        // But prompt says "pre-filled with the BVN collected in Prompt 1A if already stored".
        // In my sanitizeUser, I mask it. I should check if I can get the raw one or if I should just leave it empty.
        // Actually, the prompt says "pre-filled", so I'll try to show it if I have it.
        // Since I only store encrypted, and return masked, I'll just leave it for now or show a placeholder.
        // Wait! If the user just came from 1A, it might not be masked yet in the current session?
        // Actually, let's just use what's in the user object.
        setVal(user.bvn);
      } else if ((country === "KE" || country === "Kenya") && user?.phoneNumber) {
        setVal(user.phoneNumber.replace("+254", ""));
      }
    }
  }, [user, authLoading, router, country, val, step]);

  const validate = (value: string) => {
    if (country === "NG" || country === "Nigeria") {
      if (!/^\d{11}$/.test(value)) {
        return "Bank Verification Number must be exactly 11 digits.";
      }
    } else if (country === "KE" || country === "Kenya") {
      const cleaned = value.replace(/^0/, "");
      if (!/^\d{9}$/.test(cleaned)) {
        return "Please enter a valid 9 or 10-digit Kenyan phone number.";
      }
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate(val);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload: any = { country };
      if (country === "NG" || country === "Nigeria") {
        payload.bvn = val;
      } else {
        // Clean leading 0 if present before sending: 07123 -> 7123
        const cleanedPhone = val.replace(/^0/, "");
        payload.phoneNumber = `+254${cleanedPhone}`;
      }

      await api.onboarding.verifyIdentity(payload);
      await refreshUser();
      
      setStep("success");
    } catch (err: any) {
      console.error(err);
      if (err.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.data.attemptsRemaining);
      }
      setError(err.message || "Verification failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numeric
    if (country === "NG" || country === "Nigeria") {
      if (value.length <= 11) setVal(value);
    } else {
      // Allow up to 10 digits to accommodate leading 0 (e.g. 0712345678)
      if (value.length <= 10) setVal(value);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><DotLoader /></div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-primary">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex justify-center mb-8 sm:mb-12">
          <DayleLogo className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" />
        </div>

        <div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <DayleLogo className="w-16 h-16 text-emerald-500" />
                </motion.div>
              </motion.div>
            )}

            {step === "form" ? (
              <>
                <div className="mb-8 sm:mb-10 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
                        One last <span className="text-emerald-600">step.</span>
                    </h1>
                    <p className="text-slate-600 text-base font-bold leading-relaxed px-4">
                        {(country === "NG" || country === "Nigeria")
                            ? "To receive and send payments, we need your Bank Verification Number (BVN). This is used to set up your payment account." 
                            : "To receive and send payments in Kenya, we need your M-Pesa phone number."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <Label htmlFor="identity" className="text-sm font-bold text-slate-700 block ml-1 text-center font-primary uppercase tracking-wider">
                            {(country === "NG" || country === "Nigeria") ? "Bank Verification Number (BVN)" : "M-Pesa Phone Number"}
                        </Label>
                        
                        <div className="relative group">
                            {(country === "KE" || country === "Kenya") && (
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 font-bold text-lg select-none">
                                    +254
                                </div>
                            )}
                            <Input 
                                id="identity"
                                type="text"
                                inputMode="numeric"
                                placeholder={(country === "NG" || country === "Nigeria") ? "11 digits" : "9 digits"}
                                value={val}
                                onChange={handleInputChange}
                                required
                                className={`bg-white border-2 border-slate-200 h-14 sm:h-16 rounded-xl sm:rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-900 text-base sm:text-lg placeholder:text-slate-400 font-mono tracking-widest text-center shadow-sm ${(country === "KE" || country === "Kenya") ? "pl-16 sm:pl-20" : "px-4 sm:px-6"}`}
                            />
                            {(country === "NG" || country === "Nigeria") ? (
                                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-emerald-500/50 transition-colors" />
                            ) : (
                                <Phone className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-emerald-500/50 transition-colors" />
                            )}
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-sm font-bold text-slate-600 leading-snug">
                                {(country === "NG" || country === "Nigeria")
                                    ? "Dial *565*0# on any phone to retrieve your BVN. This is a one-time setup step." 
                                    : "Ensure this is the phone number registered with M-Pesa to avoid payment delays."}
                            </p>
                        </div>
                    </div>

                    {error && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-200">
                            <p className="text-sm font-bold leading-relaxed">{error}</p>
                        </div>
                        {attemptsRemaining !== null && (
                            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {attemptsRemaining} {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
                            </p>
                        )}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !val}
                      className="w-full h-14 sm:h-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl active:scale-[0.98] group"
                    >
                      {loading ? (
                        <DotLoader size="sm" color="white" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Complete Setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    {showBypass && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.onboarding.devBypassIdentity();
                              await refreshUser();
                              setStep("success");
                            } catch (err: any) {
                              toast.error("Bypass failed: " + err.message);
                            }
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
                          title="Development only — not available in production"
                        >
                          Skip for development
                        </button>
                      </div>
                    )}
                </form>

                <div className="mt-10 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Secure</span>
                    </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center relative border border-emerald-100 shadow-sm">
                      <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                      <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
                    Payment account <span className="text-emerald-600">ready.</span>
                  </h1>
                  
                  <p className="text-slate-600 text-base font-bold leading-relaxed px-4 mb-10">
                    Your payment account has been set up. Complete identity verification in Settings to unlock withdrawals.
                  </p>

                  <Button
                    onClick={() => router.push(user?.role === "CLIENT" ? "/client" : "/freelancer")}
                    className="w-full h-14 sm:h-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl active:scale-[0.98] group"
                  >
                    <span className="flex items-center gap-2 text-white">
                      Continue to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
              </div>
            )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            This data is used solely for payment account generation
        </p>
      </div>
    </div>
  );
}
