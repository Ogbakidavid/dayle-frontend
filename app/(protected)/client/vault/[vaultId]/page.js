"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ChevronRight,
  Download,
  Zap,
  Users,
  X,
  Check,
} from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { EvidencePanel } from "@/components/shared/EvidencePanel";

export default function ClientVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId;
  const { vaults, loading: vaultsLoading } = useVault();

  // Local State for interactive mock
  const [activeReview, setActiveReview] = useState(null); // The milestone being reviewed
  const [milestoneStates, setMilestoneStates] = useState({}); // Track approvals { [id]: 'approved' }
  const [showSuccess, setShowSuccess] = useState(false);

  // Find vault from context or use a fallback for safety
  const vault = vaults.find((v) => v.id === vaultId);

  // Memoize generated milestones to prevent re-generation on re-renders,
  // but allow updates via local state overrides
  const displayMilestones = useMemo(() => {
    if (!vault) return [];

    // 1. Determine base milestones
    let baseMilestones = [];
    if (vault.milestones && vault.milestones.length > 0) {
      baseMilestones = vault.milestones;
    } else {
      // Generate mock milestones based on type
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
        status: "verified", // Always verified in this view
        type: "COMPLIANCE_AI",
        deliverable: m.deliverable || "General Deliverable",
        checks: ["Format Validation", "Virus Scan", "Metadata Verify"],
      });

      // 2. Approval (Human)
      const approvalId = m.id ? `${m.id}_appr` : `m_${idx}_appr`;
      splitMilestones.push({
        id: approvalId,
        title: m.title,
        subtitle: "Client Approval Required",
        amount: m.amount,
        displayAmount: m.amount,
        status: milestoneStates[approvalId] || m.status || "awaiting_approval", // Use local state, then prop, then default
        type: "APPROVAL_HUMAN",
        deliverable: m.deliverable || "General Deliverable",
        deliverableId: m.deliverableId,
      });
    });

    return splitMilestones;
  }, [vault, milestoneStates]);

  // Mock Evidence Generator for the Review Panel
  const getMockEvidence = (milestone) => {
    if (!milestone) return null;
    return {
      clarifications: [
        {
          id: 1,
          question: "Is this ready for production?",
          answer: "Yes, all checks passed.",
          askedBy: "Client",
          answeredBy: "System",
          answeredAt: new Date().toISOString(),
        },
      ],
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
    };
  };

  const handleApprove = () => {
    if (activeReview) {
      setMilestoneStates((prev) => ({
        ...prev,
        [activeReview.id]: "approved",
      }));
      setActiveReview(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (vaultsLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        Loading Vault...
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        Vault Not Found
      </div>
    );
  }

  // Helper for status colors
  const getStatusColor = (status) => {
    if (status === "verified" || status === "approved" || status === "passed")
      return "text-emerald-500";
    if (status === "awaiting_approval" || status === "pending")
      return "text-amber-500";
    return "text-slate-500";
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* SUCCESS ALERT */}
        {showSuccess && (
          <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
            <Alert className="bg-emerald-500 border-emerald-600 text-white w-auto min-w-[300px] shadow-2xl">
              <CheckCircle className="h-4 w-4 text-white" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Milestone approved and funds released.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* HEADER */}
        <header className="pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wide bg-transparent border-none p-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
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
              <p className="text-slate-500 font-bold uppercase tracking-wide">
                Vault ID:{" "}
                <span className="text-slate-400 font-mono">{vault.id}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
                Total Value
              </p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ${(vault.totalAmount || vault.amount).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-500 font-medium mt-1">
                ${(vault.paidAmount || 0).toLocaleString()} Released
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: MILESTONES */}
          <div className="lg:col-span-2 space-y-6">
            {/* Milestone List */}
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white font-bold uppercase tracking-wide">
                  Milestone Phases
                </CardTitle>
                <CardDescription className="text-gray-400 font-bold uppercase tracking-wide pb-3">
                  Detailed breakdown of Compliance (AI) and Approval (Human)
                  stages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "group relative border rounded-xl p-5 transition-all",
                      milestone.type === "COMPLIANCE_AI"
                        ? "bg-emerald-950/10 border-emerald-500/10 hover:bg-emerald-950/20"
                        : milestone.type === "APPROVAL_HUMAN"
                          ? "bg-amber-950/10 border-amber-500/10 hover:bg-amber-950/20"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Icon/Number */}
                        <div
                          className={cn(
                            "mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                            milestone.type === "COMPLIANCE_AI"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : milestone.type === "APPROVAL_HUMAN"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-white/5 text-slate-500"
                          )}
                        >
                          {milestone.type === "COMPLIANCE_AI" ? (
                            <Zap className="w-4 h-4" />
                          ) : milestone.type === "APPROVAL_HUMAN" ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                            {milestone.title}
                          </h3>
                          <div className="flex gap-2 items-center mt-1 mb-2">
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
                                    className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 font-bold uppercase"
                                  >
                                    ✓ {check}
                                  </span>
                                ))}
                              </div>
                            )}

                          {milestone.deliverable && (
                            <div className="flex items-center gap-2 mt-3 mb-1">
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                Required:
                              </span>
                              <span className="text-[12px] text-white font-bold uppercase tracking-wide">
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

                      {/* Right Side: Action Button or Passed Badge */}
                      <div className="flex flex-col items-end gap-2">
                        {milestone.type === "COMPLIANCE_AI" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px] h-6 px-3 flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </Badge>
                        )}

                        {milestone.status === "awaiting_approval" &&
                          milestone.type === "APPROVAL_HUMAN" && (
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setActiveReview(milestone)}
                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
                                >
                                  Review
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="bg-[#0D0D0E] border-l border-white/10 w-full sm:max-w-[50vw] p-6 lg:p-8 overflow-y-auto">
                                <SheetHeader className="mb-6">
                                  <SheetTitle className="text-white text-2xl font-bold uppercase tracking-wide">
                                    Review Deliverable
                                  </SheetTitle>
                                  <SheetDescription className="text-slate-400">
                                    Review the evidence and data provided for
                                    this milestone before releasing funds.
                                  </SheetDescription>
                                </SheetHeader>

                                {activeReview && (
                                  <div className="space-y-6">
                                    <EvidencePanel
                                      milestone={activeReview}
                                      evidence={getMockEvidence(activeReview)}
                                    />

                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                      <h4 className="text-sm font-bold text-amber-500 mb-2 uppercase tracking-wide">
                                        Approval Action
                                      </h4>
                                      <p className="text-xs text-amber-200/70 mb-4">
                                        By approving this milestone, you are
                                        confirming that the work meets your
                                        requirements.
                                        <span className="text-white font-bold">
                                          {" "}
                                          $
                                          {activeReview.displayAmount?.toLocaleString()}
                                        </span>{" "}
                                        will be released to the freelancer.
                                      </p>
                                      <div className="flex gap-3">
                                        <SheetClose asChild>
                                          <Button
                                            onClick={handleApprove}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                          >
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve & Pay
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
                                  </div>
                                )}
                              </SheetContent>
                            </Sheet>
                          )}

                        {milestone.status === "approved" &&
                          milestone.type === "APPROVAL_HUMAN" && (
                            <div className="flex items-center text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Approved
                            </div>
                          )}

                        {milestone.status === "verified" &&
                          milestone.type === "APPROVAL_HUMAN" && (
                            <div className="flex items-center text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Passed
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
          <div className="space-y-6">
            {/* Verification Summary */}
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Production Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">
                    This view simulates how milestones are processed in
                    production: first passing automated AI Compliance checks,
                    then forwarded for Client Approval.
                  </p>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Escrow Status</span>
                      <span className="text-emerald-500 font-bold">Secure</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">
                        AI Audit Confidence
                      </span>
                      <span className="text-emerald-500 font-bold">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Next Action</span>
                      <span className="text-amber-500 font-bold">
                        Client Review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-transparent hover:bg-white/5 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Audit Log
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1">
                    Start Dispute
                  </h4>
                  <p className="text-sm text-red-200/60 mb-4">
                    Issues with deliverables? You can freeze funds here.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 w-full"
                    asChild
                  >
                    <Link
                      href={`/client/disputes/create?vaultId=${vault.id}`}
                    >
                      Open Case
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[#0D0D0E] border border-white/5 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                Contract Documents
              </h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white h-auto py-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="truncate">Service_Agreement_v2.pdf</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}