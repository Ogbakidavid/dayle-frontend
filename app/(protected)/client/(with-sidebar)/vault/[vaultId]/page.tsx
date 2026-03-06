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
  TransactionStatus,
  LedgerEntryType,
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

  const hasSettlementIssue = useMemo(() => {
    return (
      vault?.status === VaultStatus.DRAFT &&
      vault?.ledgerEntries?.some(
        (entry: any) =>
          entry.status === TransactionStatus.CONFIRMED &&
          entry.type === LedgerEntryType.DEPOSIT,
      )
    );
  }, [vault]);

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
      <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-emerald-500/30 pb-20">
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

          {/* SETTLEMENT ISSUE ALERT */}
          {hasSettlementIssue && (
            <Alert
              variant="destructive"
              className="bg-red-50 border-red-200 text-red-900 shadow-xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-lg font-black tracking-tight italic flex items-center gap-2">
                Settlement Issue Detected
              </AlertTitle>
              <AlertDescription className="text-sm font-bold mt-2 leading-relaxed italic">
                Your fiat payment of{" "}
                <span className="text-red-600 underline">
                  ${vault.totalAmount.toLocaleString()}
                </span>{" "}
                was confirmed, but we encountered an error while depositing it
                into the escrow contract.
                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFund}
                    className="bg-white border-red-200 text-red-600 hover:bg-red-50 font-black italic shadow-sm"
                  >
                    Retry Settlement
                  </Button>
                  <Link
                    href={`mailto:support@dayle.fi?subject=Settlement Issue: ${vault.id}`}
                    className="text-xs text-red-600 underline font-bold uppercase tracking-widest italic"
                  >
                    Contact Support
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* SECTION A: HEADER */}
          <header className="pt-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6 font-bold tracking-wide bg-transparent border-none p-0 cursor-pointer italic"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tighter italic">
                    {vault.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 tracking-wide text-[10px] h-6 px-3 rounded-full font-bold shadow-sm shadow-emerald-500/5"
                  >
                    {getVaultDerivedLabel(vault.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                        Freelancer
                      </p>
                      <p className="text-xs text-slate-900 font-bold italic">
                        {vault.freelancerName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4 text-emerald-600/50" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                        Created
                      </p>
                      <p className="text-xs text-slate-900 font-bold italic">
                        {new Date(vault.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xl min-w-[240px]">
                <p className="text-xs text-slate-600 font-bold tracking-wide mb-1 uppercase">
                  Total secured value
                </p>
                <p className="text-4xl font-bold text-slate-900 tracking-widest italic">
                  ${(vault.totalAmount || vault.amount || 0).toLocaleString()}
                </p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      vault.status === VaultStatus.FUNDED
                        ? "bg-emerald-500 animate-pulse shadow-emerald-500/50"
                        : "bg-slate-300 shadow-slate-300/30",
                    )}
                  />
                  <p
                    className={cn(
                      "text-[10px] font-bold tracking-wide italic",
                      vault.status === VaultStatus.FUNDED
                        ? "text-emerald-600"
                        : "text-slate-400",
                    )}
                  >
                    {vault.status === VaultStatus.FUNDED
                      ? "Funds secured in escrow"
                      : "Deposit pending simulation"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: SECTIONS B & C */}
            <div className="lg:col-span-2 space-y-8">
              {/* SECTION B: DELIVERABLES CHECKLIST */}
              <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm">
                      <ListChecks className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 font-bold tracking-wide text-lg italic">
                        What was promised
                      </CardTitle>
                      <CardDescription className="text-slate-600 font-bold tracking-wide text-[10px] mt-1 italic">
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
                    <div className="divide-y divide-slate-100">
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
                                ? "bg-emerald-50/50"
                                : "hover:bg-slate-50",
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {isIncluded ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-600 shadow-sm shadow-emerald-500/20" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-200 group-hover:text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 tracking-tight italic">
                                      {item.title}
                                    </h4>
                                    {isIncluded && (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[8px] font-bold px-2 py-0 shadow-sm italic">
                                        Included
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl mt-1 font-bold">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {isIncluded && (
                                  <div className="space-y-3 pt-1">
                                    {deliverableStatus.notes && (
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <p className="text-[9px] text-slate-600 font-bold tracking-wide mb-1.5 flex items-center gap-1.5 uppercase">
                                          <FileText className="w-3 h-3" />{" "}
                                          Freelancer notes
                                        </p>
                                        <p className="text-xs text-slate-600 italic leading-relaxed font-bold">
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
                                              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg group/file transition-all shadow-sm"
                                            >
                                              <Download className="w-3 h-3 text-emerald-600" />
                                              <span className="text-[10px] text-emerald-700 font-bold group-hover/file:text-emerald-900 italic">
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
                                  <div className="flex items-center gap-2 opacity-60">
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                    <span className="text-[9px] font-bold tracking-widest text-amber-600 uppercase">
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
              <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 font-bold tracking-wide text-lg italic">
                        What was delivered
                      </CardTitle>
                      <CardDescription className="text-slate-600 font-bold tracking-wide text-[10px] mt-1 italic">
                        Timeline of work submitted by the freelancer
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!vault.submissions || vault.submissions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-300 font-bold tracking-wide text-[10px] uppercase">
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
                              "relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer group overflow-hidden shadow-sm",
                              isSelected
                                ? "bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500/10"
                                : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                            )}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-xl transition-colors shadow-sm",
                                    isSelected
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-white text-slate-600 group-hover:text-slate-600 border border-slate-200",
                                  )}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold tracking-wide text-slate-600 mb-0.5 uppercase">
                                    {isSelected
                                      ? "Current review"
                                      : "Previous submission"}
                                  </p>
                                  <p className="text-sm font-bold text-slate-900 italic">
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
                                  "text-[9px] font-bold px-3 border-none shadow-sm",
                                  isSelected
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-100 text-emerald-700",
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
                              <p className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200 italic mb-4 font-bold shadow-sm">
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
                                    <p className="text-[9px] font-bold tracking-wide text-slate-600 uppercase">
                                      Included deliverables:
                                    </p>
                                    <div className="space-y-2">
                                      {(sub.deliverableStatus || []).map(
                                        (d: any, dIdx: number) => (
                                          <div
                                            key={dIdx}
                                            className={cn(
                                              "p-3 rounded-lg border flex flex-col gap-2 transition-all duration-300 shadow-sm",
                                              d.included
                                                ? "bg-emerald-50 border-emerald-100"
                                                : "bg-slate-50/50 border-slate-100 opacity-40",
                                            )}
                                          >
                                            <div className="flex items-center gap-2">
                                              {d.included ? (
                                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shadow-sm shadow-emerald-500/20" />
                                              ) : (
                                                <Square className="w-3.5 h-3.5 text-slate-200" />
                                              )}
                                              <span className="text-[10px] font-bold italic text-slate-900">
                                                {d.deliverableTitle}
                                              </span>
                                            </div>
                                            {d.included && d.notes && (
                                              <p className="text-[10px] text-slate-600 italic ml-5 font-bold">
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

                            <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-emerald-600 tracking-wide opacity-0 group-hover:opacity-100 transition-opacity italic">
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
              <Card className="bg-white border-slate-200 shadow-xl relative overflow-hidden group">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base font-bold tracking-wide italic flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Project controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    {vault.status === VaultStatus.DRAFT && (
                      <Link href={`/checkout/${vaultId}`} className="w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-xs italic">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Fund project
                        </Button>
                      </Link>
                    )}

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
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-xs italic"
                      >
                        <button onClick={() => setShowApproveDialog(true)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & release
                        </button>
                      </Button>
                      <DialogContent className="bg-white border-slate-200 text-slate-900 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold tracking-tight italic flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            Confirm release
                          </DialogTitle>
                          <DialogDescription className="text-slate-600 text-sm leading-relaxed pt-2 font-bold">
                            You are about to release{" "}
                            <span className="text-slate-900 font-bold">
                              $
                              {(
                                vault.totalAmount ||
                                vault.amount ||
                                0
                              ).toLocaleString()}
                            </span>{" "}
                            to the freelancer. This action is{" "}
                            <span className="text-emerald-700 font-bold tracking-widest text-[10px] uppercase">
                              irreversible
                            </span>{" "}
                            and marks the project as completed.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-2 shadow-sm">
                            <p className="text-[10px] font-bold tracking-wide text-emerald-600/50 uppercase">
                              Selected submission
                            </p>
                            <p className="text-sm font-bold text-slate-900 italic">
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
                            className="hover:bg-slate-50 text-slate-600 font-bold hover:text-slate-900 italic"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              setShowApproveDialog(false);
                              handleApprove();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black italic shadow-md shadow-emerald-600/10"
                          >
                            Yes, Release Funds
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 rounded-xl active:scale-95 transition-all text-xs italic shadow-sm"
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
                        className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] h-12 rounded-xl transition-all shadow-sm active:scale-95 italic"
                      >
                        <Gavel className="w-4 h-4 mr-2 text-amber-600" />
                        Initiate dispute
                      </Button>
                    </Link>

                    {!vault.freelancerId && (
                      <Button
                        variant="outline"
                        onClick={() => setReassigning(true)}
                        className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] h-12 rounded-xl transition-all shadow-sm active:scale-95 italic"
                      >
                        <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
                        Reassign freelancer
                      </Button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex justify-between items-center text-[10px] bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-slate-600 font-bold tracking-wide uppercase">
                        Project logic:
                      </span>
                      <span className="text-emerald-700 font-bold tracking-wide italic uppercase">
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
                    <Card className="bg-white border-emerald-500/20 shadow-xl ring-1 ring-emerald-500/10">
                      <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-slate-900 text-xs font-bold tracking-wide italic uppercase">
                          New assignment
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReassigning(false)}
                          className="h-6 w-6 p-0 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-bold tracking-wide text-slate-600 uppercase">
                            Freelancer email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="freelancer@example.com"
                              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 outline-none transition-all shadow-sm italic font-bold"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleUpdateFreelancer(inviteEmail)}
                          disabled={!inviteEmail || reassigningLoading}
                          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold tracking-wide text-[10px] h-10 rounded-lg shadow-md shadow-emerald-600/10 italic"
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
          className="bg-white border-slate-200 text-slate-900 w-[400px] sm:w-[540px] shadow-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tighter text-slate-900 italic">
              Request refund
            </SheetTitle>
            <SheetDescription className="text-slate-600 font-bold tracking-wide italic">
              Since you don&apos;t have a payment account, refunds are processed
              manually by our team. Please provide your payout details.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                Payout method
              </Label>
              <Select
                value={payoutMethod}
                onValueChange={(v: any) => setPayoutMethod(v)}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900 font-bold shadow-sm italic">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                  <SelectItem value="bank" className="font-bold italic">
                    Bank Transfer
                  </SelectItem>
                  <SelectItem value="card" className="font-bold italic">
                    Debit/Credit Card
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payoutMethod === "bank" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                    Bank name
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold italic placeholder:text-slate-300"
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
                  <Label className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                    Account number / IBAN
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold italic"
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
                  <Label className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                    Account holder name
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold italic"
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
              <Alert className="bg-amber-50 border-amber-100 text-amber-700 shadow-sm shadow-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest">
                  Note
                </AlertTitle>
                <AlertDescription className="text-[10px] font-bold italic leading-relaxed">
                  Our team will process this within 1-3 business days. Funds
                  will be returned minus any platform processing fees.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold tracking-widest h-11 rounded-xl shadow-md shadow-emerald-600/10 italic"
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
