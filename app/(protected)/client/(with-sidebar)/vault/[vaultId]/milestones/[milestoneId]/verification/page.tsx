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

export default function ClientVerificationPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;

  return (
    <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <Link
            href={`/client/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Verification Report
            </h1>
          </div>
        </header>

        <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white font-bold uppercase tracking-wide">
                  Milestone Verified
                </CardTitle>
                <CardDescription className="text-emerald-500 font-black uppercase tracking-widest text-[10px] mt-1">
                  All requirements met successfully
                </CardDescription>
              </div>
              <div className="text-left sm:text-right text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <p className="opacity-50">Verified on</p>
                <p className="text-white font-mono mt-1">
                  Oct 12, 2025 · 14:30 UTC
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 italic">
                  Checks Passed
                </h3>
                <div className="space-y-3">
                  {[
                    "Code Quality Analysis",
                    "Security Vulnerability Scan",
                    "Unit Tests Passing",
                    "deliverables.zip Integrity Check",
                  ].map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-normal">
                        {check}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-4 italic">
                  Artifacts
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-3 px-4 border-white/5 bg-white/2 hover:bg-white/5 text-gray-400 hover:text-white transition-all font-['Poppins',sans-serif]"
                  >
                    <span className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest">
                      <Download className="w-4 h-4 text-emerald-500" />
                      Full Report PDF
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      2.4 MB
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-3 px-4 border-white/5 bg-white/2 hover:bg-white/5 text-gray-400 hover:text-white transition-all font-['Poppins',sans-serif]"
                  >
                    <span className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      Audit Certificate
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      V-CL-24-12
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
