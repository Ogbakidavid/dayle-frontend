"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <section className="min-h-screen bg-[#050505] px-4 md:px-6 pt-32 pb-24 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold tracking-[0.28em] text-white/70">
              Support
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Get help with Dayle
          </h1>

          <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl font-bold tracking-tight">
            Support is available for account access, vault issues, payouts, and
            platform questions. We respond during business hours and prioritize
            active payment issues.
          </p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Email Support */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/2 p-6 md:p-8"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Email support
            </h3>

            <p className="mt-2 text-white/60 text-sm md:text-base leading-relaxed font-bold tracking-tight">
              For account issues, vault questions, or payout support, email our
              team.
            </p>

            <div className="mt-6">
              <a
                href="mailto:support@dayle.app"
                className="inline-flex items-center gap-2 text-sm font-bold  text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                support@dayle.app
              </a>
            </div>
          </motion.div>

          {/* Documentation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="rounded-3xl border border-white/10 bg-white/2 p-6 md:p-8"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
              <FileText className="w-5 h-5 text-white/70" />
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Documentation
            </h3>

            <p className="mt-2 text-white/60 text-sm md:text-base leading-relaxed font-bold tracking-tight">
              API and developer documentation will be available when the public
              API is released.
            </p>

            <div className="mt-6">
              <span className="text-sm font-bold tracking-[0.22em] text-slate-900">
                Coming soon
              </span>
            </div>
          </motion.div>
        </div>

        {/* Expectations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white/70" />
            </div>

            <div>
              <h4 className="text-white font-bold tracking-tight text-lg">
                Support expectations
              </h4>

              <p className="mt-2 text-white/60 text-sm md:text-base leading-relaxed font-bold tracking-tight">
                We prioritize issues related to active vaults and payments.
                Response times may vary based on volume and issue severity. We
                do not offer live chat at this time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back CTA */}
        <div className="mt-14">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-sm font-bold  text-white hover:bg-white/6"
            >
              ← Back to Dayle
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
