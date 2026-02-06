"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useLedger } from "@/lib/store/ledger-context";
import {
  Briefcase,
  ArrowUpRight,
  Landmark,
  Shield,
  Activity,
  CheckCircle,
  Zap,
  Badge
} from "lucide-react";
import { VaultStatus } from "@/lib/domain/enums";
import { getVaultDerivedLabel } from "@/lib/domain/enums";

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

export default function FreelancerDashboard() {
  const { vaults, loading } = useVault();
  const { balance } = useLedger();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Work categories
  const activeVaults = vaults.filter((v: any) =>
    [VaultStatus.FUNDED, VaultStatus.PAUSED, VaultStatus.DISPUTED].includes(
      v.status,
    ),
  );
  const completedVaults = vaults.filter(
    (v: any) => v.status === VaultStatus.CLOSED,
  );
  const totalPending = activeVaults.reduce(
    (acc: number, v: any) => acc + (v.totalAmount || v.amount),
    0,
  );

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
      className="space-y-8 max-w-6xl mx-auto font-['Poppins',sans-serif]"
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
            Overview
          </h1>
          <p className="text-[10px] md:text-xs text-white/50 font-black uppercase tracking-[0.2em]">
            Track your deliverables and secure earnings
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-3">
          <Link href="/freelancer/balance" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs h-11 px-6 transition-all">
              Withdraw Funds
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl hover:border-emerald-500/20 transition-all shadow-2xl group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors">
              Available to Withdraw
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter font-mono">
              ${balance?.available?.toLocaleString() || "0.00"}
            </h2>
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              Funds Liquid
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl hover:border-blue-500/20 transition-all shadow-2xl group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors">
              Pending in Vaults
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter font-mono">
              ${totalPending.toLocaleString()}
            </h2>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
              {activeVaults.length} Active Assignments
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl hover:border-amber-500/20 transition-all shadow-2xl group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 group-hover:text-white/60 transition-colors">
              Completed Projects
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter font-mono">
              {completedVaults.length}
            </h2>
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">
              Vault Access Level 1
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Assignments Section */}
      <div className="pt-8 space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Briefcase className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white italic">
              Active Assignments
            </h2>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {activeVaults.length} Contracts
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/2 border border-white/5 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : activeVaults.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="py-20 text-center bg-[#0D0D0E] border border-white/5 rounded-2xl shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 group">
              <Activity className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
              No active assignments
            </p>
            <p className="text-[10px] text-white/40 mt-3 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              Projects will appear here once secured by clients
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* PAGINATION WRAPPER */}
            <motion.div
              key={currentPage}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {paginatedVaults.map((vault: any) => (
                <Link key={vault.id} href={`/freelancer/vault/${vault.id}`}>
                  <motion.div
                    variants={itemVariants}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#0D0D0E] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all gap-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h4 className="text-lg font-black uppercase tracking-tight text-white truncate max-w-md">
                          {vault.title}
                        </h4>
                        <Badge
                          // variant="outline"
                          className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg border-emerald-500/20 py-1 px-3 whitespace-nowrap"
                        >
                          {getVaultDerivedLabel(vault.status)}
                        </Badge>
                      </div>
                      {vault.description && (
                        <p className="text-[11px] text-white/40 mb-4 line-clamp-1 max-w-xl font-bold uppercase tracking-wide leading-relaxed">
                          {vault.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Briefcase className="w-2.5 h-2.5 text-white/40" />
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                          Client:{" "}
                          <span className="text-white/80">
                            {vault.clientName || "Dayle Client"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 border-white/5 pt-6 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">
                          Vault Value
                        </p>
                        <p className="text-2xl font-black text-white uppercase tracking-tight font-mono">
                          $
                          {(vault.totalAmount || vault.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all group-hover:scale-110 shadow-lg group-hover:shadow-emerald-500/20">
                        <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-white/2 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Page <span className="text-white/60">{currentPage}</span> /{" "}
                  {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="h-10 px-4 text-[10px] border-white/10 bg-white/2 hover:bg-white/5 text-white/60 font-black uppercase tracking-widest transition-all disabled:opacity-20"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="h-10 px-4 text-[10px] border-white/10 bg-white/2 hover:bg-white/5 text-white/60 font-black uppercase tracking-widest transition-all disabled:opacity-20"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
