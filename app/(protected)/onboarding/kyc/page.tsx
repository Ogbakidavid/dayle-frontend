"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { UserRole } from "@/lib/api-client";
import { ScanFace, AlertCircle } from "lucide-react";
import DiditVerificationBtn from "@/components/kyc/DiditVerificationBtn";

function KYCPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const { user, refreshUser } = useUser();

  const handleSuccess = async () => {
    // Refresh user state so the frontend knows that KYC is complete
    const freshUser = await refreshUser();
    const currentUserRole = roleParam || freshUser?.role || user?.role;

    if (
      currentUserRole &&
      currentUserRole.toString().toUpperCase() === UserRole.CLIENT
    ) {
      router.push("/client");
    } else {
      router.push("/freelancer");
    }
  };

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col font-['Inter',sans-serif] selection:bg-emerald-500/30 overflow-hidden">
      {/* Top Navigation Bar - Mobile App Style */}
      <header className="fixed top-0 inset-x-0 h-16 bg-black z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 w-full">
          <div className="w-10 h-10"></div>
          <div className="flex-1 text-center font-semibold text-[17px] tracking-tight text-white">
            Identity verification
          </div>
          <div className="w-10 h-10 flex items-center justify-center font-mono text-xs text-white/40"></div>
        </div>
      </header>

      {/* Main Content Area - Full Bleed */}
      <main className="flex-1 overflow-y-auto w-full pt-20 pb-32 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-6 py-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-20"></div>
            <ScanFace className="w-12 h-12 text-emerald-500" />
          </div>

          <div className="space-y-4 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              Verify your identity
            </h1>
            <p className="text-sm text-zinc-400">
              We&apos;ve partnered with Didit to provide bank-grade identity
              verification. Unlock full access to funding and withdrawals in
              under 60 seconds.
            </p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                1
              </div>
              <p className="font-semibold tracking-tight">
                Have your ID card handy
              </p>
            </div>
            <div className="w-px h-6 bg-white/10 ml-4"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm">
                2
              </div>
              <p className="font-semibold tracking-tight">
                Take a quick selfie
              </p>
            </div>
          </div>

          <DiditVerificationBtn
            onSuccess={handleSuccess}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[15px] rounded-3xl transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          />

          <div className="flex justify-center flex-col items-center gap-2 mt-8 text-zinc-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[11px] font-medium tracking-tight">
                Secured by AES-256. Bank-grade SOC2 Type II.
              </p>
            </div>
            <p className="text-[10px] text-zinc-700">
              Powered by the Didit protocol
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function KYCPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <DotLoader size="lg" />
        </div>
      }
    >
      <KYCPageContent />
    </React.Suspense>
  );
}
