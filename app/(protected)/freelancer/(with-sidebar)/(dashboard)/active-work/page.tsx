"use client";

import * as React from "react";
import { useVault } from "@/lib/store/vault-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowUpRight,
  Activity,
  Zap,
  ShieldCheck,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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

export default function ActiveWorkPage() {
  const { vaults, loading } = useVault();

  // Filter for active work context
  const activeVaults = vaults.filter((v: any) =>
    [VaultStatus.FUNDED, VaultStatus.DISPUTED].includes(v.status),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
  const paginatedVaults = activeVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 pb-20 font-['Poppins',sans-serif]"
    >
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* HEADER */}
        <header className="pt-8 md:pt-12 space-y-4">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold tracking-wide text-emerald-700 italic">
            <Zap className="w-3.5 h-3.5" />
            Active Node: Workspace
          </div> */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 italic tracking-tighter leading-none">
                Active assignments
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-600 tracking-widest leading-relaxed">
                A verified stream of your current contractual obligations and
                deliverable milestones.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-bold text-slate-600 tracking-widest mb-1 italic">
                Live throughput
              </p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-900 tracking-wide">
                  {activeVaults.length} Active Node
                  {activeVaults.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
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
          ) : activeVaults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-8 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-slate-200" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-slate-900 tracking-tighter italic">
                  Clean slate
                </p>
                <p className="text-xs font-bold text-slate-600 tracking-widest leading-relaxed max-w-xs mx-auto">
                  No active assignments detected in your workspace stream.
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
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900 italic tracking-tight group-hover:text-emerald-700 transition-colors">
                                {vault.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 max-w-2xl font-bold tracking-wide italic">
                              {vault.description ||
                                "Standard contractual engagement through the Dayle escrow protocol."}
                            </p>
                          </div>

                          <div className="text-left md:text-right shrink-0">
                            <p className="text-[9px] font-bold text-slate-600 tracking-widest mb-1 italic">
                              Contract Value
                            </p>
                            <p className="text-2xl md:text-4xl font-bold text-slate-900 tracking-widest italic group-hover:scale-105 transition-transform origin-right">
                              {vault.formattedTotalAmount || vault.totalAmount}
                            </p>
                          </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 italic">
                              COUNTERPARTY
                            </p>
                            <p className="text-[10px] font-bold text-slate-900 tracking-wide flex items-center gap-2">
                              <Users className="w-3 h-3 text-emerald-600" />
                              {vault.clientName || "Dayle Client Agent"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 italic">
                              TIMESTAMP
                            </p>
                            <p className="text-[10px] font-bold text-slate-900 tracking-wide flex items-center gap-2">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {new Date(vault.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-600 tracking-widest mb-2 italic">
                              VERIFICATION
                            </p>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 transition-colors text-[9px] font-bold px-3 py-0.5 rounded-full italic">
                              Protocol Secured
                            </Badge>
                          </div>
                          <div className="flex justify-end items-center">
                            <Button
                              variant="ghost"
                              className="text-[9px] font-bold tracking-[0.2em] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-4 group/btn"
                            >
                              {/* OPEN WORKSPACE */}
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
              <p className="text-[10px] font-bold text-slate-600 tracking-widest italic">
                Displaying {paginatedVaults.length} of {activeVaults.length}{" "}
                active assignments
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="h-12 px-8 text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold tracking-[0.3em] hover:text-slate-900 transition-all rounded-xl disabled:opacity-30"
                >
                  Back
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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
