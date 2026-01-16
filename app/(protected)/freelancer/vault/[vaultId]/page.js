"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId;
  const { vaults, loading: vaultsLoading } = useVault();

  // Find vault from context
  const vault = vaults.find((v) => v.id === vaultId);

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
      [activeSubmit.id]: "awaiting_approval", // Move to review state
    }));

    setShowSuccess(true);
    setActiveSubmit(null);

    // Hide success toast after 3s
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Memoize generated milestones
  const displayMilestones = useMemo(() => {
    if (!vault) return [];

    if (vault.milestones && vault.milestones.length > 0) {
      return vault.milestones.map((m) => ({
        ...m,
        status: milestoneStates[m.id] || m.status,
      }));
    }

    // Generate mock milestones based on type (Shared logic with Client)
    const baseMilestones = [];
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
          deliverable: "Model Weights (File)", // Fallback to file for heavy model
        }
      );
    } else {
      baseMilestones.push({
        title: "Project Deliverable",
        amount: vault.amount,
        deliverableId: "doc_submission", // Default to file
        deliverable: "General Document",
      });
    }

    const splitMilestones = [];
    baseMilestones.forEach((m, idx) => {
      // 1. Compliance (AI)
      splitMilestones.push({
        id: `m_${idx}_comp`,
        title: m.title,
        subtitle: "Automated Compliance Check",
        amount: 0,
        displayAmount: m.amount,
        status: "verified", // Freelancer sees this as verified instantly in this mock
        type: "COMPLIANCE_AI",
        deliverable: m.deliverable,
        checks: ["Format Validation", "Virus Scan", "Metadata Verify"],
      });

      // 2. Approval (Human)
      splitMilestones.push({
        id: `m_${idx}_appr`,
        title: m.title,
        subtitle: "Release Funds",
        amount: m.amount,
        displayAmount: m.amount,
        status:
          milestoneStates[`m_${idx}_appr`] ||
          (idx === 1 ? "awaiting_approval" : "pending"),
        type: "APPROVAL_HUMAN",
        type: "APPROVAL_HUMAN",
        deliverable: m.deliverable,
        deliverableId: m.deliverableId, // Pass through ID
      });
    });

    return splitMilestones;
  }, [vault, milestoneStates]);

  // Helper for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "approved":
        return "text-emerald-500";
      case "awaiting_approval":
      case "pending_review":
        return "text-amber-500";
      case "disputed":
        return "text-red-500";
      default:
        return "text-slate-500";
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
        author: "Cleard AI",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  if (vaultsLoading) {
    return <div className="p-10 text-slate-500">Loading vault details...</div>;
  }

  if (!vault) {
    return (
      <div className="p-10 text-red-500">Vault not found or access denied.</div>
    );
  }

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-8">
          <Link
            href="/freelancer/vaults"
            className="inline-flex items-center text-sm font-bold uppercase tracking-wide text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vaults
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{vault.title}</h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px]"
                >
                  {vault.status}
                </Badge>
              </div>
              <p className="text-slate-500 font-medium">
                Vault ID:{" "}
                <span className="text-slate-400 font-mono">{vaultId}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
                Potential Earnings
              </p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ${vault.amount?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-emerald-500 font-medium mt-1">
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
                <CardTitle className="text-white">Project Milestones</CardTitle>
                <CardDescription>
                  Submit deliverables and track approval status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-4">
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {milestone.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "uppercase tracking-widest text-[10px] h-5",
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
                              <div className="flex gap-2 mt-2">
                                {milestone.checks.map((check) => (
                                  <span
                                    key={check}
                                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30"
                                  >
                                    ✓ {check}
                                  </span>
                                ))}
                              </div>
                            )}

                          {milestone.deliverable && (
                            <div className="flex items-center gap-2 mt-2 mb-1">
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                Required:
                              </span>
                              <span className="text-sm text-white font-medium">
                                {milestone.deliverable}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                            {milestone.type === "APPROVAL_HUMAN" && (
                              <>
                                <span>
                                  ${milestone.displayAmount?.toLocaleString()}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                              </>
                            )}
                            <span className={getStatusColor(milestone.status)}>
                              {milestone.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      {milestone.type === "APPROVAL_HUMAN" &&
                        milestone.status === "pending" && (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setActiveSubmit(milestone)}
                                className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                              >
                                Submit
                                <Upload className="w-4 h-4 ml-2" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-[#0D0D0E] border-l border-white/10 w-full sm:w-[540px] p-6 lg:p-8">
                              <SheetHeader className="mb-6">
                                <SheetTitle className="text-white text-2xl">
                                  Submit Milestone
                                </SheetTitle>
                                <SheetDescription className="text-slate-400">
                                  Upload your deliverables for client review.
                                </SheetDescription>
                              </SheetHeader>

                              {activeSubmit && (
                                <div className="space-y-6">
                                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <h4 className="text-sm font-bold text-emerald-500 mb-2 uppercase tracking-wide">
                                      Deliverable Required
                                    </h4>
                                    <p className="text-sm text-emerald-200/70">
                                      Please upload:{" "}
                                      <span className="text-white font-bold">
                                        {activeSubmit.deliverable}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <div className="space-y-2">
                                        <Label className="text-white">
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
                                                  placeholder={`Paste ${
                                                    deliverableDef?.label ||
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
                                              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3 group-hover:text-emerald-500 transition-colors" />
                                              <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                Drop files here or click to
                                                upload
                                              </p>
                                              <p className="text-xs text-slate-500 mt-1">
                                                Max 50MB
                                              </p>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-white">
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
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                      >
                                        Submit for Review
                                      </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                      <Button
                                        variant="outline"
                                        className="border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
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
                        milestone.status === "awaiting_approval" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="border-amber-500/20 text-amber-500 bg-amber-500/5"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            In Review
                          </Button>
                        )}

                      {milestone.type === "COMPLIANCE_AI" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-500 hover:text-emerald-400 pointer-events-none"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Auto-Verified
                        </Button>
                      )}
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
                <CardTitle className="text-white text-lg">
                  Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Requirements Met</span>
                    <span className="text-emerald-500 font-bold">12/12</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Code Quality Score</span>
                    <span className="text-emerald-500 font-bold">A+</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1">
                    Issues with Payment?
                  </h4>
                  <p className="text-sm text-red-200/60 mb-4">
                    If the client is unresponsive or delaying approval
                    unreasonably.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 w-full"
                    asChild
                  >
                    <Link
                      href={`/freelancer/disputes/${
                        vault.id === "v_3"
                          ? "d_003"
                          : vault.id === "v_4"
                          ? "d_004"
                          : "d_001"
                      }`}
                    >
                      Raise Dispute
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
