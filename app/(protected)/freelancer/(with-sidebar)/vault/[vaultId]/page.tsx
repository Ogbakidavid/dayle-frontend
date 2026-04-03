"use client";

import { useState, useEffect } from "react";
import { LogoLoader } from "@/components/ui/logo-loader";
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
  CreditCard,
  ListChecks,
  Square,
  CheckSquare,
  ChevronRight,
  Clock,
  Users,
  FileIcon,
  LinkIcon,
  Download,
  CircleDollarSign,
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
import { toast } from "sonner";
import { calculateDayleFee } from "@/lib/utils/fee";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;

  const [vault, setVault] = useState<any>(null);
  const [vaultsLoading, setVaultsLoading] = useState(true);
  const [expandedSubmissions, setExpandedSubmissions] = useState<string[]>([]);
  const [requestingRelease, setRequestingRelease] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8 font-primary">
        <LogoLoader />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 font-primary">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center max-w-md shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tighter mb-2">
            Access restricted
          </h2>
          <p className="text-sm text-slate-600 font-bold  leading-relaxed">
            Vault not found or access denied. Please verify your credentials as
            the assigned freelancer.
          </p>
        </div>
        <Link href="/freelancer">
          <Button
            variant="outline"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  h-11 px-8 rounded-xl transition-all shadow-sm"
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

  const handleDownload = async (file: {
    url: string;
    key?: string;
    name?: string;
    filename?: string;
  }) => {
    try {
      const isS3 =
        file.key ||
        file.url?.includes("s3.amazonaws.com") ||
        file.url?.includes("digitaloceanspaces.com");

      if (!isS3) {
        window.open(file.url, "_blank");
        return;
      }

      const key = file.key || file.url.split("/").pop()?.split("?")[0];
      if (!key) {
        window.open(file.url, "_blank");
        return;
      }

      const { url: presignedUrl } = await api.uploads.getDownloadUrl(key);
      window.open(presignedUrl, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to generate secure download link");
    }
  };

  const handleRequestRelease = async () => {
    try {
      setRequestingRelease(true);
      await api.vaults.requestRelease(vaultId);
      toast.success("Release request sent to the client!");
    } catch (err) {
      console.error("Failed to request release:", err);
      toast.error("Failed to send release request. Please try again.");
    } finally {
      setRequestingRelease(false);
    }
  };

  const isEligibleForDispute = getDisputeEligibility(vault).eligible;

  return (
    <div className="min-h-screen text-slate-600 selection:bg-emerald-500/30 pb-20 font-primary">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-10 space-y-8">
        {/* SECTION A: HEADER */}
        <header className="pt-4 md:pt-8 bg-transparent">
          <button
            onClick={() => router.push("/freelancer")}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-all mb-6 md:mb-8 font-bold  bg-white border border-slate-200 py-2 px-4 rounded-xl cursor-pointer group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-tight wrap-break-word">
                  {vault.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm text-[10px] sm:text-xs"
                >
                  {getVaultDerivedLabel(vault.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                      Client
                    </p>
                    <p className="text-xs sm:text-sm text-slate-900 font-bold">
                      {vault.clientName || "Unknown Client"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                      Created
                    </p>
                    <p className="text-xs sm:text-sm text-slate-900 font-bold">
                      {new Date(vault.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group w-full md:w-auto">
              <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-100 to-slate-100 rounded-[22px] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative text-left md:text-right p-4 sm:p-6 rounded-[20px] bg-white border border-slate-100 shadow-sm min-w-0 sm:min-w-[240px] flex flex-col justify-center overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <p className="text-sm text-slate-500 font-bold tracking-wide mb-2 leading-none">
                  Secured contract value
                </p>
                
                <div className="flex flex-col gap-4">
                  <CurrencyEstimate
                    usdAmount={Number(vault.formattedTotalAmount || "0.00")}
                    className="text-slate-900 text-xl sm:text-2xl font-black tracking-tighter leading-none"
                  />
                  
                  <div className="inline-flex items-center gap-2 self-start md:self-end bg-emerald-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-50 transition-colors shadow-sm">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <p className="text-[11px] md:text-xs text-emerald-700 font-bold flex items-center gap-1 whitespace-nowrap">
                      <CurrencyEstimate
                        usdAmount={Number(
                          vault.formattedPaidAmount || vault.paidAmount || 0,
                        )}
                        className="text-emerald-700 font-black"
                        showNote={false}
                      />
                      <span className="opacity-70 uppercase tracking-widest text-[9px]">capital settled</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* SECTION: FEE BREAKDOWN (ONLY IF RELEASED) */}
        {vault.status === VaultStatus.RELEASED && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-emerald-50/30 border-emerald-100 shadow-sm overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100/50 border border-emerald-200">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Fee Breakdown
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Disbursement deductions
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">
                        Settlement (
                        {
                          calculateDayleFee(
                            parseFloat(vault.formattedTotalAmount),
                          ).settlementFeePercent
                        }
                        %)
                      </p>
                      <CurrencyEstimate
                        usdAmount={
                          vault.settlementFeeUSD ||
                          calculateDayleFee(
                            parseFloat(vault.formattedTotalAmount),
                          ).settlementFeeUSD
                        }
                        className="text-slate-900 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] sm:text-[10px] text-amber-500 font-bold uppercase whitespace-nowrap">
                        Withdrawal fee (0.5%)
                      </p>
                      <CurrencyEstimate
                        usdAmount={
                          calculateDayleFee(
                            parseFloat(vault.formattedTotalAmount),
                          ).withdrawalFeeUSD
                        }
                        className="text-amber-600 text-xs sm:text-sm font-bold"
                      />
                    </div>
                    <div className="text-left sm:text-right border-l border-emerald-200 pl-4 sm:pl-6 ml-auto sm:ml-0">
                      <p className="text-[8px] sm:text-[10px] text-emerald-600 font-bold uppercase">
                        Total Charges
                      </p>
                      <CurrencyEstimate
                        usdAmount={
                          calculateDayleFee(
                            parseFloat(vault.formattedTotalAmount),
                          ).totalFeeUSD
                        }
                        className="text-emerald-700 text-base sm:text-lg font-black"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <CardContent className="p-6">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">
                  Your Net Receipt
                </p>
                <CurrencyEstimate
                  usdAmount={
                    vault.freelancerReceivesUSD ||
                    calculateDayleFee(parseFloat(vault.formattedTotalAmount))
                      .freelancerReceivesUSD
                  }
                  className="text-white text-2xl sm:text-3xl font-black"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <p className="text-[10px] font-bold text-emerald-400/80">
                    Funds released via Dayle Settlement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* LEFT COLUMN: SECTIONS B & C */}
          <div className="xl:col-span-2 space-y-8">
            {/* SECTION B: DELIVERABLES CHECKLIST */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 p-4 sm:p-6 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
                    <ListChecks className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold text-base sm:text-lg ">
                      What was promised
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-bold mt-0.5 sm:mt-1">
                      The specific items you committed to settle
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!vault.deliverables || vault.deliverables.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-slate-100 mx-auto" />
                    <p className="text-slate-600 font-bold uppercase">
                      No deliverables defined for this project
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {vault.deliverables.map((item: any, idx: number) => {
                      const submissionWithThis = vault.submissions?.find(
                        (s: any) =>
                          s.deliverableStatus?.some(
                            (ds: any) =>
                              (ds.deliverableId === item.id ||
                                ds.deliverableTitle === item.title) &&
                              ds.included,
                          ),
                      );

                      return (
                        <div
                          key={item.id || idx}
                          className="p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              {submissionWithThis ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-100 group-hover:text-slate-200" />
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 ">
                                  {item.title}
                                </h4>
                                {item.description && (
                                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex gap-2 pt-1">
                                  {item.submissionType === "FILE" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-slate-50 text-slate-400 border-slate-200 flex items-center gap-1"
                                    >
                                      <FileIcon className="w-2.5 h-2.5" /> File
                                      required
                                    </Badge>
                                  )}
                                  {item.submissionType === "LINK" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-slate-50 text-slate-400 border-slate-200 flex items-center gap-1"
                                    >
                                      <LinkIcon className="w-2.5 h-2.5" /> Link
                                      required
                                    </Badge>
                                  )}
                                  {item.submissionType === "BOTH" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1"
                                    >
                                      <ShieldCheck className="w-2.5 h-2.5" />{" "}
                                      File & Link
                                    </Badge>
                                  )}
                                </div>

                                {submissionWithThis && (
                                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-300">
                                    {submissionWithThis.deliverableStatus?.find(
                                      (ds: any) =>
                                        ds.deliverableId === item.id ||
                                        ds.deliverableTitle === item.title,
                                    )?.notes && (
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                          &quot;
                                          {
                                            submissionWithThis.deliverableStatus.find(
                                              (ds: any) =>
                                                ds.deliverableId === item.id ||
                                                ds.deliverableTitle ===
                                                  item.title,
                                            ).notes
                                          }
                                          &quot;
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                      {submissionWithThis.deliverableStatus?.find(
                                        (ds: any) =>
                                          ds.deliverableId === item.id ||
                                          ds.deliverableTitle === item.title,
                                      )?.link && (
                                        <a
                                          href={
                                            submissionWithThis.deliverableStatus
                                              .find(
                                                (ds: any) =>
                                                  ds.deliverableId ===
                                                    item.id ||
                                                  ds.deliverableTitle ===
                                                    item.title,
                                              )
                                              .link.startsWith("http")
                                              ? submissionWithThis.deliverableStatus.find(
                                                  (ds: any) =>
                                                    ds.deliverableId ===
                                                      item.id ||
                                                    ds.deliverableTitle ===
                                                      item.title,
                                                ).link
                                              : `https://${submissionWithThis.deliverableStatus.find((ds: any) => ds.deliverableId === item.id || ds.deliverableTitle === item.title).link}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                        >
                                          <LinkIcon className="w-3 h-3" />
                                          View Link
                                        </a>
                                      )}

                                      {submissionWithThis.deliverableStatus
                                        ?.find(
                                          (ds: any) =>
                                            ds.deliverableId === item.id ||
                                            ds.deliverableTitle === item.title,
                                        )
                                        ?.files?.map(
                                          (file: any, fIdx: number) => (
                                            <button
                                              key={fIdx}
                                              onClick={() =>
                                                handleDownload(file)
                                              }
                                              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                                            >
                                              <Download className="w-3 h-3" />
                                              {file.filename ||
                                                `File ${fIdx + 1}`}
                                            </button>
                                          ),
                                        )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 flex items-center gap-2">
                                <span className="text-[9px] font-bold">
                                  Status:
                                </span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px]  border-none px-0",
                                    submissionWithThis
                                      ? "text-emerald-700 font-bold"
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
              <CardHeader className="border-b border-slate-100 p-4 sm:p-6 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 shrink-0">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 font-bold text-base sm:text-lg ">
                      Your submissions
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-bold mt-0.5 sm:mt-1">
                      Timeline of work you have submitted
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!vault.submissions || vault.submissions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-100 font-bold tracking-[0.2em] ">
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
                            "bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/20 transition-all cursor-pointer group shadow-sm",
                            isExpanded && "border-emerald-500/20 bg-emerald-50",
                          )}
                        >
                          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs sm:text-sm">
                                {String(
                                  vault.submissions.length - idx,
                                ).padStart(2, "0")}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900  ">
                                  Submission #{vault.submissions.length - idx}
                                </p>
                                <p className="text-[9px] text-slate-600 font-bold  mt-0.5">
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
                              className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold px-2 sm:px-3 h-5 sm:h-6"
                            >
                              {sub.deliverableStatus?.filter(
                                (d: any) => d.included,
                              ).length ||
                                sub.deliverableIds?.length ||
                                0}{" "}
                              of {vault.deliverables?.length || 0} items
                            </Badge>
                          </div>

                          {sub.notes && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100  mb-4 shadow-sm">
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
                                  <p className="text-[9px] font-bold 00">
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
                                            <span className=" font-bold 900">
                                              {d.deliverableTitle}
                                            </span>
                                          </div>
                                          {d.included && d.notes && (
                                            <p className=" text-slate-600  ml-5">
                                              - {d.notes}
                                            </p>
                                          )}

                                          {d.included &&
                                            (d.link ||
                                              (d.files &&
                                                d.files.length > 0)) && (
                                              <div className="flex flex-wrap gap-2 ml-5 mt-1">
                                                {d.link && (
                                                  <a
                                                    href={
                                                      d.link.startsWith("http")
                                                        ? d.link
                                                        : `https://${d.link}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-2 py-1 rounded-[6px] text-[10px] font-bold transition-all shadow-sm"
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                  >
                                                    <LinkIcon className="w-2.5 h-2.5" />
                                                    View Link
                                                  </a>
                                                )}
                                                {d.files?.map(
                                                  (
                                                    file: any,
                                                    fileIdx: number,
                                                  ) => (
                                                    <button
                                                      key={fileIdx}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(file);
                                                      }}
                                                      className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-[6px] text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                                                    >
                                                      <Download className="w-2.5 h-2.5" />
                                                      {file.filename ||
                                                        `File ${fileIdx + 1}`}
                                                    </button>
                                                  ),
                                                )}
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

                          <div className="mt-4 flex items-center justify-end  font-bold text-emerald-700 oup-hover:opacity-100 transition-opacity">
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
                <CardTitle className="text-slate-900 text-base font-bold tracking-[0.2em]  flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Freelancer workspace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  {vault.status === VaultStatus.FUNDED && (
                    <>
                      <Link href={`/freelancer/vault/${vaultId}/submit`}>
                        <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold h-10 sm:h-12 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all text-xs sm:text-sm mb-3">
                          <Upload className="w-4 h-4 mr-2" />
                          Deliver work
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold h-10 sm:h-12 rounded-xl transition-all shadow-sm active:scale-95 mb-3 text-xs sm:text-sm"
                        onClick={handleRequestRelease}
                        disabled={requestingRelease}
                      >
                        {vault.localCurrency === "NGN" ? (
                          <span className="w-4 h-4 mr-2 flex items-center justify-center font-black text-sm antialiased">₦</span>
                        ) : vault.localCurrency === "KES" ? (
                          <span className="w-4 h-4 mr-2 flex items-center justify-center font-black text-[10px] antialiased">KSh</span>
                        ) : (
                          <CircleDollarSign className="w-4 h-4 mr-2" />
                        )}
                        {requestingRelease ? "Requesting..." : "Request release"}
                      </Button>
                    </>
                  )}

                  <Link
                    href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  h-10 sm:h-12 rounded-xl transition-all shadow-sm active:scale-95 text-xs sm:text-sm"
                    >
                      <Gavel className="w-4 h-4 mr-2 text-amber-600" />
                      Initiate resolution
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
                <CardTitle className="flex items-center gap-3 text-slate-900 font-bold">
                  <Gavel className="w-5 h-5 text-amber-600" />
                  Vault support
                </CardTitle>
                <CardDescription className="font-bold t-2 leading-relaxed  text-slate-600">
                  Initiate a formal case file if contract terms are breached.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-200 bg-white text-slate-600 hover:text-slate-900 font-bold h-12 rounded-xl transition-all shadow-sm active:scale-95"
                  disabled={!isEligibleForDispute}
                  asChild={isEligibleForDispute}
                >
                  {isEligibleForDispute ? (
                    <Link
                      href={`/freelancer/disputes/create?vaultId=${vaultId}`}
                    >
                      Initiate resolution
                    </Link>
                  ) : (
                    <Link href="/freelancer/disputes">Settlement Timeline</Link>
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
