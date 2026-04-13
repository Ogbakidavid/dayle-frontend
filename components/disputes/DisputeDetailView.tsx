"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { DISPUTE_REASON_CODES } from "@/lib/rules/disputes";
import {
  ChevronLeft,
  Gavel,
  FileText,
  Link2,
  MessageSquare,
  X,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  User,
  AlertCircle,
  Shapes,
  HelpCircle,
  FileSearch,
  History,
  Scale,
} from "lucide-react";
import type { Vault } from "@/lib/store/vault-context";
import { toast } from "sonner";
import { MediationRoom } from "./MediationRoom";
import { DisputeStatus } from "@/lib/domain/enums";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LogoLoader } from "@/components/ui/logo-loader";
import { useSocket } from "@/lib/contexts/socket-context";


interface DisputeEvent {
  type: string;
  createdAt: string;
  actorRole: string;
  actorId?: string;
  payload?: any;
  files?: Array<{ name: string; [key: string]: any }>;
  [key: string]: any;
}

interface Dispute {
  id: string;
  vaultId: string;
  status: string;
  description: string;
  openedBy: {
    name: string;
    email: string;
  };
  requirementRef?: string;
  reasonCode?: string;
  reasonCodes?: string[];
  events?: DisputeEvent[];
  openedByRole?: string;
  resolutionType?: string;
  resolutionPayload?: {
    outcome: string;
    freelancerPercent: number;
    clientPercent: number;
    totalAmount: number;
    splitAmount: number;
  };
  [key: string]: any;
}

function getReasonLabel(code: string) {
  return DISPUTE_REASON_CODES.find((item) => item.code === code)?.label || code;
}

export interface DisputeDetailViewProps {
  disputeId: string;
  role: "client" | "freelancer";
}

type EvidenceType = "link" | "note" | "file";

export function DisputeDetailView({ disputeId, role }: DisputeDetailViewProps) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState<any[]>([]);

  // Add Evidence Modal State
  const [showModal, setShowModal] = useState(false);
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("link");
  const [evidenceValue, setEvidenceValue] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function loadEvidence(vaultId: string, disputeId: string) {
    try {
      const data = await api.evidence.list({ vaultId, disputeId });
      setEvidence(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }

  async function load() {
    try {
      const d = await api.disputes.getById(disputeId);
      setDispute(d);
      if (d) {
        const v = await api.vaults.getById(d.vaultId);
        setVault(v);
        await loadEvidence(d.vaultId, d.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const { socket } = useSocket();

  useEffect(() => {
    load();
  }, [disputeId]);

  useEffect(() => {
    if (!socket || !dispute?.vaultId) return;

    const handler = (data: any) => {
      if (data.vaultId === dispute.vaultId) {
        load();
      }
    };

    socket.on("vault_updated", handler);
    return () => {
      socket.off("vault_updated", handler);
    };
  }, [socket, dispute?.vaultId]);

  const handleSubmitEvidence = async () => {
    if (!evidenceValue.trim() && evidenceType !== "note") {
      toast.error("Please enter a value.");
      return;
    }
    if (evidenceType === "note" && !evidenceNote.trim()) {
      toast.error("Please enter your statement.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (evidenceType === "link") {
        payload.url = evidenceValue.trim();
        payload.note = evidenceNote.trim() || undefined;
      } else if (evidenceType === "note") {
        payload.note = evidenceNote.trim();
      } else if (evidenceType === "file") {
        payload.fileName = evidenceValue.trim();
        payload.note = evidenceNote.trim() || undefined;
      }

      await api.evidence.create({
        vaultId: dispute!.vaultId,
        disputeId: dispute!.id,
        type: evidenceType.toUpperCase(),
        payload,
      });

      setSubmitted(true);
      toast.success("Evidence submitted.");

      await loadEvidence(dispute!.vaultId, dispute!.id);

      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setEvidenceValue("");
        setEvidenceNote("");
        setEvidenceType("link");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit evidence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const key = file.key || file.fileName || file.filename || file.name || "";
      const { url } = await api.uploads.getDownloadUrl(key);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Secure link generation failed");
    }
  };

  if (loading)
    return (
      <div className="py-32 h-screen flex flex-col items-center justify-center">
        <LogoLoader size="lg" />
      </div>
    );

  if (!dispute)
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle
          className="w-12 h-12 text-slate-200 mx-auto"
          strokeWidth={1}
        />
        <p className="text-slate-400 font-bold">Dispute record not found.</p>
        <Link href={`/${role}/disputes`}>
          <Button variant="ghost" className="text-amber-600 font-bold">
            Return to Resolution Center
          </Button>
        </Link>
      </div>
    );

  const events = dispute.events || [];
  const statusSteps = [
    { key: "OPEN", label: "Opened", desc: "Report Filed" },
    { key: "MUTUAL_RESOLUTION", label: "Mediation", desc: "Negotiation" },
    { key: "UNDER_REVIEW", label: "Dayle Review", desc: "Final Adjudication" },
    { key: "RESOLVED", label: "Settled", desc: "Case Closed" },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (s) =>
      s.key === dispute.status ||
      (dispute.status === "investigating" && s.key === "UNDER_REVIEW"),
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <FileSearch className="w-32 h-32 text-slate-900" />
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Submitted
                  </h3>
                  <p className="text-sm text-slate-400 font-bold">
                    Your evidence has been added to the case ledger.
                  </p>
                </div>
              ) : (
                <div className="relative z-10 space-y-8">
                  <header>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Add Evidence
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">
                      Support your case with files, links, or notes.
                    </p>
                  </header>

                  <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                    {(["link", "note", "file"] as EvidenceType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setEvidenceType(t)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          evidenceType === t
                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-100"
                            : "text-slate-400 hover:text-slate-600",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {(evidenceType === "link" || evidenceType === "file") && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                          {evidenceType === "link"
                            ? "Reference URL"
                            : "File Identifier"}
                        </label>
                        <input
                          placeholder={
                            evidenceType === "link"
                              ? "https://..."
                              : "e.g. screenshot.png"
                          }
                          value={evidenceValue}
                          onChange={(e) => setEvidenceValue(e.target.value)}
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:border-amber-400 transition-all"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                        Statement / Context
                      </label>
                      <textarea
                        placeholder="Explain why this is relevant..."
                        value={evidenceNote}
                        onChange={(e) => setEvidenceNote(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold focus:outline-none focus:border-amber-400 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitEvidence}
                    disabled={isSubmitting}
                    className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black tracking-widest text-xs uppercase active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                  >
                    {isSubmitting ? "Uploading..." : "Submit to Ledger"}
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link
          href={`/${role}/disputes`}
          className="inline-flex items-center gap-2 group text-slate-400 hover:text-slate-900 transition-colors font-black uppercase tracking-tighter text-xs"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Resolution Hub
        </Link>

        <div className="flex items-center gap-4">
          {["OPEN", "MUTUAL_RESOLUTION", "UNDER_REVIEW"].includes(
            dispute.status,
          ) && (
            <Button
              onClick={() => setShowModal(true)}
              className="bg-emerald-950 border border-white/10 hover:bg-emerald-700 text-white font-black h-12 px-6 rounded-2xl shadow-lg shadow-emerald-600/20"
            >
              + Add Evidence
            </Button>
          )}
        </div>
      </div>

      <header className="relative space-y-6 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <Shapes className="w-full h-full text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Scale className="w-4 h-4" />
              Active Arbitration
            </div>
            <h1 className="text-3xl md:text-5xl text-white font-black tracking-tight leading-none">
              Case <span className="text-emerald-700 text-2xl md:text-4xl">#</span>
              {dispute.id.slice(0, 12).toUpperCase()}
            </h1>
          </div>

          {/* Resolution Tracker */}
          <div className="pt-8 grid grid-cols-4 gap-2 relative">
            {/* Connector Line */}
            <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-px bg-white/10" />
            <div
              className="absolute top-[18px] left-[12.5%] transition-all duration-1000 bg-emerald-400 h-px"
              style={{ width: `${Math.max(0, currentStepIndex) * 25}%` }}
            />

            {statusSteps.map((step, i) => {
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-4 relative z-10"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-xl",
                      isCurrent
                        ? "bg-emerald-400 border-emerald-400 scale-110 shadow-emerald-400/20"
                        : isActive
                          ? "bg-white border-white shadow-white/10"
                          : "bg-slate-800 border-white/5",
                    )}
                  >
                    {isActive ? (
                      <CheckCircle2
                        className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-slate-900" : "text-emerald-500",
                        )}
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                  <div className="text-center hidden md:block">
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        isActive ? "text-white" : "text-white/30",
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-[9px] font-bold text-white/20">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mediation Room Alert */}
      {dispute.status === DisputeStatus.MUTUAL_RESOLUTION && (
        <MediationRoom
          dispute={dispute}
          vault={vault}
          role={role}
          onUpdate={load}
        />
      )}

      {/* Resolution Summary Card */}
      {dispute.status === "RESOLVED" && dispute.resolutionPayload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-emerald-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-emerald-500/10 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10 grid lg:grid-cols-[1fr_2px_1fr] gap-12 items-center">
            <div className="space-y-6">
              <header className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em]">
                  <Gavel className="w-4 h-4" />
                  Resolution Result
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {dispute.resolutionPayload.outcome === "SPLIT" 
                    ? "Mutual Split Authorized" 
                    : dispute.resolutionPayload.outcome === "RELEASE" 
                    ? "Full Asset Release" 
                    : "Full Settlement Refund"}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {dispute.resolutionType === "MEDIATION" ? "Mutual Agreement" : "Final Arbitration"}
                </div>
              </header>
              
              <p className="text-slate-600 font-bold leading-relaxed pr-8">
                {dispute.resolution || "The parties have reached a consensus on the distribution of assets held in the secure vault."}
              </p>
            </div>

            <div className="hidden lg:block h-full bg-slate-100" />

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Freelancer Share</span>
                  <span className="text-2xl font-black text-slate-900">{dispute.resolutionPayload.freelancerPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dispute.resolutionPayload.freelancerPercent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Share</span>
                  <span className="text-2xl font-black text-slate-900">{dispute.resolutionPayload.clientPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${dispute.resolutionPayload.clientPercent}%` }}
                     transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-slate-900" 
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid xl:grid-cols-[1fr_340px] gap-8">
        <main className="space-y-8">
          {/* Description Card */}
          <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Primary Claim
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-lg md:text-xl font-bold text-slate-700 leading-relaxed shadow-inner">
                &quot;{dispute.description}&quot;
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Reason Group
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {getReasonLabel(
                      dispute.reasonCode || dispute.reasonCodes?.[0] || "",
                    )}
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Vault Context
                  </p>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {vault?.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Timeline */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <History className="w-5 h-5 text-emerald-500" />
                Case Ledger
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Live Audit Log
              </p>
            </div>

            <div className="space-y-4">
              {[...events, ...evidence]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((ev, i) => {
                  const isEvidence = !ev.type || !ev.actorRole;
                  const type = isEvidence ? "EVIDENCE" : ev.type;
                  const roleLabel = isEvidence ? role : ev.actorRole;

                  return (
                    <Card
                      key={i}
                      className="group border-slate-100 bg-white hover:border-emerald-200 transition-all rounded-3xl shadow-sm overflow-hidden"
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex md:flex-col items-center gap-3 shrink-0">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                type === "OPENED"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : type === "EVIDENCE"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100",
                              )}
                            >
                              {type === "OPENED" ? (
                                <Gavel className="w-5 h-5" />
                              ) : type === "EVIDENCE" ? (
                                <FileSearch className="w-5 h-5" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5" />
                              )}
                            </div>
                            <div className="md:hidden flex-1 border-b border-slate-100" />
                          </div>

                          <div className="flex-1 space-y-4">
                            <header className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                                  {type.replace("_", " ")}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                  {roleLabel} ·{" "}
                                  {new Date(ev.createdAt).toLocaleDateString()} ·{" "}
                                  {new Date(ev.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-300 font-mono">
                                TS:{" "}
                                {new Date(ev.createdAt)
                                  .getTime()
                                  .toString()
                                  .slice(-6)}
                              </p>
                            </header>

                            <div className="text-sm font-bold text-slate-600 leading-relaxed">
                              {ev.payload?.note ||
                                ev.payload?.reason ||
                                ev.description ||
                                ev.payload?.decision ||
                                (type === "OPENED" && "Case officially opened and entered mutual mediation.") ||
                                (type === "EVIDENCE" && "New evidence submitted for record.") ||
                                (type === "ESCALATED" && "Case escalated to platform arbitration.") ||
                                "System event logged."}
                            </div>

                            {/* Files/Links */}
                            {(ev.payload?.url ||
                              ev.payload?.fileName ||
                              (ev.files || []).length > 0) && (
                              <div className="flex flex-wrap gap-3 pt-2">
                                {ev.payload?.url && (
                                  <a
                                    href={ev.payload.url}
                                    target="_blank"
                                    rel="noopener"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-[11px] font-black hover:bg-blue-100 transition-all"
                                  >
                                    <Link2 className="w-3.5 h-3.5" />
                                    View Shared Link
                                  </a>
                                )}
                                {(ev.files || []).map(
                                  (file: any, k: number) => (
                                    <button
                                      key={k}
                                      onClick={() => handleDownload(file)}
                                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      {file.name}
                                    </button>
                                  ),
                                )}
                                {ev.payload?.fileName && (
                                  <button
                                    onClick={() =>
                                      handleDownload({
                                        key: ev.payload.key,
                                        fileName: ev.payload.fileName,
                                      })
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-slate-800 transition-all shadow-lg"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {ev.payload.fileName}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          {/* Info Card */}
          <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden sticky top-8">
            <CardHeader className="bg-slate-900 p-8">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <CardTitle className="text-white text-base font-black uppercase tracking-widest">
                  Case Info
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Case Severity
                </p>
                <p className="text-sm font-black text-red-500">
                  Crucial Intervention
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Reporting Person
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm font-black text-slate-900">
                    {dispute.openedBy?.name}
                  </p>
                </div>
              </div>

              {dispute.requirementRef && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Affected Milestone
                  </p>
                  <div className="mt-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-black">
                    {dispute.requirementRef}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">
                  Final Payout Rule
                </h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  Once a decision is reached by the mediator or admin, funds
                  will be programmatically split and released. This action is
                  final and recorded on the ledger.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
