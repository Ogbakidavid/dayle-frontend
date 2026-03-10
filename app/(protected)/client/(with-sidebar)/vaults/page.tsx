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

export default function VaultsPage() {
  const { vaults, loading } = useVault();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredVaults = (vaults || []).filter((vault: any) => {
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

  const totalValue = (vaults || []).reduce(
    (acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0),
    0,
  );

  const activeCount = (vaults || []).filter(
    (v: any) => v.status === "active",
  ).length;
  const completionRate =
    (vaults || []).length > 0
      ? Math.round(
          ((vaults || []).filter((v: any) => v.status === "completed").length /
            (vaults || []).length) *
            100,
        )
      : 0;

  const stats = [
    {
      label: "Total Value",
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+0%",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      label: "Active Projects",
      value: activeCount.toString(),
      change: "+0",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
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
      className="min-h-screen  text-slate-900 selection:bg-emerald-500/30 font-['Poppins',sans-serif]"
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
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 h-11 px-5 rounded-xl transition-all font-bold  shadow-sm"
            >
              <Filter className="w-4 h-4 mr-2 text-slate-600" />
              Filters
            </Button>
            <Link href="/client/create-vault" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-emerald-600 text-white hover:bg-emerald-700 h-11 px-6 rounded-xl font-bold  shadow-md shadow-emerald-500/20 transition-all">
                <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                New project
              </Button>
            </Link>
          </motion.div>
        </header>

        {/* 2. ANALYTICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              variants={itemVariants}
              key={i}
              className="relative group bg-white border border-slate-200 p-6 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-100 transition-all" />
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-slate-50 border border-slate-100",
                    stat.color.replace("text-", "text-").replace("500", "600"),
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full ">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold  text-slate-600 mb-2">
                {stat.label}
              </p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tighter ">
                {stat.value}
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
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 md:px-6 py-4 text-[11px] font-bold text-slate-600  uppercase">
                    Project detail
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-[11px] font-bold text-slate-600  uppercase">
                    Counterparty
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-[11px] font-bold text-slate-600  uppercase">
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
                      className="group hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/client/vault/${vault.id}`)
                      }
                    >
                      <td className="px-4 md:px-6 py-5">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="hidden xs:flex w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-all shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900  group-hover:text-emerald-700 transition-colors truncate">
                              {vault.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                              <p className=" md:text-sm text-slate-600 font-bold ">
                                {vault.createdAt
                                  ? new Date(
                                      vault.createdAt,
                                    ).toLocaleDateString()
                                  : "Pending"}
                              </p>
                              <span className="sm:hidden  bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm border border-emerald-100 font-bold ">
                                {vault.status}
                              </span>
                            </div>
                            <p className="lg:hidden  text-slate-600 font-bold  mt-1 truncate">
                              {vault.freelancerName ||
                                vault.freelancerEmail ||
                                vault.freelancer?.email ||
                                "Unassigned"}
                            </p>
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
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] md:text-sm font-bold ",
                            vault.status === "active"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : vault.status === "completed"
                                ? "bg-blue-50 border-blue-100 text-blue-700"
                                : "bg-amber-50 border-amber-100 text-amber-700",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1 h-1 rounded-full",
                              vault.status === "active"
                                ? "bg-emerald-600"
                                : vault.status === "completed"
                                  ? "bg-blue-600"
                                  : "bg-amber-600",
                            )}
                          />
                          {vault.status}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-5 text-right">
                        <p className="text-sm md:text-base font-bold text-slate-900  ">
                          ${vault.formattedTotalAmount || vault.totalAmount}
                        </p>
                        <p className=" md:text-sm text-slate-600 font-bold ">
                          USD
                        </p>
                      </td>
                      <td className="px-4 md:px-6 py-5 text-right">
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
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 font-['Poppins',sans-serif]">
            <p className="text-sm md:text-sm font-bold text-slate-600  text-center sm:text-left">
              Displaying {paginatedVaults.length} of {filteredVaults.length}{" "}
              escrow projects
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
                className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-600 hover:text-white transition-all font-bold "
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
                className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-600 hover:text-white transition-all font-bold "
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
