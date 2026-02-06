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
  Upload,
  Clock,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EvidenceChannel } from "@/components/milestones/EvidenceChannel";

import { useVault } from "@/lib/store/vault-context";
import { MILESTONE_STATUS_LABELS } from "@/lib/rules/milestones";

export default function FreelancerMilestoneDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;
  const milestoneId = params.milestoneId as string;
  const { vaults, loading } = useVault();

  // Find vault and milestone
  const vault = (vaults || []).find((v) => v.id === vaultId);
  const milestone = vault?.milestones?.find((m: any) => m.id === milestoneId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/20 font-black uppercase tracking-[0.3em] font-['Poppins',sans-serif]">
        <div className="w-12 h-12 border-4 border-white/5 border-t-emerald-500 rounded-full animate-spin mb-6" />
        Syncing Milestone Data
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 font-['Poppins',sans-serif]">
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center max-w-md shadow-2xl">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
            Milestone Nullified
          </h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
            The requested milestone could not be located in the current project
            scope.
          </p>
        </div>
        <Link href={`/freelancer/vault/${vaultId}`}>
          <Button
            variant="outline"
            className="border-white/5 bg-white/2 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl transition-all"
          >
            Return to Vault
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-8">
          <Link
            href={`/freelancer/vault/${vaultId}`}
            className="inline-flex items-center text-xs text-white/40 hover:text-white transition-all mb-8 font-black uppercase tracking-[0.2em] bg-white/2 border border-white/5 py-2 px-4 rounded-xl cursor-pointer group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Vault
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {milestone.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-[0.2em] text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg"
                >
                  {MILESTONE_STATUS_LABELS[milestone.status] ||
                    milestone.status}
                </Badge>
              </div>
              <p className="text-white/40 text-lg font-bold uppercase tracking-tight max-w-2xl leading-relaxed italic">
                {milestone.description}
              </p>
            </div>
            <div className="text-left md:text-right border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-2 italic">
                SECURED VALUE
              </p>
              <p className="text-4xl font-black uppercase text-white tracking-widest font-mono leading-none">
                ${(milestone.totalAmount || milestone.amount).toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/2 rounded-full -mr-24 -mt-24 blur-3xl" />
              <CardHeader className="pb-6 border-b border-white/5">
                <CardTitle className="text-white font-black uppercase tracking-widest text-lg italic flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Required Deliverables
                </CardTitle>
                <CardDescription className="text-white/30 uppercase font-bold tracking-widest text-[10px] mt-2">
                  Structured requirements for milestone validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-8">
                {(milestone.requirementItemsJson || []).map(
                  (item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5 group-hover:border-white/10 transition-all shadow-sm"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                        <FileText className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-white/80 text-xs font-black uppercase tracking-widest italic">
                        {item.label}
                      </span>
                    </div>
                  ),
                )}
                {!milestone.requirementItemsJson?.length && (
                  <div className="p-8 text-center bg-white/1 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">
                      No structured deliverables detected.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Execution Ready?
                  </h3>
                  <p className="text-xs text-white/40 font-black uppercase tracking-widest leading-relaxed max-w-md italic">
                    Initialize the delivery protocol once all requirements have
                    been satisfied. Encrypted submission will follow.
                  </p>
                </div>
                <Link
                  href={`/freelancer/vault/${vaultId}/milestones/${milestoneId}/submit`}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Button className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-[0.15em] text-xs h-14 px-10 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-95 group">
                    Start Delivery
                    <Upload className="w-4 h-4 ml-3 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl overflow-hidden relative group">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-base font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Axis Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-2 italic">
                      TEMPORAL LIMIT
                    </p>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-sm font-black uppercase italic tracking-widest font-mono">
                        {milestone.dueDate
                          ? new Date(milestone.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "UNDEFINED"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/2 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mb-2 italic">
                      LIFECYCLE STATE
                    </p>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <Clock className="w-4 h-4 text-white/40" />
                      </div>
                      <span className="text-sm font-black uppercase italic tracking-widest shadow-sm">
                        {MILESTONE_STATUS_LABELS[milestone.status] ||
                          milestone.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Channel */}
            <div className="h-[600px] shadow-2xl rounded-[32px] overflow-hidden border border-white/5">
              <EvidenceChannel
                vaultId={vaultId}
                milestoneId={milestoneId}
                role="freelancer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
