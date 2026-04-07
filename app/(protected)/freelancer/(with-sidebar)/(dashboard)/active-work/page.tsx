"use client";

import * as React from "react";
import { useVault } from "@/lib/store/vault-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { VaultStatus } from "@/lib/domain/enums";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any },
  },
};

export default function AssignmentsPage() {
  const { vaults, loading } = useVault();
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "COMPLETED" | "ALL">("ACTIVE");

  // All valid assignments (non-draft)
  const allAssignments = vaults.filter((v: any) => v.status !== VaultStatus.DRAFT);

  // Filtered based on tab
  const filteredVaults = allAssignments.filter((v: any) => {
    if (statusFilter === "ACTIVE") {
      return [VaultStatus.FUNDED, VaultStatus.DISPUTED].includes(v.status);
    }
    if (statusFilter === "COMPLETED") {
      return [VaultStatus.RELEASED, VaultStatus.REFUNDED].includes(v.status);
    }
    return true; // ALL
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredVaults.length / itemsPerPage);
  const paginatedVaults = filteredVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const totalEarnings = allAssignments
    .filter((v: any) => v.status === VaultStatus.RELEASED)
    .reduce((acc, v: any) => acc + (Number(v.formattedTotalAmount) || 0), 0);

  const activeCount = allAssignments.filter((v: any) => 
    [VaultStatus.FUNDED, VaultStatus.DISPUTED].includes(v.status)
  ).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-20 font-primary"
    >
      <div className="max-w-6xl mx-auto sm:px-6 space-y-12">
        {/* HEADER */}
        <header className="pt-8 md:pt-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900  tracking-tighter leading-none">
                My Assignments
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-600 tracking-wide leading-relaxed">
                A definitive record of your contractual deliverables and verified earning stream.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm min-w-[140px]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
                <CurrencyEstimate usdAmount={totalEarnings} showNote={false} className="text-xl font-bold text-slate-900" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm min-w-[140px]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Nodes</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xl font-bold text-slate-900">{activeCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
            {(["ACTIVE", "COMPLETED", "ALL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                   setStatusFilter(tab);
                   setCurrentPage(1);
                }}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === tab
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Content Section */}
        <div className="space-y-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white border border-slate-200 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : filteredVaults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-8 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-slate-200" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-slate-900 tracking-tighter ">
                  {statusFilter === "COMPLETED" ? "No history yet" : "Clean slate"}
                </p>
                <p className="text-xs font-bold text-slate-600 tracking-widest leading-relaxed max-w-xs mx-auto">
                  {statusFilter === "COMPLETED" 
                    ? "You haven't completed any assignments in this workspace yet."
                    : "No assignments match your current filter criteria."}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {paginatedVaults.map((vault: any) => (
                <motion.div key={vault.id} variants={itemVariants}>
                  <Link href={`/freelancer/vault/${vault.id}`}>
                    <Card className="bg-white border border-slate-200 shadow-sm hover:border-emerald-500/20 group transition-all duration-500 cursor-pointer overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="space-y-4 flex-1 min-w-0">
                            <div className="flex flex-col items-start md:flex-row md:items-center gap-3">
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900  tracking-tight group-hover:text-emerald-700 transition-colors">
                                {vault.title}
                              </h3>
                              <Badge className={cn(
                                "text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest",
                                vault.status === VaultStatus.RELEASED ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                [VaultStatus.FUNDED, VaultStatus.DISPUTED].includes(vault.status) ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-slate-50 text-slate-600 border-slate-100"
                              )}>
                                {
                                  vault.status === VaultStatus.RELEASED ? "Paid" : 
                                  vault.status === VaultStatus.FUNDED ? "In Progress" : 
                                  vault.status
                                }
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 max-w-2xl font-bold tracking-wide ">
                              {vault.description ||
                                "Standard contractual engagement through the Dayle settlement protocol."}
                            </p>
                          </div>

                          <div className="text-left md:text-right shrink-0">
                            <p className="text-[9px] font-bold text-slate-600 tracking-widest mb-1 ">
                              Contract Value
                            </p>
                            <CurrencyEstimate
                              usdAmount={Number(vault.formattedTotalAmount || "0.00")}
                              showNote={false}
                              className="text-2xl md:text-4xl font-bold text-slate-900 tracking-widest group-hover:scale-105 transition-transform origin-right"
                              align="right"
                            />
                          </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 ">
                              COUNTERPARTY
                            </p>
                            <p className="text-[10px] font-bold text-slate-900 tracking-wide flex items-center gap-2">
                              <Users className="w-3 h-3 text-slate-900" />
                              {vault.clientName || "Dayle Client Agent"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 ">
                              TIMESTAMP
                            </p>
                            <p className="text-[10px] font-bold text-slate-900 tracking-wide flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-900" />
                              {new Date(vault.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 ">
                              VERIFICATION
                            </p>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                              <span className="text-[10px] font-bold text-slate-900 tracking-wide">Protocol Secured</span>
                            </div>
                          </div>
                          <div className="flex justify-end items-center">
                            <Button
                              variant="ghost"
                              className="text-[9px] font-bold tracking-[0.2em] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-4 group/btn"
                            >
                              VIEW DETAILS
                              <ChevronRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 pt-10"
            >
              <p className="text-[10px] font-bold text-slate-600 tracking-widest ">
                Displaying {paginatedVaults.length} of {filteredVaults.length}{" "}
                assignments
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="h-12 px-8 text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold tracking-[0.3em] hover:text-slate-900 transition-all rounded-xl disabled:opacity-30"
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="h-12 px-8 text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold tracking-[0.3em] hover:text-slate-900 transition-all rounded-xl disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
