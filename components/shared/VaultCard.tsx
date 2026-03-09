"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lock, TrendingUp } from "lucide-react";
import type { Vault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";

export interface VaultCardProps {
  vault: Vault;
  isClient: boolean;
}

export function VaultCard({ vault, isClient }: VaultCardProps) {
  return (
    <Card className="bg-muted border-white/5 card-interactive group p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight text-white  truncate">
          {vault.title}
        </h3>
        <StatusBadge status={vault.status} />
      </div>

      <div className="space-y-4">
        {/* Value */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-white/30 mb-1">
            Project value
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">$</span>
            <h2 className="text-3xl font-bold text-white tracking-tighter ">
              {(vault.totalAmount || vault.amount || 0).toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Stakeholders */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <TrendingUp className="w-2.5 h-2.5 text-slate-900" />
          </div>
          <p className="text-[10px] text-slate-900 font-bold tracking-widest">
            {isClient ? "Freelancer: " : "Client: "}
            <span className="text-white/80">
              {isClient
                ? vault.freelancerName || vault.freelancerEmail || "Unassigned"
                : vault.clientName || "Dayle Client"}
            </span>
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <span className="text-[9px] font-bold tracking-widest text-white/30">
            {vault.deliverables?.length || 0} deliverables
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span
            className={cn(
              "text-[9px] font-bold tracking-widest",
              vault.submissions?.length > 0
                ? "text-emerald-500"
                : "text-white/30",
            )}
          >
            {vault.submissions?.length > 0
              ? isClient
                ? "Submission received"
                : `${vault.submissions[0].deliverableStatus?.filter((d: any) => d.included).length || 0} of ${vault.deliverables?.length || 0} Claimed`
              : "Waiting for submission"}
          </span>
        </div>
      </div>

      <Link
        href={`/${isClient ? "client" : "freelancer"}/vault/${vault.id}`}
        className="block pt-4"
      >
        <Button
          variant="outline"
          className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold tracking-widest text-[10px] h-11"
        >
          View details
        </Button>
      </Link>
    </Card>
  );
}
