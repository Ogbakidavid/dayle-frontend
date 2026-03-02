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

export interface VaultCardProps {
  vault: Vault;
  isClient: boolean;
}

export function VaultCard({ vault, isClient }: VaultCardProps) {
  return (
    <Card className="bg-muted border-white/5 card-interactive group">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-bold text-white line-clamp-1 flex-1">
            {vault.title}
          </CardTitle>
          <StatusBadge status={vault.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-2 text-3xl font-bold text-white amount-display">
              ${vault.amount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-white font-bold uppercase tracking-wide">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked in vault</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 line-clamp-2 min-h-10">
          {vault.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href={`/${isClient ? "client" : "freelancer"}/vault/${vault.id}`}
          className="w-full"
        >
          <Button
            variant="outline"
            className="w-full border-white/10 hover:border-white/20 hover:bg-white/5 text-white/80"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
