"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { DISPUTE_REASON_CODES } from "@/lib/rules/disputes";
import { ChevronLeft, Gavel, FileText, Link2, MessageSquare, X, CheckCircle2, Loader2, ShieldAlert, User, AlertCircle } from "lucide-react";
import type { Vault } from "@/lib/store/vault-context";
import { toast } from "sonner";
import { MediationRoom } from "./MediationRoom";
import { DisputeStatus } from "@/lib/domain/enums";

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

  useEffect(() => {
    load();
  }, [disputeId]);

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
      toast.success("Evidence submitted to the case ledger.");

      // Reload evidence
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

  const handleDownload = async (file: { url?: string; key?: string; name?: string; fileName?: string; filename?: string }) => {
    try {
      const url = file.url || "";
      const key = file.key || file.fileName || file.filename || file.name || "";
      
      const isS3 = key && (file.key || url.includes('s3.amazonaws.com') || url.includes('digitaloceanspaces.com') || !url.includes('://'));
      
      if (!isS3 && url) {
        window.open(url, '_blank');
        return;
      }

      const s3Key = file.key || key;
      if (!s3Key) {
        if (url) window.open(url, '_blank');
        return;
      }

      const { url: presignedUrl } = await api.uploads.getDownloadUrl(s3Key);
      window.open(presignedUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to generate secure download link');
    }
  };

  // Fallback if no events found
  const events = dispute?.events || [];

  if (loading)
    return (
      <div className="text-slate-600 p-8 text-center bg-slate-50 rounded-xl border border-slate-200 font-bold">
        Loading case file...
      </div>
    );

  if (!dispute) {
    return (
      <div className="text-slate-600 p-8 text-center bg-slate-50 rounded-xl border border-slate-200 font-bold">
        Dispute not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Add Evidence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8 space-y-6">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-800 text-lg">Evidence Submitted</p>
                <p className="text-sm text-slate-400 text-center">It has been logged to the case ledger.</p>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add Evidence</h2>
                  <p className="text-xs text-slate-400 mt-1">Submit supporting material for this case. Admins will review it during adjudication.</p>
                </div>

                {/* Type Selector */}
                <div className="flex gap-2">
                  {(["link", "note", "file"] as EvidenceType[]).map((t) => {
                    const icons = { link: <Link2 className="w-3.5 h-3.5" />, note: <MessageSquare className="w-3.5 h-3.5" />, file: <FileText className="w-3.5 h-3.5" /> };
                    const labels = { link: "URL / Link", note: "Written Statement", file: "File Reference" };
                    return (
                      <button
                        key={t}
                        onClick={() => setEvidenceType(t)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-xs font-bold transition-all ${evidenceType === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                      >
                        {icons[t]}
                        {labels[t]}
                      </button>
                    );
                  })}
                </div>

                {/* Link / File input */}
                {(evidenceType === "link" || evidenceType === "file") && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {evidenceType === "link" ? "URL" : "File name / path"}
                    </label>
                    <input
                      type={evidenceType === "link" ? "url" : "text"}
                      placeholder={evidenceType === "link" ? "https://github.com/..." : "screenshot.png"}
                      value={evidenceValue}
                      onChange={(e) => setEvidenceValue(e.target.value)}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-300"
                    />
                  </div>
                )}

                {/* Note / Statement textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {evidenceType === "note" ? "Your Statement *" : "Additional context (optional)"}
                  </label>
                  <textarea
                    placeholder={
                      evidenceType === "note"
                        ? "Describe the issue in detail..."
                        : "Explain what this link or file demonstrates..."
                    }
                    value={evidenceNote}
                    onChange={(e) => setEvidenceNote(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 resize-none placeholder:text-slate-300"
                  />
                </div>

                <Button
                  onClick={handleSubmitEvidence}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : "Submit Evidence"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mediation Room */}
      {dispute.status === DisputeStatus.MUTUAL_RESOLUTION && (
        <MediationRoom 
          dispute={dispute} 
          vault={vault} 
          role={role} 
          onUpdate={load} 
        />
      )}

      <div>
        <Link
          href={`/${role}/disputes`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to disputes
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 flex items-center gap-2">
              <Gavel className="w-3.5 h-3.5" />
              Contractual Arbitration Protocol
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
              Case <span className="text-slate-400">#</span>{dispute.id.slice(0, 12)}
            </h1>
            <p className="text-sm text-slate-500 font-bold">
              Vault: {vault?.title || "Project Vault"}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Case Reporter</p>
              <p className="text-sm font-bold text-slate-900">{dispute.openedBy?.name || "System"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Case Overview Card */}
      <Card className="bg-white border-none shadow-xl shadow-emerald-600/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <ShieldAlert className="w-32 h-32 text-emerald-600" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Primary Claim</p>
                <p className="text-lg font-bold text-slate-600 leading-relaxed italic">
                  &quot;{dispute.description}&quot;
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Protocol Date</p>
                  <p className="text-xs font-bold text-slate-600">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Case Origin</p>
                  <p className="text-xs font-bold text-slate-600">{dispute.openedByRole === 'CLIENT' ? 'Client Initiated' : 'Freelancer Initiated'}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="bg-amber-600 backdrop-blur-sm rounded-2xl p-5 border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Reason for Dispute</span>
                </div>
                <p className="text-xl font-bold text-white tracking-tight">
                  {getReasonLabel(dispute.reasonCode || dispute.reasonCodes?.[0] || "")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Timeline / Evidence Ledger */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900 text-lg flex items-center justify-between font-bold">
                <span>Evidence Ledger</span>
                {dispute.status === "OPEN" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowModal(true)}
                    className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                  >
                    + Add evidence
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {events.length === 0 && evidence.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm font-bold">
                    No events logged in the evidence ledger yet.
                  </div>
                ) : (
                  <>
                    {events.map((ev, i) => (
                      <div
                        key={`ev-${i}`}
                        className="p-6 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <div className="h-full w-px bg-slate-100 min-h-[40px]" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-emerald-600">
                                  {ev.type?.replace("_", " ").toLowerCase()}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">
                                  {new Date(ev.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-slate-300">
                                {ev.actorRole}
                              </span>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 text-sm text-slate-600 font-bold leading-relaxed shadow-inner">
                              {ev.type === "OPENED" ? (
                                <div className="space-y-1">
                                  <p className="text-slate-900">
                                    Dispute initiated for{" "}
                                    <span className="text-emerald-600 underline">
                                      {vault?.title}
                                    </span>
                                  </p>
                                  {dispute.description && (
                                    <p className="text-xs text-slate-500 italic">
                                      &quot;{dispute.description}&quot;
                                    </p>
                                  )}
                                  {ev.payload?.deliverableTitle && (
                                    <div className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                      Deliverable: {ev.payload.deliverableTitle}
                                    </div>
                                  )}
                                </div>
                              ) : ev.type === "EVIDENCE_SUBMITTED" ? (
                                <div className="space-y-1">
                                  {ev.payload?.note && (
                                    <p className="text-slate-900 italic">
                                      &quot;{ev.payload.note}&quot;
                                    </p>
                                  )}
                                  {ev.payload?.url && (
                                    <div className="mt-1 flex items-center gap-1.5 overflow-hidden">
                                      <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <a href={ev.payload.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline truncate text-[13px]">
                                        {ev.payload.url}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                ev.payloadJson?.notes ||
                                ev.payload?.note ||
                                ev.payload?.decision ||
                                (typeof ev.payload === "string"
                                  ? ev.payload
                                  : ev.payload?.reasonCode 
                                    ? `Case update: ${getReasonLabel(ev.payload.reasonCode)}`
                                    : JSON.stringify(ev.payload || {}))
                              )}
                            </div>

                            {(ev.payload?.reasonCode ||
                              ev.payload?.reasonCodes) && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50 shadow-xs">
                                  {getReasonLabel(
                                    ev.payload.reasonCode ||
                                      ev.payload.reasonCodes?.[0],
                                  )}
                                </div>
                              </div>
                            )}

                            {(ev.files || []).length > 0 && (
                              <div className="flex flex-wrap gap-3 pt-2">
                                {ev.files?.map((file, k) => (
                                  <button
                                    key={k}
                                    onClick={() => handleDownload(file)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                                  >
                                    <FileText className="w-3 h-3 text-emerald-500" />
                                    {file.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Submitted Evidence entries */}
                    {evidence.map((ev, i) => (
                      <div key={`evi-${i}`} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-400 mt-2 shadow-[0_0_8px_rgba(96,165,250,0.3)]" />
                            <div className="h-full w-px bg-slate-100 min-h-[40px]" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-blue-500">
                                  evidence · {(ev.type || "").toLowerCase()}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">
                                  {new Date(ev.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-slate-300 capitalize">{role}</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 text-sm text-slate-700 font-bold space-y-2">
                              {ev.payload?.url && (
                                <a
                                  href={ev.payload.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 underline flex items-center gap-1.5 break-all"
                                >
                                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                                  {ev.payload.url}
                                </a>
                              )}
                              {ev.payload?.fileName && (
                                <button
                                  onClick={() => handleDownload({ key: ev.payload.key, fileName: ev.payload.fileName })}
                                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 cursor-pointer transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                  {ev.payload.fileName}
                                </button>
                              )}
                              {ev.payload?.note && (
                                <p className="text-slate-600 italic">&quot;{ev.payload.note}&quot;</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 sticky top-8 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-400 text-[10px] font-bold  uppercase tracking-wider">
                Case details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-1.5">
                <p className=" text-slate-400 text-xs font-bold ">Status</p>
                <div className="inline-flex">
                  <p className="text-sm font-bold text-slate-900 capitalize bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {dispute.status?.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className=" text-slate-400 text-xs font-bold ">Opened by</p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {dispute.openedBy?.name || "Unknown"}
                </p>
              </div>
              {dispute.requirementRef && (
                <div className="space-y-2">
                  <p className=" text-slate-400 text-xs font-bold ">
                    Target requirement
                  </p>
                  <div className="bg-emerald-50/50 rounded-xl p-3 text-xs font-bold text-emerald-700 border border-emerald-100 shadow-inner">
                    {dispute.requirementRef}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <p className=" text-slate-400 text-xs font-bold ">Reason protocol</p>
                <div className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold">
                  {getReasonLabel(
                    dispute.reasonCode || dispute.reasonCodes?.[0] || "",
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
