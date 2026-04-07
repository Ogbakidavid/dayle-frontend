"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Smartphone,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function IdentityOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
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
    fullName: user?.name || "",
  });

  const { val, confirmPhoneVal, fullName } = persistedData;

  const setVal = (v: string) => setPersistedData(p => ({ ...p, val: v }));
  const setConfirmPhoneVal = (v: string) => setPersistedData(p => ({ ...p, confirmPhoneVal: v }));
  const setFullName = (v: string) => setPersistedData(p => ({ ...p, fullName: v }));

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
  const currentCountry = selectedCountry || user?.country;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user?.paymentAccountReady && step !== "success") {
      if (returnTo) {
        router.push(returnTo);
        return;
      }
      router.push(user.role === "CLIENT" ? "/client" : "/freelancer");
    }
  }, [user, authLoading, router, step, otpStep, returnTo]);

  const handleCountrySelect = async (c: string) => {
    setLoading(true);
    setLoadingMessage("Setting up your payment profile...");
    try {
      await api.auth.updateProfile({ country: c });
      await api.onboarding.initialize();
      await refreshUser();
      setSelectedCountry(c);
      setStep("form");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to initialize account. Please try again.");
    } finally {
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
    setLoadingMessage("Verifying your identity...");
    try {
      const c = selectedCountry || user?.country;
      const payload: any = { 
        country: c,
        fullName: fullName 
      };
      if (c === "Nigeria" || c === "NG") {
        payload.bvn = val;
      } else {
        payload.phoneNumber = `+254${val}`;
      }

      const res = await api.onboarding.submitIdentity(payload);

      if (res.requiresOtp) {
        setOtpMethods(res.methods);
        if (currentCountry === "Nigeria" || currentCountry === "NG") {
          setOtpStep("phone_confirm");
        } else {
          setOtpStep("method");
        }
        return;
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
      setLoadingMessage("Triggering verification code...");
      await api.onboarding.selectKycMethod("sendotp");
      setOtpStep("otp");
      if (isDev) setOtp("123456");
    } catch (err: any) {
      toast.error(err.message || "Confirmation failed. Please try again.");
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
      toast.error(err.message || "Failed to trigger verification.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setLoadingMessage("Verifying code...");
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
    const value = e.target.value.replace(/\D/g, "");
    if (currentCountry === "Nigeria" || currentCountry === "NG") {
      if (value.length <= 11) setVal(value);
    } else {
      if (value.length <= 9) setVal(value);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <DotLoader />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 xs:p-6 selection:bg-emerald-500/30 font-primary">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-sm xs:max-w-full sm:max-w-xl lg:max-w-5xl mx-auto">
        <div className="flex lg:hidden justify-center mb-8 xs:mb-10">
          <DayleLogo className="w-12 h-12 text-emerald-500" />
        </div>

        <div className="bg-white border border-slate-200 lg:border-none p-5 xs:p-8 sm:p-12 lg:p-0 rounded-[32px] sm:rounded-[40px] lg:rounded-none shadow-sm lg:shadow-none relative overflow-hidden lg:overflow-visible lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          {/* Suble glow inside card (mobile only) */}
          <div className="lg:hidden absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>

          {/* Desktop Left Side - Info */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-start text-left space-y-8">
            <DayleLogo className="w-16 h-16 text-emerald-500 mb-4" />
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Identity &<br />
                <span className="text-emerald-600">Settlement.</span>
              </h2>
              <p className="text-slate-600 font-bold text-lg leading-relaxed max-w-sm">
                Complete your identity set up to unlock secure project vaults and instant withdrawals.
              </p>
            </div>
            
            <div className="space-y-4 pt-8 border-t border-slate-100 w-full">
              {[
                { icon: ShieldCheck, text: "Bank-grade encryption" },
                { icon: CheckCircle2, text: "Instant account linking" },
                { icon: Info, text: "Compliance ensured" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-500">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[13px] font-bold uppercase tracking-wider">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form Container */}
          <div className="lg:col-span-7 bg-white lg:border lg:border-slate-200 lg:p-12 lg:rounded-[48px] lg:shadow-2xl lg:shadow-emerald-500/5 relative">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[32px] sm:rounded-[48px]"
                >
                  <div className="animate-bounce">
                    <DayleLogo className="w-16 h-16 text-emerald-500" />
                  </div>
                  {loadingMessage && (
                    <p className="mt-6 text-slate-600 font-bold text-sm tracking-wide">
                      {loadingMessage}
                    </p>
                  )}
                </motion.div>
              )}

              {step === "country" ? (
                <motion.div key="country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8 xs:mb-10 text-center text-slate-900">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-3 sm:mb-4 text-balance">
                      Select your <span className="text-emerald-600">country.</span>
                    </h1>
                    <p className="text-slate-600 text-sm xs:text-base font-bold leading-relaxed px-2 text-balance">
                      We need this to ensure we use the correct payment rails for your region.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleCountrySelect("NG")}
                      disabled={loading}
                      className="h-16 xs:h-20 rounded-2xl border-slate-200 flex items-center justify-between px-6 xs:px-8 hover:border-emerald-500/50 hover:bg-slate-50 group transition-all"
                    >
                      <div className="flex items-center gap-3 xs:gap-4">
                        <span className="text-2xl xs:text-3xl">🇳🇬</span>
                        <span className="text-base xs:text-lg font-bold text-slate-900">Nigeria</span>
                      </div>
                      <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleCountrySelect("KE")}
                      disabled={loading}
                      className="h-16 xs:h-20 rounded-2xl border-slate-200 flex items-center justify-between px-6 xs:px-8 hover:border-emerald-500/50 hover:bg-slate-50 group transition-all"
                    >
                      <div className="flex items-center gap-3 xs:gap-4">
                        <span className="text-2xl xs:text-3xl">🇰🇪</span>
                        <span className="text-base xs:text-lg font-bold text-slate-900">Kenya</span>
                      </div>
                      <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </Button>
                  </div>
                </motion.div>
              ) : step === "form" && otpStep === "phone_confirm" ? (
                <motion.div key="phone_confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="mb-8">
                    <div className="w-14 h-14 xs:w-16 xs:h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Smartphone className="w-7 h-7 xs:w-8 xs:h-8" />
                    </div>
                    <h1 className="text-xl xs:text-2xl font-bold text-slate-900 mb-3">Confirm BVN Phone.</h1>
                    <p className="text-slate-600 text-sm xs:text-base font-medium">
                      Provide the 11-digit phone number linked to your <span className="font-bold text-slate-800">BVN registry</span>.
                    </p>
                  </div>

                  <form onSubmit={handlePhoneConfirm} className="space-y-6">
                    <div className="relative group">
                      <input
                        type="text"
                        value={confirmPhoneVal}
                        onChange={(e) => setConfirmPhoneVal(e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="Enter BVN phone number"
                        className="w-full h-12 xs:h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center tracking-[0.2em] text-lg"
                        required
                      />

                    </div>

                    <div className="p-3 xs:p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] xs:text-xs text-amber-700 font-bold leading-relaxed">
                        {isDev 
                          ? "STAGING: Use 08032043843 to proceed with testing." 
                          : "IMPORTANT: This must be the phone number used during your BVN registration."}
                      </p>
                    </div>

                    <Button type="submit" disabled={loading || confirmPhoneVal.length < 10} className="w-full h-12 xs:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:bg-slate-200">
                      {loading ? "Confirming..." : "Link Phone & Send Code"}
                    </Button>


                  </form>
                </motion.div>
              ) : step === "form" && otpStep === "method" ? (
                <motion.div key="method" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="mb-8">
                    <div className="w-14 h-14 xs:w-16 xs:h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-7 h-7 xs:w-8 xs:h-8" />
                    </div>
                    <h1 className="text-xl xs:text-2xl font-bold text-slate-900 mb-3">Verification Method.</h1>
                    <p className="text-slate-600 text-sm xs:text-base font-medium">
                      Choose how you'd like to receive your verification code.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3 xs:gap-4 mb-8">
                    {otpMethods.map((m: any) => (
                      <Button
                        key={m.method}
                        variant="outline"
                        onClick={() => handleSelectMethod(m.method)}
                        disabled={loading}
                        className="min-h-[80px] xs:min-h-[100px] h-auto py-4 xs:py-6 rounded-[24px] border-slate-200 flex items-center justify-between px-6 xs:px-8 hover:border-emerald-500/50 hover:bg-slate-50 group transition-all whitespace-normal"
                      >
                        <div className="flex flex-col items-start text-left flex-1 pr-3 xs:pr-4 min-w-0">
                          <span className="text-sm xs:text-base font-bold text-slate-900 uppercase tracking-tight leading-tight">
                            {m.method === 'sendotp' ? 'SMS Code' : 'Recognition'}
                          </span>
                          <span className="text-[10px] xs:text-xs text-slate-500 font-medium leading-tight mt-1">
                            {m.hint || 'Standard rates apply'}
                          </span>
                        </div>
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-slate-100 rounded-xl xs:rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                          <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
                        </div>
                      </Button>
                    ))}
                  </div>

                  <button type="button" onClick={() => setOtpStep("none")} className="text-slate-400 font-bold uppercase tracking-widest text-[9px] xs:text-[10px] hover:text-slate-600 transition-colors">
                    Go back to initial input
                  </button>
                </motion.div>
              ) : step === "form" && otpStep === "otp" ? (
                <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="mb-8">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4">
                      Enter <span className="text-emerald-600">code.</span>
                    </h1>
                    <p className="text-slate-600 text-sm xs:text-base font-bold leading-relaxed px-4">
                      We've sent a verification code via {selectedMethod}.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-700 block text-center uppercase tracking-widest">6-Digit Code</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000 000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        className="bg-slate-50! border-slate-200 h-14 xs:h-16 sm:h-20 rounded-2xl sm:rounded-3xl focus:border-emerald-500 text-slate-900 text-2xl xs:text-3xl sm:text-4xl font-bold tracking-[0.4em] text-center"
                      />
                      <Alert className="mt-4 p-4 xs:p-5 bg-amber-50/50 border-amber-200/50 rounded-2xl border-2">
                        <div className="flex items-center gap-3 xs:gap-4 text-left">
                          <div className="w-8 h-8 xs:w-10 xs:h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4 w-4 xs:h-5 xs:w-5 text-amber-600" />
                          </div>
                          <div>
                            <AlertTitle className="text-[10px] xs:text-xs font-bold text-amber-900 uppercase tracking-widest mb-0.5">Staging Mode</AlertTitle>
                            <AlertDescription className="text-[10px] xs:text-xs text-amber-800 font-medium">Use <span className="text-emerald-600 font-bold">123456</span> to verify</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    </div>

                    <Button type="submit" disabled={loading || otp.length < 4} className="w-full h-12 xs:h-14 bg-slate-900 text-white hover:bg-emerald-600 rounded-2xl font-bold text-base transition-all">
                      {loading ? "Verifying..." : "Verify & Complete Setup"}
                    </Button>

                    <button type="button" onClick={() => setOtpStep("method")} className="text-[10px] xs:text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest">
                      Didn't get a code? Resend
                    </button>
                  </form>
                </motion.div>
              ) : step === "form" ? (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8 xs:mb-10 text-center">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3 sm:mb-4 text-balance">
                      One last <span className="text-emerald-600">step.</span>
                    </h1>
                    <p className="text-slate-600 text-sm xs:text-base font-bold leading-relaxed px-2 text-balance">
                      {currentCountry === "NG" || currentCountry === "Nigeria" ? "To set up your payment account, we need your BVN." : "To receive payments, we need your M-Pesa phone number."}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 xs:space-y-8">
                    <div className="space-y-4 xs:space-y-6">
                      <div className="space-y-2 xs:space-y-3">
                        <Label className="text-xs xs:text-sm font-bold text-slate-700 block text-center uppercase tracking-wider">Legal Full Name</Label>
                        <Input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="bg-slate-50! border-slate-200 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl text-slate-900 text-sm xs:text-base font-bold px-4 xs:px-6 text-center"
                        />
                      </div>

                      <div className="space-y-2 xs:space-y-3">
                        <Label className="text-xs xs:text-sm font-bold text-slate-700 block text-center uppercase tracking-wider">
                          {currentCountry === "NG" || currentCountry === "Nigeria" ? "BVN Number" : "M-Pesa Phone"}
                        </Label>
                        <div className="relative group">
                          {(currentCountry === "KE" || currentCountry === "Kenya") && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 font-bold text-base xs:text-lg z-10">+254</div>
                          )}
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder={currentCountry === "NG" || currentCountry === "Nigeria" ? "11 digits" : "9 digits"}
                            value={val}
                            onChange={handleInputChange}
                            required
                            className={`bg-slate-50! border-slate-200 h-12 xs:h-14 sm:h-16 rounded-xl sm:rounded-2xl text-slate-900 text-sm xs:text-base font-mono tracking-widest text-center ${currentCountry === "KE" || currentCountry === "Kenya" ? "pl-16 xs:pl-20" : "px-4"}`}
                          />
                        </div>
                      </div>

                      {isDev && (
                        <div className="w-full flex justify-center">
                          <div className="w-full p-4 xs:p-5 bg-emerald-50/40 border border-emerald-200/60 rounded-[24px] flex flex-col items-center justify-center gap-2 group transition-all duration-300 hover:bg-emerald-50/60">
                            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-emerald-100/50 rounded-full border border-emerald-200/40">
                              <Info className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Staging Mode</span>
                            </div>
                            <p className="text-[11px] xs:text-[12px] font-bold text-slate-600 text-center leading-relaxed text-balance">
                              Use <span className="text-emerald-600">{currentCountry === "KE" || currentCountry === "Kenya" ? "0714325678" : "any 11 digits"}</span> to complete setup
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && <div className="text-center p-3 sm:p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 text-xs font-bold">{error}</div>}

                    <div className="flex flex-col gap-4 xs:gap-6">
                      <Button type="submit" disabled={loading || !val} className="w-full h-12 xs:h-14 sm:h-16 bg-slate-900 text-white rounded-xl xs:rounded-2xl font-bold text-base transition-all shadow-xl">
                        {loading ? "Processing..." : "Complete Setup"}
                      </Button>
                      <button type="button" onClick={() => router.push(user?.role === "CLIENT" ? "/client" : "/freelancer")} className="text-[10px] xs:text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ArrowLeft className="w-3 h-3" /> Skip for now
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                  <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 xs:w-24 xs:h-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm relative">
                      <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                      <CheckCircle2 className="w-10 h-10 xs:w-12 xs:h-12 text-emerald-600" />
                    </div>
                  </div>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">Account <span className="text-emerald-600">ready.</span></h1>
                  <p className="text-slate-600 text-sm xs:text-base font-bold leading-relaxed mb-8">Your payment account is set up. You can now use the platform.</p>
                  <Button onClick={() => router.push(returnTo || (user?.role === "CLIENT" ? "/client" : "/freelancer"))} className="w-full h-12 xs:h-14 sm:h-16 bg-slate-900 text-white rounded-xl xs:rounded-2xl font-bold transition-all shadow-xl">
                    Continue to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-8 text-center text-[9px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4">
          Identity verification is mandatory for financial compliance
        </p>
      </div>
    </div>
  );
}
