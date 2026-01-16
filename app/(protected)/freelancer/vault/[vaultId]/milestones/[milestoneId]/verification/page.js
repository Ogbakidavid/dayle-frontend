"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function FreelancerVerificationPage() {
  const params = useParams();
  const { vaultId, milestoneId } = params;

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <Link
            href={`/freelancer/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Verification Report
            </h1>
          </div>
        </header>

        <Card className="bg-[#0D0D0E] border-white/5">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Milestone Verified</CardTitle>
                <CardDescription className="text-emerald-500 font-medium mt-1">
                  Your work has passed all verification checks
                </CardDescription>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>Verified on</p>
                <p className="text-white font-mono">Oct 12, 2025 · 14:30 UTC</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
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
                      className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-300 text-sm">{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Artifacts
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-3 border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Full Report PDF
                    </span>
                    <span className="text-xs text-slate-500">2.4 MB</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-3 border-white/10 bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Blockchain Proof
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      0x7f...3a9
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
