"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpRight,
  Zap,
  Shield,
  TrendingUp,
  Filter,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";

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

export default function FreelancerVaultsPage() {
  const { vaults, loading } = useVault();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredVaults = (vaults || []).filter((vault: any) => {
    const clientEmail = vault.clientEmail || vault.client?.email || "";
    return (
      vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVaults.length / itemsPerPage);
  const paginatedVaults = filteredVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalEarnings = (vaults || [])
    .filter((v: any) => v.status === "RELEASED" || v.status === "completed")
    .reduce(
      (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
      0,
    );

  const activeJobs = (vaults || []).filter(
    (v: any) =>
      v.status === "FUNDED" || v.status === "DISPUTED" || v.status === "active",
  ).length;

  const releasedCount = (vaults || []).filter(
    (v: any) => v.status === "RELEASED" || v.status === "completed",
  ).length;
  const disputedCount = (vaults || []).filter(
    (v: any) => v.status === "DISPUTED",
  ).length;
  const refundedCount = (vaults || []).filter(
    (v: any) => v.status === "REFUNDED",
  ).length;

  const totalClosed = releasedCount + disputedCount + refundedCount;
  const successRate =
    totalClosed > 0 ? Math.round((releasedCount / totalClosed) * 100) : 100;

  const stats = [
    {
      label: "Total Earnings",
      value: totalEarnings,
      isAmount: true,
      change: "+0%",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      label: "Active Jobs",
      value: activeJobs.toString(),
      change: "+0",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      change: "+0%",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen text-slate-600 font-sans selection:bg-emerald-500/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tighter text-slate-900 leading-tight">
              Your projects
            </h1>
            <p className=" text-slate-400 font-medium">
              Manage your active contracts and project accounts
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 h-11 px-5 rounded-xl transition-all font-bold"
            >
              <Filter className="w-4 h-4 mr-2 text-emerald-500" />
              Filters
            </Button>
          </motion.div>
        </header>

        {/* 2. ANALYTICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              variants={itemVariants}
              key={i}
              className="relative group bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-all" />

              <div className="flex justify-between items-start mb-6">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition-colors",
                    stat.color,
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 mb-2 group-hover:text-slate-500 transition-colors uppercase tracking-wider">
                {stat.label}
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {(stat as any).isAmount ? (
                  <CurrencyEstimate
                    usdAmount={stat.value as number}
                    showNote={false}
                  />
                ) : (
                  stat.value
                )}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* 3. SEARCH & TOOLS */}
        <motion.div variants={itemVariants} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 sm:py-5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500/30 text-slate-900 placeholder:text-slate-300 transition-all shadow-sm font-medium text-xs sm:text-base"
          />
        </motion.div>

        {/* 4. DATA TABLE (LIST) */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-5  font-bold text-slate-400 text-xs uppercase tracking-wider">
                    Project detail
                  </th>
                  <th className="hidden lg:table-cell px-6 py-5  font-bold text-slate-400 text-xs uppercase tracking-wider">
                    Client
                  </th>
                  <th className="hidden sm:table-cell px-6 py-5  font-bold text-slate-400 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5  font-bold text-slate-400 text-xs uppercase tracking-wider text-right">
                    Value
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVaults.map((vault: any) => (
                  <tr
                    key={vault.id}
                    className="group hover:bg-slate-50 transition-all cursor-pointer relative flex flex-col sm:table-row border-b border-slate-100 sm:border-none last:border-none"
                    onClick={() =>
                      (window.location.href = `/freelancer/vault/${vault.id}`)
                    }
                  >
                    <td className="px-4 sm:px-6 py-4 sm:py-6 sm:table-cell">
                      <div className="flex items-center gap-4">
                        <div className="hidden xs:flex w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-500/30 transition-all shrink-0 shadow-sm">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-all tracking-tight truncate max-w-[140px] sm:max-w-md">
                            {vault.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              {vault.createdAt
                                ? new Date(vault.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )
                                : "Pending..."}
                            </p>

                            <span
                              className={cn(
                                "sm:hidden text-[10px] px-2 py-0.5 rounded-full border font-bold whitespace-nowrap",
                                vault.status === "FUNDED" ||
                                  vault.status === "active"
                                  ? "bg-amber-50 border-amber-100 text-amber-700"
                                  : vault.status === "RELEASED" ||
                                      vault.status === "completed"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : vault.status === "DISPUTED"
                                      ? "bg-red-50 border-red-100 text-red-700"
                                      : vault.status === "INVITED"
                                        ? "bg-blue-50 border-blue-100 text-blue-700"
                                        : "bg-slate-50 border-slate-200 text-slate-400",
                              )}
                            >
                              {vault.status === "FUNDED" ||
                              vault.status === "active"
                                ? "Funded"
                                : vault.status === "RELEASED" ||
                                    vault.status === "completed"
                                  ? "Released"
                                  : vault.status === "DISPUTED"
                                    ? "Disputed"
                                    : vault.status === "INVITED"
                                      ? "Invited"
                                      : vault.status}
                            </span>
                          </div>
                          <p className="lg:hidden text-[10px] text-slate-400 font-medium mt-1 sm:mt-2 truncate">
                            Client:{" "}
                            {vault.clientEmail ||
                              vault.client?.email ||
                              "Unknown client"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600 shadow-sm text-[10px]">
                          {(vault.clientEmail ||
                            vault.client?.email ||
                            "C")[0].toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                          {vault.clientEmail ||
                            vault.client?.email ||
                            "Unknown client"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-6">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm",
                          vault.status === "FUNDED" || vault.status === "active"
                            ? "bg-amber-50 border-amber-100 text-amber-600"
                            : vault.status === "RELEASED" ||
                                vault.status === "completed"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                              : vault.status === "DISPUTED"
                                ? "bg-red-50 border-red-100 text-red-600"
                                : vault.status === "INVITED"
                                  ? "bg-blue-50 border-blue-100 text-blue-600"
                                  : "bg-slate-50 border-slate-200 text-slate-400",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            vault.status === "FUNDED" ||
                              vault.status === "active"
                              ? "bg-amber-500"
                              : vault.status === "RELEASED" ||
                                  vault.status === "completed"
                                ? "bg-emerald-500"
                                : vault.status === "DISPUTED"
                                  ? "bg-red-500"
                                  : vault.status === "INVITED"
                                    ? "bg-blue-500"
                                    : "bg-slate-300",
                          )}
                        />
                        {vault.status === "FUNDED" || vault.status === "active"
                          ? "Funded"
                          : vault.status === "RELEASED" ||
                              vault.status === "completed"
                            ? "Released"
                            : vault.status === "DISPUTED"
                              ? "Disputed"
                              : vault.status === "INVITED"
                                ? "Invited"
                                : vault.status}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 sm:py-6 text-right sm:table-cell flex items-center justify-between sm:justify-end border-t sm:border-t-0 border-slate-100">
                        <span className="sm:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value</span>
                        <CurrencyEstimate
                        usdAmount={Number(
                            vault.formattedTotalAmount || vault.totalAmount,
                          )}
                        showNote={false}
                          className="text-sm sm:text-base font-bold text-slate-900"
                        />
                    </td>
                    <td className="px-6 py-6 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Link
                          href={`/freelancer/vault/${vault.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-xl transition-all shadow-sm"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 5. FOOTER SUMMARY / PAGINATION */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-slate-200">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ">
            Securing{" "}
            <span className="text-slate-900">{paginatedVaults.length}</span> /{" "}
            {filteredVaults.length} Project Vaults
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 sm:h-11 px-4 sm:px-6 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 transition-all font-bold disabled:opacity-20 shadow-sm text-xs sm:text-sm"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "w-9 h-9 rounded-xl font-bold transition-all shadow-sm",
                    p === currentPage
                      ? "bg-slate-900 text-white scale-110 shadow-slate-900/10"
                      : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-9 sm:h-11 px-4 sm:px-6 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 transition-all font-bold disabled:opacity-20 shadow-sm text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
