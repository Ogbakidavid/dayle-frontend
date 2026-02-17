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
    (acc: number, v: any) => acc + (v.totalAmount || v.amount || 0),
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
      value: `$${totalValue.toLocaleString()}`,
      change: "+0%",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      label: "Active Vaults",
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
      className="min-h-screen text-gray-400 selection:bg-emerald-500/30 font-['Poppins',sans-serif]"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">
              Financial Vaults
            </h1>
            <p className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-wide">
              Overview of your secured financial vaults
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              className="bg-transparent border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all font-bold uppercase tracking-wide"
            >
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              Filters
            </Button>
            <Link href="/client/create-vault" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-black hover:bg-emerald-400 hover:text-black h-11 px-6 rounded-xl font-black uppercase tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                New Vault
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
              className="relative group bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/4 transition-all" />
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-white/5 border border-white/5",
                    stat.color,
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wide">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-wide text-gray-400 mb-2">
                {stat.label}
              </p>
              <h2 className="text-3xl font-black text-white tracking-tighter">
                {stat.value}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* 3. SEARCH & TOOLS */}
        <motion.div variants={itemVariants} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="Search vaults..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-[#0D0D0E] border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all shadow-inner font-bold uppercase tracking-wide text-sm md:text-base"
          />
        </motion.div>

        {/* 4. DATA TABLE (LIST) */}
        <motion.div
          variants={itemVariants}
          className="bg-[#0D0D0E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/1">
                  <th className="px-4 md:px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wide">
                    Vault Detail
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wide">
                    Counterparty
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wide text-right">
                    Value
                  </th>
                  <th className="px-4 md:px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500 font-bold uppercase tracking-wide"
                    >
                      Loading vaults...
                    </td>
                  </tr>
                ) : paginatedVaults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500 font-bold uppercase tracking-wide"
                    >
                      No vaults found.
                    </td>
                  </tr>
                ) : (
                  paginatedVaults.map((vault: any) => (
                    <tr
                      key={vault.id}
                      className="group hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/client/vault/${vault.id}`)
                      }
                    >
                      <td className="px-4 md:px-6 py-5">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="hidden xs:flex w-10 h-10 rounded-xl bg-white/5 border border-white/5 items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white uppercase tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                              {vault.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                              <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-wide">
                                {vault.createdAt
                                  ? new Date(
                                      vault.createdAt,
                                    ).toLocaleDateString()
                                  : "Pending"}
                              </p>
                              <span className="sm:hidden text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 font-black uppercase tracking-wide">
                                {vault.status}
                              </span>
                            </div>
                            <p className="lg:hidden text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1 truncate">
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
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-500">
                            {(vault.freelancerName ||
                              vault.freelancerEmail ||
                              vault.freelancer?.email ||
                              "U")[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-400 font-bold uppercase tracking-wide truncate max-w-[150px]">
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
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] md:text-sm font-bold uppercase tracking-wide",
                            vault.status === "active"
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                              : vault.status === "completed"
                                ? "bg-blue-500/5 border-blue-500/20 text-blue-500"
                                : "bg-amber-500/5 border-amber-500/20 text-amber-500",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1 h-1 rounded-full",
                              vault.status === "active"
                                ? "bg-emerald-500"
                                : vault.status === "completed"
                                  ? "bg-blue-500"
                                  : "bg-amber-500",
                            )}
                          />
                          {vault.status}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-5 text-right">
                        <p className="text-sm md:text-base font-bold text-white tracking-wide">
                          $
                          {(vault.totalAmount || vault.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-wide">
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
                              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-white/5 font-['Poppins',sans-serif]">
            <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide text-center sm:text-left">
              Displaying {paginatedVaults.length} of {filteredVaults.length}{" "}
              escrow vaults
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
                className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white transition-all font-bold uppercase tracking-wide"
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
                          ? "bg-white text-black shadow-lg"
                          : "bg-white/5 text-gray-400 hover:bg-white/10",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <div className="sm:hidden text-sm font-bold text-white">
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
                className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white transition-all font-bold uppercase tracking-wide"
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
