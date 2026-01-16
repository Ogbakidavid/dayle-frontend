"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/mock-api";
import { useEffect, useState } from "react";
import { DISPUTE_REASON_CODES } from "@/lib/rules/disputes";
import { ChevronLeft, Gavel, FileText, Calendar } from "lucide-react";

function getReasonLabel(code) {
  return DISPUTE_REASON_CODES.find((item) => item.code === code)?.label || code;
}

export function DisputeDetailView({ disputeId, role }) {
  const [dispute, setDispute] = useState(null);
  const [vault, setVault] = useState(null);
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

  // Mock Events if not present (fallback)
  const events = dispute?.events || [];

  if (loading)
    return <div className="text-white/70 p-8">Loading case file...</div>;

  if (!dispute) {
    return <div className="text-white/70 p-8">Dispute not found.</div>;
  }

  const milestone = vault?.milestones?.find(
    (m) => m.id === dispute.milestoneId
  );

  return (
    <div className="space-y-8 pb-20">
      <Link
        href={`/${role}/disputes`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to disputes
      </Link>

      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-400 flex items-center gap-2">
            <Gavel className="w-3 h-3" />
            Case File
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
          Case #{dispute.id}
        </h1>
        <p className="text-sm text-white/60">
          Vault: {vault?.title || "Vault"} · Milestone:{" "}
          {milestone?.title || dispute.milestoneId}
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Timeline / Evidence Ledger */}
        <div className="space-y-6">
          <Card className="bg-[#0D0D0E] border-white/5">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <span>Evidence Ledger</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white/70 hover:text-white bg-transparent text-xs uppercase tracking-wide"
                >
                  + Add Evidence
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {events.map((ev, i) => (
                  <div key={i} className="p-6 hover:bg-white/[0.01]">
                    <div className="flex items-start gap-4">
                      {/* Icon/Actor */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-white/20 mt-2" />
                        <div className="h-full w-px bg-white/5 min-h-[40px]" />
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                              {ev.type.replace("_", " ")}
                            </span>
                            <span className="text-xs text-white/40 font-mono">
                              {new Date(ev.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-white/30 uppercase tracking-wide">
                            {ev.actor}
                          </span>
                        </div>

                        {/* Payload Content */}
                        <div className="bg-[#141416] rounded-lg p-4 border border-white/5 text-sm text-slate-300 leading-relaxed">
                          {ev.payload?.summary ||
                            ev.payload?.note ||
                            ev.payload?.decision ||
                            JSON.stringify(ev.payload)}
                        </div>

                        {/* Reason Codes Badge */}
                        {(ev.payload?.reasonCode ||
                          ev.payload?.reasonCodes) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {getReasonLabel(
                                ev.payload.reasonCode ||
                                  ev.payload.reasonCodes?.[0]
                              )}
                            </div>
                          </div>
                        )}

                        {/* Files */}
                        {(ev.files || []).length > 0 && (
                          <div className="flex flex-wrap gap-3 pt-2">
                            {ev.files.map((file, k) => (
                              <div
                                key={k}
                                className="flex items-center gap-2 text-xs text-white/50 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5"
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-[#111111] border-white/10 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">
                Case Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className="text-lg font-bold text-white capitalize">
                  {dispute.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
                  Opened By
                </p>
                <p className="text-sm font-medium text-white">
                  {dispute.openedBy}
                </p>
              </div>
              {dispute.requirementRef && (
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">
                    Target
                  </p>
                  <div className="bg-white/5 rounded p-2 text-xs font-mono text-emerald-400 border border-white/5">
                    {dispute.requirementRef}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">
                  Scope
                </p>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <div className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">
                      {getReasonLabel(
                        dispute.reasonCode || dispute.reasonCodes?.[0]
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
