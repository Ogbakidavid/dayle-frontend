"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DotLoader } from "@/components/ui/dot-loader";
import { Shield, Users, Briefcase, ArrowRight } from "lucide-react";
import { api, UserRole } from "@/lib/api-client";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "@/lib/store/user-context";

export default function RoleSelectionPage() {
  const router = useRouter();
  const { authenticated, getAccessToken } = usePrivy();
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState<UserRole | null>(null);

  async function handleSelect(role: UserRole) {
    setLoading(role);

    try {
      if (authenticated) {
        // User is already authenticated (e.g. from Social Login), set role directly
        const token = await getAccessToken();
        if (token) {
          await api.onboarding.setRole(role);
          await refreshUser(token);
          router.push(role === UserRole.CLIENT ? "/client" : "/freelancer");
          return;
        }
      }

      // Default: Redirect to signup with selected role
      router.push(`/signup?role=${role}`);
    } catch (error) {
      console.error("Error setting role:", error);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-['Poppins',sans-serif]">
      {/* Background Grid Decoration */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-8 h-8 text-black stroke-[3px]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter">
            Identify your <span className="text-emerald-600">account.</span>
          </h1>
          <p className="text-slate-600 text-xl font-bold max-w-xl mx-auto tracking-tight">
            Choose how you will interact with the Dayle system to begin setup.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Option */}
          <div
            onClick={() => !loading && handleSelect(UserRole.CLIENT)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                !loading && handleSelect(UserRole.CLIENT);
              }
            }}
            className={`group relative p-10 rounded-[40px] border transition-all cursor-pointer overflow-hidden ${
              loading === UserRole.CLIENT
                ? "border-emerald-600 bg-emerald-50"
                : "border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-slate-100 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                I&apos;m a client
              </h3>

              <p className="text-slate-600 text-lg font-bold leading-relaxed mb-10 tracking-tight">
                I want to hire contractors, create secure payment projects, and
                release funds only after work is verified.
              </p>
              <Button
                variant="ghost"
                className="p-0 text-emerald-500 font-bold  text-sm hover:bg-transparent group-hover:translate-x-2 transition-transform"
              >
                {loading === UserRole.CLIENT ? (
                  <DotLoader size="sm" />
                ) : (
                  <span className="flex items-center gap-2">
                    Setup client account <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Freelancer Option */}
          <div
            onClick={() => !loading && handleSelect(UserRole.FREELANCER)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                !loading && handleSelect(UserRole.FREELANCER);
              }
            }}
            className={`group relative p-10 rounded-[40px] border transition-all cursor-pointer overflow-hidden ${
              loading === UserRole.FREELANCER
                ? "border-emerald-600 bg-emerald-50"
                : "border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-slate-100 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                <Briefcase className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                I&apos;m a contractor
              </h3>

              <p className="text-slate-600 text-lg font-bold leading-relaxed mb-10 tracking-tight">
                I want to work with verified clients and receive guaranteed,
                escrow-protected payouts for my projects.
              </p>
              <Button
                variant="ghost"
                className="p-0 text-emerald-500 font-bold  text-sm hover:bg-transparent group-hover:translate-x-2 transition-transform"
              >
                {loading === UserRole.FREELANCER ? (
                  <DotLoader size="sm" />
                ) : (
                  <span className="flex items-center gap-2">
                    Setup contractor account <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <div className="flex gap-8 text-[11px] font-bold text-slate-600 tracking-[0.2em]">
            <span>Secure selection</span>
            <span>•</span>
            <span>Identity verification next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
