"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Loader2, CheckCircle2, User } from "lucide-react";
import { api, UserRole } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login: contextLogin, refreshUser } = useUser();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const { refreshUser } = useUser(); // Unused in original, but imported

  const {
    login: privyLogin,
    ready,
    authenticated,
    user: privyUser,
    getAccessToken,
  } = usePrivy();

  async function handleSocialLoginSuccess() {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      setLoading(true);
      await api.auth.socialLogin({ accessToken });
      const userData = await refreshUser();

      // Skip complete-profile and use social name if backend name is missing
      if (!userData?.name || userData.name.trim() === "") {
        const socialName =
          privyUser?.google?.name || privyUser?.github?.username || "";
        if (socialName) {
          await api.auth.updateProfile({ name: socialName });
          await refreshUser();
        }
      }

      const updatedUser = await refreshUser();

      // Check if user needs to select role
      if (!updatedUser.role || updatedUser.role === "NONE") {
        router.push("/onboarding/role");
        return;
      }

      // User has name (or social default) and role, redirect to dashboard or returnTo
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push(updatedUser.role === "CLIENT" ? "/client" : "/freelancer");
      }
    } catch (err) {
      console.error(err);
      setError("Social login failed. Please try again.");
      setLoading(false);
    }
  }

  // Temporarily triggering handleSocialLoginSuccess when authenticated via Privy.
  // In a real flow, better to use the onSuccess callback of login() or a specialized hook.
  // But usePrivy's login callback options are cleaner.
  // Re-implementing login call below to include { onComplete }.

  // Actually, overriding `login` usage in buttons to include { onComplete } is better than useEffect
  // but button click handler above uses purely `login({...})`.
  // Let's redefine `login` wrapper or just use `useEffect`.
  // Using useEffect on `authenticated` state might double-trigger if not careful,
  // but `login` with `onComplete` is best practice.

  // Updating buttons to use handlePrivyLogin wrapper.
  const handlePrivyLogin = async (provider: any) => {
    try {
      // The login method accepts LoginModalOptions. To preserve the "button-like" feel
      // we can restrict the modal to only show the chosen provider.
      await privyLogin({ loginMethods: [provider] });
    } catch (e) {
      console.error(e);
    }
  };

  // Use effect to watch for authentication state change and trigger backend sync
  useEffect(() => {
    if (ready && authenticated && privyUser) {
      handleSocialLoginSuccess();
    }
  }, [ready, authenticated, privyUser]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // First, check if user has 2FA enabled
      const twoFAStatus = await api.security.check2FAOnLogin(email, password);

      if (twoFAStatus.requires2FA) {
        // Store pending credentials and redirect to 2FA page
        api.auth.setPending2FA(email, password);
        router.push(
          returnTo
            ? `/verify-2fa?returnTo=${encodeURIComponent(returnTo)}`
            : "/verify-2fa",
        );
        return;
      }

      // No 2FA required, proceed with login
      const user = await contextLogin(email, password);

      if (returnTo) {
        router.push(returnTo);
        return;
      }

      if (user.role === UserRole.CLIENT) router.push("/client");
      else if (user.role === UserRole.FREELANCER) router.push("/freelancer");
      else router.push("/onboarding/role");
    } catch (err: any) {
      setError("Invalid email or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row selection:bg-emerald-500/30 font-[Poppins,sans-serif]">
      {/* LEFT SIDE: Branding & Features (Visual Anchor) */}
      <div className="hidden md:flex md:w-[45%] bg-[#080808] relative justify-center p-20 border-r border-white/5 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size:[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>

        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="flex items-center gap-4 mb-20 group">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-emerald-500/20 text-black">
              <Shield className="w-7 h-7 stroke-[3px]" />
            </div>
            <span className="font-black tracking-tighter text-white text-3xl uppercase">
              Dayle
            </span>
          </Link>

          <h1 className="text-6xl lg:text-7xl font-black text-white leading-[0.95] uppercase tracking-tighter mb-12">
            Secure <br />
            <span className="text-emerald-500 italic">Payments.</span>
          </h1>

          <div className="space-y-8">
            {[
              {
                title: "Capital Security",
                text: "Funds are held in isolated, insured vaults.",
              },
              {
                title: "Automated Payouts",
                text: "Milestone-based fund release upon completion.",
              },
              {
                title: "Verified Solvency",
                text: "Verified proof-of-funds for every project.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">
                    {item.title}
                  </h4>
                  <p className="text-white font-bold text-lg leading-snug">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form (The Action) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-[#050505] relative overflow-hidden">
        {/* Subtle Form Background Detail */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/2 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-[440px] relative z-10">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">
              Sign In
            </h2>
            <p className="text-white mt-4 text-sm font-bold uppercase tracking-wide leading-relaxed">
              Access your secure financial workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-sm font-black uppercase tracking-wide text-white ml-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="bg-muted! border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:bg-white/5! focus:ring-0 transition-all text-white text-lg placeholder:text-white/50 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-black uppercase tracking-wide text-white"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-wide transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="bg-muted! border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:bg-white/8! focus:ring-0 transition-all text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-bold uppercase tracking-wide leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-wide transition-all shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#050505] px-2 text-white/30 font-black tracking-[0.2em]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrivyLogin("google")}
                disabled={!ready || authenticated}
                className="h-14 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all rounded-2xl group px-0"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-white/60 font-black uppercase text-[10px] tracking-widest group-hover:text-white transition-colors">
                  Google
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handlePrivyLogin("github")}
                disabled={!ready || authenticated}
                className="h-14 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all rounded-2xl group px-0"
              >
                <svg
                  className="w-5 h-5 mr-2 fill-white/60 group-hover:fill-white transition-colors group-hover:scale-110"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-white/60 font-black uppercase text-[10px] tracking-widest group-hover:text-white transition-colors">
                  GitHub
                </span>
              </Button>
            </div>
          </form>

          <p className="mt-12 text-center text-white text-sm font-bold uppercase tracking-wide">
            Don't have an account?{" "}
            <Link
              href={
                returnTo
                  ? `/onboarding/role?returnTo=${encodeURIComponent(returnTo)}`
                  : "/onboarding/role"
              }
              className="text-white hover:text-emerald-500 font-black transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-emerald-500/50"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
