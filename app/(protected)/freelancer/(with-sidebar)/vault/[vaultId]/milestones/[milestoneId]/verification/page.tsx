"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, ShieldCheck, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function FreelancerVerificationPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 space-y-10">
        <header className="pt-8">
          <Link
            href={`/freelancer/vault/${vaultId}`}
            className="inline-flex items-center text-[10px] text-white/40 hover:text-white transition-all mb-10 font-black uppercase tracking-[0.3em] bg-white/2 border border-white/5 py-3 px-6 rounded-2xl group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Vault Origin
          </Link>
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/10 animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                Verification Report
              </h1>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
                Protocol Success Confirmation
              </p>
            </div>
          </div>
        </header>

        <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-20" />
          <CardHeader className="border-b border-white/5 pb-8 p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  Milestone Validated
                </CardTitle>
                <CardDescription className="text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] mt-3 italic">
                  Your work has passed all high-integrity verification checks
                </CardDescription>
              </div>
              <div className="text-left md:text-right text-[10px] text-white/30 font-black uppercase tracking-[0.3em] italic bg-white/2 p-4 rounded-2xl border border-white/5">
                <p className="mb-1">Authenticated on</p>
                <p className="text-white font-mono tracking-normal">
                  Oct 12, 2025 · 14:30 UTC
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Checks Passed
                </h3>
                <div className="space-y-4">
                  {[
                    "Code Quality Analysis",
                    "Security Vulnerability Scan",
                    "Unit Tests Passing",
                    "deliverables.zip Integrity Check",
                  ].map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/5 group/check hover:border-emerald-500/20 transition-all shadow-inner"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 group-hover/check:scale-110 transition-transform" />
                      <span className="text-white/70 text-xs font-black uppercase tracking-widest italic">
                        {check}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
                  Artifacts Issued
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-5 px-6 border-white/5 bg-white/2 hover:bg-emerald-500/5 hover:border-emerald-500/20 text-white/60 hover:text-white rounded-2xl transition-all shadow-xl group/btn"
                  >
                    <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <Download className="w-5 h-5 text-emerald-500 group-hover/btn:-translate-y-1 transition-transform" />
                      Full Report PDF
                    </span>
                    <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                      2.4 MB
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-5 px-6 border-white/5 bg-white/2 hover:bg-emerald-500/5 hover:border-emerald-500/20 text-white/60 hover:text-white rounded-2xl transition-all shadow-xl group/btn"
                  >
                    <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 group-hover/btn:rotate-12 transition-transform" />
                      Audit Certificate
                    </span>
                    <span className="text-[10px] text-white/20 font-mono tracking-widest uppercase">
                      V-PR-24-91
                    </span>
                  </Button>
                </div>
                <div className="pt-6">
                  <p className="p-5 rounded-2xl bg-white/1 border border-white/5 text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed italic">
                    These artifacts are cryptographically signed by Dayle
                    Verification Protocol. Unauthorized modification will
                    invalidate the signature.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
