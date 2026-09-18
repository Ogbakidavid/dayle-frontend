"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  User,
  ArrowLeft,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row selection:bg-emerald-500/30 font-['Poppins',sans-serif]">
      {/* LEFT SIDE: Branding & Features */}
      <div className="hidden md:flex md:w-[45%] bg-slate-50 relative justify-center p-20 border-r border-slate-200 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>

        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="flex items-center gap-4 mb-20 group">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-emerald-500/20 text-black">
              <Shield className="w-7 h-7 stroke-[3px]" />
            </div>
            <span className="font-bold tracking-tighter text-slate-900 text-3xl">
              Dayle
            </span>
          </Link>

          <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-[0.95] tracking-tighter mb-12">
            Recover <br />
            <span className="text-emerald-600 italic">access.</span>
          </h1>

          <div className="space-y-8">
            {[
              {
                title: "Account Security",
                text: "We verify your identity before resetting access.",
              },
              {
                title: "Instant Recovery",
                text: "Receive a secure reset link to your email instantly.",
              },
              {
                title: "24/7 Support",
                text: "Contact our dedicated support team if you need help.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="mt-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm tracking-wide mb-1">
                    {item.title}
                  </h4>
                  <p className="text-slate-600 font-bold text-lg leading-snug">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-white relative overflow-hidden">
        {/* Subtle Form Background Detail */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/2 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-[440px] relative z-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-8 font-bold tracking-wide text-xs transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to login
          </Link>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
              Forgot password
            </h2>
            <p className="text-slate-600 mt-4 text-sm font-bold tracking-wide leading-relaxed">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-bold tracking-wide text-slate-700 ml-1"
                >
                  Email address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    className="bg-slate-50! border-slate-200 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:bg-white! focus:ring-0 transition-all text-slate-900! text-lg placeholder:text-slate-600"
                  />
                  <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-400 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-bold tracking-wide leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold text-base transition-all shadow-xl active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <DotLoader size="sm" />
                    <span>Sending Link...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Link sent!
                </h3>
                <p className="text-slate-600 text-sm font-bold tracking-wide mt-2 leading-relaxed">
                  We&apos;ve sent a password reset link to your email address.
                  Please check your inbox.
                </p>
              </div>
              <Button
                onClick={() => router.push("/reset-password")} // Simulate clicking logic for demo
                className="w-full h-14 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                Open email app
              </Button>

              {/* For Demo purposes, a direct link */}
              <div className="pt-4 border-t border-white/5">
                <Link
                  href="/reset-password"
                  className="text-emerald-600 text-xs font-bold tracking-wide hover:underline"
                >
                  (Demo: go to reset password page)
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
