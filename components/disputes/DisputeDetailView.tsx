"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { DISPUTE_REASON_CODES } from "@/lib/rules/disputes";
import { ChevronLeft, Gavel, FileText } from "lucide-react";
import type { Vault } from "@/lib/store/vault-context";

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

export function DisputeDetailView({ disputeId, role }: DisputeDetailViewProps) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await api.disputes.getById(disputeId);
        setDispute(d);
        if (d) {
          const v = await api.vaults.getById(d.vaultId);
          setVault(v);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [disputeId]);

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
    <div className="space-y-8 pb-20">
      <Link
        href={`/${role}/disputes`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-bold"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to disputes
      </Link>

      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold  text-emerald-600 flex items-center gap-2">
            <Gavel className="w-3 h-3" />
            Case file
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Case #{dispute.id.slice(0, 12)}...
        </h1>
        <p className="text-sm text-slate-600 font-bold">
          Vault: {vault?.title || "Vault"}
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Timeline / Evidence Ledger */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900 text-lg flex items-center justify-between font-bold">
                <span>Evidence Ledger</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                >
                  + Add evidence
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {events.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm font-bold">
                    No events logged in the evidence ledger yet.
                  </div>
                ) : (
                  events.map((ev, i) => (
                    <div
                      key={i}
                      className="p-6 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon/Actor */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                          <div className="h-full w-px bg-slate-100 min-h-[40px]" />
                        </div>

                        <div className="flex-1 space-y-3">
                          {/* Header */}
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

                          {/* Payload Content */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 text-sm text-slate-600 font-bold leading-relaxed shadow-inner">
                              {ev.type === "OPENED" ? (
                                <div className="space-y-1">
                                  <p className="text-slate-900">
                                    Dispute initiated for{" "}
                                    <span className="text-emerald-600 underline">
                                      {vault?.title}
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-500 italic">
                                    "{dispute.description}"
                                  </p>
                                </div>
                              ) : (
                                ev.payloadJson?.notes ||
                                ev.payload?.note ||
                                ev.payload?.decision ||
                                (typeof ev.payload === "string"
                                  ? ev.payload
                                  : JSON.stringify(ev.payload || {}))
                              )}
                            </div>

                          {/* Reason Codes Badge */}
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

                          {/* Files */}
                          {(ev.files || []).length > 0 && (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {ev.files?.map((file, k) => (
                                <div
                                  key={k}
                                  className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
                                >
                                  <FileText className="w-3 h-3 text-emerald-500" />
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
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
