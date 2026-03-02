"use client";

import * as React from "react";
import { useVault } from "@/lib/store/vault-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, Activity } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

import { VaultStatus } from "@/lib/domain/enums";

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
      className="space-y-12 max-w-6xl mx-auto font-['Poppins',sans-serif] px-6 lg:px-8 py-8"
    >
      {/* Breadcrumbs / Header */}
      <div className="space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic"
        >
          <Link
            href="/freelancer"
            className="hover:text-emerald-500 transition-colors"
          >
            Origin
          </Link>
          <span className="text-white/5">/</span>
          <span className="text-emerald-500">Active Node</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
              Active Assignments
            </h1>
            <p className="text-[10px] md:text-xs text-white/30 font-black uppercase tracking-[0.4em] italic">
              Authorized project streams and deliverable pipelines
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white/2 border border-white/5 animate-pulse rounded-4xl"
              />
            ))}
          </div>
        ) : activeVaults.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="py-24 text-center bg-white/1 border border-dashed border-white/5 rounded-[3rem] shadow-inner"
          >
            <div className="w-20 h-20 bg-white/5 rounded-4xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
              Zero Active Signals
            </h3>
            <p className="text-xs text-white/30 font-black uppercase tracking-[0.3em] max-w-sm mx-auto italic">
              No ongoing assignments detected in the current scope. New project
              links will materialize here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5">
              {paginatedVaults.map((vault: any) => (
                <motion.div key={vault.id} variants={itemVariants}>
                  <Link
                    href={`/freelancer/vault/${vault.id}`}
                    className="group flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-[#0D0D0E] border border-white/5 rounded-[2.5rem] hover:border-emerald-500/30 transition-all gap-8 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="space-y-3 min-w-0 relative z-10">
                      <div className="flex flex-wrap items-center gap-4">
                        <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter group-hover:text-emerald-500 transition-colors truncate">
                          {vault.title}
                        </h4>
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/10 whitespace-nowrap shadow-sm">
                          {vault.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-white/20 font-black uppercase tracking-[0.2em] italic">
                        <p className="flex items-center gap-2">
                          Partner node:{" "}
                          <span className="text-white/40 truncate max-w-[150px]">
                            {vault.clientName || "Authenticated Client"}
                          </span>
                        </p>
                        <span className="hidden xs:block w-1 h-1 rounded-full bg-white/5" />
                        <p className="whitespace-nowrap">
                          Initialized{" "}
                          <span className="text-white/40">
                            {vault.createdAt
                              ? new Date(vault.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "Recently"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 border-white/5 pt-8 lg:pt-0 relative z-10">
                      <div className="text-left lg:text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 italic">
                          Protocol Value
                        </p>
                        <p className="text-3xl font-black text-white tracking-widest font-mono italic">
                          $
                          {(vault.totalAmount || vault.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all shadow-xl shrink-0 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <ArrowUpRight className="w-6 h-6 text-white/10 group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                variants={itemVariants}
                className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-10"
              >
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">
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
                    className="h-12 px-8 text-[10px] border-white/5 bg-white/2 hover:bg-white/5 text-white/40 font-black uppercase tracking-[0.3em] hover:text-white transition-all rounded-xl disabled:opacity-20"
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="h-12 px-8 text-[10px] border-white/5 bg-white/2 hover:bg-white/5 text-white/40 font-black uppercase tracking-[0.3em] hover:text-white transition-all rounded-xl disabled:opacity-20"
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
