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
  timestamp: string;
  actor: string;
  payloadJson?: any;
  payload?: any;
  files?: Array<{ name: string; [key: string]: any }>;
  [key: string]: any;
}

interface Dispute {
  id: string;
  vaultId: string;
  status: string;
  openedBy: string;
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
      <div className="text-white/70 p-8 text-center bg-black/20 rounded-xl border border-white/5">
        Loading case file...
      </div>
    );

  if (!dispute) {
    return (
      <div className="text-white/70 p-8 text-center bg-black/20 rounded-xl border border-white/5">
        Dispute not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <Link
        href={`/${role}/disputes`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to disputes
      </Link>

      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold  text-emerald-400 flex items-center gap-2">
            <Gavel className="w-3 h-3" />
            Case file
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Case #{dispute.id}
        </h1>
        <p className="text-sm text-white/60">
          Vault: {vault?.title || "Vault"}
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Timeline / Evidence Ledger */}
        <div className="space-y-6">
          <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-white/1">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <span>Evidence Ledger</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white/70 hover:text-white bg-transparent text-sm "
                >
                  + Add evidence
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {events.length === 0 ? (
                  <div className="p-12 text-center text-white/30 text-sm">
                    No events logged in the evidence ledger yet.
                  </div>
                ) : (
                  events.map((ev, i) => (
                    <div
                      key={i}
                      className="p-6 hover:bg-white/1 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon/Actor */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                          <div className="h-full w-px bg-white/5 min-h-[40px]" />
                        </div>

                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold r text-emerald-400">
                                {ev.type?.replace("_", " ").toLowerCase()}
                              </span>
                              <span className="text-sm text-slate-900 ">
                                {new Date(ev.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-white/30 ">
                              {ev.actor}
                            </span>
                          </div>

                          {/* Payload Content */}
                          <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-sm text-gray-400 leading-relaxed shadow-inner">
                            {ev.payloadJson?.notes ||
                              ev.payload?.note ||
                              ev.payload?.decision ||
                              (typeof ev.payload === "string"
                                ? ev.payload
                                : JSON.stringify(ev.payload || {}))}
                          </div>

                          {/* Reason Codes Badge */}
                          {(ev.payload?.reasonCode ||
                            ev.payload?.reasonCodes) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <div className=" font-bold  text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shadow-sm shadow-amber-500/10">
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
                                  className="flex items-center gap-2 text-sm text-white/50 bg-white/3 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 hover:text-white transition-all cursor-pointer"
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
          <Card className="bg-muted border-white/10 sticky top-8 shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white text-sm font-bold  opacity-60">
                Case details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-1">
                <p className=" text-white/30 font-bold ">Status</p>
                <div className="inline-flex">
                  <p className="text-base font-bold text-white capitalize bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {dispute.status?.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className=" text-white/30 font-bold ">Opened by</p>
                <p className="text-sm font-medium text-white/80">
                  {dispute.openedBy}
                </p>
              </div>
              {dispute.requirementRef && (
                <div className="space-y-2">
                  <p className=" text-white/30 font-bold ">
                    Target requirement
                  </p>
                  <div className="bg-emerald-500/5 rounded p-2.5 text-sm  text-emerald-400 border border-emerald-500/10 shadow-inner">
                    {dispute.requirementRef}
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <p className=" text-white/30 font-bold ">Reason protocol</p>
                <div className="text-sm leading-relaxed text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 font-medium">
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
