"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceChannel } from "@/components/milestones/EvidenceChannel";

import { useVault } from "@/lib/store/vault-context";
import { MILESTONE_STATUS_LABELS } from "@/lib/rules/milestones";

export default function ClientMilestoneDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;
  const milestoneId = params.milestoneId as string;
  const { vaults, loading } = useVault();

  // Find vault and milestone
  const vault = (vaults || []).find((v: any) => v.id === vaultId);
  const milestone = vault?.milestones?.find((m: any) => m.id === milestoneId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        Milestone Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-8">
          <Link
            href={`/client/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">
                  {milestone.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[10px]"
                >
                  {(MILESTONE_STATUS_LABELS as any)[milestone.status] ||
                    milestone.status}
                </Badge>
              </div>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                {milestone.description}
              </p>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                Milestone Value
              </p>
              <p className="text-3xl font-black text-white tracking-tight font-mono">
                ${(milestone.totalAmount || milestone.amount).toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white font-bold uppercase tracking-wide">
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(milestone.requirementItemsJson || []).map(
                  (item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/2 border border-white/5"
                    >
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-400 text-sm font-bold uppercase tracking-normal">
                        {item.label}
                      </span>
                    </div>
                  ),
                )}
                {!milestone.requirementItemsJson?.length && (
                  <p className="text-sm text-white/50 font-bold uppercase tracking-widest">
                    No structured requirements listed.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link
                href={`/client/vault/${vaultId}/milestones/${milestoneId}/review`}
              >
                <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-widest text-[11px] px-8 transition-all">
                  Review Submission
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg font-bold uppercase tracking-wide">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Due Date
                  </p>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold">
                      {milestone.dueDate
                        ? new Date(milestone.dueDate).toLocaleDateString()
                        : "No date set"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2 text-amber-500">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-widest text-[11px]">
                      {(MILESTONE_STATUS_LABELS as any)[milestone.status] ||
                        milestone.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Channel */}
            <div className="h-[600px]">
              <EvidenceChannel
                vaultId={vaultId}
                milestoneId={milestoneId}
                role="client"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
