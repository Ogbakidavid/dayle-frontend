"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import {
  Upload,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Gavel,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EvidencePanel } from "@/components/shared/EvidencePanel";
import { cn } from "@/lib/utils";
import { getDisputeEligibility } from "@/lib/rules/disputes";
import {
  VaultStatus,
} from "@/lib/domain/enums";
import { getVaultDerivedLabel } from "@/lib/domain/enums";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;

  const [vault, setVault] = useState<any>(null);
  const [vaultsLoading, setVaultsLoading] = useState(true);

  useEffect(() => {
    async function loadVault() {
      try {
        setVaultsLoading(true);
        const data = await api.vaults.getById(vaultId);
        setVault(data);
      } catch (err) {
        console.error("Failed to load vault:", err);
        setVault(null);
      } finally {
        setVaultsLoading(false);
      }
    }
    if (vaultId) {
      loadVault();
    }
  }, [vaultId]);

  // Single submission for the vault
  const [evidence, setEvidence] = useState<any>(null);
  useEffect(() => {
    async function loadEvidence() {
      if (vault) {
        try {
          const data = await api.evidence.list({
            vaultId: vault.id,
          });
          setEvidence(data);
        } catch (err) {
          console.error("Evidence load failed:", err);
        }
      }
    }
    loadEvidence();
  }, [vault]);

  if (vaultsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/20 font-black uppercase tracking-[0.3em] font-['Poppins',sans-serif]">
        <div className="w-12 h-12 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin mb-6" />
        Initializing Vault Data
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 font-['Poppins',sans-serif]">
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center max-w-md shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
            Access Restricted
          </h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
            Vault not found or access denied. Please verify your credentials as
            the assigned freelancer.
          </p>
        </div>
        <Link href="/freelancer">
          <Button
            variant="outline"
            className="border-white/5 bg-white/2 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl transition-all"
          >
            Return to Workspace
          </Button>
        </Link>
      </div>
    );
  }

  const isEligibleForDispute = getDisputeEligibility(vault).eligible;

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-4 md:pt-8 bg-transparent">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-white/40 hover:text-white transition-all mb-6 md:mb-8 font-black uppercase tracking-[0.2em] bg-white/2 border border-white/5 py-2 px-4 rounded-xl cursor-pointer group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Workspace
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {vault.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-[0.2em] text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg"
                >
                  {getVaultDerivedLabel(vault.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 px-2 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                    Vault Signature:{" "}
                    <span className="text-white/60 font-mono tracking-normal ml-1">
                      {vaultId}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
              <p className="text-[9px] md:text-[11px] text-white/30 font-black uppercase tracking-[0.3em] mb-2 italic">
                SECURED CONTRACT VALUE
              </p>
              <p className="text-4xl md:text-6xl font-black uppercase text-white tracking-widest font-mono leading-none">
                ${vault.amount?.toLocaleString() || "0"}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-[10px] md:text-xs text-emerald-500/80 font-black uppercase tracking-widest italic">
                  ${(vault.paidAmount || 0).toLocaleString()} Capital
                  Distributed
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/2 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <CardHeader className="pb-8 border-b border-white/5">
                <CardTitle className="text-white font-black uppercase tracking-widest text-lg italic flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Project Deliverable
                </CardTitle>
                <CardDescription className="text-white/30 uppercase font-bold tracking-widest text-[10px] mt-2">
                  Submit your work for verification and payment release
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="group relative bg-white/2 border border-white/5 rounded-2xl p-6 hover:bg-white/4 hover:border-emerald-500/20 transition-all shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    <div className="flex items-start gap-5 min-w-0">
                      <div className="mt-1 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-white/40 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shadow-inner italic">
                        <FileText className="w-5 h-5 text-emerald-500/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate mb-4 italic">
                          {vault.description || "Project Scope"}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="uppercase tracking-[0.2em] text-[9px] font-black italic">
                              STATUS: {getVaultDerivedLabel(vault.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 shrink-0 pt-1">
                      {vault.status === VaultStatus.FUNDED ? (
                        <Link href={`/freelancer/vault/${vaultId}/submit`}>
                          <Button
                            size="sm"
                            className="bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-[0.15em] h-10 px-6 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs italic"
                          >
                            Deliver Work
                            <Upload className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="outline" className="opacity-50">
                          {getVaultDerivedLabel(vault.status)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Panel */}
            <div className="relative">
              <EvidencePanel vault={vault} evidence={evidence} />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* Verification Summary */}
            <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-base font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] bg-white/2 p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 font-black uppercase tracking-widest">
                      Escrow Status:
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          vault.status === VaultStatus.FUNDED
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                            : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                        )}
                      />
                      <span
                        className={cn(
                          "font-black uppercase tracking-widest italic",
                          vault.status === VaultStatus.FUNDED
                            ? "text-emerald-500"
                            : "text-amber-500",
                        )}
                      >
                        {getVaultDerivedLabel(vault.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            <Card
              className={cn(
                "border-white/5 bg-[#0D0D0E] shadow-2xl transition-all hover:border-amber-500/20",
                !isEligibleForDispute && "opacity-60",
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm italic">
                  <Gavel className="w-5 h-5 text-amber-500" />
                  Legal Escrow Support
                </CardTitle>
                <CardDescription className="font-bold uppercase tracking-widest text-[9px] mt-2 leading-relaxed italic">
                  {isEligibleForDispute
                    ? "Dispute eligibility confirmed. Open a formal case file if contract terms are breached."
                    : "No active disputes allowed. Case files are restricted to specific breach of contract reason codes."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-white/5 bg-white/2 hover:bg-white/5 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl transition-all shadow-lg active:scale-95"
                  disabled={!isEligibleForDispute}
                  asChild={isEligibleForDispute}
                >
                  {isEligibleForDispute ? (
                    <Link
                      href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    >
                      Initiate Case File
                    </Link>
                  ) : (
                    <Link href="/freelancer/disputes">Escrow Dashboard</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
