"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/card";
import { useLedger } from "@/lib/store/ledger-context";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { Search, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";

// Helper: format a raw USDC/USDT amount stored in 6-decimal base units
const formatAmount = (raw: bigint | number | string): number => {
  try {
    return parseFloat(ethers.formatUnits(BigInt(raw), 6));
  } catch {
    return 0;
  }
};

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
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
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
        .reduce((sum: number, entry: any) => sum + Math.abs(formatAmount(entry.amount)), 0),
    [entries],
  );

  const completedTotal = useMemo(
    () =>
      (entries || [])
        .filter((entry: any) => entry.status === "CONFIRMED")
        .reduce((sum: number, entry: any) => sum + Math.abs(formatAmount(entry.amount)), 0),
    [entries],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 font-primary"
    >
      <header className="space-y-3">
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100  font-bold  text-emerald-700 "
        >
          Financial activity protocol
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tighter "
        >
          {role === "client" ? "Ledger management" : "Earning history"}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-sm md:text-sm font-bold text-slate-600  max-w-2xl leading-relaxed"
        >
          Synchronized transaction log reflecting all capital movements.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "In Transit",
            value: `$${processingTotal.toLocaleString()}`,
            color: "text-slate-900",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
          {
            label: "Distributed",
            value: `$${completedTotal.toLocaleString()}`,
            color: "text-slate-900",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            label: "Total Events",
            value: `${(entries || []).length}`,
            color: "text-slate-900",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
        ].map((stat) => (
          <motion.div
            variants={itemVariants}
            key={stat.label}
            className="group"
          >
            <Card
              className={cn(
                "bg-white border border-slate-200 shadow-sm transition-all group-hover:border-slate-300 overflow-hidden relative",
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl opacity-10 transition-all group-hover:opacity-20",
                  stat.bg,
                )}
              />
              <CardContent className="py-8 relative z-10">
                <p className="text-sm font-bold  text-slate-600 mb-2 group-hover:text-slate-600 transition-colors ">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold text-slate-900 tracking-tighter ",
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-600 transition-colors" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ledger entries..."
            className="w-full pl-12 pr-4 py-4 bg-white font-bold  border border-slate-200 rounded-2xl text-sm md:text-base text-slate-900 placeholder-slate-900 focus:outline-none focus:border-emerald-500/30 shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-slate-600  hidden sm:block ">
            Real-time verification active
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="hidden sm:table-header-group">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-600  uppercase">
                        Transaction node
                      </th>
                      <th className="hidden md:table-cell px-6 py-4 text-[11px] font-bold  text-slate-600 uppercase">
                        Project axis
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold  text-slate-600 uppercase">
                        State
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-600  uppercase text-right">
                        Value (USD)
                      </th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-8 h-8 border-2 border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                          <span className=" font-bold  text-slate-600">
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
                          <span className=" font-bold  text-slate-600">
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
                          className="group hover:bg-slate-50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-emerald-600 flex flex-col sm:table-row sm:border-none last:border-none"
                        >
                          <td className="px-4 sm:px-6 py-5 sm:py-6 sm:table-cell">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div
                                className={cn(
                                  "hidden xs:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl items-center justify-center border transition-all shadow-lg shrink-0",
                                  entry.type === "RELEASE" ||
                                    entry.type === "DEPOSIT"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                                    : entry.type === "LOCK" ||
                                        entry.type === "REFUND"
                                      ? "bg-amber-50 border-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600"
                                      : "bg-blue-50 border-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
                                )}
                              >
                                {entry.type === "RELEASE" ||
                                entry.type === "WITHDRAW" ? (
                                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                  <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-slate-900 font-bold tracking-tight truncate group-hover:text-emerald-700 transition-colors ">
                                  {entry.description || entry.id}
                                </p>
                                <p className="text-[10px] sm:text-xs font-bold  text-slate-600 mt-1 ">
                                  ID: {entry.id.slice(0, 12)}...
                                </p>
                                <div className="sm:hidden mt-2 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-slate-600 font-bold truncate max-w-[150px]">
                                    {vault?.title || "Independent"}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-xs text-slate-600 font-bold">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="sm:hidden text-right shrink-0">
                                <p className="text-sm font-bold text-slate-900">
                                  ${Math.abs(formatAmount(entry.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={cn(
                                  "text-[10px] font-bold mt-0.5",
                                  entry.amount < 0 ? "text-amber-600" : "text-emerald-600"
                                )}>
                                  {entry.amount < 0 ? "Debit" : "Credit"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-6 font-['Poppins',sans-serif]">
                            <p className="text-sm text-slate-600 font-bold tracking-tight  truncate max-w-[200px]">
                              {vault?.title || "Independent transaction"}
                            </p>
                            <p className="text-sm text-slate-600 font-bold  mt-1.5 flex items-center gap-1.5">
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
                          <td className="px-4 sm:px-6 py-3 sm:py-6 sm:table-cell border-t sm:border-none border-slate-50">
                            <div className="flex sm:justify-start">
                              <span
                                className={cn(
                                  "px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full border shadow-sm transition-all uppercase sm:capitalize",
                                  statusStyles[entry.status] ||
                                    "bg-slate-50 border-slate-200 text-slate-600",
                                )}
                              >
                                {entry.status.toLowerCase()}
                              </span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-6 text-right">
                            <p className="text-base font-bold text-slate-900 leading-none">
                              ${Math.abs(formatAmount(entry.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-slate-600 font-bold mt-1">
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

