"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormPersistence } from "@/lib/hooks/use-form-persistence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { DotLoader } from "@/components/ui/dot-loader";
import {
  ShieldCheck,
  Phone,
  Info,
  ArrowRight,
  CheckCircle2,
  Mail,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function IdentityOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useUser();
  const [step, setStep] = useState<"country" | "form" | "success">(
    user?.country ? "form" : "country",
  );
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(user?.country || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null,
  );

  // State with Persistence
  const [persistedData, setPersistedData, clearPersistence] = useFormPersistence("onboarding_identity", {
    val: "",
    confirmPhoneVal: "",
  });

  const { val, confirmPhoneVal } = persistedData;

  const setVal = (v: string) => setPersistedData(p => ({ ...p, val: v }));
  const setConfirmPhoneVal = (v: string) => setPersistedData(p => ({ ...p, confirmPhoneVal: v }));

  // OTP Flow states
  const [otpMethods, setOtpMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState<
    "none" | "method" | "otp" | "phone_confirm"
  >("none");

  const isDev =
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_TESTNET_MODE === "true";
  const showBypass = process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === "true";
  const currentCountry = selectedCountry || user?.country;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    // Only redirect away if payment account is actually ready
    // Don't redirect if we're mid-onboarding or OTP flow
    if (user?.paymentAccountReady && step !== "success") {
      router.push(user.role === "CLIENT" ? "/client" : "/freelancer");
    }
  }, [user, authLoading, router, step, otpStep]);

  const handleCountrySelect = async (c: string) => {
    setLoading(true);
    setLoadingMessage("Setting up your payment profile...");
    try {
      await api.auth.updateProfile({ country: c });
      await api.onboarding.initialize();
      await refreshUser();
      setSelectedCountry(c);
      setStep("form");
      setLoading(false);
      setLoadingMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to initialize account. Please try again.");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const validate = (value: string) => {
    const c = selectedCountry || user?.country;
    if (c === "Nigeria" || c === "NG") {
      if (!/^\d{11}$/.test(value)) {
        return "BVN must be exactly 11 digits.";
      }
    } else if (c === "Kenya" || c === "KE") {
      if (!/^\d{9}$/.test(value)) {
        return "Phone number must be exactly 9 digits after +254.";
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
    setLoadingMessage("Verifying your identity and linking account...");
    try {
      const c = selectedCountry || user?.country;
      const payload: any = { country: c };
      if (c === "Nigeria" || c === "NG") {
        payload.bvn = val;
      } else {
        payload.phoneNumber = `+254${val}`;
      }

      const res = await api.onboarding.submitIdentity(payload);

      if (res.requiresOtp) {
        setOtpMethods(res.methods);
        // Force Step 3 (Phone Confirm) as a mandatory prerequisite for Nigeria (BVN)
        if (currentCountry === "Nigeria" || currentCountry === "NG") {
          setOtpStep("phone_confirm");
        } else {
          setOtpStep("method");
        }
        setLoading(false);
        setLoadingMessage("");
        return; // Don't call refreshUser here — it triggers guard redirects
      }

      await refreshUser();
      clearPersistence();
      setStep("success");
    } catch (err: any) {
      console.error(err);
      if (err.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.data.attemptsRemaining);
      }
      setError(err.message || "Failed to submit identity. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handlePhoneConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPhoneVal || confirmPhoneVal.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setLoadingMessage("Confirming phone number...");
    try {
      await api.onboarding.confirmKycPhone(confirmPhoneVal);
      // Rahman's Step 3: Auto-trigger OTP with 'sendotp'
      setLoadingMessage("Triggering verification code...");
      await api.onboarding.selectKycMethod("sendotp");
      
      setOtpStep("otp");
      if (isDev) {
        setOtp("123456"); // Pre-fill staging OTP
      }
    } catch (err: any) {
      toast.error(
        err.message ||
          "Confirmation failed. Please check the number and try again.",
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleSelectMethod = async (method: string) => {
    setSelectedMethod(method);
    setLoading(true);
    setLoadingMessage("Preparing verification...");
    try {
      await api.onboarding.selectKycMethod(method);
      setOtpStep("otp");
    } catch (err: any) {
      toast.error(
        err.message || "Failed to trigger verification. Please try again.",
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setLoadingMessage("Verifying code and completing setup...");
    try {
      await api.onboarding.verifyOtp(otp);
      await refreshUser();
      clearPersistence();
      setStep("success");
    } catch (err: any) {
      toast.error(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numeric
    if (currentCountry === "Nigeria" || currentCountry === "NG") {
      if (value.length <= 11) setVal(value);
    } else {
      if (value.length <= 9) setVal(value);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DotLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-primary">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex justify-center mb-8 sm:mb-12">
          <DayleLogo className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500" />
        </div>

        <div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-[40px] shadow-sm relative overflow-hidden">
          {/* Suble glow inside card */}
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
              {loadingMessage && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-slate-600 font-bold text-sm tracking-wide"
                >
                  {loadingMessage}
                </motion.p>
              )}
            </motion.div>
          )}

          {step === "country" ? (
            <>
              <div className="mb-8 sm:mb-10 text-center text-slate-900">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-3 sm:mb-4">
                  Select your <span className="text-emerald-600">country.</span>
                </h1>
                <p className="text-slate-600 text-base font-bold leading-relaxed">
                  We need this to ensure we use the correct payment rails for
                  your region.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleCountrySelect("NG")}
                  disabled={loading}
                  className="h-20 rounded-2xl border-slate-200 flex items-center justify-between px-8 hover:border-emerald-500/50 hover:bg-slate-50 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🇳🇬</span>
                    <span className="text-lg font-bold text-slate-900">
                      Nigeria
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleCountrySelect("KE")}
                  disabled={loading}
                  className="h-20 rounded-2xl border-slate-200 flex items-center justify-between px-8 hover:border-emerald-500/50 hover:bg-slate-50 group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🇰🇪</span>
                    <span className="text-lg font-bold text-slate-900">
                      Kenya
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </Button>
              </div>
            </>
          ) : step === "form" && otpStep === "phone_confirm" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Confirm BVN Phone.</h1>
                <p className="text-slate-600 font-medium">
                  Partna requires you to provide the 11-digit phone number linked to your <span className="font-bold text-slate-800">BVN registry</span> to proceed.
                </p>
              </div>

              <form onSubmit={handlePhoneConfirm} className="space-y-6">
                <div className="relative group">
                  <input
                    type="text"
                    value={confirmPhoneVal}
                    onChange={(e) => setConfirmPhoneVal(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="Enter BVN phone number"
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center tracking-[0.2em] text-lg"
                    required
                  />
                  {isDev && (currentCountry === "NG" || currentCountry === "Nigeria") && (
                    <div className="mt-2 text-[11px] text-slate-500 font-bold flex items-center gap-1.5 ml-2">
                       <Info className="w-3 h-3 text-blue-500" />
                       STAGING: Use 08032043843
                    </div>
                  )}
                  {isDev && (currentCountry === "KE" || currentCountry === "Kenya") && (
                    <div className="mt-2 text-[11px] text-slate-500 font-bold flex items-center gap-1.5 ml-2">
                       <Info className="w-3 h-3 text-emerald-500" />
                       STAGING: no phone confirm needed for Kenya
                    </div>
                  )}
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
                  <p className="text-xs text-amber-700 font-bold leading-relaxed">
                    IMPORTANT: This must be the exact phone number that was used when you registered your BVN.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || confirmPhoneVal.length < 10}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:bg-slate-200 disabled:shadow-none"
                >
                  {loading ? "Confirming..." : "Link Phone & Send Code"}
                </Button>

                <button
                  type="button"
                  onClick={() => setOtpStep("none")}
                  className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                >
                  Choose another method
                </button>
              </form>
            </motion.div>
          ) : step === "form" && otpStep === "method" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Verification Method.</h1>
                <p className="text-slate-600 font-medium">
                  {currentCountry === "Kenya" || currentCountry === "KE" 
                    ? "Choose how you'd like to verify your number." 
                    : "Choose how you'd like to receive your verification code."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {otpMethods.map((m: any) => (
                  <Button
                    key={m.method}
                    variant="outline"
                    onClick={() => handleSelectMethod(m.method)}
                    disabled={loading}
                    className="min-h-[100px] h-auto py-6 rounded-[24px] border-slate-200 flex items-center justify-between px-8 hover:border-emerald-500/50 hover:bg-slate-50 group transition-all whitespace-normal"
                  >
                    <div className="flex flex-col items-start text-left flex-1 pr-4 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight whitespace-normal">
                        {m.method === 'sendotp' ? 'Receive SMS Code' : 'Send SMS Recognition'}
                      </span>
                      <span className="text-xs sm:text-[13px] text-slate-500 font-medium leading-relaxed mt-1 wrap-break-word whitespace-normal">
                        {m.hint || 'Standard carrier rates apply'}
                      </span>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors shrink-0 shadow-sm border border-slate-200/50 ml-2">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </Button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOtpStep("none")}
                className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
              >
                Go back to phone input
              </button>
            </motion.div>
          ) : step === "form" && otpStep === "otp" ? (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
                  Enter <span className="text-emerald-600">code.</span>
                </h1>
                <p className="text-slate-600 text-base font-bold leading-relaxed px-4">
                  We've sent a verification code to your {selectedMethod}. Enter
                  it below to complete your setup.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="otp"
                    className="text-sm font-bold text-slate-700 block text-center uppercase tracking-widest"
                  >
                    6-Digit Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000 000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    className="bg-slate-50! border-slate-200 h-16 sm:h-20 rounded-2xl sm:rounded-3xl focus:border-emerald-500 focus:bg-white! focus:ring-0 transition-all text-slate-900 text-2xl sm:text-4xl font-bold tracking-[0.4em] text-center"
                  />
                  <Alert className="mt-4 p-5 bg-amber-50/50 border-amber-200/50 rounded-2xl border-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <AlertTitle className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-0.5">Staging Mode</AlertTitle>
                        <AlertDescription className="text-xs text-amber-800 font-medium">
                          Use <span className="text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-100 font-mono font-bold text-sm shadow-sm">123456</span> to verify
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full h-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <DotLoader size="sm" color="white" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify & Complete Setup"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setOtpStep("method")}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest"
                  >
                    Didn't get a code? Resend
                  </button>
                </div>
              </form>
            </>
          ) : step === "form" ? (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
                  One last <span className="text-emerald-600">step.</span>
                </h1>
                <p className="text-slate-600 text-base font-bold leading-relaxed px-4">
                  {currentCountry === "NG" || currentCountry === "Nigeria"
                    ? "To receive and send payments, we need your Bank Verification Number (BVN). This is used to set up your payment account."
                    : "To receive and send payments in Kenya, we need your M-Pesa phone number."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="identity"
                    className="text-sm font-bold text-slate-700 block ml-1 text-center font-primary uppercase tracking-wider"
                  >
                    {currentCountry === "NG" || currentCountry === "Nigeria"
                      ? "Bank Verification Number (BVN)"
                      : "M-Pesa Phone Number"}
                  </Label>

                  <div className="relative group/input">
                    {(currentCountry === "KE" ||
                      currentCountry === "Kenya") && (
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 font-bold text-lg select-none z-10">
                        +254
                      </div>
                    )}
                    <Input
                      id="identity"
                      type="text"
                      inputMode="numeric"
                      placeholder={
                        currentCountry === "NG" || currentCountry === "Nigeria"
                          ? "11 digits"
                          : "9 digits"
                      }
                      value={val}
                      onChange={handleInputChange}
                      required
                      className={`bg-slate-50! border-slate-200 h-14 sm:h-16 rounded-xl sm:rounded-2xl focus:border-emerald-500/50 focus:bg-white! focus:ring-0 transition-all text-slate-900 text-base sm:text-lg placeholder:text-slate-400 font-mono tracking-widest text-center ${currentCountry === "KE" || currentCountry === "Kenya" ? "pl-16 sm:pl-20" : "px-4 sm:px-6"}`}
                    />
                    
                    {currentCountry === "NG" || currentCountry === "Nigeria" ? (
                      <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-emerald-500/50 transition-colors" />
                    ) : (
                      <Phone className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-emerald-500/50 transition-colors" />
                    )}
                  </div>

                  {isDev && (currentCountry === "KE" || currentCountry === "Kenya") && (
                    <Alert className="bg-emerald-50/50 border-emerald-200/50 text-emerald-800 rounded-3xl mb-6 py-5 px-6 border-2">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                           <Info className="h-5 w-5 text-emerald-600" />
                         </div>
                         <div>
                            <AlertTitle className="text-sm font-bold uppercase tracking-wide text-emerald-900 mb-1">Staging Hint</AlertTitle>
                            <AlertDescription className="text-[13px] font-medium leading-relaxed text-emerald-800/80">
                               Use phone <span className="bg-white px-2.5 py-1 rounded-xl border border-emerald-200 font-mono font-bold text-emerald-600 shadow-sm">0714325678</span> to bypass verification in this environment.
                            </AlertDescription>
                         </div>
                       </div>
                    </Alert>
                  )}
                  {isDev && (currentCountry === "NG" || currentCountry === "Nigeria") && (
                    <Alert className="bg-blue-50/50 border-blue-200/50 text-blue-800 rounded-3xl mb-6 py-5 px-6 border-2">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                           <ShieldCheck className="h-5 w-5 text-blue-600" />
                         </div>
                         <div>
                            <AlertTitle className="text-sm font-bold uppercase tracking-wide text-blue-900 mb-1">Staging Hint</AlertTitle>
                            <AlertDescription className="text-[13px] font-medium leading-relaxed text-blue-800/80">
                               Use any <span className="bg-white px-2.5 py-1 rounded-xl border border-blue-200 font-mono font-bold text-blue-600 shadow-sm">11-digit number</span> e.g. 12345678901 for testing.
                            </AlertDescription>
                         </div>
                       </div>
                    </Alert>
                  )}

                  {/* <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-slate-600 leading-snug">
                      {currentCountry === "NG" || currentCountry === "Nigeria"
                        ? "Dial *565*0# on any phone to retrieve your BVN. This is a one-time setup step."
                        : "Ensure this is the phone number registered with M-Pesa to avoid payment delays."}
                    </p>
                  </div> */}
                </div>

                {error && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-2xl border border-red-200">
                      <p className="text-sm font-bold leading-relaxed">
                        {error}
                      </p>
                    </div>
                    {attemptsRemaining !== null && (
                      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {attemptsRemaining}{" "}
                        {attemptsRemaining === 1 ? "attempt" : "attempts"}{" "}
                        remaining
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !val}
                  className="w-full h-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <DotLoader size="sm" color="white" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      Complete Setup{" "}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                          clearPersistence();
                          setStep("success");
                        } catch (err: any) {
                          toast.error("Bypass failed: " + err.message);
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
                      title="Development only — not available in production"
                    >
                      {/* DEV ONLY - Remove before production deployment */}
                      Skip for development
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-10 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Encrypted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    Secure
                  </span>
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
                Your payment account has been set up. Complete identity
                verification in Settings to unlock withdrawals.
              </p>

              <Button
                onClick={() =>
                  router.push(
                    user?.role === "CLIENT" ? "/client" : "/freelancer",
                  )
                }
                className="w-full h-14 sm:h-16 bg-slate-900 text-white hover:bg-emerald-600 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl active:scale-[0.98] group"
              >
                <span className="flex items-center gap-2 text-white">
                  Continue to Dashboard{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Identity verification is mandatory for financial compliance
        </p>
      </div>
    </div>
  );
}
