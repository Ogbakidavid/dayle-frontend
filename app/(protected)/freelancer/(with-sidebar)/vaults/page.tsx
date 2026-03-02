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

  const stats = [
    {
      label: "Total Earnings",
      value: "$45,000",
      change: "+8.5%",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      label: "Active Jobs",
      value: "5",
      change: "+1",
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Success Rate",
      value: "98%",
      change: "+0.2%",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen text-gray-400 font-sans selection:bg-emerald-500/30"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Your Vaults
            </h1>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">
              Manage your active contracts and payment vaults
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              className="bg-white/2 border border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px]"
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
              className="relative group bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/1 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/5 transition-all" />
              <div className="flex justify-between items-start mb-6">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-white/5 border border-white/5 transition-colors",
                    stat.color,
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 group-hover:text-white/50 transition-colors">
                {stat.label}
              </p>
              <h2 className="text-3xl font-black text-white tracking-widest font-mono">
                {stat.value}
              </h2>
            </motion.div>
          ))}
        </section>

        {/* 3. SEARCH & TOOLS */}
        <motion.div variants={itemVariants} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="Search vaults or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-5 bg-[#0D0D0E] border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/30 text-white placeholder:text-white/10 transition-all shadow-xl font-bold uppercase tracking-wide text-xs"
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
                  <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Vault Detail
                  </th>
                  <th className="hidden lg:table-cell px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Client
                  </th>
                  <th className="hidden sm:table-cell px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">
                    Value
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedVaults.map((vault: any) => (
                  <tr
                    key={vault.id}
                    className="group hover:bg-white/2 transition-all cursor-pointer relative"
                    onClick={() =>
                      (window.location.href = `/freelancer/vault/${vault.id}`)
                    }
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="hidden xs:flex w-11 h-11 rounded-xl bg-white/2 border border-white/5 items-center justify-center text-white/20 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shrink-0 shadow-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-all uppercase tracking-tight truncate max-w-xs md:max-w-md">
                            {vault.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest whitespace-nowrap">
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

                            <span className="sm:hidden text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black uppercase tracking-widest whitespace-nowrap">
                              {(vault.status || "Pending").toUpperCase()}
                            </span>
                          </div>
                          <p className="lg:hidden text-[9px] text-white/20 font-black uppercase tracking-widest mt-2 truncate">
                            Client:{" "}
                            {vault.clientEmail ||
                              vault.client?.email ||
                              "Unknown Client"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-500 shadow-inner">
                          {(vault.clientEmail ||
                            vault.client?.email ||
                            "C")[0].toUpperCase()}
                        </div>
                        <span className="text-[11px] text-white/50 font-bold tracking-wide truncate max-w-[200px] uppercase">
                          {vault.clientEmail ||
                            vault.client?.email ||
                            "Unknown Client"}
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-6">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] shadow-sm",
                          vault.status === "active" || vault.status === "FUNDED"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                            : vault.status === "completed" ||
                                vault.status === "CLOSED"
                              ? "bg-blue-500/5 border-blue-500/20 text-blue-500"
                              : "bg-white/5 border-white/10 text-white/40",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            vault.status === "active" ||
                              vault.status === "FUNDED"
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                              : vault.status === "completed" ||
                                  vault.status === "CLOSED"
                                ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                                : "bg-white/20 shadow-none",
                          )}
                        />
                        {vault.status || "PENDING"}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <p className="text-base font-black text-white tracking-widest font-mono">
                        ${(vault.totalAmount || vault.amount).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mt-1 italic">
                        Secured
                      </p>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Link
                          href={`/freelancer/vault/${vault.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-emerald-500 hover:text-black hover:bg-emerald-500 rounded-xl transition-all shadow-lg"
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
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
            Securing{" "}
            <span className="text-white/40">{paginatedVaults.length}</span> /{" "}
            {filteredVaults.length} Escrow Contracts
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
              className="h-11 px-6 text-[10px] border-white/5 bg-white/2 hover:bg-white/5 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest disabled:opacity-20"
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
                    "w-9 h-9 rounded-xl text-[10px] font-black transition-all shadow-lg",
                    p === currentPage
                      ? "bg-white text-black scale-110 shadow-white/10"
                      : "bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/60",
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
              className="h-11 px-6 text-[10px] border-white/5 bg-white/2 hover:bg-white/5 text-white/40 hover:text-white transition-all font-black uppercase tracking-widest disabled:opacity-20"
            >
              Next
            </Button>
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
