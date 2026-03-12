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
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-slate-900 flex items-center gap-2 text-base font-bold ">
          <Gavel className="w-4 h-4 text-amber-500" />
          Dispute initiation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <p className="text-sm text-slate-600 leading-relaxed font-bold">
          Disputes are vault-scoped and require structured reason codes.
          Free-text complaints are not accepted.
        </p>

        {vault && policy.requiresRequirementId && (
          <div className="space-y-2">
            <p className=" font-bold st text-slate-900">Requirement scope</p>
            <select
              value={selectedRequirement}
              onChange={handleSelectChange}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all outline-none font-bold"
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
          <p className=" font-bold st text-slate-900">Reason codes</p>
          <div className="grid gap-2">
            {DISPUTE_REASON_CODES.map((reason) => {
              const active = selectedReasons.includes(reason.code);
              return (
                <label
                  key={reason.code}
                  className={`flex items-start gap-4 border transition-all cursor-pointer rounded-xl p-4 text-sm ${
                    active
                      ? "border-amber-500 bg-amber-50/50 text-slate-900 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleReason(reason.code)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-amber-500 focus:ring-amber-500/10"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      {reason.label}
                    </p>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
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
              ? "border-emerald-100 bg-emerald-50 text-emerald-900"
              : "border-amber-100 bg-amber-50 text-amber-900"
          }`}
        >
          <EligibilityIcon
            className={`w-5 h-5 mt-0.5 shrink-0 ${eligibility.eligible ? "text-emerald-600" : "text-amber-600"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-bold">
              {eligibility.eligible ? "Ready to open" : "Action required"}
            </p>
            <p className="text-sm font-bold opacity-70">
              {eligibility.reason || "Select scope above"}
            </p>
          </div>
        </div>

        <Button
          className={`w-full h-11 transition-all font-bold rounded-xl ${
            canSubmit
              ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-sm"
              : "bg-slate-100 text-slate-400 border border-slate-200"
          }`}
          disabled={!canSubmit}
        >
          {canSubmit ? "Submit dispute" : "Dispute locked"}
        </Button>
      </CardContent>
    </Card>
  );
}
