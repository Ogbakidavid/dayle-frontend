"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  ArrowDownUp,
  Gavel,
  ShieldCheck,
  Shapes,
  MessageSquareQuote,
  Scale,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import type { Vault } from "@/lib/store/vault-context";
import { DotLoader } from "@/components/ui/dot-loader";

interface Dispute {
  id: string;
  vaultId: string;
  status: string;
  createdAt: string;
  openedBy: string;
  requirementRef?: string;
  description?: string;
  openedByRole?: string;
  [key: string]: any;
}

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

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: LucideIcon; description: string }> = {
  OPEN: {
    label: "Opened",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    icon: AlertCircle,
    description: "Initial report received",
  },
  MUTUAL_RESOLUTION: {
    label: "Mediation",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    icon: MessageSquareQuote,
    description: "Negotiating a fair split",
  },
  UNDER_REVIEW: {
    label: "Dayle Review",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
    icon: Scale,
    description: "Admin reviewing evidence",
  },
  RESOLVED: {
    label: "Settled",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    icon: CheckCircle2,
    description: "Funds released accordingly",
  },
  REJECTED: {
    label: "Closed",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    icon: XCircle,
    description: "Resolved without payout",
  },
};

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function DisputeListView({ role }: { role: "client" | "freelancer" }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");

  const [disputesData, setDisputesData] = useState<Dispute[]>([]);
  const [vaultsData, setVaultsData] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, v] = await Promise.all([
          api.disputes.list(),
          api.vaults.list(),
        ]);
        setDisputesData(d);
        setVaultsData(v);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role]);

  const counts = useMemo(() => {
    const open = disputesData.filter((d) => ["OPEN", "MUTUAL_RESOLUTION", "open"].includes(d.status)).length;
    const review = disputesData.filter((d) => ["UNDER_REVIEW", "investigating"].includes(d.status)).length;
    const resolved = disputesData.filter((d) => ["RESOLVED", "resolved"].includes(d.status)).length;
    const total = disputesData.length;
    
    return { open, review, resolved, total };
  }, [disputesData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = disputesData.map((d) => {
      const vault = vaultsData.find((v) => v.id === d.vaultId);
      return {
        ...d,
        vaultTitle: vault?.title || "Project Vault",
      };
    });

    if (statusFilter !== "all") {
      list = list.filter((d) => d.status.toUpperCase() === statusFilter.toUpperCase());
    }

    if (q) {
      list = list.filter((d) => {
        const hay = [d.id, d.vaultTitle, d.description || "", d.status].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    list.sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return sortKey === "newest" ? bT - aT : aT - bT;
    });

    return list;
  }, [query, statusFilter, sortKey, disputesData, vaultsData]);

  const statusTabs = [
    { key: "all", label: "All Cases", count: counts.total },
    { key: "OPEN", label: "Needs Action", count: counts.open },
    { key: "UNDER_REVIEW", label: "Under Review", count: counts.review },
    { key: "RESOLVED", label: "Resolved", count: counts.resolved },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto"
    >
      <section className="relative overflow-hidden bg-emerald-950 rounded-4xl p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <Shapes className="w-full h-full text-white" strokeWidth={0.5} />
        </div>
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Resolution Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Fairness by <span className="text-emerald-400">Design.</span>
            </h1>
            <p className="text-sm md:text-base text-emerald-100/80 font-medium leading-relaxed">
              Disputes are handled in two stages: first via mutual settlement, then through expert arbitration if no agreement is reached.
            </p>
          </div>
          <div className="shrink-0">
            <Link href={`/${role}/disputes/create`}>
              <Button size="lg" className="bg-white hover:bg-emerald-50 text-emerald-900 font-black h-14 px-8 rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all text-sm uppercase tracking-wider">
                <Plus className="mr-2 h-5 w-5" strokeWidth={3} />
                New Dispute
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 border-t border-white/10 pt-8">
          {[
            { label: "Active Cases", val: counts.open + counts.review, icon: Activity },
            { label: "Resolved", val: counts.resolved, icon: CheckCircle2 },
            { label: "Mutual Settlement", val: counts.open, icon: MessageSquareQuote },
            { label: "Arbiter Review", val: counts.review, icon: Scale },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-300/60">
                <s.icon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-white">{s.val}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {statusTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border",
                statusFilter === t.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                  : "bg-transparent text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              )}
            >
              {t.label} 
              <span className={cn("ml-2 opacity-50", statusFilter === t.key ? "text-white" : "text-slate-400")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cases..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 h-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/5 transition-all"
            />
          </div>
          <Button 
            variant="outline" 
            className="h-12 w-12 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 p-0"
            onClick={() => setSortKey(s => s === "newest" ? "oldest" : "newest")}
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={statusFilter + query}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 gap-4"
        >
          {loading ? (
            <div className="py-32 text-center space-y-8 bg-white rounded-4xl border border-slate-100 shadow-sm">
                <DotLoader color="primary" size="lg" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Opening Legal Docket...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-4xl border border-slate-100 shadow-sm border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">All clear here.</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                No disputes found. Your projects are currently running smoothly.
              </p>
            </div>
          ) : (
            filtered.map((dispute) => {
              const cfg = statusConfig[dispute.status.toUpperCase()] || statusConfig.OPEN;
              const StatusIcon = cfg.icon;

              return (
                <Link key={dispute.id} href={`/${role}/disputes/${dispute.id}`}>
                  <Card className="group border-slate-100 bg-white hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 rounded-4xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row lg:items-center">
                        <div className={cn(
                          "lg:w-64 p-8 flex flex-col justify-center items-center gap-4 text-center border-b lg:border-b-0 lg:border-r border-slate-50 transition-colors group-hover:bg-slate-50/50",
                        )}>
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                            cfg.bg, cfg.text, "border", cfg.border
                          )}>
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={cn("text-sm font-black uppercase tracking-widest", cfg.text)}>
                              {cfg.label}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                              {cfg.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 p-8 min-w-0 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                Case ID: <span className="text-slate-900">#{dispute.id.slice(0, 8)}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                Filed: {formatDate(dispute.createdAt)}
                              </p>
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
                                {dispute.vaultTitle}
                              </h3>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                               <Button variant="ghost" className="rounded-xl px-4 py-6 font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                                 Manage Case
                                 <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                               </Button>
                            </div>
                          </div>

                          {dispute.description && (
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                              &quot;{dispute.description}&quot;
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                              <span className="w-2 h-2 rounded-full bg-slate-200" />
                              Requirement: <span className="text-slate-900">{dispute.requirementRef || "Whole Vault"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                              <span className="w-2 h-2 rounded-full bg-slate-200" />
                              Origin: <span className="text-slate-900">{dispute.openedByRole === 'CLIENT' ? 'Client' : 'Freelancer'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div variants={itemVariants} className="pt-8">
        <Card className="bg-emerald-50 border-emerald-100 rounded-4xl overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/50">
              <Scale className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2 flex-1 text-center md:text-left">
              <h4 className="text-lg font-bold text-emerald-900">How do we solve disputes?</h4>
              <p className="text-sm text-emerald-900/70 font-medium leading-relaxed max-w-2xl">
                First, we provide a **Mediation Room** where you can chat and reach a mutual agreement. If that fails, our **Adjudication Team** reviews all evidence (files, screenshots, contracts) and makes a final, binding decision.
              </p>
            </div>
            <Link href="https://docs.dayle.finance/disputes" target="_blank">
               <Button variant="outline" className="border-emerald-200 bg-white text-emerald-600 font-bold hover:bg-emerald-100 transition-all rounded-xl h-11 px-6">
                 Read Protocol
               </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
