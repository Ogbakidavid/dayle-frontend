"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Loader2, User } from "lucide-react";
import { useUser } from "@/lib/store/user-context";
import { api } from "@/lib/api-client";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // Redirect logic
  React.useEffect(() => {
    const checkAndRedirect = async () => {
      if (user?.name && user.name.trim() !== "") {
        // If user already has a name, check if we need to set role
        let currentRole = user.role;

        // If no role set but we have a param, try to set it
        if ((!currentRole || currentRole === "NONE") && roleParam) {
          try {
            await api.auth.updateProfile({ role: roleParam });
            await refreshUser();
            currentRole = roleParam as any;
          } catch (e) {
            console.error("Failed to set role from param", e);
          }
        }

        // Redirect based on final role state
        if (currentRole && currentRole !== "NONE") {
          router.push(currentRole === "CLIENT" ? "/client" : "/freelancer");
        } else {
          router.push("/onboarding/role");
        }
      }
    };

    checkAndRedirect();
  }, [user, router, roleParam, refreshUser]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!name || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    setLoading(true);
    try {
      const updates: any = { name: name.trim() };
      if (roleParam) {
        updates.role = roleParam;
      }

      await api.auth.updateProfile(updates);
      await refreshUser();

      // Determine where to go next
      const targetRole = roleParam || user?.role;

      if (targetRole && targetRole !== "NONE") {
        router.push(targetRole === "CLIENT" ? "/client" : "/freelancer");
      } else {
        router.push("/onboarding/role");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-['Poppins',sans-serif]">
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-8 h-8 text-black stroke-[3px]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Complete Your <span className="text-emerald-500">Profile.</span>
          </h1>
          <p className="text-white text-lg font-bold max-w-md mx-auto uppercase tracking-tight">
            Tell us your name to personalize your experience.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
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
                className="bg-muted! border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:bg-white/8! focus:ring-0 transition-all text-white text-lg placeholder:text-white/50"
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
            className="w-full h-16 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-wide transition-all shadow-xl active:scale-[0.98]"
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

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex gap-8 text-[11px] font-black text-white uppercase tracking-[0.3em]">
            <span>Secure Profile</span>
            <span>•</span>
            <span>Role Selection Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
