"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/mock-api";
import {
  Upload,
  FileText,
  DollarSign,
  Users,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Link2,
  Gavel,
} from "lucide-react";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EvidencePanel } from "@/components/shared/EvidencePanel";
import { cn } from "@/lib/utils";
import { getDisputeEligibility } from "@/lib/rules/disputes";
import { VaultStatus, MilestoneStatus, VerificationResult } from "@/lib/domain/enums";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId;

  // Fetch vault directly by ID instead of relying on context
  const [vault, setVault] = useState(null);
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

  // No local state needed - submissions go through dedicated page

  // Memoize generated milestones
  const displayMilestones = useMemo(() => {
    if (!vault) return [];

    // 1. Determine base milestones
    let baseMilestones = [];
    if (vault.milestones && vault.milestones.length > 0) {
      baseMilestones = vault.milestones;
    } else {
      // If no milestones (e.g. freshly accepted invite), we might return empty or a placeholder
      if (vault.status === VaultStatus.FUNDED_ASSIGNED || vault.status === VaultStatus.INVITED) {
        return [];
      }

      // Generate mock milestones based on type for other active states
      if (vault.type === "development") {
        baseMilestones.push(
          {
            title: "GitHub Repository Setup",
            amount: vault.amount * 0.2,
            deliverableId: "github_repo",
            deliverable: "GitHub Repository",
          },
          {
            title: "Core API Implementation",
            amount: vault.amount * 0.4,
            deliverableId: "api_endpoint",
            deliverable: "Live API Endpoint",
          },
          {
            title: "Production Deployment",
            amount: vault.amount * 0.4,
            deliverableId: "live_webapp",
            deliverable: "Deployed Web App",
          }
        );
      } else if (vault.type === "design") {
        baseMilestones.push(
          {
            title: "Brand Guidelines",
            amount: vault.amount * 0.3,
            deliverableId: "figma_link",
            deliverable: "Figma File",
          },
          {
            title: "Logo Assets",
            amount: vault.amount * 0.3,
            deliverableId: "asset_pack",
            deliverable: "Design Assets (ZIP)",
          },
          {
            title: "Social Media Kit",
            amount: vault.amount * 0.4,
            deliverableId: "figma_link",
            deliverable: "Figma Link",
          }
        );
      } else if (vault.type === "content_ai") {
        baseMilestones.push(
          {
            title: "Raw Data Collection",
            amount: vault.amount * 0.3,
            deliverableId: "ai_dataset",
            deliverable: "JSON Dataset",
          },
          {
            title: "Data Sanitization",
            amount: vault.amount * 0.3,
            deliverableId: "doc_submission",
            deliverable: "Technical Document",
          },
          {
            title: "Model Fine-tuning",
            amount: vault.amount * 0.4,
            deliverableId: "audio_video",
            deliverable: "Model Weights (File)",
          }
        );
      } else {
        baseMilestones.push({
          title: "Project Deliverable",
          amount: vault.amount,
          deliverableId: "doc_submission",
          deliverable: "General Document",
        });
      }
    }

    // 2. Map to Unified Milestone Object (Matches Client View)
    return baseMilestones.map((m, idx) => {
      const id = m.id || `m_${idx}`;
      return {
        ...m,
        id: id,
        complianceStatus: VerificationResult.PASS, // In MVP, these are automated checks that pass instantly
        status: m.status || MilestoneStatus.PENDING,
        displayAmount: m.amount,
      };
    });
  }, [vault]);

  // Check if any milestone is eligible for dispute
  const anyEligibleForDispute = useMemo(() => {
    return displayMilestones.some((m) => getDisputeEligibility(m).eligible);
  }, [displayMilestones]);

  // Helper for status colors
  const getStatusColor = (status) => {
    const normalized = status?.toUpperCase();
    switch (normalized) {
      case MilestoneStatus.VERIFIED:
        return "text-emerald-500";
      case MilestoneStatus.AWAITING_APPROVAL:
      case "PENDING_REVIEW":
      case MilestoneStatus.SUBMITTED:
        return "text-amber-500";
      case MilestoneStatus.REJECTED:
      case MilestoneStatus.DISPUTED:
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  // Helper for mock evidence
  const getMockEvidence = (milestone) => ({
    clarifications: [],
    fileComments: [
      {
        id: 1,
        fileName: `${(milestone.deliverable || "deliverable")
          .toLowerCase()
          .replace(/ /g, "_")}_v1.zip`,
        requirementRef: "REQ-AUTO-01",
        comment: "Automated scan complete. No PII detected.",
        author: "Dayle AI",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  if (vaultsLoading) {
    return <div className="p-10 text-gray-400">Loading vault details...</div>;
  }

  if (!vault) {
    // Debug info to help understand why access might be denied
    return (
      <div className="p-10 text-red-500">
        <h2 className="text-xl font-bold mb-2">Vault not found or access denied.</h2>
        <p className="text-sm opacity-70">
          Please check if you are logged in as the correct freelancer.
        </p>
        <Link href="/freelancer">
          <Button variant="outline" className="mt-4">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-4 md:pt-8 bg-transparent">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-4 md:mb-6 font-bold uppercase tracking-wide bg-transparent border-none p-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{vault.title}</h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px] shrink-0"
                >
                  {vault.status}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-wide truncate">
                Vault ID:{" "}
                <span className="text-gray-400 font-mono">{vaultId}</span>
              </p>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-widest">
                Potential Earnings
              </p>
              <p className="text-2xl md:text-3xl font-bold uppercase text-white tracking-tight">
                ${vault.amount?.toLocaleString() || "0"}
              </p>
              <p className="text-[10px] md:text-xs text-emerald-500 font-bold uppercase tracking-tight mt-1">
                ${(vault.paidAmount || 0).toLocaleString()} Received
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: MILESTONES */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white font-bold uppercase tracking-wide">Project Milestones</CardTitle>
                <CardDescription className="text-gray-400 uppercase font-bold tracking-normal pb-2">
                  Submit deliverables and track approval status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="group relative bg-white/2 border border-white/5 rounded-xl p-5 hover:bg-white/4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white uppercase tracking-wide truncate">
                            {milestone.title}
                          </h3>

                          {/* Escrow Verification Protocol */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                              <Zap className="w-3 h-3" />
                              <span className="uppercase tracking-widest text-[9px] font-bold">
                                AI: {milestone.complianceStatus}
                              </span>
                            </div>
                            <div className={cn(
                              "flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest",
                              getStatusColor(milestone.status).replace("text-", "bg-").replace("500", "500/10"),
                              getStatusColor(milestone.status).replace("text-", "border-").replace("500", "500/20"),
                              getStatusColor(milestone.status)
                            )}>
                              <Users className="w-3 h-3" />
                              <span>
                                Approval: {milestone.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {milestone.deliverable && (
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                <FileText className="w-3 h-3" />
                                Deliverable:
                              </div>
                              <span className="text-[12px] text-white font-bold uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {milestone.deliverable}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions & Amount */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${milestone.displayAmount?.toLocaleString()}
                          </p>
                          {milestone.dueDate && (
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                              Due: {milestone.dueDate}
                            </p>
                          )}
                        </div>

                        {(milestone.status === MilestoneStatus.PENDING || !milestone.status) ? (
                          <Link href={`/freelancer/vault/${vaultId}/milestones/${milestone.id}/submit`}>
                            <Button
                              size="sm"
                              className="bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-normal h-8"
                            >
                              Submit
                              <Upload className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              "uppercase tracking-widest text-[10px] h-7 px-3 flex items-center gap-1.5",
                              getStatusColor(milestone.status).replace("text-", "bg-").replace("500", "500/10"),
                              getStatusColor(milestone.status),
                              getStatusColor(milestone.status).replace("text-", "border-").replace("500", "500/20")
                            )}
                          >
                            {milestone.status === MilestoneStatus.VERIFIED ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {milestone.status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Evidence Panel (Using the first milestone's evidence for demo) */}
            <EvidencePanel
              milestone={displayMilestones[0]}
              evidence={getMockEvidence(displayMilestones[0] || {})}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Verification Summary */}
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">
                  Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">
                      Requirements Met:
                    </span>
                    <span className="text-emerald-500 font-bold uppercase tracking-normal">
                      12/12
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">
                      Checks Passed:
                    </span>
                    <span className="text-emerald-500 font-bold uppercase tracking-normal">
                      12/12
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">
                      Last Verified:
                    </span>
                    <span className="text-white font-bold uppercase tracking-normal">
                      2 mins ago
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">
                      Status:
                    </span>
                    <span className="text-emerald-500 font-bold uppercase tracking-normal">
                      Verified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            <Card
              className={cn(
                "border-white/5 bg-[#0D0D0E]",
                !anyEligibleForDispute && "opacity-70"
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white font-bold uppercase tracking-normal">
                  <Gavel className="w-5 h-5 text-amber-500" />
                  Case Files
                </CardTitle>
                <CardDescription className="font-bold uppercase tracking-normal pb-3">
                  {anyEligibleForDispute
                    ? "Open a formal case file if work does not meet requirements."
                    : "No eligible case files for this vault right now. Case files are only allowed for specific reason codes tied to a milestone."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-normal"
                  disabled={!anyEligibleForDispute}
                  asChild={anyEligibleForDispute}
                >
                  {anyEligibleForDispute ? (
                    <Link
                      href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    >
                      Open a Case
                    </Link>
                  ) : (
                    <Link href="/freelancer/disputes">Go to disputes</Link>
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
