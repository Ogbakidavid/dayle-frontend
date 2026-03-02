"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Gavel,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowDownUp,
  X,
  LucideIcon,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import type { Vault } from "@/lib/store/vault-context";

interface Dispute {
  id: string;
  vaultId: string;
  status: "open" | "resolved" | "investigating" | "closed" | string;
  openedAt: string;
  openedBy: string;
  requirementRef?: string;
  description?: string;
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

interface StatusConfigItem {
  label: string;
  pill: string;
  iconWrap: string;
  icon: LucideIcon;
  iconColor: string;
}

const statusConfig: Record<string, StatusConfigItem> = {
  open: {
    label: "Open",
    pill: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    iconWrap: "bg-amber-500/10 border-amber-500/20",
    icon: AlertCircle,
    iconColor: "text-amber-300",
  },
  resolved: {
    label: "Resolved",
    pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    iconWrap: "bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
    iconColor: "text-emerald-300",
  },
  investigating: {
    label: "Investigating",
    pill: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    iconWrap: "bg-sky-500/10 border-sky-500/20",
    icon: Clock,
    iconColor: "text-sky-300",
  },
  closed: {
    label: "Closed",
    pill: "bg-white/5 text-white/60 border-white/10",
    iconWrap: "bg-white/[0.04] border-white/10",
    icon: CheckCircle2,
    iconColor: "text-white/60",
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

interface StatusPillProps {
  status: string;
}

function StatusPill({ status }: StatusPillProps) {
  const cfg = statusConfig[status] || statusConfig.open;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        cfg.pill,
      )}
    >
      {cfg.label}
    </span>
  );
}

interface IconBadgeProps {
  status: string;
}

function IconBadge({ status }: IconBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.open;
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border",
        cfg.iconWrap,
      )}
    >
      <Icon className={cn("h-4 w-4", cfg.iconColor)} />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "neutral" | "amber" | "emerald" | "sky";
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  const toneMap = {
    neutral: "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
    amber: "border-amber-500/15 bg-amber-500/[0.06] hover:bg-amber-500/[0.09]",
    emerald:
      "border-emerald-500/15 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09]",
    sky: "border-sky-500/15 bg-sky-500/[0.06] hover:bg-sky-500/[0.09]",
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={cn("transition-colors", toneMap[tone] || toneMap.neutral)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                {title}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {value}
              </p>
              {hint ? (
                <p className="mt-1 text-[10px] text-white/45 font-bold uppercase tracking-widest">
                  {hint}
                </p>
              ) : null}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
              <Icon className="h-5 w-5 text-white/70" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export interface DisputeListViewProps {
  role: "client" | "freelancer";
}

export function DisputeListView({ role }: DisputeListViewProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | investigating | resolved | closed
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest

  const [disputesData, setDisputesData] = useState<Dispute[]>([]);
  const [vaultsData, setVaultsData] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
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
    const open = disputesData.filter((d) => d.status === "open").length;
    const investigating = disputesData.filter(
      (d) => d.status === "investigating",
    ).length;
    const resolved = disputesData.filter((d) => d.status === "resolved").length;
    const closed = disputesData.filter((d) => d.status === "closed").length;
    return {
      open,
      investigating,
      resolved,
      closed,
      total: disputesData.length,
    };
  }, [disputesData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = disputesData.map((d) => {
      const vault = vaultsData.find((v) => v.id === d.vaultId);
      return {
        ...d,
        vaultTitle: vault?.title || "Unknown Vault",
      };
    });

    if (statusFilter !== "all") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (q) {
      list = list.filter((d) => {
        const hay = [
          d.id,
          d.vaultTitle,
          d.requirementRef || "",
          d.description || "",
          d.status,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    list.sort((a, b) => {
      const aT = new Date(a.openedAt).getTime();
      const bT = new Date(b.openedAt).getTime();
      return sortKey === "newest" ? bT - aT : aT - bT;
    });

    return list;
  }, [query, statusFilter, sortKey, disputesData, vaultsData]);

  const statusTabs = [
    { key: "all", label: "All", count: counts.total },
    { key: "open", label: "Open", count: counts.open },
    {
      key: "investigating",
      label: "Investigating",
      count: counts.investigating,
    },
    { key: "resolved", label: "Resolved", count: counts.resolved },
    { key: "closed", label: "Closed", count: counts.closed },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="hidden xs:flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/3 shrink-0">
              <Gavel className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">
                Disputes
              </h1>
              <p className="text-xs md:text-sm text-white/50 font-bold uppercase tracking-wide">
                {role === "client"
                  ? "Review and manage disputes tied to your vaults."
                  : "Open and track disputes for fair vault resolution."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href={`/${role}/disputes/create`} className="w-full sm:w-auto">
            <Button className="h-11 w-full sm:w-auto bg-amber-500 px-5 font-black text-black hover:bg-amber-400 uppercase tracking-wide shadow-lg shadow-amber-500/20">
              <Plus className="mr-2 h-5 w-5" />
              Open dispute
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Open"
          value={counts.open}
          hint="Needs attention"
          icon={AlertCircle}
          tone="amber"
        />
        <StatCard
          title="Investigating"
          value={counts.investigating}
          hint="In review"
          icon={Clock}
          tone="sky"
        />
        <StatCard
          title="Resolved"
          value={counts.resolved}
          hint="Completed cases"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          title="Total"
          value={counts.total}
          hint="All disputes"
          icon={Gavel}
          tone="neutral"
        />
      </div>

      {/* Controls */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/10 bg-[#0B0B0C] shadow-xl overflow-hidden">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search disputes..."
                  className="
                  h-11 w-full rounded-xl border border-white/10 bg-black/40
                  pl-9 pr-9 text-sm text-white placeholder:text-white/35
                  outline-none transition
                  focus:border-white/20 focus:ring-2 focus:ring-amber-500/30
                "
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/40 hover:bg-white/5 hover:text-white/70"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full sm:w-auto border-white/10 bg-white/3 text-white/70 hover:bg-white/6 hover:text-white font-bold uppercase tracking-wide transition-all"
                  onClick={() =>
                    setSortKey((s) => (s === "newest" ? "oldest" : "newest"))
                  }
                >
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  {sortKey === "newest" ? "Newest first" : "Oldest first"}
                </Button>
              </div>
            </div>

            {/* Status tabs */}
            <div className="mt-5 flex flex-wrap gap-2">
              {statusTabs.map((t) => {
                const active = statusFilter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setStatusFilter(t.key)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
                      active
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-200 shadow-inner"
                        : "border-white/10 bg-white/3 text-white/60 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <Filter
                      className={cn(
                        "h-3 w-3",
                        active ? "text-amber-200" : "text-white/40",
                      )}
                    />
                    {t.label}
                    <span
                      className={cn(
                        "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        active
                          ? "bg-amber-500/15 text-amber-200"
                          : "bg-white/5 text-white/50",
                      )}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* List */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/10 bg-[#0B0B0C] shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/1">
            <CardTitle className="flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-amber-300" />
                <span className="text-lg font-bold tracking-wider uppercase">
                  Cases
                </span>
                <span className="text-sm font-normal uppercase text-white/40 font-mono">
                  ({filtered.length})
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-white/30">
                  Syncing ledger...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 md:p-14">
                <div className="rounded-2xl border border-white/10 bg-white/3 p-12 text-center shadow-inner">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/30 shadow-xl">
                    <Gavel className="h-7 w-7 text-white/20" />
                  </div>
                  <p className="text-lg font-bold uppercase tracking-wide text-white">
                    No records found
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-widest text-white/30 max-w-xs mx-auto leading-relaxed">
                    Try adjusting filters or open a new dispute for resolution.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <Link href={`/${role}/disputes/create`}>
                      <Button className="h-11 bg-amber-500 px-8 font-black text-black hover:bg-amber-400 uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        <Plus className="mr-2 h-5 w-5" />
                        Open dispute
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map((dispute) => {
                  return (
                    <div
                      key={dispute.id}
                      className="group px-6 py-6 transition-all hover:bg-white/1 md:px-8 border-l-2 border-l-transparent hover:border-l-amber-500/40"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left */}
                        <div className="flex items-start gap-5 min-w-0">
                          <IconBadge status={dispute.status} />

                          <div className="min-w-0 space-y-2">
                            {/* Primary line: Vault title */}
                            <p className="truncate text-lg font-black uppercase tracking-tight leading-none text-white group-hover:text-amber-300 transition-colors">
                              {dispute.vaultTitle}
                            </p>

                            {/* Meta line: ID + status */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-mono font-bold text-white/60 tracking-wider">
                                #{dispute.id.slice(0, 8)}
                              </span>
                              <StatusPill status={dispute.status} />
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                              <span className="flex items-center gap-1.5">
                                <span className="text-white/20">Vault:</span>
                                <span className="text-white/60">
                                  {dispute.vaultId}
                                </span>
                              </span>

                              {dispute.requirementRef ? (
                                <span className="flex items-center gap-1.5">
                                  <span className="text-white/20">Target:</span>
                                  <span className="text-emerald-400/70">
                                    {dispute.requirementRef}
                                  </span>
                                </span>
                              ) : null}

                              <span className="flex items-center gap-1.5">
                                <span className="text-white/20">Opened:</span>
                                <span className="text-white/60">
                                  {formatDate(dispute.openedAt)}
                                </span>
                              </span>
                            </div>

                            {/* Summary */}
                            {dispute.description ? (
                              <p className="line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-white/50 bg-black/20 p-3 rounded-xl border border-white/5 shadow-inner mt-4">
                                {dispute.description}
                              </p>
                            ) : (
                              <div className="mt-4 inline-block px-3 py-1 rounded-full border border-white/5 bg-white/5">
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                                  No description file
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-3 lg:justify-end shrink-0">
                          <Link
                            href={`/${role}/disputes/${dispute.id}`}
                            className="w-full lg:w-auto"
                          >
                            <Button
                              variant="outline"
                              className="
                                h-11 w-full lg:w-auto border-white/10 bg-white/3
                                text-white font-bold uppercase tracking-widest
                                hover:bg-white/10 hover:border-white/20
                                transition-all px-6 text-xs
                              "
                            >
                              View Docket
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
