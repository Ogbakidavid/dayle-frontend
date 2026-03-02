"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
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
  SheetClose,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVault } from "@/lib/store/vault-context";
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
          "You must complete KYC verification before you can fund vaults.",
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
      toast.success("Vault successfully funded!");
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
    setReassigning(true);
    try {
      await api.vaults.updateFreelancer(vault.id, {
        freelancerEmail: email,
      });
      toast.success(`Vault reassigned to ${email}`);
      setInviteEmail("");
      await refreshVaults();
    } catch (err: any) {
      console.error("Reassignment failed:", err);
      toast.error(err.message || "Failed to reassign vault.");
    } finally {
      setReassigning(false);
    }
  };

  // Check if eligible for dispute
  const anyEligibleForDispute = useMemo(() => {
    return (
      vault?.status === VaultStatus.FUNDED ||
      vault?.status === VaultStatus.DISPUTED
    );
  }, [vault]);

  // Aggregate all submitted deliverables for the "Contract Documents" section
  const submittedDeliverables = useMemo(() => {
    return [];
  }, []);

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

  return (
    <>
      <div className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          {/* SUCCESS ALERT */}
          {showSuccess && (
            <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
              <Alert className="bg-emerald-500 border-emerald-600 text-white w-auto min-w-[300px] shadow-2xl">
                <CheckCircle className="h-4 w-4 text-white" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Vault approved and funds released.
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
                  <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">
                    {vault.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px]"
                  >
                    {getVaultDerivedLabel(vault.status)}
                  </Badge>
                  {vault.vaultAddress && (
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                        On-chain Escrow Verified
                      </span>
                      <button
                        onClick={() => {
                          if (vault.vaultAddress) {
                            navigator.clipboard.writeText(vault.vaultAddress);
                            toast.success("Vault Reference ID copied");
                          }
                        }}
                        className="hover:text-white transition-colors"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                  {vault.status === VaultStatus.DRAFT && (
                    <Button
                      size="sm"
                      className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide text-[10px] h-7 px-3 transition-all disabled:opacity-50 disabled:grayscale"
                      onClick={() => router.push(`/checkout/${vaultId}`)}
                      disabled={vault.isFrozen}
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
                <p className="text-3xl font-bold uppercase text-white tracking-tight font-mono">
                  ${(vault.totalAmount || vault.amount).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-500 font-bold uppercase tracking-tight mt-1">
                  ${(vault.paidAmount || 0).toLocaleString()} Released
                </p>
              </div>
            </div>
          </header>

          {/* FROZEN VAULT BANNER */}
          {vault.isFrozen && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 animate-in fade-in slide-in-from-top-4">
              <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-1 grow">
                <h3 className="text-lg font-black text-red-500 uppercase tracking-wide">
                  Security Freeze Active
                </h3>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  This vault has been automatically frozen due to a detected
                  discrepancy. All actions (funding, submissions, reviews) are
                  temporarily paused.
                </p>
                {vault.frozenReason && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-red-500/20 text-xs font-mono text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    REASON: {vault.frozenReason}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-bold uppercase tracking-widest text-[10px]"
                asChild
              >
                <a href="mailto:support@dayle.com?subject=Frozen Vault Appeal">
                  Contact Support
                </a>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black!">
            {/* LEFT COLUMN: VAULT OVERVIEW */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-[#0D0D0E] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white font-bold uppercase tracking-wide">
                    Vault Overview
                  </CardTitle>
                  <CardDescription className="text-gray-400 font-bold uppercase tracking-wide pb-3">
                    Single-release escrow contract details and actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="group relative border border-white/5 rounded-xl p-5 bg-white/2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white uppercase tracking-wide truncate">
                            {vault.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div
                              className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all",
                                vault.status === VaultStatus.RELEASED
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : vault.status === VaultStatus.REFUNDED
                                    ? "bg-neutral-500/10 border-neutral-500/20 text-neutral-400"
                                    : vault.status === VaultStatus.DISPUTED
                                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-500",
                              )}
                            >
                              <span className="uppercase tracking-widest text-[9px] font-bold">
                                Status: {getVaultDerivedLabel(vault.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-black text-white font-mono">
                            $
                            {(
                              vault.totalAmount || vault.amount
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                          {vault.status === VaultStatus.FUNDED &&
                            vault.freelancerId && (
                              <Button
                                size="sm"
                                onClick={handleApprove}
                                disabled={vault.isFrozen}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wide text-[11px] h-8 transition-all disabled:opacity-50 disabled:grayscale w-full"
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve &
                                Release
                              </Button>
                            )}

                          {/* Refund Button: Shown if not released AND (no freelancer OR disputed) */}
                          {vault.status !== VaultStatus.RELEASED &&
                            (!vault.freelancerId ||
                              vault.status === VaultStatus.DISPUTED) && (
                              <Button
                                size="sm"
                                onClick={handleRefund}
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 font-bold uppercase tracking-wide text-[11px] h-8 border border-red-500/20 transition-all font-['Poppins',sans-serif] w-full"
                              >
                                <RefreshCcw className="w-3 h-3 mr-1" /> Request
                                Refund
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dispute CTA */}
              <Card
                className={cn(
                  "border-white/5 bg-[#0D0D0E]",
                  !anyEligibleForDispute && "opacity-70",
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
                      : "No eligible case files for this vault right now. Case files are only allowed for specific reason codes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] transition-all"
                    disabled={!anyEligibleForDispute}
                    asChild={anyEligibleForDispute}
                  >
                    {
                      (anyEligibleForDispute ? (
                        <Link
                          href={`/client/disputes/create?vaultId=${vaultId}`}
                        >
                          Open a Case
                        </Link>
                      ) : (
                        <Link href="/client/disputes">Go to disputes</Link>
                      )) as any
                    }
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-[#0D0D0E] border border-white/5 rounded-xl p-6 space-y-4">
                {vault.status === VaultStatus.FUNDED && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                      Freelancer Assignment
                    </h4>
                    <Card
                      className={cn(
                        "bg-white/2 border-white/10 transition-colors",
                        latestInvite?.status === "DECLINED" &&
                          "border-red-500/30 bg-red-500/5",
                      )}
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              latestInvite?.status === "DECLINED"
                                ? "bg-red-500/10"
                                : "bg-amber-500/10",
                            )}
                          >
                            <UserPlus
                              className={cn(
                                "w-5 h-5",
                                latestInvite?.status === "DECLINED"
                                  ? "text-red-500"
                                  : "text-amber-500",
                              )}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-white uppercase tracking-tighter">
                                {latestInvite?.status === "DECLINED"
                                  ? "Freelancer Declined Invitation"
                                  : !vault.freelancerId
                                    ? "Awaiting Freelancer Assignment"
                                    : "Reassign Freelancer"}
                              </p>
                              {latestInvite?.status === "DECLINED" && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] uppercase h-4 px-1"
                                >
                                  Declined
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-normal">
                              {latestInvite?.status === "DECLINED" ? (
                                <>
                                  The previous freelancer{" "}
                                  <span className="text-white">
                                    ({latestInvite.email})
                                  </span>{" "}
                                  declined this invitation.
                                </>
                              ) : !vault.freelancerId ? (
                                "Enter a freelancer's email address to send them an invitation to this vault."
                              ) : (
                                "Assign this project to someone else? This will update the secure escrow account to the new freelancer once they accept."
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div>
                            <Label
                              htmlFor="invite-email"
                              className="text-white! text-[10px] font-bold uppercase tracking-widest mb-2 block opacity-50"
                            >
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
                                className="w-full bg-black/60 border border-white/10 rounded-lg px-10 py-2.5 text-white text-sm placeholder:text-gray-400 focus:border-emerald-500/50 focus:outline-none transition-all font-bold"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={() => handleUpdateFreelancer(inviteEmail)}
                            disabled={reassigning || !inviteEmail}
                            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide text-xs h-10 transition-all font-['Poppins',sans-serif]"
                          >
                            {reassigning
                              ? "Updating..."
                              : !vault.freelancerId
                                ? "Send Invitation"
                                : "Reassign Project"}
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
                      submittedDeliverables.map((doc: any) => (
                        <Button
                          key={doc.id}
                          variant="ghost"
                          onClick={() => {
                            toast.info(`Opening ${doc.name}`);
                          }}
                          className="w-full justify-between items-center text-gray-500 hover:text-white h-auto py-3 px-4 border border-white/5 bg-white/2 hover:bg-white/5 transition-all group font-['Poppins',sans-serif]"
                        >
                          <div className="flex items-center min-w-0 mr-3">
                            {doc.type === "link" ? (
                              <ExternalLink className="w-4 h-4 mr-3 shrink-0 text-emerald-500/70" />
                            ) : (
                              <Download className="w-4 h-4 mr-3 shrink-0" />
                            )}
                            <div className="text-left min-w-0">
                              <span className="block text-[11px] font-bold text-white uppercase truncate">
                                {doc.name}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Button>
                      ))
                    ) : (
                      <div className="p-4 border border-dashed border-white/5 rounded-lg text-center">
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                          No deliverables submitted yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-white">
              Request Refund
            </SheetTitle>
            <SheetDescription className="text-gray-400 font-bold uppercase tracking-wide">
              Since you don&apos;t have a payment account, refunds are processed
              manually by our team. Please provide your payout details.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest opacity-50">
                Payout Method
              </Label>
              <Select
                value={payoutMethod}
                onValueChange={(v: any) => setPayoutMethod(v)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold uppercase">
                  <SelectValue placeholder="Select Method" />
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
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Bank Name
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
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Account Number / IBAN
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
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    Account Holder Name
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
                <AlertTitle className="text-[10px] font-black uppercase">
                  Note
                </AlertTitle>
                <AlertDescription className="text-[10px] font-bold uppercase">
                  Our team will process this within 1-3 business days. Funds
                  will be returned minus any platform processing fees.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-widest"
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
