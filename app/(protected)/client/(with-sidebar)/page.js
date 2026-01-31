"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useLedger } from "@/lib/store/ledger-context";
import {
  CreditCard,
  Landmark,
  Shield,
  Activity,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  Plus,
} from "lucide-react";
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

export default function ClientDashboard() {
  const { vaults, loading } = useVault();
  const { balance } = useLedger();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const activeVaults = vaults.filter(
    (v) => v.status !== "completed" && v.status !== "cancelled"
  );
  const totalLocked = activeVaults.reduce(
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
      className=" space-y-8 max-w-6xl mx-auto"
    >

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">
            Overview
          </h1>
          <p className="text-sm text-white font-bold uppercase tracking-wide">
            Welcome back to your client dashboard
          </p>
        </motion.div>
      </header>
      {/* Stats Cards - Cleaner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-muted border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              Available Balance
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">
              ${balance?.available?.toLocaleString() || "0.00"}
            </h2>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              Fully Liquid
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-muted border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              Locked in Vaults
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">
              ${totalLocked.toLocaleString()}
            </h2>
            <p className="text-white text-sm font-bold uppercase tracking-wide">
              {activeVaults.length} Active Contracts
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Vaults Section */}
      <div className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">Active Vaults</h2>
          </div>
          <div className="text-sm text-white font-bold uppercase tracking-wide">{activeVaults.length} active</div>
        </motion.div>

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
          <motion.div variants={itemVariants} className="py-16 text-center bg-muted border border-white/10 rounded-sm">
            <Activity className="w-12 h-12 text-white mx-auto mb-4" />
            <p className="text-white font-bold uppercase tracking-wide">No active vaults</p>
            <p className="text-sm text-white mt-2 font-bold uppercase tracking-wide">
              Get started by creating your first vault
            </p>
            <Link href="/client/create-vault">
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-wide">
                <Plus className="w-4 h-4 mr-2" />
                Create Vault
              </Button>
            </Link>
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
                  href={`/client/vault/${vault.id}`}
                >
                  <motion.div
                    variants={itemVariants}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-muted border border-white/10 rounded-sm hover:border-white/20 transition-colors gap-8"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold uppercase tracking-wide text-white truncate">{vault.title}</h4>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wide rounded-sm border border-emerald-500/20 whitespace-nowrap">
                          {getVaultDerivedLabel(vault.status)}
                        </span>
                      </div>
                      {vault.description && (
                        <p className="text-gray-400 mb-2 line-clamp-1 max-w-xl font-bold uppercase tracking-wide truncate">
                          {vault.description}
                        </p>
                      )}
                      <p className="text-sm font-bold uppercase tracking-wide text-white/50 truncate">
                        {vault.freelancerEmail ||
                          vault.freelancer?.email ||
                          "Unassigned"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-[10px] sm:text-sm font-bold uppercase tracking-wide text-white/40 sm:text-white mb-0.5 sm:mb-1">Value</p>
                        <p className="text-lg font-bold uppercase tracking-wide text-white">
                          ${(vault.totalAmount || vault.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-colors shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm font-black text-white uppercase tracking-wide">
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
                    className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-wide"
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
                    className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-wide"
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
