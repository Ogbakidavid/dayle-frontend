"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { UserRole } from "@/lib/api-client";
import { ScanFace, AlertCircle, ChevronLeft } from "lucide-react";
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
    <div className="min-h-dvh bg-white text-slate-900 flex flex-col font-['Inter',sans-serif] selection:bg-emerald-500/30 overflow-hidden">
      {/* Top Navigation Bar - Mobile App Style */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white z-50 flex items-center justify-between px-6 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center font-semibold text-[17px] tracking-tight text-slate-900 mr-10">
            Identity verification
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Bleed */}
      <main className="flex-1 overflow-y-auto w-full pt-20 pb-32 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full px-6 py-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 relative border border-emerald-100 shadow-sm">
            <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-ping opacity-20"></div>
            <ScanFace className="w-12 h-12 text-emerald-600" />
          </div>

          <div className="space-y-4 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">
              Verify your identity
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              We&apos;ve partnered with Didit to provide bank-grade identity
              verification. Unlock full access to funding and withdrawals in
              under 60 seconds.
            </p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                1
              </div>
              <p className="font-semibold tracking-tight text-slate-900 ">
                Have your ID card handy
              </p>
            </div>
            <div className="w-px h-6 bg-slate-200 ml-4"></div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                2
              </div>
              <p className="font-semibold tracking-tight text-slate-900 ">
                Take a quick selfie
              </p>
            </div>
          </div>

          <DiditVerificationBtn
            onSuccess={handleSuccess}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] rounded-3xl transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/10 "
          />

          <div className="flex justify-center flex-col items-center gap-2 mt-8 text-slate-600">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[11px] font-bold tracking-[0.05em] uppercase ">
                Secured by AES-256. Bank-grade SOC2 Type II.
              </p>
            </div>
            <p className=" text-slate-300 font-medium uppercase st">
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <DotLoader size="lg" />
        </div>
      }
    >
      <KYCPageContent />
    </React.Suspense>
  );
}
