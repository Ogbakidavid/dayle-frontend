"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { ArrowRight, Loader2, Shield, User } from "lucide-react";
import Link from "next/link";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = searchParams.get("returnTo");
  const role = searchParams.get("role");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.updateProfile({ name: name.trim() });
      await refreshUser();

      // Redirect to role selection or dashboard
      if (role) {
        router.push(
          returnTo || (role === "CLIENT" ? "/client" : "/freelancer"),
        );
      } else {
        router.push("/onboarding/role");
      }
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 selection:bg-emerald-500/30 font-[Poppins,sans-serif]">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-4 mb-12 justify-center group"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-emerald-500/20 text-black">
            <Shield className="w-7 h-7 stroke-[3px]" />
          </div>
          <span className="font-black tracking-tighter text-white text-3xl uppercase">
            Dayle
          </span>
        </Link>

        <div className="bg-muted border border-white/10 rounded-3xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-3">
              Complete Your Profile
            </h2>
            <p className="text-white/60 text-sm font-bold uppercase tracking-wide">
              Please enter your full name to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-black uppercase tracking-wide text-white ml-1"
              >
                Full Name
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  autoFocus
                  className="bg-muted! border-white/10 h-14 rounded-2xl px-6 focus:border-emerald-500/50 focus:bg-white/8! focus:ring-0 transition-all text-white! text-lg placeholder:text-gray-400"
                />
                <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
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
              className="w-full h-14 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-wide transition-all shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
