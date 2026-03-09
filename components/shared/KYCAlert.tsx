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
      className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 md:p-6 overflow-hidden relative"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between relative z-10">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Action required: Verify your identity
              <span className="inline-flex items-center px-2 py-0.5 rounded  font-semibold bg-amber-500/20 text-amber-500  border border-amber-500/20">
                {user.kycStatus === KycStatus.REJECTED
                  ? "Verification failed"
                  : "Pending verification"}
              </span>
            </h3>

            <p className="text-amber-200/60 text-sm font-medium leading-relaxed max-w-2xl">
              To unlock full platform capabilities including withdrawals and
              vault creation, please complete your identity verification. This
              helps us ensure a secure environment for all users.
            </p>
          </div>
        </div>

        <Link href={`/onboarding/kyc?role=${user.role}`}>
          <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black font-semibold  transition-all shadow-lg shadow-amber-500/20">
            Complete KYC
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
