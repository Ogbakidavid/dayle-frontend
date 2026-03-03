"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLedger } from "@/lib/store/ledger-context";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { Search, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PROCESSING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface GlobalLedgerViewProps {
  role: "client" | "freelancer";
}

export function GlobalLedgerView({ role }: GlobalLedgerViewProps) {
  const [search, setSearch] = useState("");
  const { transactions: entries, loading } = useLedger();
  const { vaults } = useVault();

  const filtered = useMemo(() => {
    return (entries || []).filter((entry: any) => {
      const vault = (vaults || []).find((v: any) => v.id === entry.vaultId);
      return (
        entry.id?.toLowerCase().includes(search.toLowerCase()) ||
        (entry.description || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (vault?.title || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [entries, vaults, search]);

  const processingTotal = useMemo(
    () =>
      (entries || [])
        .filter((entry: any) =>
          ["PROCESSING", "PENDING"].includes(entry.status),
        )
        .reduce((sum: number, entry: any) => sum + Math.abs(entry.amount), 0),
    [entries],
  );

  const completedTotal = useMemo(
    () =>
      (entries || [])
        .filter((entry: any) => entry.status === "CONFIRMED")
        .reduce((sum: number, entry: any) => sum + Math.abs(entry.amount), 0),
    [entries],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 font-['Poppins',sans-serif]"
    >
      <header className="space-y-3">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold tracking-wide text-emerald-400 italic"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Financial activity protocol
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-5xl font-bold text-white tracking-tighter italic"
        >
          {role === "client" ? "Ledger management" : "Earning history"}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-[10px] md:text-xs font-bold text-white/40 tracking-wide max-w-2xl leading-relaxed"
        >
          Synchronized transaction log reflecting all capital movements.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "In Transit",
            value: `$${processingTotal.toLocaleString()}`,
            color: "text-amber-500",
            bg: "bg-amber-500/5",
            border: "border-amber-500/10",
          },
          {
            label: "Distributed",
            value: `$${completedTotal.toLocaleString()}`,
            color: "text-emerald-500",
            bg: "bg-emerald-500/5",
            border: "border-emerald-500/10",
          },
          {
            label: "Total Events",
            value: `${(entries || []).length}`,
            color: "text-blue-500",
            bg: "bg-blue-500/5",
            border: "border-blue-500/10",
          },
        ].map((stat) => (
          <motion.div
            variants={itemVariants}
            key={stat.label}
            className="group"
          >
            <Card
              className={cn(
                "bg-[#0D0D0E] border border-white/5 shadow-2xl transition-all group-hover:border-white/10 overflow-hidden relative",
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl opacity-10 transition-all group-hover:opacity-20",
                  stat.bg,
                )}
              />
              <CardContent className="py-8 relative z-10">
                <p className="text-[9px] font-bold tracking-wide text-white/30 mb-2 group-hover:text-white/50 transition-colors italic">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "text-4xl font-bold tracking-tighter font-mono",
                    stat.color,
                  )}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4"
      >
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ledger entries..."
            className="w-full pl-12 pr-4 py-4 bg-[#0D0D0E] font-bold tracking-wide border border-white/5 rounded-2xl text-xs text-white placeholder:text-white/5 focus:outline-none focus:border-emerald-500/30 shadow-xl transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-bold text-white/30 tracking-wide hidden sm:block italic">
            Real-time verification active
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-[#0D0D0E] border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/1">
                    <th className="px-6 py-5 text-[10px] font-bold tracking-wide text-white/20 italic">
                      Transaction node
                    </th>
                    <th className="hidden md:table-cell px-6 py-5 text-[10px] font-bold tracking-wide text-white/20 italic">
                      Project axis
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold tracking-wide text-white/20 italic">
                      State
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold tracking-wide text-white/20 italic text-right">
                      Value (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-8 h-8 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                          <span className="text-[10px] font-bold tracking-wide text-white/20">
                            Syncing node history
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group">
                            <Search className="w-6 h-6 text-white/10 group-hover:text-white/20 transition-all" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wide text-white/20">
                            No matching records detected
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((entry: any) => {
                      const vault = (vaults || []).find(
                        (v: any) => v.id === entry.vaultId,
                      );
                      return (
                        <tr
                          key={entry.id}
                          className="group hover:bg-white/2 transition-colors cursor-pointer border-l-2 border-transparent hover:border-emerald-500/50"
                        >
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "hidden xs:flex w-10 h-10 rounded-xl items-center justify-center border transition-all shadow-lg",
                                  entry.type === "RELEASE" ||
                                    entry.type === "DEPOSIT"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500"
                                    : entry.type === "LOCK" ||
                                        entry.type === "REFUND"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500"
                                      : "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-black group-hover:border-blue-500",
                                )}
                              >
                                {entry.type === "RELEASE" ||
                                entry.type === "WITHDRAW" ? (
                                  <ArrowUpRight className="w-5 h-5" />
                                ) : (
                                  <ArrowDownLeft className="w-5 h-5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white font-bold tracking-tight truncate group-hover:text-emerald-400 transition-colors italic">
                                  {entry.description || entry.id}
                                </p>
                                <p className="text-[9px] font-bold tracking-wide text-white/20 mt-1">
                                  Sig: {entry.id}
                                </p>
                                <div className="md:hidden mt-2 flex items-center gap-2">
                                  <span className="text-[9px] text-white/40 font-bold tracking-wide truncate max-w-[120px]">
                                    {vault?.title || "Vault"}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-white/20" />
                                  <span className="text-[9px] text-white/30 font-bold tracking-widest font-mono">
                                    {new Date(
                                      entry.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-6 font-['Poppins',sans-serif]">
                            <p className="text-xs text-white/70 font-bold tracking-tight italic truncate max-w-[200px]">
                              {vault?.title || "Independent transaction"}
                            </p>
                            <p className="text-[9px] text-white/20 font-bold tracking-wide mt-1.5 flex items-center gap-1.5 font-mono">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex justify-center sm:justify-start">
                              <span
                                className={cn(
                                  "px-3 py-1.5 text-[9px] font-bold tracking-wide rounded-full border shadow-sm italic transition-all",
                                  statusStyles[entry.status] ||
                                    "bg-white/5 border-white/10 text-white/40",
                                )}
                              >
                                {entry.status.charAt(0) +
                                  entry.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <p className="text-base font-bold text-white font-mono tracking-widest leading-none">
                              ${Math.abs(entry.amount).toLocaleString()}
                            </p>
                            <p className="text-[9px] text-white/20 font-bold tracking-wide mt-1 italic">
                              {entry.amount < 0 ? "Debit" : "Credit"}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
