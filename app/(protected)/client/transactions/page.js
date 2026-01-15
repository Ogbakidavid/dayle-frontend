"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock Data
const mockTransactions = [
  {
    id: "TX-98234",
    type: "deposit",
    counterparty: "Bank Transfer",
    status: "completed",
    amount: 5000,
    date: "Oct 24, 2025",
    method: "USD",
  },
  {
    id: "TX-98233",
    type: "payment",
    counterparty: "alex@devstudio.com",
    status: "completed",
    amount: 2500,
    date: "Oct 23, 2025",
    method: "Escrow Release",
  },
  {
    id: "TX-98232",
    type: "payment",
    counterparty: "sarah@design.co",
    status: "pending",
    amount: 1500,
    date: "Oct 22, 2025",
    method: "Escrow Release",
  },
  {
    id: "TX-98231",
    type: "withdrawal",
    counterparty: "Bank Account ****4532",
    status: "processing",
    amount: 10000,
    date: "Oct 20, 2025",
    method: "Wire Transfer",
  },
  {
    id: "TX-98230",
    type: "deposit",
    counterparty: "Bank Transfer",
    status: "completed",
    amount: 20000,
    date: "Oct 15, 2025",
    method: "USD",
  },
  {
    id: "TX-98229",
    type: "payment",
    counterparty: "mike@marketing.pro",
    status: "failed",
    amount: 3500,
    date: "Oct 12, 2025",
    method: "Escrow Release",
  },
  {
    id: "TX-98228",
    type: "deposit",
    counterparty: "Bank Transfer",
    status: "completed",
    amount: 1200,
    date: "Oct 10, 2025",
    method: "USD",
  },
  {
    id: "TX-98227",
    type: "payment",
    counterparty: "jane@dev.io",
    status: "completed",
    amount: 4200,
    date: "Oct 08, 2025",
    method: "Escrow Release",
  },
  {
    id: "TX-98226",
    type: "withdrawal",
    counterparty: "Bank Account ****4532",
    status: "completed",
    amount: 5000,
    date: "Oct 05, 2025",
    method: "Wire Transfer",
  },
  {
    id: "TX-98225",
    type: "deposit",
    counterparty: "Bank Transfer",
    status: "completed",
    amount: 8000,
    date: "Oct 01, 2025",
    method: "USD",
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredTransactions = mockTransactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        {/* 1. TOP NAVIGATION / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
              Transactions
            </h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              Financial activity and history
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all"
            >
              <Download className="w-4 h-4 mr-2 text-slate-400" />
              Export
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all font-bold uppercase tracking-widest"
            >
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              Filters
            </Button>
          </div>
        </header>

        {/* 2. STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl">
            <p className="text-sm font-medium text-slate-500">Total Volume</p>
            <h2 className="text-3xl font-bold text-white mt-1">$42,500</h2>
          </div>
          <div className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl">
            <p className="text-sm font-medium text-slate-500">Processing</p>
            <h2 className="text-3xl font-bold text-amber-500 mt-1">$11,500</h2>
          </div>
          <div className="bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Available
            </p>
            <h2 className="text-3xl font-bold text-emerald-500 mt-1 tracking-tight">
              $31,000
            </h2>
          </div>
        </div>

        {/* 3. SEARCH */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="search"
            placeholder="Search by ID or counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#0D0D0E] border border-white/5 rounded-sm focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all shadow-inner font-bold uppercase tracking-wider"
          />
        </div>

        {/* 4. TABLE */}
        <div className="bg-[#0D0D0E] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                          {tx.type === "deposit" ? (
                            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                          ) : tx.type === "withdrawal" ? (
                            <ArrowUpRight className="w-5 h-5 text-amber-500" />
                          ) : (
                            <RefreshCw className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">
                            {tx.id}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5 font-bold uppercase tracking-widest">
                            {tx.counterparty}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                        {tx.date}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider",
                          tx.status === "completed"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                            : tx.status === "processing" ||
                              tx.status === "pending"
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                            : "bg-red-500/5 border-red-500/20 text-red-500"
                        )}
                      >
                        <div
                          className={cn(
                            "w-1 h-1 rounded-full",
                            tx.status === "completed"
                              ? "bg-emerald-500"
                              : tx.status === "processing" ||
                                tx.status === "pending"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}
                        />
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p
                        className={cn(
                          "text-sm font-bold tracking-tight",
                          tx.type === "deposit"
                            ? "text-emerald-500"
                            : "text-white"
                        )}
                      >
                        {tx.type === "deposit" ? "+" : "-"}$
                        {tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        {tx.method}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
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
                  className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-9 px-4 text-sm border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold uppercase tracking-widest"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
