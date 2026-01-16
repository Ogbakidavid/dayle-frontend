"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  ArrowUpRight,
  Zap,
  Shield,
  TrendingUp,
  MoreHorizontal,
  Filter,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";

export default function FreelancerVaultsPage() {
  const { vaults, loading } = useVault();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredVaults = (vaults || []).filter((vault) => {
    const clientEmail = vault.clientEmail || vault.client?.email || "";
    return (
      vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVaults.length / itemsPerPage);
  const paginatedVaults = filteredVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Your Vaults
            </h1>
            <p className="text-sm text-white font-bold uppercase tracking-wide">
              Manage your active contracts and milestones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all"
            >
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              Filters
            </Button>
          </div>
        </header>

        {/* 2. ANALYTICS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative group bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/[0.04] transition-all" />
              <div className="flex justify-between items-start mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-xl bg-white/5 border border-white/5",
                    stat.color
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wide">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-wide text-white/30 mb-2">
                {stat.label}
              </p>
              <h2 className="text-3xl font-black text-white tracking-tighter">
                {stat.value}
              </h2>
            </div>
          ))}
        </section>

        {/* 3. SEARCH & TOOLS */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="Search vaults, clients, or milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#0D0D0E] border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all shadow-inner"
          />
        </div>

        {/* 4. DATA TABLE (LIST) */}
        <div className="bg-[#0D0D0E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Vault Detail
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide text-right">
                    Value
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedVaults.map((vault) => (
                  <tr
                    key={vault.id}
                    className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/freelancer/vault/${vault.id}`)
                    }
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {vault.title}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5 font-medium">
                            {new Date(
                              vault.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-500">
                          {(vault.clientEmail ||
                            vault.client?.email ||
                            "C")[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-400 font-medium">
                          {vault.clientEmail ||
                            vault.client?.email ||
                            "Unknown Client"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-bold uppercase tracking-wide",
                          vault.status === "active"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                            : vault.status === "completed"
                              ? "bg-blue-500/5 border-blue-500/20 text-blue-500"
                              : "bg-amber-500/5 border-amber-500/20 text-amber-500"
                        )}
                      >
                        <div
                          className={cn(
                            "w-1 h-1 rounded-full",
                            vault.status === "active"
                              ? "bg-emerald-500"
                              : vault.status === "completed"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          )}
                        />
                        {vault.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-black text-white tracking-wide">
                        ${(vault.totalAmount || vault.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600 font-bold uppercase">
                        USD
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/freelancer/vault/${vault.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. FOOTER SUMMARY */}
        <footer className="flex items-center justify-between py-6 border-t border-white/5">
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
            Displaying {paginatedVaults.length} of {filteredVaults.length}{" "}
            smart-vaults
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
              className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-wide"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                      : "bg-white/5 text-slate-500 hover:bg-white/10"
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
              className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-wide"
            >
              Next
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
