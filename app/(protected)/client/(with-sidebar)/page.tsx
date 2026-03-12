"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useLedger } from "@/lib/store/ledger-context";
import {
  Landmark,
  Shield,
  Activity,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  Plus,
} from "lucide-react";
import { VaultStatus, getVaultDerivedLabel } from "@/lib/domain/enums";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientDashboard() {
  const { vaults, loading } = useVault();
  const { balance } = useLedger();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const activeVaults = vaults.filter(
    (v: any) =>
      v.status !== VaultStatus.RELEASED && v.status !== VaultStatus.CANCELLED,
  );

  const securedVaults = vaults.filter(
    (v: any) =>
      v.status === VaultStatus.FUNDED || v.status === VaultStatus.DISPUTED,
  );

  const totalLocked = securedVaults.reduce(
    (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
    0,
  );

  // Sync balance formatting
  if (balance) {
    (balance as any).formattedSecured = totalLocked.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
  const paginatedVaults = activeVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalInvestment = vaults.reduce(
    (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
    0,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto font-primary"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 ">
            Overview
          </h1>
          <p className="text-sm md:text-sm text-slate-600 font-bold">
            Welcome back to your client dashboard
          </p>
        </motion.div>
      </header>
      {/* Stats Cards - Cleaner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-6 rounded-sm hover:border-slate-300 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold  text-slate-900">
              Total investment
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
              ${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold ">
              <Activity className="w-4 h-4" />
              All-time project value
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-muted border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold  text-slate-900">
              Secured in projects
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
              ${balance?.formattedSecured || "0"}
            </h2>
            <p className="text-slate-600 text-sm font-bold ">
              {securedVaults.length} active contracts
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Vaults Section */}
      <div className="space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <LayoutGrid className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold  text-slate-900 ">
              Active projects
            </h2>
          </div>
          <div className=" font-bold  text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            {activeVaults.length} active
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : activeVaults.length === 0 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 group">
              <Activity className="w-8 h-8 text-slate-200 group-hover:text-slate-600 transition-colors" />
            </div>
            <p className="text-sm font-bold  text-slate-900">
              No active projects
            </p>
            <p className=" text-slate-600 mt-3 font-semibold  max-w-xs mx-auto leading-relaxed">
              Get started by creating your first project
            </p>
            <Link href="/client/create-vault">
              <Button className="mt-8 bg-emerald-600 hover:bg-emerald-700 font-bold transition-all  px-6 h-10 rounded-xl shadow-lg shadow-emerald-500/10">
                <Plus className="w-3.5 h-3.5 mr-2" />
                New project
              </Button>
            </Link>
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
                <Link key={vault.id} href={`/client/vault/${vault.id}`}>
                  <motion.div
                    variants={itemVariants}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500/30 transition-all gap-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 truncate max-w-md">
                          {vault.title}
                        </h4>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold  rounded-lg border border-emerald-200 py-1 px-3 whitespace-nowrap">
                          {getVaultDerivedLabel(vault.status)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-bold  text-slate-600 truncate">
                          {vault.freelancerName ||
                            vault.freelancerEmail ||
                            vault.freelancer?.email ||
                            "Unassigned freelancer"}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className=" font-bold  text-slate-600">
                            {vault.deliverables?.length || 0} deliverables
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span
                            className={cn(
                              " font-bold  px-2 py-0.5 rounded-md",
                              vault.submissions?.length > 0
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200",
                            )}
                          >
                            {vault.submissions?.length > 0
                              ? "Submission received"
                              : "Waiting for submission"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 border-slate-100 pt-6 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-[9px] text-slate-600 font-bold  mb-1">
                          Project value
                        </p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight ">
                          ${vault.formattedTotalAmount || vault.totalAmount}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all group-hover:scale-110 shadow-sm group-hover:shadow-emerald-500/20">
                        <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className=" font-bold text-slate-600 ">
                  Page <span className="text-slate-600">{currentPage}</span> /{" "}
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
                    className="h-10 px-4  border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  transition-all disabled:opacity-50"
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
                    className="h-10 px-4  border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold  transition-all disabled:opacity-50"
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
