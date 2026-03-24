"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  ArrowUpRight,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";

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

const statusConfig: Record<string, { label: string; classes: string }> = {
  FUNDED: {
    label: "Funded",
    classes: "bg-amber-50 border-amber-100 text-amber-700",
  },
  DISPUTED: {
    label: "Disputed",
    classes: "bg-red-50 border-red-100 text-red-700",
  },
  RELEASED: {
    label: "Released",
    classes: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
  REFUNDED: {
    label: "Refunded",
    classes: "bg-slate-50 border-slate-100 text-slate-700",
  },
  INVITED: {
    label: "Invitation Sent",
    classes: "bg-blue-50 border-blue-100 text-blue-700",
  },
  DRAFT: {
    label: "Draft",
    classes: "bg-slate-50 border-slate-100 text-slate-500",
  },
  // Backward compatibility
  active: {
    label: "Funded",
    classes: "bg-amber-50 border-amber-100 text-amber-700",
  },
  completed: {
    label: "Released",
    classes: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
};

export default function VaultsPage() {
  const { vaults, loading } = useVault();
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "COMPLETED">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredVaults = (vaults || [])
    .filter((vault: any) => {
      if (activeTab === "ACTIVE") {
        return (
          vault.status === "FUNDED" ||
          vault.status === "DISPUTED" ||
          vault.status === "active"
        );
      }
      if (activeTab === "COMPLETED") {
        return (
          vault.status === "RELEASED" ||
          vault.status === "REFUNDED" ||
          vault.status === "completed"
        );
      }
      return true;
    })
    .filter((vault: any) => {
      const counterparty =
        vault.freelancerName ||
        vault.freelancerEmail ||
        vault.freelancer?.email ||
        "";
      return (
        vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        counterparty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const totalPages = Math.ceil(filteredVaults.length / itemsPerPage);
  const paginatedVaults = filteredVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const currentVaults = vaults || [];
  const previousVaults = currentVaults.filter(
    (v: any) => v.createdAt && new Date(v.createdAt) < thirtyDaysAgo,
  );

  // Total Value
  const totalValue = currentVaults.reduce(
    (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
    0,
  );
  const prevTotalValue = previousVaults.reduce(
    (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
    0,
  );
  const valueChange =
    prevTotalValue === 0
      ? totalValue > 0
        ? 100
        : 0
      : Math.round(((totalValue - prevTotalValue) / prevTotalValue) * 100);

  // Active Projects
  const activeCount = currentVaults.filter(
    (v: any) =>
      v.status === "FUNDED" || v.status === "DISPUTED" || v.status === "active",
  ).length;
  const prevActiveCount = previousVaults.filter(
    (v: any) =>
      v.status === "FUNDED" || v.status === "DISPUTED" || v.status === "active",
  ).length;
  const activeChange = activeCount - prevActiveCount;

  // Completion Rate
  const currentCompleted = currentVaults.filter(
    (v: any) =>
      v.status === "RELEASED" ||
      v.status === "REFUNDED" ||
      v.status === "completed",
  ).length;
  const currentRate =
    currentVaults.length > 0
      ? Math.round((currentCompleted / currentVaults.length) * 100)
      : 0;

  const prevCompleted = previousVaults.filter(
    (v: any) =>
      v.status === "RELEASED" ||
      v.status === "REFUNDED" ||
      v.status === "completed",
  ).length;
  const prevRate =
    previousVaults.length > 0
      ? Math.round((prevCompleted / previousVaults.length) * 100)
      : 0;
  const rateChange = currentRate - prevRate;

  const stats = [
    {
      label: "Total Value",
      value: totalValue,
      change: `+${valueChange}%`,
      color: "text-slate-900",
      trend: valueChange >= 0 ? "up" : "down",
    },
    {
      label: "Active Projects",
      value: activeCount.toString(),
      change: `${activeChange >= 0 ? "+" : ""}${activeChange}`,
      color: "text-slate-900",
      trend: activeChange >= 0 ? "up" : "down",
    },
    {
      label: "Completion Rate",
      value: `${currentRate}%`,
      change: `${rateChange >= 0 ? "+" : ""}${rateChange}%`,
      color: "text-slate-900",
      trend: rateChange >= 0 ? "up" : "down",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen  text-slate-900 selection:bg-emerald-500/30 font-primary"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 ">
              Secured projects
            </h1>
            <p className="text-sm md:text-sm text-slate-600 font-bold">
              Overview of your secured project accounts
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-start gap-3 sm:flex-row flex-col sm:items-center"
          >
            <Link href="/client/create-vault" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 h-11 px-6 rounded-xl font-bold  shadow-md shadow-emerald-500/20 transition-all">
                <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                New project
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* Status Tabs */}
        <motion.div
          variants={itemVariants}
          className="flex border-b border-slate-200"
        >
          {[
            { id: "ALL", label: "All projects" },
            { id: "ACTIVE", label: "Active" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-4 text-sm font-bold transition-all relative",
                activeTab === tab.id
                  ? "text-emerald-600"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabClient"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* 2. ANALYTICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              variants={itemVariants}
              key={i}
              className="relative group bg-white border border-slate-200 p-6 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-100 transition-all" />
              <div className="flex justify-end items-start mb-4">
                <span
                  className={cn(
                    "text-sm font-bold px-2 py-1 rounded-full transition-colors",
                    stat.trend === "up"
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-600 bg-amber-50",
                  )}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold  text-slate-600 mb-2">
                {stat.label}
              </p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
                {typeof stat.value === "number" ? (
                  <CurrencyEstimate usdAmount={stat.value} showNote={false} />
                ) : (
                  stat.value
                )}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* 3. SEARCH & TOOLS */}
        <motion.div variants={itemVariants} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 text-slate-900 placeholder-slate-900 transition-all shadow-sm font-bold  text-sm md:text-base"
          />
        </motion.div>

        {/* 4. DATA TABLE (LIST) */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-slate-600 uppercase">
                    Project detail
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-[11px] font-bold text-slate-600 uppercase">
                    Counterparty
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-[11px] font-bold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-slate-600  uppercase text-right">
                    Value
                  </th>
                  <th className="px-4 md:px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-600 font-bold "
                    >
                      Loading projects...
                    </td>
                  </tr>
                ) : paginatedVaults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-600 font-bold "
                    >
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  paginatedVaults.map((vault: any) => (
                    <tr
                      key={vault.id}
                      className="group hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:table-row border-b border-slate-100 sm:border-none last:border-none"
                      onClick={() =>
                        (window.location.href = `/client/vault/${vault.id}`)
                      }
                    >
                      <td className="px-4 md:px-6 py-5 sm:table-cell">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="hidden xs:flex w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-all shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                              {vault.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                              <p className="text-xs md:text-sm text-slate-600 font-bold">
                                {vault.createdAt
                                  ? new Date(
                                      vault.createdAt,
                                    ).toLocaleDateString()
                                  : "Pending"}
                              </p>
                              <div
                                className={cn(
                                  "sm:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold",
                                  statusConfig[
                                    vault.status as keyof typeof statusConfig
                                  ]?.classes ||
                                    "bg-slate-50 border-slate-100 text-slate-700",
                                )}
                              >
                                {statusConfig[
                                  vault.status as keyof typeof statusConfig
                                ]?.label || vault.status}
                              </div>
                            </div>
                            <p className="lg:hidden text-sm text-slate-600 font-bold mt-1 truncate">
                              {vault.freelancerName ||
                                vault.freelancerEmail ||
                                vault.freelancer?.email ||
                                "Unassigned"}
                            </p>
                          </div>
                          <div className="sm:hidden text-right shrink-0">
                            <CurrencyEstimate
                              usdAmount={Number(
                                vault.formattedTotalAmount || vault.totalAmount,
                              )}
                              showNote={false}
                              className="text-sm font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                            {(vault.freelancerName ||
                              vault.freelancerEmail ||
                              vault.freelancer?.email ||
                              "U")[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-600 font-bold  truncate max-w-[150px]">
                            {vault.freelancerName ||
                              vault.freelancerEmail ||
                              vault.freelancer?.email ||
                              "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-5">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] md:text-sm font-bold",
                            statusConfig[
                              vault.status as keyof typeof statusConfig
                            ]?.classes ||
                              "bg-slate-50 border-slate-100 text-slate-700",
                          )}
                        >
                          {statusConfig[
                            vault.status as keyof typeof statusConfig
                          ]?.label || vault.status}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-5 text-right">
                        <CurrencyEstimate
                          usdAmount={Number(
                            vault.formattedTotalAmount || vault.totalAmount,
                          )}
                          showNote={false}
                          className="text-sm md:text-base font-bold text-slate-900"
                        />
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/client/vault/${vault.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 5. FOOTER SUMMARY */}
        {!loading && filteredVaults.length > 0 && (
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 font-primary">
            <p className="text-sm md:text-sm font-bold text-slate-600  text-center sm:text-left">
              Displaying {paginatedVaults.length} of {filteredVaults.length}{" "}
              project vaults
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="h-9 px-4 text-xs sm:text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all font-bold shadow-sm"
              >
                Previous
              </Button>
              <div className="hidden sm:flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setCurrentPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                        p === currentPage
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                          : "bg-transparent text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <div className="sm:hidden text-sm font-bold text-slate-900">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="h-9 px-4 text-xs sm:text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all font-bold shadow-sm"
              >
                Next
              </Button>
            </div>
          </footer>
        )}
      </div>
    </motion.div>
  );
}
