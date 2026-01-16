"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLedgerEntries, getVaultById } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Search, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const statusStyles = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function GlobalLedgerView({ role }) {
  const [search, setSearch] = useState("");
  const entries = useMemo(() => getLedgerEntries(), []);

  const filtered = entries.filter((entry) => {
    const vault = getVaultById(entry.vaultId);
    return (
      entry.id.toLowerCase().includes(search.toLowerCase()) ||
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      (vault?.title || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const processingTotal = entries
    .filter((entry) => ["processing", "pending"].includes(entry.status))
    .reduce((sum, entry) => sum + entry.amount, 0);

  const completedTotal = entries
    .filter((entry) => entry.status === "completed")
    .reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-xs font-black uppercase tracking-wide text-emerald-400">
          Global Ledger
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
          Settlement Activity
        </h1>
        <p className="text-sm font-bold text-white uppercase tracking-wide">
          USD-only ledger view with processing states for all vault movements.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            label: "Processing",
            value: `$${processingTotal.toLocaleString()}`,
          },
          { label: "Completed", value: `$${completedTotal.toLocaleString()}` },
          { label: "Entries", value: `${entries.length}` },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#111111] border-white/10">
            <CardContent className="py-6">
              <p className="text-xs font-black uppercase tracking-wide text-white/30">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-white mt-1 tracking-tighter">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ledger entries..."
            className="w-full pl-10 pr-4 py-2 bg-[#111111] border border-white/10 rounded-lg text-sm text-white focus:border-emerald-500/40"
          />
        </div>
        <Link href={`/${role}`}>
          <Button
            variant="outline"
            className="border-white/10 text-white/70 hover:text-white"
          >
            Back to dashboard
          </Button>
        </Link>
      </div>

      <Card className="bg-[#111111] border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/5">
                <tr className="text-xs font-black uppercase tracking-wide text-white/30">
                  <th className="px-6 py-4">Entry</th>
                  <th className="px-6 py-4">Vault</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((entry) => {
                  const vault = getVaultById(entry.vaultId);
                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center border",
                              entry.type === "release"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            )}
                          >
                            {entry.type === "release" ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-white font-black uppercase tracking-tight">
                              {entry.description}
                            </p>
                            <p className="text-sm uppercase font-black tracking-wide text-white/30">
                              {entry.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/70">
                          {vault?.title || "Vault"}
                        </p>
                        <p className="text-xs text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 text-sm font-bold uppercase tracking-wide rounded-full border",
                            statusStyles[entry.status]
                          )}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">
                        ${entry.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
