"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Gavel, CheckCircle2 } from "lucide-react";
import {
  DISPUTE_REASON_CODES,
  getDisputeEligibility,
} from "@/lib/rules/disputes";
import type { Vault } from "@/lib/store/vault-context";

export interface DisputeInitiationPanelProps {
  vault: Vault;
}

interface DisputePolicy {
  eligibleStatuses: string[];
  requiresRequirementId: boolean;
  [key: string]: any;
}

export function DisputeInitiationPanel({ vault }: DisputeInitiationPanelProps) {
  const [selectedRequirement, setSelectedRequirement] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const policy: DisputePolicy = vault?.disputePolicy || {
    eligibleStatuses: ["failed", "rejected"],
    requiresRequirementId: true,
  };

  const eligibility = useMemo(
    () => getDisputeEligibility(vault as any, selectedRequirement || null),
    [vault, selectedRequirement],
  );

  const canSubmit = eligibility.eligible && selectedReasons.length > 0;
  const EligibilityIcon = eligibility.eligible ? CheckCircle2 : AlertTriangle;
  const eligibilityTone = eligibility.eligible
    ? "text-emerald-400"
    : "text-amber-400";

  const toggleReason = (code: string) => {
    setSelectedReasons((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code],
    );
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRequirement(event.target.value);
  };

  return (
    <Card className="bg-muted border-white/10 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/2">
        <CardTitle className="text-white flex items-center gap-2 text-base font-bold uppercase tracking-wide">
          <Gavel className="w-4 h-4 text-amber-400" />
          Dispute Initiation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <p className="text-sm text-white/60 leading-relaxed">
          Disputes are vault-scoped and require structured reason codes.
          Free-text complaints are not accepted.
        </p>

        {vault && policy.requiresRequirementId && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Requirement scope
            </p>
            <select
              value={selectedRequirement}
              onChange={handleSelectChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40 transition-all outline-none"
            >
              <option value="">Select requirement...</option>
              {(vault as any).submission?.requirements?.map((req: any) => (
                <option key={req.reqId} value={req.reqId}>
                  {req.reqId} · {req.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Reason codes
          </p>
          <div className="grid gap-2">
            {DISPUTE_REASON_CODES.map((reason) => {
              const active = selectedReasons.includes(reason.code);
              return (
                <label
                  key={reason.code}
                  className={`flex items-start gap-4 border transition-all cursor-pointer rounded-xl p-4 text-sm ${
                    active
                      ? "border-amber-500/30 bg-amber-500/10 text-white shadow-inner"
                      : "border-white/5 bg-black/40 text-white/60 hover:border-white/20 hover:bg-white/4"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleReason(reason.code)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white/90">
                      {reason.label}
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div
          className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
            eligibility.eligible
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-amber-500/20 bg-amber-500/10 text-amber-200"
          }`}
        >
          <EligibilityIcon
            className={`w-5 h-5 mt-0.5 shrink-0 ${eligibilityTone}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {eligibility.eligible ? "Ready to Open" : "Action Required"}
            </p>
            <p className="text-xs text-white/70">
              {eligibility.reason || "Select scope above"}
            </p>
          </div>
        </div>

        <Button
          className={`w-full h-11 transition-all font-bold uppercase tracking-wider ${
            canSubmit
              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
              : "bg-white/5 text-white/20 border border-white/5"
          }`}
          disabled={!canSubmit}
        >
          {canSubmit ? "Submit Dispute" : "Dispute Locked"}
        </Button>
      </CardContent>
    </Card>
  );
}
