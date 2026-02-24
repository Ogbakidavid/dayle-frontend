"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  EvidencePanel,
  type EvidenceItemData,
} from "@/components/shared/EvidencePanel";
import { DisputeInitiationPanel } from "@/components/disputes/DisputeInitiationPanel";
import { MILESTONE_STATUS_LABELS } from "@/lib/rules/milestones";
import { BadgeCheck, Ban, ChevronLeft, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { DotLoader } from "@/components/ui/dot-loader";
import type { Vault, Milestone } from "@/lib/store/vault-context";

const statusStyles = {
  PASS: "text-emerald-400",
  FAIL: "text-red-400",
  FLAGGED: "text-amber-400",
  HUMAN_REVIEW: "text-sky-400",
  PENDING: "text-amber-400",
} as const;

export interface MilestoneVerificationViewProps {
  vaultId: string;
  milestoneId: string;
  role: "client" | "freelancer";
}

export function MilestoneVerificationView({
  vaultId,
  milestoneId,
  role,
}: MilestoneVerificationViewProps) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItemData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const vaultData = await api.vaults.getById(vaultId);
      setVault(vaultData);

      const m = vaultData.milestones?.find((m) => m.id === milestoneId);
      if (m) {
        setMilestone(m);
        // Fetch evidence
        const evidenceData = await api.evidence.list({ milestoneId });
        setEvidence(evidenceData as any);
      } else {
        setError("Milestone not found");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load milestone");
    } finally {
      setLoading(false);
    }
  }, [vaultId, milestoneId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/50 gap-4">
        <DotLoader size="lg" />
        <p className="font-bold uppercase tracking-widest text-xs">
          Securing data link...
        </p>
      </div>
    );
  }

  if (error || !vault || !milestone) {
    return (
      <div className="text-white/70 py-10 text-center border border-white/10 rounded-lg bg-muted">
        <p className="font-bold uppercase mb-2">
          {error || "Milestone not found"}
        </p>
        <Link href={`/${role}/vault/${vaultId}`}>
          <Button variant="outline" size="sm">
            Back to vault
          </Button>
        </Link>
      </div>
    );
  }

  const verificationStatus =
    (milestone.verification as any)?.status || "PENDING";
  const isPass = verificationStatus === "PASS";
  const isFail = verificationStatus === "FAIL";

  return (
    <div className="space-y-8">
      <Link
        href={`/${role}/vault/${vaultId}`}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to vault
      </Link>

      <header className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-400">
          Verification Result
        </div>
        <h1 className="text-3xl font-bold text-white">{milestone.title}</h1>
        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-white">
          <span>
            Status:{" "}
            {MILESTONE_STATUS_LABELS[
              milestone.status as keyof typeof MILESTONE_STATUS_LABELS
            ] || milestone.status}
          </span>
          <span>Vault: {vault.title}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="space-y-6">
          <Card className="bg-muted border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                Objective Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <ShieldCheck
                  className={`w-5 h-5 ${statusStyles[verificationStatus as keyof typeof statusStyles] || statusStyles.PENDING}`}
                />
                <span
                  className={
                    statusStyles[
                      verificationStatus as keyof typeof statusStyles
                    ] || statusStyles.PENDING
                  }
                >
                  {verificationStatus}
                </span>
              </div>
              {(milestone.verification as any)?.verifiedAt && (
                <p className="text-xs text-white font-bold uppercase tracking-wide">
                  Verified{" "}
                  {new Date(
                    (milestone.verification as any).verifiedAt,
                  ).toLocaleDateString()}
                </p>
              )}
              <div className="space-y-2">
                {(milestone.verification as any)?.checks?.length ? (
                  (milestone.verification as any).checks.map(
                    (check: string) => (
                      <div
                        key={check}
                        className="flex items-start gap-3 text-sm text-white/70"
                      >
                        {isFail ? (
                          <Ban className="w-4 h-4 text-red-400 mt-0.5" />
                        ) : (
                          <BadgeCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
                        )}
                        <span>{check}</span>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-sm text-white">
                    Verification review is still in progress.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Release Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPass ? (
                <p className="text-sm text-white/70">
                  AI audit passed. Awaiting client approval for fund release.
                </p>
              ) : isFail ? (
                <p className="text-sm text-white/70">
                  Compliance failed. Update evidence and resubmit for
                  verification.
                </p>
              ) : verificationStatus === "FLAGGED" ? (
                <p className="text-sm text-white/70">
                  AI audit flagged potential issues. Awaiting human advisor
                  review or client override.
                </p>
              ) : verificationStatus === "HUMAN_REVIEW" ? (
                <p className="text-sm text-white/70">
                  Awaiting manual audit by a human advisor.
                </p>
              ) : (
                <p className="text-sm text-white/70">
                  Verification in progress. You will see an outcome once checks
                  complete.
                </p>
              )}
              <Button
                variant="outline"
                className="border-white/10 text-white/70 hover:text-white"
              >
                View Ledger Entry
              </Button>
            </CardContent>
          </Card>

          <DisputeInitiationPanel milestone={milestone as any} />
        </div>

        <EvidencePanel
          milestone={milestone as any}
          evidence={evidence as any}
        />
      </div>
    </div>
  );
}
