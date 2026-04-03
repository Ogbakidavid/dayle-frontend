"use client";

import { useUser } from "@/lib/store/user-context";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { KycStatus } from "@/lib/domain/enums";

export function KYCAlert() {
  const { user, loading } = useUser();

  // Don't show if loading or if user is already approved
  if (loading || !user || user.kycStatus === KycStatus.VERIFIED) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-xl border border-amber-200 bg-amber-50/50 p-4 md:p-6 overflow-hidden relative"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between relative z-10">
        <div className="flex gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Action required: Verify your identity
              </h3>
              <span className="w-fit inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                {user.kycStatus === KycStatus.REJECTED
                  ? "Verification failed"
                  : "Pending verification"}
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              Submit your BVN/Phone (Tier 1) to fund projects. Complete full 
              identity verification (Tier 2) to unlock fund releases and 
              withdrawals.
            </p>
          </div>
        </div>

        <Link href={`/onboarding/kyc?role=${user.role}`}>
          <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all shadow-lg shadow-amber-500/20">
            Complete KYC
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
