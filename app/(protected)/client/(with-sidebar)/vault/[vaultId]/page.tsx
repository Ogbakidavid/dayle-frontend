"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  FileIcon,
  LinkIcon,
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
  Building2,
  Fingerprint,
} from "lucide-react";
import { DayleLogo } from "@/components/shared/DayleLogo";
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
import { calculateDayleFee } from "@/lib/utils/fee";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { DotLoader } from "@/components/ui/dot-loader";


function BankInfoElement({ label, value, icon, copyable, highlight }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-2xl border transition-all duration-300",
      highlight 
        ? "bg-emerald-50 border-emerald-100 shadow-sm" 
        : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          highlight ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 border border-slate-100"
        )}>
          {icon}
        </div>
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-colors",
              copied ? "bg-emerald-500 text-white" : "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50"
            )}
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        )}
      </div>
      <div className="space-y-1">
        <p className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          highlight ? "text-emerald-600/60" : "text-slate-400"
        )}>
          {label}
        </p>
        <p className={cn(
          "text-sm font-black tracking-tight leading-tight break-all",
          highlight ? "text-emerald-700" : "text-slate-900"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ClientVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vaultId = params.vaultId as string;
  const { user } = useUser();
  const { vaults, loading: vaultsLoading, refreshVaults } = useVault();

  const isSuccessReturn = searchParams.get("success") === "true";
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

  // Onramp State
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundingStep, setFundingStep] = useState<"confirm" | "instructions">("confirm");
  const [rateData, setRateData] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [initiatingRamp, setInitiatingRamp] = useState(false);
  const [mockingDeposit, setMockingDeposit] = useState(false);

  // Refund Form State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "card">("bank");
  const [payoutDetails, setPayoutDetails] = useState({
    bankName: "",
    accountNumber: "",
    holderName: "",
    routingNumber: "",
  });

  // Request Changes State
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  // Fetch active dispute if status is DISPUTED
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  useEffect(() => {
    async function fetchActiveDispute() {
      if (!vault || vault.status !== VaultStatus.DISPUTED) return;
      try {
        const disputes = await api.disputes.listForVault(vault.id);
        if (disputes && disputes.length > 0) {
          // Find active or use first available
          const active = disputes.find((d: any) => d.status !== "RESOLVED" && d.status !== "CLOSED");
          setActiveDisputeId(active ? active.id : disputes[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch active dispute:", err);
      }
    }
    fetchActiveDispute();
  }, [vault]);

  // Poll for status update after returning from checkout or while in AWAITING_PAYMENT
  useEffect(() => {
    const isProcessing = vault?.status === VaultStatus.PROCESSING_PAYMENT;
    const isAwaiting = vault?.status === VaultStatus.AWAITING_PAYMENT;

    if ((isSuccessReturn && vault?.status === VaultStatus.DRAFT) || isProcessing || isAwaiting) {
      const intervalId = setInterval(() => {
        refreshVaults({ isBackground: true });
      }, 60000); // Poll every 60 seconds (sockets handle real-time)
      
      return () => clearInterval(intervalId);
    } else if (isSuccessReturn && vault?.status === VaultStatus.FUNDED) {
      // Clear the query param so we don't keep polling or showing success unnecessarily on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      toast.success("Deposit confirmed!", { description: "Funds are now secured in the settlement vault." });
    }
  }, [isSuccessReturn, vault?.status, refreshVaults]);

  // Rate Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showFundModal && fundingStep === "confirm" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showFundModal, fundingStep, countdown]);

  const fetchRate = async () => {
    if (!user || !vault) return;
    setLoadingRate(true);
    try {
      const currency = user.country === "Kenya" ? "KES" : "NGN";
      const budgetUSD = parseFloat(vault.formattedTotalAmount);
      const data = await api.rates.getTransactionRate(currency, budgetUSD, vault.id, "funding");
      setRateData(data);
      setCountdown(600);
    } catch (err: any) {
      toast.error("Failed to fetch current rate");
    } finally {
      setLoadingRate(false);
    }
  };

  const handleApprove = async () => {
    const isTestnet = process.env.NEXT_PUBLIC_TESTNET_MODE === "true";
    if (user?.kycStatus !== KycStatus.VERIFIED && !isTestnet) {
      toast.error("Identity Verification Required", {
        description: "You must complete full identity verification (Tier 2) to release funds.",
        action: {
          label: "Verify Now",
          onClick: () => router.push("/onboarding/kyc?returnTo=" + encodeURIComponent(window.location.pathname)),
        }
      });
      return;
    }
    setShowApproveDialog(false);
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
    if (!user?.paymentAccountReady) {
      toast.error("Onboarding Required", {
        description:
          "Please complete your BVN verification (Tier 1) before you can fund projects.",
        action: {
          label: "Verify Now",
          onClick: () => router.push("/onboarding/identity?returnTo=" + encodeURIComponent(window.location.pathname)),
        }
      });
      return;
    }

    if (vault.status === VaultStatus.AWAITING_PAYMENT) {
      setFundingStep("instructions");
      setShowFundModal(true);
      return;
    }

    setFundingStep("confirm");
    setShowFundModal(true);
    fetchRate();
  };

  const proceedToPayment = async () => {
    if (!rateData) return;
    setInitiatingRamp(true);
    try {
      const response = await api.vaults.fund(vault.id, {
        paymentMethod: "bank",
        currency: rateData.currency,
        rateKey: rateData.rateKey, // Assuming backend returns rateKey from transaction-rate API
        amount: rateData.convertedAmount,
        idempotencyKey: crypto.randomUUID(),
      });

      // If bank info returned directly
      if (response.accountNumber) {
        await refreshVaults();
        setFundingStep("instructions");
      } else if (response.redirectUrl) {
        window.location.href = response.redirectUrl;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setInitiatingRamp(false);
    }
  };

  const handleRefund = async () => {
    setShowRefundModal(true);
  };

  const submitRefundRequest = async () => {
    const isTestnet = process.env.NEXT_PUBLIC_TESTNET_MODE === "true";
    if (user?.kycStatus !== KycStatus.VERIFIED && !isTestnet) {
      toast.error("Identity Verification Required", {
        description:
          "You must complete full identity verification (Tier 2) before you can request a refund.",
      });
      return;
    }
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

  const handleMockDeposit = async () => {
    if (!vault) return;
    setMockingDeposit(true);
    try {
      await api.vaults.mockDeposit(vault.id, {
        amount: vault.partnaFromAmount,
        accountName: vault.partnaAccountName || user?.name
      });
      toast.success("Mock deposit triggered!", { 
        description: "The payment should be confirmed shortly. Please wait a few moments for the vault to update." 
      });
      // Start polling immediately
      refreshVaults();
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger mock deposit");
    } finally {
      setMockingDeposit(false);
    }
  };  const handleRequestChanges = async () => {
    if (!reason.trim()) {
      toast.error("Reason Required", {
        description: "Please provide a reason for the requested changes.",
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await api.vaults.updateStatus(vaultId, {
        status: VaultStatus.CHANGES_REQUESTED,
        reason: reason,
      });
      toast.success("Changes Requested", {
        description: "The freelancer has been notified of your requested changes.",
      });
      setReason("");
      setShowReasonModal(false);
      await refreshVaults();
    } catch (err: any) {
      toast.error("Action Failed", {
        description: err.message || "Failed to request changes. Please try again.",
      });
    } finally {
      setIsUpdatingStatus(false);
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

  const handleDownload = async (file: { url: string; key?: string; name?: string; filename?: string }) => {
    try {
      const isS3 = file.key || file.url?.includes('s3.amazonaws.com') || file.url?.includes('digitaloceanspaces.com');
      
      if (!isS3) {
        window.open(file.url, '_blank');
        return;
      }

      const key = file.key || file.url.split('/').pop()?.split('?')[0];
      if (!key) {
        window.open(file.url, '_blank');
        return;
      }

      const { url: presignedUrl } = await api.uploads.getDownloadUrl(key);
      window.open(presignedUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to generate secure download link');
    }
  };

  if (vaultsLoading || !vault) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex items-center justify-center h-24 w-24">
          {/* Pulsating background ring */}
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
          {/* Main Logo with pulse effect */}
          <div className="relative animate-pulse">
            <DayleLogo className="w-12 h-12 text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white text-slate-600 font-sans selection:bg-emerald-500/30 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
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
              <AlertTitle className="text-lg font-black tracking-tight  flex items-center gap-2">
                Settlement Issue Detected
              </AlertTitle>
              <AlertDescription className="text-sm font-bold mt-2 leading-relaxed ">
                Your fiat payment of{" "}
                <span className="text-red-600 underline">
                  {vault.formattedTotalAmount || "0.00"}
                </span>{" "}
                was confirmed, but we encountered an error while updating the
                project vault.
                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFund}
                    className="bg-white border-red-200 text-red-600 hover:bg-red-50 font-black  shadow-sm"
                  >
                    Retry Settlement
                  </Button>
                  <Link
                    href={`mailto:support@dayle.fi?subject=Settlement Issue: ${vault.id}`}
                    className="text-sm text-red-600 underline font-bold uppercase st "
                  >
                    Contact Support
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* BANK INSTRUCTIONS INDICATOR (AWAITING PAYMENT) */}
          {vault.status === VaultStatus.AWAITING_PAYMENT && (
            <div className="pt-8 flex justify-end">
              <div className="inline-flex items-center gap-4 p-4 pr-8 bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5 overflow-hidden border-l-4 border-l-emerald-500">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none">
                    Transfer Pending
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold leading-tight">
                    Securing funds via bank transfer...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION A: HEADER */}
          <header className="pt-8">
            <button
              onClick={() => router.push("/client")}
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6 font-bold  bg-transparent border-none p-0 cursor-pointer "
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 tracking-tighter wrap-break-word">
                    {vault.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 px-3 rounded-full font-bold shadow-sm",
                      vault.status === VaultStatus.PROCESSING_PAYMENT 
                        ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}
                  >
                    {isSuccessReturn && vault.status === VaultStatus.DRAFT 
                      ? "CONFIRMING DEPOSIT" 
                      : getVaultDerivedLabel(vault.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                        Freelancer
                      </p>
                      <p className="text-xs sm:text-sm text-slate-900 font-bold ">
                        {vault.freelancerName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600/50" />
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                        Created
                      </p>
                      <p className="text-xs sm:text-sm text-slate-900 font-bold ">
                        {new Date(vault.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xl min-w-0 sm:min-w-[240px]">
                <p className="text-xs sm:text-sm text-slate-600 font-bold mb-1 uppercase tracking-wider">
                  Total secured value
                </p>
                <CurrencyEstimate 
                  usdAmount={Number(vault.formattedTotalAmount || "0.00")} 
                  className="text-slate-900 text-2xl sm:text-4xl font-bold"
                />
                <div className="mt-2 flex items-center justify-start md:justify-end gap-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-sm",
                      (vault.status === VaultStatus.FUNDED || 
                       vault.status === VaultStatus.CHANGES_REQUESTED || 
                       vault.status === VaultStatus.RELEASE_REQUESTED)
                        ? "bg-emerald-500 animate-pulse shadow-emerald-500/50"
                      : vault.status === VaultStatus.DISPUTED
                        ? "bg-amber-500 animate-pulse shadow-amber-500/50"
                      : vault.status === VaultStatus.RELEASED
                        ? "bg-blue-500 shadow-blue-500/30"
                      : vault.status === VaultStatus.REFUNDED
                        ? "bg-slate-400 shadow-slate-400/30"
                      : isSuccessReturn && vault.status === VaultStatus.DRAFT
                        ? "bg-amber-500 animate-pulse shadow-amber-500/50"
                      : "bg-slate-300 shadow-slate-300/30",
                    )}
                  />
                  <p
                    className={cn(
                      "text-[10px] sm:text-xs font-bold",
                      (vault.status === VaultStatus.FUNDED || 
                       vault.status === VaultStatus.CHANGES_REQUESTED || 
                       vault.status === VaultStatus.RELEASE_REQUESTED)
                        ? "text-emerald-600"
                      : vault.status === VaultStatus.DISPUTED
                        ? "text-amber-600"
                      : vault.status === VaultStatus.RELEASED
                        ? "text-blue-600"
                      : vault.status === VaultStatus.REFUNDED
                        ? "text-slate-500"
                      : isSuccessReturn && vault.status === VaultStatus.DRAFT
                        ? "text-amber-600"
                      : "text-slate-400",
                    )}
                  >
                    {(vault.status === VaultStatus.FUNDED || 
                      vault.status === VaultStatus.CHANGES_REQUESTED || 
                      vault.status === VaultStatus.RELEASE_REQUESTED)
                      ? "Funds secured in vault"
                    : vault.status === VaultStatus.DISPUTED
                      ? "Funds locked in resolution"
                    : vault.status === VaultStatus.RELEASED
                      ? "Payment settled to freelancer"
                    : vault.status === VaultStatus.REFUNDED
                      ? "Funds returned to client"
                    : vault.status === VaultStatus.AWAITING_PAYMENT
                      ? "Awaiting bank transfer"
                    : vault.status === VaultStatus.PROCESSING_PAYMENT
                      ? "Verifying payment result..."
                    : isSuccessReturn && vault.status === VaultStatus.DRAFT
                      ? "Confirming secure deposit..."
                    : "Awaiting deposit"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* SECTION: FEE BREAKDOWN (ONLY IF FUNDED OR RELEASED) */}
          {(vault.status === VaultStatus.FUNDED || 
            vault.status === VaultStatus.CHANGES_REQUESTED || 
            vault.status === VaultStatus.RELEASE_REQUESTED || 
            vault.status === VaultStatus.RELEASED) && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-emerald-50/30 border-emerald-100 shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-emerald-100/50 border border-emerald-200">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Fee Breakdown</h3>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wider">Transparent costs</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold">Settlement ({calculateDayleFee(parseFloat(vault.formattedTotalAmount)).settlementFeePercent}%)</p>
                          <CurrencyEstimate 
                            usdAmount={(parseFloat(vault.formattedTotalAmount) * calculateDayleFee(parseFloat(vault.formattedTotalAmount)).settlementFeePercent) / 100} 
                            className="text-slate-900 text-xs sm:text-sm font-bold"
                          />
                        </div>
                        <div className="text-left sm:text-right border-l border-emerald-200 pl-4 sm:pl-6 ml-auto sm:ml-0">
                          <p className="text-[8px] sm:text-[10px] font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-emerald-500">Total Secured</p>
                          <CurrencyEstimate 
                            usdAmount={parseFloat(vault.formattedTotalAmount)} 
                            className="text-emerald-700 text-base sm:text-lg font-black"
                          />
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* LEFT COLUMN: SECTIONS B & C */}
            <div className="xl:col-span-2 space-y-8">
              {/* SECTION B: DELIVERABLES CHECKLIST */}
              <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm">
                      <ListChecks className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 font-bold  text-lg ">
                        What was promised
                      </CardTitle>
                      <CardDescription className="text-slate-600 font-bold mt-1 ">
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
                      <p className="text-red-500 font-bold  text-sm">
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
                              "p-4 sm:p-6 transition-colors group",
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
                                    <h4 className="font-bold text-slate-900 tracking-tight ">
                                      {item.title}
                                    </h4>
                                    {isIncluded && (
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[8px] font-bold px-2 py-0 shadow-sm ">
                                        Included
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1 font-bold">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {item.submissionType === 'FILE' && (
                                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200 flex items-center gap-1">
                                        <FileIcon className="w-2.5 h-2.5" /> File required
                                      </Badge>
                                    )}
                                    {item.submissionType === 'LINK' && (
                                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200 flex items-center gap-1">
                                        <LinkIcon className="w-2.5 h-2.5" /> Link required
                                      </Badge>
                                    )}
                                    {item.submissionType === 'BOTH' && (
                                      <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                                        <ShieldCheck className="w-2.5 h-2.5" /> File & Link
                                      </Badge>
                                    )}
                                  </div>

                                </div>

                                {isIncluded && (
                                  <div className="space-y-3 pt-1">
                                    {deliverableStatus.notes && (
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <p className="text-[9px] text-slate-600 font-bold  mb-1.5 flex items-center gap-1.5 uppercase">
                                          <FileText className="w-3 h-3" />{" "}
                                          Freelancer notes
                                        </p>
                                        <p className="text-sm text-slate-600  leading-relaxed font-bold">
                                          &quot;{deliverableStatus.notes}&quot;
                                        </p>
                                      </div>
                                    )}

                                    {deliverableStatus.link && (
                                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                                        <p className="text-[9px] text-emerald-600 font-bold mb-1.5 flex items-center gap-1.5 uppercase">
                                          <ExternalLink className="w-3 h-3" />{" "}
                                          Submission Link
                                        </p>
                                        <a 
                                          href={deliverableStatus.link.startsWith('http') ? deliverableStatus.link : `https://${deliverableStatus.link}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-emerald-700 font-bold underline break-all flex items-center gap-2"
                                        >
                                          {deliverableStatus.link}
                                          <ExternalLink className="w-3 h-3 shrink-0" />
                                        </a>
                                      </div>
                                    )}


                                    {deliverableStatus.files?.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {deliverableStatus.files.map(
                                          (file: any, fIdx: number) => (
                                            <button
                                              key={fIdx}
                                              onClick={() => handleDownload(file)}
                                              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg group/file transition-all shadow-sm cursor-pointer"
                                            >
                                              <Download className="w-3 h-3 text-emerald-600" />
                                              <span className=" text-emerald-700 font-bold group-hover/file:text-emerald-900 ">
                                                {file.filename ||
                                                  `File ${fIdx + 1}`}
                                              </span>
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {!isIncluded && activeSubmission && (
                                  <div className="flex items-center gap-2 opacity-60">
                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                    <span className="text-[9px] font-bold st text-amber-600 uppercase">
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
                      <CardTitle className="text-slate-900 font-bold  text-lg ">
                        What was delivered
                      </CardTitle>
                      <CardDescription className="text-slate-600 font-bold   mt-1 ">
                        Timeline of work submitted by the freelancer
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {!vault.submissions || vault.submissions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-300 font-bold   uppercase">
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
                              "relative p-4 sm:p-6 rounded-2xl border transition-all duration-500 cursor-pointer group overflow-hidden shadow-sm",
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
                                  <p className=" font-bold  text-slate-600 mb-0.5 uppercase">
                                    {isSelected
                                      ? "Current review"
                                      : "Previous submission"}
                                  </p>
                                  <p className="text-sm font-bold text-slate-900 ">
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
                              <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-200  mb-4 font-bold shadow-sm">
                                &quot;{sub.notes}&quot;
                              </p>
                            )}

                            {sub.fileUrl && (
                              <div className="mb-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload({ url: sub.fileUrl, key: sub.fileKey, filename: sub.filename || "Submission Attachment" });
                                  }}
                                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Main Attachment
                                </button>
                              </div>
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
                                    <p className="text-[9px] font-bold  text-slate-600 uppercase">
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
                                              <span className=" font-bold  text-slate-900">
                                                {d.deliverableTitle}
                                              </span>
                                            </div>
                                            {d.included && d.notes && (
                                              <p className=" text-slate-600  ml-5 font-bold">
                                                - {d.notes}
                                              </p>
                                            )}

                                            {d.included && (d.link || (d.files && d.files.length > 0)) && (
                                              <div className="flex flex-wrap gap-2 ml-5 mt-1">
                                                {d.link && (
                                                  <a 
                                                    href={d.link.startsWith('http') ? d.link : `https://${d.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-2 py-1 rounded-[6px] text-[10px] font-bold transition-all shadow-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <LinkIcon className="w-2.5 h-2.5" />
                                                    View Link
                                                  </a>
                                                )}
                                                {d.files?.map((file: any, fileIdx: number) => (
                                                  <button
                                                    key={fileIdx}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDownload(file);
                                                    }}
                                                    className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-[6px] text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                                                  >
                                                    <Download className="w-2.5 h-2.5" />
                                                    {file.filename || `File ${fileIdx + 1}`}
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="mt-4 flex items-center justify-end  font-bold text-emerald-600  opacity-0 group-hover:opacity-100 transition-opacity ">
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
                  <CardTitle className="text-slate-900 text-base font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Project controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <AnimatePresence mode="wait">
                      {!reassigning ? (
                        <motion.div
                          key="actions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col gap-3"
                        >
                          {vault.status === VaultStatus.DRAFT && !isSuccessReturn && (
                            <Link href={`/checkout/${vaultId}`} className="w-full">
                              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 sm:h-12 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-xs sm:text-sm ">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Fund project
                              </Button>
                            </Link>
                          )}

                          {vault.status === VaultStatus.AWAITING_PAYMENT && (
                            <div className="flex flex-col gap-3">
                              <Link href={`/checkout/${vaultId}/bank`} className="w-full">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black capitalize tracking-wide h-10 sm:h-12 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all text-xs sm:text-sm">
                                  Review transfer details
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                                </Button>
                              </Link>
                            </div>
                          )}
                          
                          {vault.status === VaultStatus.DRAFT && isSuccessReturn && (
                            <Button disabled className="w-full bg-emerald-600/50 text-white font-bold h-10 sm:h-12 rounded-xl shadow-lg shadow-emerald-600/10 transition-all text-xs sm:text-sm ">
                              <div className="flex items-center justify-center gap-1.5 h-full mr-2">
                                <DotLoader color="white" size="sm" />
                              </div>
                              Confirming Deposit...
                            </Button>
                          )}

                          {/* Approve & Release — show when FUNDED, CHANGES_REQUESTED, or RELEASE_REQUESTED */}
                          {(vault.status === VaultStatus.FUNDED || 
                            vault.status === VaultStatus.CHANGES_REQUESTED || 
                            vault.status === VaultStatus.RELEASE_REQUESTED) && (
                            <Button
                              onClick={() => setShowApproveDialog(true)}
                              className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold h-10 sm:h-12 rounded-xl shadow-xl active:scale-95 transition-all text-xs sm:text-sm "
                              disabled={
                                !vault.submissions?.length ||
                                vault.isFrozen
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                              Approve & Release Funds
                            </Button>
                          )}

                          {/* Request Changes — show when FUNDED, RELEASE_REQUESTED, or CHANGES_REQUESTED */}
                          {(vault.status === VaultStatus.FUNDED || 
                            vault.status === VaultStatus.RELEASE_REQUESTED ||
                            vault.status === VaultStatus.CHANGES_REQUESTED) && (
                            <Button
                              variant="outline"
                              className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold h-10 sm:h-12 rounded-xl active:scale-95 transition-all text-xs sm:text-sm shadow-sm"
                              onClick={() => setShowReasonModal(true)}
                            >
                              <RefreshCcw className="w-4 h-4 mr-2" />
                              Request changes
                            </Button>
                          )}

                          {/* Dispute — available when FUNDED, CHANGES_REQUESTED, or RELEASE_REQUESTED */}
                          {(vault.status === VaultStatus.FUNDED || 
                            vault.status === VaultStatus.CHANGES_REQUESTED || 
                            vault.status === VaultStatus.RELEASE_REQUESTED) && (
                            <Link
                              href={`/client/disputes/create?vaultId=${vaultId}`}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold h-10 sm:h-12 rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <Gavel className="w-4 h-4 mr-2 text-amber-600" />
                                Initiate dispute
                              </Button>
                            </Link>
                          )}

                          {/* Enter Mediation — available when DISPUTED */}
                          {vault.status === VaultStatus.DISPUTED && activeDisputeId && (
                            <Link
                              href={`/client/disputes/${activeDisputeId}`}
                              className="w-full"
                            >
                              <Button
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 sm:h-12 rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95 text-xs sm:text-sm"
                              >
                                <Gavel className="w-4 h-4 mr-2" />
                                Enter Mediation Room
                              </Button>
                            </Link>
                          )}

                          {!vault.freelancerId && (
                            <Button
                              variant="outline"
                              onClick={() => setReassigning(true)}
                              className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold  h-12 rounded-xl transition-all shadow-sm active:scale-95 "
                            >
                              <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
                              Reassign freelancer
                            </Button>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="reassign"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 uppercase">New assignment</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReassigning(false)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[9px] font-bold text-slate-600 uppercase">Freelancer email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                  type="email"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="freelancer@example.com"
                                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 outline-none transition-all shadow-sm font-bold"
                                />
                              </div>
                            </div>
                            <Button
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-lg shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-xs"
                              onClick={() => handleUpdateFreelancer(inviteEmail)}
                              disabled={!inviteEmail || reassigningLoading}
                            >
                              {reassigningLoading ? (
                                <div className="flex items-center justify-center gap-1.5 h-full">
                                  <DotLoader color="white" size="sm" />
                                </div>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3 mr-2" />
                                  Send Invitation
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex justify-between items-center  bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-slate-600 font-bold text-[10px] uppercase">
                        Project logic:
                      </span>
                      <span className="text-emerald-700 font-bold text-[10px] uppercase">
                        Standard settlement
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE/RELEASE DIALOG */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-5 sm:p-8 bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 p-5 sm:p-8 opacity-10">
              <Zap className="w-16 sm:w-24 h-16 sm:h-24" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter">Release Funds?</DialogTitle>
            <DialogDescription className="text-slate-400 font-bold mt-1 sm:mt-2 text-xs sm:text-sm">
              This will settle the payment to the freelancer and deduct platform fees.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 bg-white">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-sm font-bold text-slate-500">Vault Total</span>
                <CurrencyEstimate 
                  usdAmount={parseFloat(vault.formattedTotalAmount)} 
                  className="text-slate-900 text-sm font-black"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase">Settlement fee ({calculateDayleFee(parseFloat(vault.formattedTotalAmount)).settlementFeePercent}%)</span>
                  <CurrencyEstimate 
                    usdAmount={(parseFloat(vault.formattedTotalAmount) * calculateDayleFee(parseFloat(vault.formattedTotalAmount)).settlementFeePercent) / 100} 
                    className="text-slate-900 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mt-6 group transition-all hover:bg-emerald-100/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Freelancer receives</p>
                    <CurrencyEstimate 
                      usdAmount={parseFloat(vault.formattedTotalAmount) - ((parseFloat(vault.formattedTotalAmount) * calculateDayleFee(parseFloat(vault.formattedTotalAmount)).settlementFeePercent) / 100)} 
                      className="text-emerald-900 text-xl sm:text-2xl font-black"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 h-12 rounded-xl font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                Confirm Release
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* REFUND REQUEST MODAL */}
      <Sheet open={showRefundModal} onOpenChange={setShowRefundModal}>
        <SheetContent
          side="right"
          className="bg-white border-slate-200 text-slate-900 w-full sm:w-[540px] shadow-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold tracking-tighter text-slate-900 ">
              Request refund
            </SheetTitle>
            <SheetDescription className="text-slate-600 font-bold  ">
              Since you don&apos;t have a payment account, refunds are processed
              manually by our team. Please provide your payout details.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold st text-slate-600 uppercase">
                Payout method
              </Label>
              <Select
                value={payoutMethod}
                onValueChange={(v: any) => setPayoutMethod(v)}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900 font-bold shadow-sm ">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                  <SelectItem value="bank" className="font-bold ">
                    Bank Transfer
                  </SelectItem>
                  <SelectItem value="card" className="font-bold ">
                    Debit/Credit Card
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payoutMethod === "bank" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className=" font-bold st text-slate-600 uppercase">
                    Bank name
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold  placeholder:text-slate-300"
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
                  <Label className=" font-bold st text-slate-600 uppercase">
                    Account number / IBAN
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold "
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
                  <Label className=" font-bold st text-slate-600 uppercase">
                    Account holder name
                  </Label>
                  <input
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-emerald-500/50 focus:outline-none transition-all shadow-sm font-bold "
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
                <AlertTitle className=" font-black uppercase st">
                  Note
                </AlertTitle>
                <AlertDescription className=" font-bold  leading-relaxed">
                  Our team will process this within 1-3 business days. Funds
                  will be returned minus any platform processing fees.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold st h-11 rounded-xl shadow-md shadow-emerald-600/10 "
                onClick={submitRefundRequest}
                disabled={requestingRefund}
              >
                {requestingRefund ? "Submitting..." : "Submit Refund Request"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* FUNDING CONFIRMATION MODAL */}
      <Dialog open={showFundModal} onOpenChange={setShowFundModal}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {fundingStep === "confirm" ? "Confirm Funding" : "Payment Instructions"}
              </DialogTitle>
              <DialogDescription className="font-bold text-slate-500">
                {fundingStep === "confirm" 
                  ? "Review the final amount and exchange rate before proceeding." 
                  : "Complete the bank transfer using the details below."}
              </DialogDescription>
            </DialogHeader>

            {fundingStep === "confirm" ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-500 uppercase">Project Value</p>
                    <CurrencyEstimate usdAmount={Number(vault?.formattedTotalAmount || 0)} showNote={false} className="text-lg font-black text-slate-900" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase">You will transfer</p>
                      <p className="text-2xl font-black text-emerald-600">
                        {loadingRate ? "..." : `${rateData?.convertedAmount?.toLocaleString()} ${rateData?.currency}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white font-bold text-[10px]">
                      {rateData?.currency} Rate
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Rate valid for: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </div>
                  <button onClick={fetchRate} className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 min-w-[100px] justify-end">
                    {loadingRate ? (
                      <div className="flex items-center gap-1">
                        <DotLoader size="sm" color="white" />
                      </div>
                    ) : (
                      <RefreshCcw className="w-3 h-3" />
                    )}
                    Refresh Rate
                  </button>
                </div>

                <Alert className="bg-amber-50 border-amber-100 text-amber-900 p-4">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs font-bold opacity-80 leading-relaxed">
                    Rate expires in 10 minutes. The final amount may vary slightly depending on market conditions at time of transfer.
                  </AlertDescription>
                </Alert>

                <Button 
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-500/20"
                  onClick={proceedToPayment}
                  disabled={initiatingRamp || loadingRate}
                >
                  {initiatingRamp ? (
                    <div className="flex items-center justify-center gap-2 h-full">
                      <DotLoader color="white" size="sm" />
                    </div>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-xl">
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Bank Name</p>
                        <p className="text-lg font-black">{vault.partnaBankName}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Account Number</p>
                          <p className="text-2xl font-black tracking-wider">{vault.partnaAccountNumber}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-white/40 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(vault.partnaAccountNumber);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="w-5 h-5" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Beneficiary Name</p>
                        <p className="text-sm font-bold">{vault.partnaAccountName}</p>
                      </div>
                   </div>

                   <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Total to send</p>
                        <p className="text-xl font-black text-emerald-700">
                          {vault.partnaFromAmount?.toLocaleString()} {vault.partnaFromCurrency}
                        </p>
                      </div>
                      <Badge className="bg-emerald-600 text-white border-none font-bold">EXACT AMOUNT</Badge>
                    </CardContent>
                   </Card>
                 </div>

                 <p className="text-xs text-center font-bold text-slate-400">
                   After transfer, please wait 2-5 minutes for confirmation. This page will update automatically.
                 </p>

                 <Button 
                   className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl"
                   onClick={() => setShowFundModal(false)}
                 >
                   I've made the transfer
                 </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showReasonModal} onOpenChange={setShowReasonModal}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl overflow-hidden p-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter">
                Request Changes
              </DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-500 leading-relaxed">
                Provide specific feedback or list the revisions needed for the freelancer to complete the project.
              </DialogDescription>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Feedback & Instructions
              </Label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="List specific changes required..."
                className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-900 text-sm font-bold focus:border-amber-500/30 outline-none transition-all resize-none shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReasonModal(false)}
                className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestChanges}
                disabled={isUpdatingStatus || !reason.trim()}
                className="flex-1 h-14 rounded-2xl bg-slate-900 border-none text-white font-bold hover:bg-black active:scale-95 transition-all text-xs uppercase shadow-xl disabled:bg-slate-300 disabled:opacity-50"
              >
                {isUpdatingStatus ? "Sending..." : "Submit Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
