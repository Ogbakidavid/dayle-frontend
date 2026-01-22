"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useWallet } from "@/lib/store/wallet-context";
import {
  Briefcase,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Wallet,
  Shield,
  Activity,
  LayoutGrid,
  CheckCircle,
  Zap,
} from "lucide-react";
import { AmountDisplay } from "@/components/ui/amount-display";
import { StatusBadge } from "@/components/ui/status-badge";

import { useState } from "react";

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
  const { balance } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Work categories
  const activeVaults = vaults.filter((v) =>
    ["ACTIVE", "PENDING", "REVIEW"].includes(v.status)
  );
  const completedVaults = vaults.filter((v) => v.status === "COMPLETED");
  const totalPending = activeVaults.reduce(
    (acc, v) => acc + (v.totalAmount || v.amount),
    0
  );

  const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
  const paginatedVaults = activeVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
            Overview
          </h1>
          <p className="text-xs md:text-sm text-white font-bold uppercase tracking-wide">
            Track your deliverables and secure earnings
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-3">
          <Link href="/freelancer/wallet" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#111111] border border-gray-800 hover:bg-gray-800 text-white font-bold uppercase tracking-wide">
              Withdraw Funds
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-[#111111] border border-gray-900 p-6 rounded-sm hover:border-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wide text-white-300">
              Available to Withdraw
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              ${balance?.available?.toLocaleString() || "0.00"}
            </h2>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold uppercase tracking-wide ">
              <Zap className="w-4 h-4" />
              Funds Liquid
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#111111] border border-gray-900 p-6 rounded-sm hover:border-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wide text-white-300">
              Pending in Vaults
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              ${totalPending.toLocaleString()}
            </h2>
            <p className="text-white-300 text-sm font-bold uppercase tracking-wide">
              {activeVaults.length} Active Assignments
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#111111] border border-gray-900 p-6 rounded-sm hover:border-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wide text-white-300">
              Completed Projects
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {completedVaults.length}
            </h2>
            <p className="text-white-300 text-sm font-bold uppercase tracking-wide">
              Vault Access Level 1
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Assignments Section */}
      <div className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">
              Active Assignments
            </h2>
          </div>
          {activeVaults.length} contracts
        </motion.div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-white/5 animate-pulse rounded-sm"
            />
          ))}
        </div>
      ) : activeVaults.length === 0 ? (
        <motion.div variants={itemVariants} className="py-16 text-center bg-[#111111] border border-gray-900 rounded-sm">
          <Activity className="w-12 h-12 text-white-700 mx-auto mb-4" />
          <p className="text-white-400 font-medium">No active assignments</p>
          <p className="text-sm text-white-500 mt-2">
            Projects will appear here once secured by clients
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* PAGINATION WRAPPER */}
          <motion.div
            key={currentPage}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {paginatedVaults.map((vault) => (
              <Link
                key={vault.id}
                href={`/freelancer/vault/${vault.id}`}
              >
                <motion.div
                  variants={itemVariants}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#111111] border border-gray-900 rounded-sm hover:border-gray-800 transition-colors gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-bold uppercase tracking-wide text-white truncate">
                        {vault.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wide rounded-sm border border-emerald-500/20 whitespace-nowrap">
                        {vault.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 uppercase font-bold tracking-wide truncate">
                      Client: {vault.clientName || "Dayle Client"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="text-[10px] sm:text-sm text-white-400 font-bold uppercase tracking-wide sm:text-white mb-0.5 sm:mb-1">
                        Vault Value
                      </p>
                      <p className="text-lg font-bold text-white uppercase tracking-wide">
                        ${(vault.totalAmount || vault.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-sm bg-gray-900 flex items-center justify-center group-hover:bg-emerald-500 transition-colors shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-white-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-2">
              <p className="text-sm font-black text-white-500 uppercase tracking-wide">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="h-8 px-3 text-sm border-gray-800 bg-transparent hover:bg-gray-800 text-white-400 font-bold uppercase tracking-wide"
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
                  className="h-8 px-3 text-sm border-gray-800 bg-transparent hover:bg-gray-800 text-white-400 font-bold uppercase tracking-wide"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
