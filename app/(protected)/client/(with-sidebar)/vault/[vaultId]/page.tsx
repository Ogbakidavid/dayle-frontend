"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
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
  RefreshCcw,
  ShieldAlert,
  AlertCircle,
  ShieldCheck,
  Copy,
  Mail,
  UserPlus,
  ListChecks,
  Square,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
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
  SheetClose,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVault } from "@/lib/store/vault-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EvidencePanel } from "@/components/shared/EvidencePanel";
import { getDisputeEligibility } from "@/lib/rules/disputes";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";
import {
  VaultStatus,
  KycStatus,
  getVaultDerivedLabel,
} from "@/lib/domain/enums";
import { useUser } from "@/lib/store/user-context";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const { user } = useUser();
  const { vaults, loading: vaultsLoading, refreshVaults } = useVault();

  const [showSuccess, setShowSuccess] = useState(false);

  // Find vault from context or use a fallback for safety
  const vault = vaults.find((v: any) => v.id === vaultId);

  // Invitation State
  const [inviteEmail, setInviteEmail] = useState("");
  const [latestInvite, setLatestInvite] = useState<any>(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassigningLoading, setReassigningLoading] = useState(false);
  const [requestingRefund, setRequestingRefund] = useState(false);

  // Refund Form State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "card">("bank");
  const [payoutDetails, setPayoutDetails] = useState({
    bankName: "",
    accountNumber: "",
    holderName: "",
    routingNumber: "",
  });

  // Fetch latest invitation status for this vault
  useEffect(() => {
    async function fetchInviteStatus() {
      if (!vault || vault.status !== VaultStatus.FUNDED) return;
      try {
        const data = await api.invites.getByVaultId(vault.id);
        setLatestInvite(data);
      } catch (err) {
        console.error("Failed to fetch invite status:", err);
      }
    }
    fetchInviteStatus();
  }, [vault]);

  const handleApprove = async () => {
    try {
      await api.vaults.release(vault.id, {
        idempotencyKey: crypto.randomUUID(),
      });
      await refreshVaults();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success("Funds released successfully!");
    } catch (err) {
      console.error("Release failed:", err);
      toast.error("Failed to release funds. Please try again.");
    }
  };

  const handleFund = async () => {
    if (user?.kycStatus !== KycStatus.VERIFIED) {
      toast.error("KYC Verification Required", {
        description:
          "You must complete KYC verification before you can fund projects.",
      });
      return;
    }

    try {
      await api.vaults.fund(vault.id, {
        paymentMethod: "bank",
        paymentDetails: {},
        idempotencyKey: crypto.randomUUID(),
      });
      await refreshVaults();
      toast.success("Project successfully funded!");
    } catch (err: any) {
      console.error("Funding failed:", err);
      toast.error(err.message || "Failed to fund vault.");
    }
  };

  const handleRefund = async () => {
    setShowRefundModal(true);
  };

  const submitRefundRequest = async () => {
    setRequestingRefund(true);
    try {
      await api.vaults.requestRefund(vault.id, {
        payoutMethod,
        payoutDetails,
      });
      toast.success("Refund request submitted for admin review.");
      setShowRefundModal(false);
      await refreshVaults();
    } catch (err: any) {
      console.error("Refund request failed:", err);
      toast.error(err.message || "Failed to submit refund request.");
    } finally {
      setRequestingRefund(false);
    }
  };

  const handleUpdateFreelancer = async (email: string) => {
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    setReassigningLoading(true);
    try {
      await api.vaults.updateFreelancer(vault.id, {
        freelancerEmail: email,
      });
      toast.success(`Project reassigned to ${email}`);
      setInviteEmail("");
      setReassigning(false);
      await refreshVaults();
    } catch (err: any) {
      console.error("Reassignment failed:", err);
      toast.error(err.message || "Failed to reassign project.");
    } finally {
      setReassigningLoading(false);
    }
  };
  const [expandedSubmissions, setExpandedSubmissions] = useState<string[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  // Auto-select latest submission on load
  useEffect(() => {
    if (vault?.submissions?.length > 0 && !selectedSubmissionId) {
      setSelectedSubmissionId(vault.submissions[0].id);
      setExpandedSubmissions([vault.submissions[0].id]);
    }
  }, [vault, selectedSubmissionId]);

  const toggleSubmission = (id: string) => {
    setSelectedSubmissionId(id);
    setExpandedSubmissions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <>
      <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* SUCCESS ALERT */}
          {showSuccess && (
            <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
              <Alert className="bg-emerald-500 border-emerald-600 text-white w-auto min-w-[300px] shadow-2xl">
                <CheckCircle className="h-4 w-4 text-white" />
                <AlertTitle className="text-sm font-bold">Success</AlertTitle>
                <AlertDescription>
                  Project approved and funds released.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* SECTION A: HEADER */}
          <header className="pt-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 font-bold tracking-wide bg-transparent border-none p-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-white tracking-tighter italic">
                    {vault.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 tracking-wide text-[10px] h-6 px-3 rounded-full font-bold"
                  >
                    {getVaultDerivedLabel(vault.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 font-bold tracking-widest">
                        Freelancer
                      </p>
                      <p className="text-xs text-white font-bold">
                        {vault.freelancerName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-500/50" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 font-bold tracking-widest">
                        Created
                      </p>
                      <p className="text-xs text-white font-bold">
                        {new Date(vault.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl min-w-[240px]">
                <p className="text-xs text-white/30 font-bold tracking-wide mb-1">
                  Total secured value
                </p>
                <p className="text-4xl font-bold text-white tracking-widest font-mono">
                  ${(vault.totalAmount || vault.amount || 0).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-emerald-500 font-bold tracking-wide">
                    Funds secured in escrow
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: SECTIONS B & C */}
            <div className="lg:col-span-2 space-y-8">
              {/* SECTION B: DELIVERABLES CHECKLIST */}
              <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <ListChecks className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white font-bold tracking-wide text-lg italic">
                        What was promised
                      </CardTitle>
                      <CardDescription className="text-white/30 font-bold tracking-wide text-[10px] mt-1">
                        Review the specific items the freelancer committed to
                        delivering
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {!vault.deliverables || vault.deliverables.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                      <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto" />
                      <p className="text-red-500 font-bold tracking-wide text-xs">
                        Error: no deliverables defined for this project
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {vault.deliverables.map((item: any, idx: number) => {
                        const activeSubmission = vault.submissions?.find(
                          (s: any) => s.id === selectedSubmissionId,
                        );

                        const deliverableStatus =
                          activeSubmission?.deliverableStatus?.find(
                            (d: any) =>
                              d.deliverableTitle === item.title ||
                              d.deliverableId === item.id,
                          );

                        const isIncluded = deliverableStatus?.included;

                        return (
                          <div
                            key={item.id || idx}
                            className={cn(
                              "p-6 transition-colors group",
                              isIncluded
                                ? "bg-emerald-500/3"
                                : "hover:bg-white/2",
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {isIncluded ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Square className="w-5 h-5 text-white/10 group-hover:text-white/20" />
                                )}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white tracking-tight italic">
                                      {item.title}
                                    </h4>
                                    {isIncluded && (
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-bold px-2 py-0">
                                        Included
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-white/40 leading-relaxed max-w-2xl mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {isIncluded && (
                                  <div className="space-y-3 pt-1">
                                    {deliverableStatus.notes && (
                                      <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] text-white/30 font-bold tracking-wide mb-1.5 flex items-center gap-1.5">
                                          <FileText className="w-3 h-3" />{" "}
                                          Freelancer notes
                                        </p>
                                        <p className="text-xs text-white/60 italic leading-relaxed">
                                          &quot;{deliverableStatus.notes}&quot;
                                        </p>
                                      </div>
                                    )}

                                    {deliverableStatus.files?.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {deliverableStatus.files.map(
                                          (file: any, fIdx: number) => (
                                            <a
                                              key={fIdx}
                                              href={file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg group/file transition-all"
                                            >
                                              <Download className="w-3 h-3 text-emerald-500" />
                                              <span className="text-[10px] text-white/70 font-bold group-hover/file:text-white">
                                                {file.filename ||
                                                  `File ${fIdx + 1}`}
                                              </span>
                                            </a>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {!isIncluded && activeSubmission && (
                                  <div className="flex items-center gap-2 opacity-30">
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                    <span className="text-[9px] font-bold tracking-widest text-amber-500">
                                      Missing from this submission
                                    </span>
                                  </div>
                                )}
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
              <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Zap className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <CardTitle className="text-white font-bold tracking-wide text-lg italic">
                        What was delivered
                      </CardTitle>
                      <CardDescription className="text-white/30 font-bold tracking-wide text-[10px] mt-1">
                        Timeline of work submitted by the freelancer
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!vault.submissions || vault.submissions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-white/20 font-bold tracking-wide text-[10px]">
                        No work submitted yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vault.submissions.map((sub: any, idx: number) => {
                        const isSelected = selectedSubmissionId === sub.id;
                        const isExpanded = expandedSubmissions.includes(sub.id);

                        return (
                          <div
                            key={sub.id}
                            onClick={() => toggleSubmission(sub.id)}
                            className={cn(
                              "relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer group overflow-hidden",
                              isSelected
                                ? "bg-emerald-500/5 border-emerald-500/20 ring-1 ring-emerald-500/20"
                                : "bg-white/1 border-white/5 hover:border-white/10 hover:bg-white/2",
                            )}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isSelected
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60",
                                  )}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold tracking-wide text-white/30 mb-0.5">
                                    {isSelected
                                      ? "Current review"
                                      : "Previous submission"}
                                  </p>
                                  <p className="text-sm font-bold text-white italic">
                                    {new Date(
                                      sub.submittedAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-bold px-3 border-none",
                                  isSelected
                                    ? "bg-emerald-500 text-black"
                                    : "bg-emerald-500/5 text-emerald-500",
                                )}
                              >
                                {sub.deliverableStatus?.filter(
                                  (d: any) => d.included,
                                ).length ||
                                  sub.deliverableIds?.length ||
                                  0}{" "}
                                of {vault.deliverables?.length || 0} claimed
                              </Badge>
                            </div>

                            {sub.notes && (
                              <p className="text-xs text-white/50 bg-black/40 p-4 rounded-xl border border-white/5 italic mb-4">
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
                                  <div className="pt-4 border-t border-white/5 space-y-3">
                                    <p className="text-[9px] font-bold tracking-wide text-white/20">
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
                                                ? "bg-emerald-500/5 border-emerald-500/10"
                                                : "bg-white/2 border-white/5 opacity-40",
                                            )}
                                          >
                                            <div className="flex items-center gap-2">
                                              {d.included ? (
                                                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                                              ) : (
                                                <Square className="w-3.5 h-3.5 text-white/10" />
                                              )}
                                              <span className="text-[10px] font-bold italic text-white/90">
                                                {d.deliverableTitle}
                                              </span>
                                            </div>
                                            {d.included && d.notes && (
                                              <p className="text-[10px] text-white/40 italic ml-5">
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

                            <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-emerald-500 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* RIGHT COLUMN: ACTION BUTTONS & SUMMARY */}
            <div className="space-y-6">
              {/* STATUS & ACTIONS */}
              <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl relative overflow-hidden group">
                <CardHeader>
                  <CardTitle className="text-white text-base font-bold tracking-wide italic flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Project controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Dialog
                      open={showApproveDialog}
                      onOpenChange={setShowApproveDialog}
                    >
                      <Button
                        asChild
                        disabled={
                          vault.status !== VaultStatus.FUNDED ||
                          !vault.submissions?.length ||
                          vault.isFrozen
                        }
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-xs italic"
                      >
                        <button onClick={() => setShowApproveDialog(true)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & release
                        </button>
                      </Button>
                      <DialogContent className="bg-[#0D0D0E] border-white/5 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold tracking-tight italic flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            Confirm release
                          </DialogTitle>
                          <DialogDescription className="text-white/40 text-sm leading-relaxed pt-2">
                            You are about to release{" "}
                            <span className="text-white font-bold">
                              $
                              {(
                                vault.totalAmount ||
                                vault.amount ||
                                0
                              ).toLocaleString()}
                            </span>{" "}
                            to the freelancer. This action is{" "}
                            <span className="text-emerald-500 font-bold tracking-widest text-[10px]">
                              irreversible
                            </span>{" "}
                            and marks the project as completed.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-2">
                            <p className="text-[10px] font-bold tracking-wide text-emerald-500/50">
                              Selected submission
                            </p>
                            <p className="text-sm font-bold text-white">
                              {new Date(
                                vault.submissions?.find(
                                  (s: any) => s.id === selectedSubmissionId,
                                )?.submittedAt || Date.now(),
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="gap-3 sm:gap-0">
                          <Button
                            variant="ghost"
                            onClick={() => setShowApproveDialog(false)}
                            className="hover:bg-white/5 text-white/40 hover:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              setShowApproveDialog(false);
                              handleApprove();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-black font-black"
                          >
                            Yes, Release Funds
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-xl active:scale-95 transition-all text-xs italic"
                      onClick={() =>
                        toast.info("Request Changes feature is coming soon!", {
                          description:
                            "Please use the chat or external communication to provide feedback for now.",
                        })
                      }
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Request changes
                    </Button>

                    <Link
                      href={`/client/disputes/create?vaultId=${vaultId}`}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-white/5 bg-white/2 hover:bg-white/5 text-white font-bold text-[10px] h-12 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        <Gavel className="w-4 h-4 mr-2 text-amber-500" />
                        Initiate dispute
                      </Button>
                    </Link>

                    {!vault.freelancerId && (
                      <Button
                        variant="outline"
                        onClick={() => setReassigning(true)}
                        className="w-full border-white/5 bg-white/2 hover:bg-white/5 text-white font-bold text-[10px] h-12 rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        <UserPlus className="w-4 h-4 mr-2 text-emerald-500" />
                        Reassign freelancer
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4">
                    <div className="flex justify-between items-center text-[10px] bg-white/2 p-4 rounded-xl border border-white/5">
                      <span className="text-white/40 font-bold tracking-wide">
                        Project logic:
                      </span>
                      <span className="text-emerald-500 font-bold tracking-wide italic">
                        Standard escrow
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* REASSIGNMENT PANEL - Shown when reassigning is true */}
              <AnimatePresence>
                {reassigning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="bg-[#0D0D0E] border-emerald-500/20 shadow-2xl">
                      <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-xs font-bold tracking-wide italic">
                          New assignment
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReassigning(false)}
                          className="h-6 w-6 p-0 hover:bg-white/5"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold tracking-wide text-white/30">
                            Freelancer email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="freelancer@example.com"
                              className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/10 focus:border-emerald-500/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleUpdateFreelancer(inviteEmail)}
                          disabled={!inviteEmail || reassigningLoading}
                          className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold tracking-wide text-[10px] h-10 rounded-lg"
                        >
                          Confirm reassignment
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* REFUND REQUEST MODAL */}
      <Sheet open={showRefundModal} onOpenChange={setShowRefundModal}>
        <SheetContent
          side="right"
          className="bg-[#0D0D0E] border-white/5 text-white w-[400px] sm:w-[540px]"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tighter text-white">
              Request refund
            </SheetTitle>
            <SheetDescription className="text-gray-400 font-bold tracking-wide">
              Since you don&apos;t have a payment account, refunds are processed
              manually by our team. Please provide your payout details.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold tracking-widest opacity-50">
                Payout method
              </Label>
              <Select
                value={payoutMethod}
                onValueChange={(v: any) => setPayoutMethod(v)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-[#161618] border-white/10 text-white">
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Debit/Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payoutMethod === "bank" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest opacity-50">
                    Bank name
                  </Label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                    value={payoutDetails.bankName}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        bankName: e.target.value,
                      })
                    }
                    placeholder="e.g. Chase, Zenith, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest opacity-50">
                    Account number / IBAN
                  </Label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                    value={payoutDetails.accountNumber}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest opacity-50">
                    Account holder name
                  </Label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                    value={payoutDetails.holderName}
                    onChange={(e) =>
                      setPayoutDetails({
                        ...payoutDetails,
                        holderName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-[10px] font-black">Note</AlertTitle>
                <AlertDescription className="text-[10px] font-bold">
                  Our team will process this within 1-3 business days. Funds
                  will be returned minus any platform processing fees.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold tracking-widest"
                onClick={submitRefundRequest}
                disabled={requestingRefund}
              >
                {requestingRefund ? "Submitting..." : "Submit Refund Request"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
