"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { disputes, getVaultById } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Gavel, ArrowUpRight } from "lucide-react";

const statusStyles = {
  open: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-white/5 text-white/40 border-white/10",
};

export function DisputeListView({ role }) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
          Disputes
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
          Case Queue
        </h1>
        <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
          Disputes are tied to milestones and must reference structured reason
          codes.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            label: "Open cases",
            value: disputes.filter((d) => d.status === "open").length,
          },
          {
            label: "Resolved",
            value: disputes.filter((d) => d.status === "resolved").length,
          },
          { label: "Total", value: disputes.length },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#111111] border-white/10">
            <CardContent className="py-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white mt-1 tracking-tighter">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111111] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-400" />
            Dispute List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {disputes.map((dispute) => {
            const vault = getVaultById(dispute.vaultId);
            return (
              <div
                key={dispute.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/5 bg-black/40 rounded-lg p-4"
              >
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">
                    {dispute.id} · {vault?.title || "Vault"}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">
                    Mileston {dispute.milestoneId} · Requirement{" "}
                    {dispute.requirementId || "N/A"}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-0.5">
                    Opened {new Date(dispute.openedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border",
                      statusStyles[dispute.status]
                    )}
                  >
                    {dispute.status}
                  </span>
                  <Link href={`/${role}/disputes/${dispute.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white/70 hover:text-white"
                    >
                      View Case
                      <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
