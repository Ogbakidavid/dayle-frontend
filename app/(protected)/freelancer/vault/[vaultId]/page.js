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

  // Local State for interactive mock submission
  const [activeSubmit, setActiveSubmit] = useState(null);
  const [milestoneStates, setMilestoneStates] = useState({}); // Track submissions { [id]: 'awaiting_approval' }
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeSubmit) return;

    // Update local state to simulate submission
    setMilestoneStates((prev) => ({
      ...prev,
      [activeSubmit.id]: "AWAITING_APPROVAL", // Move to review state
    }));

    setShowSuccess(true);
    setActiveSubmit(null);

    // Hide success toast after 3s
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Memoize generated milestones
  const displayMilestones = useMemo(() => {
    if (!vault) return [];

    // 1. Determine base milestones
    let baseMilestones = [];
    if (vault.milestones && vault.milestones.length > 0) {
      baseMilestones = vault.milestones;
    } else {
      // If no milestones (e.g. freshly accepted invite), we might return empty or a placeholder
      if (vault.status === "FUNDED_ASSIGNED" || vault.status === "AWAITING_FUNDING") {
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

    // 2. Split into Compliance & Approval
    const splitMilestones = [];
    baseMilestones.forEach((m, idx) => {
      // 1. Compliance (AI)
      splitMilestones.push({
        id: m.id ? `${m.id}_comp` : `m_${idx}_comp`,
        title: m.title,
        subtitle: "Automated Compliance Check",
        amount: 0,
        displayAmount: m.amount,
        status: "VERIFIED", // Freelancer sees this as verified instantly in this mock
        type: "COMPLIANCE_AI",
        deliverable: m.deliverable || "General Deliverable",
        checks: ["Format Validation", "Virus Scan", "Metadata Verify"],
      });

      // 2. Approval (Human)
      const approvalId = m.id ? `${m.id}_appr` : `m_${idx}_appr`;
      splitMilestones.push({
        id: approvalId,
        title: m.title,
        subtitle: "Release Funds",
        amount: m.amount,
        displayAmount: m.amount,
        status:
          milestoneStates[approvalId] ||
          m.status ||
          (idx === 0 ? "PENDING" : "PENDING"), // Default all to pending if no status
        type: "APPROVAL_HUMAN",
        deliverable: m.deliverable || "General Deliverable",
        deliverableId: m.deliverableId,
      });
    });

    return splitMilestones;
  }, [vault, milestoneStates]);

  // Check if any milestone is eligible for dispute
  const anyEligibleForDispute = useMemo(() => {
    return displayMilestones.some((m) => getDisputeEligibility(m).eligible);
  }, [displayMilestones]);

  // Helper for status colors
  const getStatusColor = (status) => {
    const normalized = status?.toUpperCase();
    switch (normalized) {
      case "VERIFIED":
      case "APPROVED":
        return "text-emerald-500";
      case "AWAITING_APPROVAL":
      case "PENDING_REVIEW":
      case "SUBMITTED":
        return "text-amber-500";
      case "REJECTED":
      case "FAILED":
      case "DISPUTED":
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
        requirementId: "REQ-AUTO-01",
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
                    className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={cn(
                            "mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                            milestone.type === "COMPLIANCE_AI"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          )}
                        >
                          {milestone.type === "COMPLIANCE_AI" ? (
                            <Zap className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide break-words">
                              {milestone.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "uppercase tracking-widest text-[10px] h-5 whitespace-nowrap",
                                milestone.type === "COMPLIANCE_AI"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              )}
                            >
                              {milestone.type === "COMPLIANCE_AI"
                                ? "AI Compliance"
                                : "Client Approval"}
                            </Badge>
                          </div>

                          {milestone.type === "COMPLIANCE_AI" &&
                            milestone.checks && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {milestone.checks.map((check) => (
                                  <span
                                    key={check}
                                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 font-bold uppercase"
                                  >
                                    ✓ {check}
                                  </span>
                                ))}
                              </div>
                            )}

                          {milestone.deliverable && (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 mb-1">
                              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap">
                                Required:
                              </span>
                              <span className="text-[12px] text-white font-bold uppercase tracking-wide break-words">
                                {milestone.deliverable}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                            {milestone.type === "APPROVAL_HUMAN" && (
                              <>
                                <span className="text-white">
                                  ${milestone.displayAmount?.toLocaleString()}
                                </span>
                                <span className="hidden xs:block w-1 h-1 rounded-full bg-slate-700" />
                              </>
                            )}
                            <span className={cn(getStatusColor(milestone.status), "whitespace-nowrap")}>
                              {milestone.status.replace("_", " ")}
                            </span>

                            {/* Eligible Dispute Action */}
                            {getDisputeEligibility(milestone).eligible && (
                              <Link
                                href={`/freelancer/disputes/create?vaultId=${vaultId}&milestoneId=${milestone.id}`}
                                className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/20 transition-colors font-bold uppercase tracking-normal"
                              >
                                <Gavel className="w-3 h-3" />
                                Open Case
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        {milestone.type === "COMPLIANCE_AI" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-wide text-[10px] h-6 px-3 flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </Badge>
                        )}

                        {milestone.type === "APPROVAL_HUMAN" &&
                          (milestone.status === "PENDING" ||
                            !milestone.status) && (
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setActiveSubmit(milestone)}
                                  className="bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-normal"
                                >
                                  Submit
                                  <Upload className="w-4 h-4 ml-2" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="bg-[#0D0D0E] border-l border-white/10 w-full sm:max-w-[50vw] p-6 lg:p-8 overflow-y-auto">
                                <SheetHeader className="mb-6">
                                  <SheetTitle className="text-white text-2xl font-bold uppercase tracking-normal">
                                    Submit Milestone
                                  </SheetTitle>
                                  <SheetDescription className="text-gray-400 font-bold uppercase tracking-normal">
                                    Upload your deliverables for client review.
                                  </SheetDescription>
                                </SheetHeader>

                                {activeSubmit && (
                                  <div className="space-y-6">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                      <h4 className="text-sm font-bold text-emerald-500 mb-2 uppercase tracking-wide">
                                        Deliverable Required
                                      </h4>
                                      <p className="text-sm text-emerald-200/70 font-bold uppercase tracking-normal">
                                        Please upload:{" "}
                                        <span className="text-white font-bold">
                                          {activeSubmit.deliverable}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <div className="space-y-2">
                                          <Label className="text-white font-bold uppercase tracking-normal">
                                            Submission
                                          </Label>
                                          {(() => {
                                            // Determine Input Type from Constants
                                            const purpose =
                                              VAULT_PURPOSE_MAPPING[vault.type];
                                            const deliverableDef =
                                              purpose?.deliverables?.find(
                                                (d) =>
                                                  d.id ===
                                                  activeSubmit.deliverableId
                                              );
                                            const isLink =
                                              deliverableDef?.type === "link";

                                            if (isLink) {
                                              return (
                                                <div className="relative">
                                                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                  <Input
                                                    placeholder={`Paste ${deliverableDef?.label ||
                                                      "Link"
                                                      } URL...`}
                                                    className="bg-black/30 border-white/10 text-white pl-10"
                                                  />
                                                </div>
                                              );
                                            }

                                            return (
                                              <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/[0.02] transition-colors text-center cursor-pointer group">
                                                <input
                                                  type="file"
                                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-emerald-500 transition-colors" />
                                                <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                  Drop files here or click to
                                                  upload
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                  Max 50MB
                                                </p>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-white font-bold uppercase tracking-normal">
                                          Comments
                                        </Label>
                                        <Textarea
                                          placeholder="Add notes for the client..."
                                          className="bg-black/30 border-white/10 text-white min-h-[100px]"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-white/10">
                                      <SheetClose asChild>
                                        <Button
                                          onClick={handleSubmit}
                                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-normal"
                                        >
                                          Submit for Review
                                        </Button>
                                      </SheetClose>
                                      <SheetClose asChild>
                                        <Button
                                          variant="outline"
                                          className="border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold uppercase tracking-normal"
                                        >
                                          Cancel
                                        </Button>
                                      </SheetClose>
                                    </div>
                                  </div>
                                )}
                              </SheetContent>
                            </Sheet>
                          )}

                        {milestone.type === "APPROVAL_HUMAN" &&
                          milestone.status === "AWAITING_APPROVAL" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="border-amber-500/20 text-amber-500 bg-amber-500/5 font-bold uppercase tracking-normal"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              In Review
                            </Button>
                          )}

                        {milestone.status === "VERIFIED" &&
                          milestone.type === "APPROVAL_HUMAN" && (
                            <div className="flex items-center text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Approved
                            </div>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">Requirements Met</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-normal">12/12</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-normal">Checks Summary</span>
                    <span className="text-emerald-500 font-bold uppercase tracking-normal">A+</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
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
