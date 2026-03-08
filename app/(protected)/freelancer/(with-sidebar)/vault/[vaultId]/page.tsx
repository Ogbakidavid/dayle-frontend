"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import {
  Upload,
  AlertCircle,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Gavel,
  ShieldCheck,
  ListChecks,
  Square,
  CheckSquare,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDisputeEligibility } from "@/lib/rules/disputes";
import { VaultStatus } from "@/lib/domain/enums";
import { getVaultDerivedLabel } from "@/lib/domain/enums";
import { AnimatePresence, motion } from "framer-motion";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;

  const [vault, setVault] = useState<any>(null);
  const [vaultsLoading, setVaultsLoading] = useState(true);
  const [expandedSubmissions, setExpandedSubmissions] = useState<string[]>([]);

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

  if (vaultsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-900 font-bold tracking-wide">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-6" />
        Initializing vault data
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 font-['Poppins',sans-serif]">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tighter mb-2">
            Access restricted
          </h2>
          <p className="text-xs text-slate-600 font-bold tracking-wide leading-relaxed">
            Vault not found or access denied. Please verify your credentials as
            the assigned freelancer.
          </p>
        </div>
        <Link href="/freelancer">
          <Button
            variant="outline"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] h-11 px-8 rounded-xl transition-all shadow-sm"
          >
            Return to workspace
          </Button>
        </Link>
      </div>
    );
  }

  const toggleSubmission = (id: string) => {
    setExpandedSubmissions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const isEligibleForDispute = getDisputeEligibility(vault).eligible;

  return (
    <div className="min-h-screen text-slate-600 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* SECTION A: HEADER */}
        <header className="pt-4 md:pt-8 bg-transparent">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 transition-all mb-6 md:mb-8 font-bold tracking-wide bg-white border border-slate-200 py-2 px-4 rounded-xl cursor-pointer group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Workspace
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 italic tracking-tighter leading-none">
                  {vault.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-100 tracking-wide text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm"
                >
                  {getVaultDerivedLabel(vault.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 font-bold tracking-wide">
                      Client
                    </p>
                    <p className="text-xs text-slate-900 font-bold">
                      {vault.clientName || "Unknown Client"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 font-bold tracking-wide">
                      Created
                    </p>
                    <p className="text-xs text-slate-900 font-bold">
                      {new Date(vault.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right p-6 rounded-2xl bg-white border border-slate-200 shadow-sm min-w-[240px]">
              <p className="text-[9px] md:text-[11px] text-slate-600 font-bold tracking-wide mb-1 italic">
                Secured contract value
              </p>
              <p className="text-4xl md:text-6xl font-bold text-slate-900 tracking-widest italic leading-none">
                {vault.formattedTotalAmount || vault.totalAmount}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-[10px] md:text-xs text-emerald-700 font-bold tracking-wide italic">
                  $
                  {vault.formattedPaidAmount ||
                    (vault.paidAmount || 0).toLocaleString()}{" "}
                  capital distributed
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN: SECTIONS B & C */}
          <div className="lg:col-span-2 space-y-8">
            {/* SECTION B: DELIVERABLES CHECKLIST */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-6 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <ListChecks className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold tracking-wide text-lg italic">
                      What was promised
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-bold tracking-wide text-[10px] mt-1">
                      The specific items you committed to deliver
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!vault.deliverables || vault.deliverables.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-slate-100 mx-auto" />
                    <p className="text-slate-600 font-bold tracking-widest text-[10px] uppercase">
                      No deliverables defined for this project
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {vault.deliverables.map((item: any, idx: number) => {
                      const submissionWithThis = vault.submissions?.find(
                        (s: any) =>
                          s.deliverableIds?.includes(item.id || item.title),
                      );

                      return (
                        <div
                          key={item.id || idx}
                          className="p-6 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {submissionWithThis ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-100 group-hover:text-slate-200" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="text-sm font-bold text-slate-900 italic">
                                {item.title}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                                  Description: {item.description}
                                </p>
                              )}
                              <div className="pt-2 flex items-center gap-2">
                                <span className="text-[9px] font-bold tracking-widest text-slate-600">
                                  Status:
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] tracking-wide border-none px-0",
                                    submissionWithThis
                                      ? "text-emerald-700"
                                      : "text-amber-600/50",
                                  )}
                                >
                                  {submissionWithThis
                                    ? `Included in submission (${new Date(submissionWithThis.submittedAt).toLocaleDateString()})`
                                    : "Not started"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION C: SUBMISSION HISTORY */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-6 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold tracking-wide text-lg italic">
                      Your submissions
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-bold tracking-widest text-[10px] mt-1">
                      Timeline of work you have submitted
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!vault.submissions || vault.submissions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-100 font-bold tracking-[0.2em] text-[10px]">
                      No work submitted yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vault.submissions.map((sub: any, idx: number) => {
                      const isExpanded = expandedSubmissions.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubmission(sub.id)}
                          className={cn(
                            "bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/20 transition-all cursor-pointer group shadow-sm",
                            isExpanded && "border-emerald-500/20 bg-emerald-50",
                          )}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center italic text-[10px] font-bold text-emerald-700">
                                {String(
                                  vault.submissions.length - idx,
                                ).padStart(2, "0")}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 tracking-wide italic">
                                  Submission #{vault.submissions.length - idx}
                                </p>
                                <p className="text-[9px] text-slate-600 font-bold tracking-wide mt-0.5">
                                  {new Date(sub.submittedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold tracking-wide px-3"
                            >
                              {sub.deliverableStatus?.filter(
                                (d: any) => d.included,
                              ).length ||
                                sub.deliverableIds?.length ||
                                0}{" "}
                              of {vault.deliverables?.length || 0} deliverables
                            </Badge>
                          </div>

                          {sub.notes && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic mb-4 shadow-sm">
                              &quot;{sub.notes}&quot;
                            </p>
                          )}

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-4"
                              >
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                  <p className="text-[9px] font-bold tracking-widest text-slate-600">
                                    Included deliverables:
                                  </p>
                                  <div className="space-y-2">
                                    {(sub.deliverableStatus || []).map(
                                      (d: any, dIdx: number) => (
                                        <div
                                          key={dIdx}
                                          className={cn(
                                            "p-3 rounded-lg border flex flex-col gap-2 transition-all duration-300",
                                            d.included
                                              ? "bg-emerald-50 border-emerald-100"
                                              : "bg-white border-slate-100 opacity-40",
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            {d.included ? (
                                              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                              <Square className="w-3.5 h-3.5 text-slate-100" />
                                            )}
                                            <span className="text-[10px] font-bold tracking-widest italic text-slate-900">
                                              {d.deliverableTitle}
                                            </span>
                                          </div>
                                          {d.included && d.notes && (
                                            <p className="text-[10px] text-slate-600 italic ml-5">
                                              - {d.notes}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-emerald-700 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            {isExpanded
                              ? "Click to collapse"
                              : "Click to expand details"}
                            <ChevronRight
                              className={cn(
                                "w-3 h-3 ml-1 transition-transform",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: ACTIONS */}
          <div className="space-y-8">
            {/* VAULT CONTROLS */}
            <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group">
              <CardHeader>
                <CardTitle className="text-slate-900 text-base font-bold tracking-[0.2em] italic flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Freelancer workspace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  {vault.status === VaultStatus.FUNDED && (
                    <Link href={`/freelancer/vault/${vaultId}/submit`}>
                      <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold h-12 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-xs italic">
                        <Upload className="w-4 h-4 mr-2" />
                        Deliver work
                      </Button>
                    </Link>
                  )}

                  <Link
                    href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] h-12 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <Gavel className="w-4 h-4 mr-2 text-amber-600" />
                      Initiate dispute
                    </Button>
                  </Link>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                  <p className="text-[9px] text-slate-600 font-bold tracking-[0.2em]">
                    Assigned to you by {vault.clientName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            <Card
              className={cn(
                "border-slate-200 bg-white shadow-sm transition-all hover:border-amber-500/20",
                !isEligibleForDispute && "opacity-60",
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900 font-bold tracking-widest text-sm italic">
                  <Gavel className="w-5 h-5 text-amber-600" />
                  Vault support
                </CardTitle>
                <CardDescription className="font-bold tracking-widest text-[9px] mt-2 leading-relaxed italic text-slate-600">
                  Initiate a formal case file if contract terms are breached.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 bg-white text-slate-600 hover:text-slate-900 font-bold tracking-widest text-[10px] h-12 rounded-xl transition-all shadow-sm active:scale-95"
                  disabled={!isEligibleForDispute}
                  asChild={isEligibleForDispute}
                >
                  {isEligibleForDispute ? (
                    <Link
                      href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    >
                      Initiate dispute
                    </Link>
                  ) : (
                    <Link href="/freelancer/disputes">Escrow Timeline</Link>
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
