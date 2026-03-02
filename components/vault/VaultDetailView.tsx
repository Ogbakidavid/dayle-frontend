"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EvidencePanel } from "@/components/shared/EvidencePanel";
import { api } from "@/lib/api-client";
import { DotLoader } from "@/components/ui/dot-loader";
import type { Vault } from "@/lib/store/vault-context";
import { FileText, ShieldCheck, ClipboardList } from "lucide-react";

export interface VaultDetailViewProps {
  vaultId: string;
  role: "client" | "freelancer";
}

export function VaultDetailView({ vaultId, role }: VaultDetailViewProps) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<any[] | null>(null);

  const fetchVault = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.vaults.getById(vaultId);
      setVault(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load vault");
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const fetchEvidence = React.useCallback(async () => {
    try {
      const data = await api.evidence.list({ vaultId });
      setEvidence(data);
    } catch (err) {
      console.error(err);
    }
  }, [vaultId]);

  useEffect(() => {
    if (vault) {
      fetchEvidence();
    }
  }, [vault, fetchEvidence]);

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

  if (error || !vault) {
    return (
      <div className="text-white/70 py-10 text-center border border-white/10 rounded-lg bg-muted">
        <p className="font-bold uppercase mb-2">{error || "Vault not found"}</p>
        <Link href={`/${role}/vaults`}>
          <Button variant="outline" size="sm">
            Back to list
          </Button>
        </Link>
      </div>
    );
  }

  const totalAmount = vault.totalAmount || vault.amount || 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Vault Detail
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{vault.title}</h1>
            <p className="text-sm text-white/60 max-w-2xl">
              {vault.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide text-white">
              <span>Client: {vault.clientName}</span>
              <span>
                Freelancer:{" "}
                {vault.freelancer?.name ||
                  vault.freelancer?.email ||
                  vault.freelancerEmail ||
                  "Unassigned"}
              </span>
              <span>
                Created: {new Date(vault.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <StatusBadge status={vault.status} />
            <div className="text-3xl font-bold text-white">
              ${totalAmount.toLocaleString()}
            </div>
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              Total locked
            </span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-500" />
              Project Requirements
            </h2>
          </div>
          <Card className="bg-muted border-white/10">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-white text-lg">
                  Vault Requirements
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/5 bg-black/40 p-4 space-y-2">
                <div className="space-y-2">
                  {(vault.requirements || []).length === 0 ? (
                    <p className="text-sm text-white/50 italic">
                      No specific requirements listed.
                    </p>
                  ) : (
                    (vault.requirements || []).map((req: any) => (
                      <div
                        key={req.reqId}
                        className="flex items-start gap-3 text-sm text-white/70"
                      >
                        <FileText className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">
                            {req.reqId} · {req.label}
                          </p>
                          <p className="text-xs text-white/50">
                            {req.acceptance}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <EvidencePanel vault={vault} evidence={evidence || []} />
        </div>
      </div>
    </div>
  );
}
