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
      setError(err.message || "Failed to load project details");
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
        <p className="font-bold st text-sm">Securing data link...</p>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="text-white/70 py-10 text-center border border-white/10 rounded-lg bg-muted">
        <p className="font-bold mb-2">{error || "Project not found"}</p>
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
        <div className="flex items-center gap-3 text-sm font-bold  text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Project details
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{vault.title}</h1>
            <p className="text-sm text-white/60 max-w-2xl">
              {vault.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold  text-white">
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
            <span className="text-sm font-bold  text-white">Total locked</span>
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
                  Project requirements
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/5 bg-black/40 p-4 space-y-2">
                <div className="space-y-2">
                  {(vault.requirements || []).length === 0 ? (
                    <p className="text-sm text-white/50 ">
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
                          <p className="text-sm text-white/50">
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
          {vault.status === "AWAITING_PAYMENT" && role === "client" && (
            <Card className="bg-emerald-500/10 border-emerald-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <CardHeader>
                <CardTitle className="text-emerald-400 text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Payment Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-white/80">
                  To fund this project, please make a bank transfer using the details below. The project status will update automatically once payment is verified.
                </p>
                <div className="bg-black/40 rounded-lg p-4 space-y-3 border border-white/5">
                  <div className="grid grid-cols-[1fr_2fr] gap-y-3 text-sm">
                    <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest self-center">Amount</span>
                    <span className="text-white font-mono text-lg font-bold">
                      {vault.partnaExpectedAmount?.toLocaleString()} {vault.client?.country === 'Kenya' ? 'KES' : 'NGN'}
                    </span>
                    
                    <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest self-center">Bank Name</span>
                    <span className="text-white font-semibold">{vault.partnaBankName}</span>
                    
                    <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest self-center">Account Number</span>
                    <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-base tracking-[0.2em]">{vault.partnaAccountNumber}</span>
                    </div>
                    
                    <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest self-center">Account Name</span>
                    <span className="text-white font-semibold">{vault.partnaAccountName}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                  <div className="flex gap-3">
                      <ClipboardList className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-200/70 leading-relaxed">
                        <strong>Important:</strong> Ensure the amount matches exactly. Transfers usually settle within 5-15 minutes.
                      </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <EvidencePanel vault={vault} evidence={evidence || []} />
        </div>
      </div>
    </div>
  );
}
