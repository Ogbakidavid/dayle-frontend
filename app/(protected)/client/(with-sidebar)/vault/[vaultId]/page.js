"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/mock-api";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Download,
  Zap,
  Users,
  X,
  Check,
  Gavel,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  getDisputeEligibility,
  DISPUTE_REASON_CODES,
} from "@/lib/rules/disputes";
import { APPROVAL_REJECTION_CODES } from "@/lib/rules/milestones";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";
import { VaultStatus, MilestoneStatus } from "@/lib/domain/enums";

export default function ClientVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId;
  const { vaults, loading: vaultsLoading, refreshVaults } = useVault();

  // Local State for interactive mock
  const [activeReview, setActiveReview] = useState(null); // The milestone being reviewed
  const [showSuccess, setShowSuccess] = useState(false);

  // Review Modal State
  const [reviewReason, setReviewReason] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewAction, setReviewAction] = useState(null); // 'REVISION_REQUESTED' | 'REJECTED'

  // Find vault from context or use a fallback for safety
  const vault = vaults.find((v) => v.id === vaultId);

  // Invitation State
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [latestInvite, setLatestInvite] = useState(null);

  // Fetch latest invitation status for this vault
  useEffect(() => {
    async function fetchInviteStatus() {
      if (!vault || (vault.status !== VaultStatus.FUNDED_UNASSIGNED && vault.status !== VaultStatus.INVITED)) return;
      try {
        const data = await api.invites.getByVaultId(vault.id);
        setLatestInvite(data);
      } catch (err) {
        console.error("Failed to fetch invite status:", err);
      }
    }
    fetchInviteStatus();
  }, [vault]);

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
            displayAmount: vault.totalAmount * 0.2,
            deliverableTypeId: "github_repo",
            deliverableMode: "LINK",
          },
          {
            title: "Core API Implementation",
            displayAmount: vault.totalAmount * 0.4,
            deliverableTypeId: "api_endpoint",
            deliverableMode: "LINK",
          },
          {
            title: "Production Deployment",
            displayAmount: vault.totalAmount * 0.4,
            deliverableTypeId: "live_webapp",
            deliverableMode: "LINK",
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
          displayAmount: vault.totalAmount || vault.amount,
          deliverableTypeId: "doc_submission",
          deliverableMode: "FILE",
        });
      }
    }

    // 2. Map to Unified Milestone Object (MVP Architecture)
    return baseMilestones.map((m, idx) => {
      const id = m.id || `m_${idx}`;
      return {
        ...m,
        id: id,
        type: "APPROVAL",
        complianceStatus: m.verification?.result || "PENDING",
        status: m.status || MilestoneStatus.AWAITING_APPROVAL,
        displayAmount: m.totalAmount || m.amount || m.displayAmount,
      };
    });
  }, [vault]);

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
          requirementRef: "REQ-AUTO-01",
          comment: "Automated scan complete. No PII detected.",
          author: "Dayle AI",
          createdAt: new Date().toISOString(),
        },
      ],
    };
  };

  const handleApprove = async () => {
    if (activeReview) {
      try {
        // API call to release funds and update status
        await api.vaults.releaseMilestone(
          vault.id,
          activeReview.id,
          { idempotencyKey: `rel_${activeReview.id}_${Date.now()}` }
        );

        // Refresh vault data to see new status
        await refreshVaults(); 

        setActiveReview(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        console.error("Release failed:", err);
        toast.error("Failed to release funds. Please try again.");
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!activeReview || !reviewAction || !reviewReason) return;

    try {
      const outcome = reviewAction === "REJECTED" ? "REJECT" : "REQUEST_CHANGES";

      await api.milestones.review(activeReview.id, {
        outcome: outcome,
        reasonCodes: [reviewReason],
        notes: reviewFeedback,
      });

      await refreshVaults(); // Refresh to catch status change

      // Reset
      setActiveReview(null);
      setReviewAction(null);
      setReviewReason("");
      setReviewFeedback("");
      toast.success("Review submitted successfully");
    } catch (err) {
      console.error("Review failed:", err);
      toast.error("Failed to submit review");
    }
  };

  // Check if any milestone is eligible for dispute
  const anyEligibleForDispute = useMemo(() => {
    return displayMilestones.some((m) => getDisputeEligibility(m).eligible);
  }, [displayMilestones]);

  // Aggregate all submitted deliverables for the "Contract Documents" section
  const submittedDeliverables = useMemo(() => {
    const list = [];
    displayMilestones.forEach((m) => {
      // Logic: If status is VERIFIED or AWAITING_APPROVAL, the freelancer has submitted work.
      // In MVP mock, if there is a 'deliverableId' and 'deliverable' name, we treat it as a potential link/file.
      const hasWork = [MilestoneStatus.VERIFIED, MilestoneStatus.AWAITING_APPROVAL, MilestoneStatus.SUBMITTED].includes(m.status);
      if (hasWork && m.deliverable) {
        // Attempt to find metadata from constants to see if it's a file or link
        const purpose = vault.type;
        const deliverableMeta = VAULT_PURPOSE_MAPPING[purpose]?.deliverables?.find(d => d.id === m.deliverableTypeId);

        list.push({
          id: `${m.id}_deliverable`,
          name: deliverableMeta?.label || m.deliverableTypeId,
          milestoneName: m.title,
          type: deliverableMeta?.type || (m.deliverableTypeId?.toLowerCase().includes("link") ? "link" : "file"),
          url: "#",
        });
      }
    });
    return list;
  }, [displayMilestones]);

  if (vaultsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Loading Vault...
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Vault Not Found
      </div>
    );
  }

  // Helper for status colors
  const getStatusColor = (status) => {
    const normalized = status?.toUpperCase();
    if (normalized === MilestoneStatus.VERIFIED)
      return "text-emerald-500";
    if (normalized === MilestoneStatus.AWAITING_APPROVAL || normalized === MilestoneStatus.PENDING || normalized === MilestoneStatus.SUBMITTED)
      return "text-amber-500";
    if (normalized === MilestoneStatus.REJECTED || normalized === MilestoneStatus.REVISION_REQUESTED)
      return "text-red-500";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
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
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wide bg-transparent border-none p-0 cursor-pointer"
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
                {(vault.status === VaultStatus.DRAFT || vault.status === VaultStatus.AWAITING_FUNDING) && (
                  <Button
                    size="sm"
                    className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide text-[10px] h-7 px-3"
                    onClick={() => {
                      toast.success("Funding flow initiated. Mocking vault activation...");
                    }}
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                    Fund Vault
                  </Button>
                )}
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-wide">
                Vault ID:{" "}
                <span className="text-gray-400 font-mono">{vault.id}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                Total Value
              </p>
              <p className="text-3xl font-bold uppercase text-white tracking-tight">
                ${(vault.totalAmount || vault.amount).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mt-1">
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
                    className="group relative border border-white/5 rounded-xl p-5 bg-white/2 hover:bg-white/4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Milestone Index */}
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
                              "flex items-center gap-1.5 px-2 py-0.5 rounded border",
                              getStatusColor(milestone.status).replace("text-", "bg-").replace("500", "500/10"),
                              getStatusColor(milestone.status).replace("text-", "border-").replace("500", "500/20"),
                              getStatusColor(milestone.status)
                            )}>
                              <Users className="w-3 h-3" />
                              <span className="uppercase tracking-widest text-[9px] font-bold">
                                Approval: {milestone.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>

                          {milestone.deliverableTypeId && (
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                                <FileText className="w-3 h-3" />
                                Protocol:
                              </div>
                              <span className="text-[11px] text-gray-300 font-bold uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                {milestone.deliverableTypeId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
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

                        {milestone.status === MilestoneStatus.AWAITING_APPROVAL ? (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setActiveReview(milestone)}
                                className="bg-amber-500 text-black hover:bg-amber-400 font-bold uppercase tracking-wide text-[11px] h-8"
                              >
                                Review Work
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-[#0D0D0E] border-l border-white/10 w-full sm:max-w-[50vw] p-6 lg:p-8 overflow-y-auto">
                              <SheetHeader className="mb-6">
                                <SheetTitle className="text-white text-2xl font-bold uppercase tracking-wide">
                                  Review Deliverable
                                </SheetTitle>
                                <SheetDescription className="text-gray-400 font-bold uppercase tracking-normal">
                                  Review the evidence and data provided for this
                                  milestone before releasing funds.
                                </SheetDescription>
                              </SheetHeader>

                              {activeReview && (
                                <div className="space-y-6">
                                  <EvidencePanel
                                    milestone={activeReview}
                                    evidence={getMockEvidence(activeReview)}
                                  />

                                  <div className="space-y-4 pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                                      Actions
                                    </h4>

                                    {/* Approve */}
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                      <div className="flex items-center justify-between gap-4">
                                        <div>
                                          <h5 className="text-sm font-bold text-emerald-500 uppercase tracking-wide">
                                            Approve & Pay
                                          </h5>
                                          <p className="text-xs text-emerald-200/70 mt-1 font-semibold uppercase tracking-normal">
                                            Release{" "}
                                            <span className="text-white font-bold">
                                              $
                                              {activeReview.displayAmount?.toLocaleString()}
                                            </span>{" "}
                                            to freelancer.
                                          </p>
                                        </div>
                                        <SheetClose asChild>
                                          <Button
                                            onClick={handleApprove}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wide"
                                          >
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve
                                          </Button>
                                        </SheetClose>
                                      </div>
                                    </div>

                                    <div className="relative flex items-center py-2">
                                      <div className="grow border-t border-white/10"></div>
                                      <span className="shrink-0 mx-4 text-white/30 text-xs font-bold uppercase tracking-wide">
                                        Or Request Changes
                                      </span>
                                      <div className="grow border-t border-white/10"></div>
                                    </div>

                                    {/* Revision / Reject */}
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 font-bold uppercase tracking-wide",
                                            reviewAction ===
                                            "REVISION_REQUESTED" &&
                                            "bg-amber-500/10 ring-1 ring-amber-500"
                                          )}
                                          onClick={() => {
                                            setReviewAction(
                                              "REVISION_REQUESTED"
                                            );
                                            setReviewReason("");
                                          }}
                                        >
                                          Request Changes
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold uppercase tracking-wide",
                                            reviewAction === "REJECTED" &&
                                            "bg-red-500/10 ring-1 ring-red-500"
                                          )}
                                          onClick={() => {
                                            setReviewAction("REJECTED");
                                            setReviewReason("");
                                          }}
                                        >
                                          Reject Work
                                        </Button>
                                      </div>

                                      {reviewAction && (
                                        <div className="space-y-4 p-4 rounded-lg bg-white/2 border border-white/10 animate-in slide-in-from-top-2">
                                          <div className="space-y-2">
                                            <Label>
                                              Reason codes (required)
                                            </Label>
                                            <Select
                                              onValueChange={setReviewReason}
                                            >
                                              <SelectTrigger className="bg-black/40 border-white/10">
                                              </SelectTrigger>
                                              <SelectContent className="bg-[#141416] border-white/10 text-white max-h-[300px]">
                                                {APPROVAL_REJECTION_CODES.filter(
                                                  (c) =>
                                                    reviewAction === "REJECTED"
                                                      ? c.code !==
                                                      "REVISION_REQUIRED"
                                                      : true
                                                ).map((c) => (
                                                  <SelectItem
                                                    key={c.code}
                                                    value={c.code}
                                                    className="focus:bg-white/10 focus:text-white border-b border-white/5 last:border-0"
                                                  >
                                                    <div className="flex flex-col py-1">
                                                      <span className="font-bold text-xs uppercase tracking-wide">
                                                        {c.label}
                                                      </span>
                                                      <span className="text-[10px] text-white/40 font-bold uppercase mt-0.5">
                                                        {c.description}
                                                      </span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>

                                            {/* Visual Reason Indicator */}
                                            {reviewReason && (
                                              <div className="mt-2 p-3 bg-white/3 border border-white/5 rounded-lg">
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Target Protocol:</p>
                                                <p className="text-sm font-bold text-white uppercase">{APPROVAL_REJECTION_CODES.find(c => c.code === reviewReason)?.label}</p>
                                              </div>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Notes (Optional)</Label>
                                            <Textarea
                                              placeholder="Provide feedback..."
                                              className="bg-black/40 border-white/10 min-h-[80px]"
                                              value={reviewFeedback}
                                              onChange={(e) =>
                                                setReviewFeedback(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              onClick={() =>
                                                setReviewAction(null)
                                              }
                                            >
                                              Cancel
                                            </Button>
                                            <SheetClose asChild>
                                              <Button
                                                disabled={!reviewReason}
                                                onClick={handleReviewSubmit}
                                                className={
                                                  reviewAction === "REJECTED"
                                                    ? "bg-red-600 hover:bg-red-700"
                                                    : "bg-amber-600 hover:bg-amber-700"
                                                }
                                              >
                                                Confirm{" "}
                                                {reviewAction === "REJECTED"
                                                  ? "Rejection"
                                                  : "Request"}
                                              </Button>
                                            </SheetClose>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>
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
                            {milestone.status === "VERIFIED" ||
                              milestone.status === MilestoneStatus.VERIFIED ? (
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
          </div>

          {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
          <div className="space-y-6">
            {/* Verification Summary (MVP DEMO) */}
            <Card className="bg-[#0D0D0E] border-white/5 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[8px] uppercase font-black">
                  Demo Module
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">
                  Production Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                    This view simulates automated AI compliance checks before
                    forwarding work for human approval.
                  </p>

                  <div className="p-4 bg-white/3 rounded-lg border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold uppercase">
                        AI Confidence
                      </span>
                      <span className="text-emerald-500 font-bold">99.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold uppercase">
                        Next Step
                      </span>
                      <span className="text-amber-500 font-bold">
                        Human Review
                      </span>
                    </div>
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
                <CardDescription className="font-semibold text-gray-400 uppercase tracking-normal mb-2">
                  {anyEligibleForDispute
                    ? "Open a formal case file if work does not meet requirements."
                    : "No eligible case files for this vault right now. Case files are only allowed for specific reason codes tied to a milestone."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5 text-white"
                  disabled={!anyEligibleForDispute}
                  asChild={anyEligibleForDispute}
                >
                  {anyEligibleForDispute ? (
                    <Link href={`/client/disputes/create?vaultId=${vaultId}`}>
                      Open a Case
                    </Link>
                  ) : (
                    <Link href="/client/disputes">Go to disputes</Link>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-[#0D0D0E] border border-white/5 rounded-xl p-6 space-y-4">
              {/* Freelancer Assignment Section */}
              {(vault.status === "FUNDED_UNASSIGNED" || vault.status === "INVITED") && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                    Freelancer Assignment
                  </h4>
                  <Card className={cn(
                    "bg-white/[0.02] border-white/10 transition-colors",
                    latestInvite?.status === "DECLINED" && "border-red-500/30 bg-red-500/5"
                  )}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          latestInvite?.status === "DECLINED" ? "bg-red-500/10" : "bg-amber-500/10"
                        )}>
                          <UserPlus className={cn(
                            "w-5 h-5",
                            latestInvite?.status === "DECLINED" ? "text-red-500" : "text-amber-500"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-white">
                              {latestInvite?.status === "DECLINED"
                                ? "Freelancer Declined Invitation"
                                : vault.status === "FUNDED_UNASSIGNED"
                                  ? "Awaiting Freelancer Assignment"
                                  : "Invitation Pending"}
                            </p>
                            {latestInvite?.status === "DECLINED" && (
                              <Badge variant="destructive" className="text-[10px] uppercase h-4 px-1">Declined</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {latestInvite?.status === "DECLINED"
                              ? <>
                                The previous freelancer <span className="text-white">({latestInvite.email})</span> declined this invitation.
                                {latestInvite.declineReason && (
                                  <span className="block mt-1 text-red-400/70 italic text-[11px]">
                                    Reason: {latestInvite.declineReason.replace(/_/g, " ")}
                                  </span>
                                )}
                              </>
                              : "Enter a freelancer's email address to send them an invitation to this vault."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <Label htmlFor="invite-email" className="text-white text-[10px] font-bold uppercase tracking-widest mb-2 block opacity-50">
                            REASSIGN FREELANCER
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              id="invite-email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="freelancer@example.com"
                              className="w-full bg-black/60 border border-white/10 rounded-lg px-10 py-2.5 text-white text-sm placeholder:text-gray-400 focus:border-emerald-500/50 focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            if (!inviteEmail) {
                              toast.error("Please enter a valid email address");
                              return;
                            }
                            setSendingInvite(true);
                            // Simulate sending invitation
                            setTimeout(() => {
                              toast.success(`Invitation sent to ${inviteEmail}`);
                              setInviteEmail("");
                              setSendingInvite(false);
                              setLatestInvite({
                                vaultId: vault.id,
                                email: inviteEmail,
                                status: "PENDING",
                                invitedAt: new Date().toISOString()
                              });
                            }, 1000);
                          }}
                          disabled={sendingInvite || !inviteEmail}
                          className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide text-xs h-10"
                        >
                          {sendingInvite ? "Sending..." : "Send New Invitation"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="relative">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                  Contract Deliverables
                </h4>
                <div className="space-y-2">
                  {submittedDeliverables.length > 0 ? (
                    submittedDeliverables.map((doc) => (
                      <Button
                        key={doc.id}
                        variant="ghost"
                        onClick={() => {
                          toast.info(`Opening ${doc.name} submitted for ${doc.milestoneName}`);
                        }}
                        className="w-full justify-between items-center text-gray-500 hover:text-white h-auto py-3 px-4 border border-white/5 bg-white/2 hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center min-w-0 mr-3">
                          {doc.type === "link" ? (
                            <ExternalLink className="w-4 h-4 mr-3 shrink-0 text-emerald-500/70" />
                          ) : (
                            <Download className="w-4 h-4 mr-3 shrink-0" />
                          )}
                          <div className="text-left min-w-0">
                            <span className="block text-[11px] font-bold text-white uppercase truncate">{doc.name}</span>
                            <span className="block text-[9px] text-gray-600 font-bold uppercase tracking-tighter mt-0.5">{doc.milestoneName}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Button>
                    ))
                  ) : (
                    <div className="p-4 border border-dashed border-white/5 rounded-lg text-center">
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No deliverables submitted yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
