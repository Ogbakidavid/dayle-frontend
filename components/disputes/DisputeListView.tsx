"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Plus,
  Search,
  Filter,
  ArrowDownUp,
  MoreVertical,
  Check,
  ChevronRight,
  Gavel,
  ArrowUpRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, Variants } from "framer-motion";
import type { Vault } from "@/lib/store/vault-context";

interface Dispute {
  id: string;
  vaultId: string;
  status: "open" | "resolved" | "investigating" | "closed" | string;
  createdAt: string;
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
  OPEN: {
    label: "Open",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    iconWrap: "bg-amber-50 border-amber-100",
    icon: AlertCircle,
    iconColor: "text-amber-700",
  },
  RESOLVED: {
    label: "Resolved",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconWrap: "bg-emerald-50 border-emerald-100",
    icon: CheckCircle2,
    iconColor: "text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
    iconWrap: "bg-slate-50 border-slate-100",
    icon: XCircle,
    iconColor: "text-slate-600",
  },
  UNDER_REVIEW: {
    label: "In Review",
    pill: "bg-sky-50 text-sky-700 border-sky-200",
    iconWrap: "bg-sky-50 border-sky-100",
    icon: Clock,
    iconColor: "text-sky-700",
  },
  investigating: { // For backward compatibility if any old data exists
    label: "In Review",
    pill: "bg-sky-50 text-sky-700 border-sky-200",
    iconWrap: "bg-sky-50 border-sky-100",
    icon: Clock,
    iconColor: "text-sky-700",
  },
  open: { // For backward compatibility
    label: "Open",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    iconWrap: "bg-amber-50 border-amber-100",
    icon: AlertCircle,
    iconColor: "text-amber-700",
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
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1  font-bold  uppercase ",
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
    neutral: "border-slate-200 bg-white hover:bg-slate-50",
    amber: "border-amber-200 bg-amber-50/50 hover:bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50",
    sky: "border-sky-200 bg-sky-50/50 hover:bg-sky-50",
  };

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={cn("transition-colors", toneMap[tone] || toneMap.neutral)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold  text-slate-600 mb-2 ">{title}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tighter ">
                {value}
              </p>
              {hint ? (
                <p className="mt-1  text-slate-600 font-bold">
                  {hint}
                </p>
              ) : null}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <Icon className="h-5 w-5 text-slate-600" />
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
    const open = disputesData.filter((d) => d.status === "OPEN" || d.status === "open").length;
    const review = disputesData.filter(
      (d) => d.status === "UNDER_REVIEW" || d.status === "investigating",
    ).length;
    const resolved = disputesData.filter((d) => d.status === "RESOLVED" || d.status === "resolved").length;
    const rejected = disputesData.filter((d) => d.status === "REJECTED" || d.status === "rejected").length;
    
    return {
      open,
      review,
      resolved,
      rejected,
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
      list = list.filter((d) => d.status.toUpperCase() === statusFilter.toUpperCase());
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
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return sortKey === "newest" ? bT - aT : aT - bT;
    });

    return list;
  }, [query, statusFilter, sortKey, disputesData, vaultsData]);

  const statusTabs = [
    { key: "all", label: "All", count: counts.total },
    { key: "OPEN", label: "Open", count: counts.open },
    {
      key: "UNDER_REVIEW",
      label: "In Review",
      count: counts.review,
    },
    { key: "RESOLVED", label: "Resolved", count: counts.resolved },
    { key: "REJECTED", label: "Closed", count: counts.rejected },
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
            <div className="hidden xs:flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 shrink-0">
              <Gavel className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter ">
                Disputes
              </h1>
              <p className="text-sm md:text-sm font-bold text-slate-600  max-w-2xl leading-relaxed">
                {role === "client"
                  ? "Review and manage disputes tied to your vaults."
                  : "Open and track disputes for fair vault resolution."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link href={`/${role}/disputes/create`} className="w-full sm:w-auto">
            <Button className="h-11 w-full sm:w-auto bg-amber-500 px-6 font-bold text-white hover:bg-amber-600  shadow-md shadow-amber-500/20 rounded-xl transition-all">
              <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
              Open dispute
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open"
          value={counts.open}
          hint="Needs attention"
          icon={AlertCircle}
          tone="amber"
        />
        <StatCard
          title="In Review"
          value={counts.review}
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
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search disputes..."
                  className="
                  h-12 w-full rounded-2xl border border-slate-200 bg-white
                  pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-900
                  outline-none transition-all font-bold 
                  focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 shadow-sm
                "
                />
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full sm:w-auto border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold  transition-all shadow-sm rounded-xl"
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
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold transition-all",
                      active
                        ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Filter
                      className={cn(
                        "h-3 w-3",
                        active ? "text-amber-300" : "text-slate-300",
                      )}
                    />
                    {t.label}
                    <span
                      className={cn(
                        "ml-1 rounded-full px-2 py-0.5  font-bold ",
                        active
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600",
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
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <CardTitle className="flex items-center justify-between gap-3 text-slate-900">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-amber-600" />
                <span className="text-lg font-bold  ">Cases</span>
                <span className="text-[11px] font-bold text-slate-600 font-mono st mt-0.5">
                  ({filtered.length})
                </span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500" />
                <p className="mt-4 text-sm font-bold  text-slate-600">
                  Syncing ledger...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 md:p-14">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-12 text-center shadow-sm">
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <Gavel className="h-7 w-7 text-slate-200" />
                  </div>
                  <p className="text-lg font-bold  text-slate-900">
                    No records found
                  </p>
                  <p className="mt-2 text-sm  text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Try adjusting filters or open a new dispute for resolution.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <Link href={`/${role}/disputes/create`}>
                      <Button className="h-11 bg-amber-500 px-8 font-bold text-white hover:bg-amber-600  shadow-md shadow-amber-500/20 rounded-xl transition-all">
                        <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
                        Open dispute
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((dispute) => {
                  return (
                    <div
                      key={dispute.id}
                      className="group px-6 py-6 transition-all hover:bg-slate-50 md:px-8 border-l-2 border-l-transparent hover:border-l-amber-500/40"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        {/* Left */}
                        <div className="flex items-start gap-5 min-w-0">
                          <IconBadge status={dispute.status} />

                          <div className="min-w-0 space-y-2">
                            {/* Primary line: Vault title */}
                            <p className="truncate text-lg font-bold tracking-tighter leading-none text-slate-900 group-hover:text-amber-700 transition-colors ">
                              {dispute.vaultTitle}
                            </p>

                            {/* Meta line: ID + status */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-mono font-bold text-slate-600 r ">
                                #{dispute.id.slice(0, 8)}
                              </span>
                              <StatusPill status={dispute.status} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1  md:text-sm font-bold  text-slate-600 uppercase ">
                              <span className="text-slate-600">
                                {dispute.vaultId.slice(0, 8)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              {dispute.requirementRef ? (
                                <>
                                  <span className="text-emerald-600">
                                    {dispute.requirementRef}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                                </>
                              ) : null}
                              <span className="text-slate-600">
                                {formatDate(dispute.createdAt)}
                              </span>
                            </div>

                            {/* Summary */}
                            {dispute.description ? (
                              <p className="line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm mt-4">
                                {dispute.description}
                              </p>
                            ) : (
                              <div className="mt-4 inline-block px-3 py-1 rounded-full border border-slate-100 bg-slate-50">
                                <span className=" text-slate-600 font-bold ">
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
                                h-11 w-full lg:w-auto border-slate-200 bg-white
                                text-slate-600 font-bold  transition-all
                                hover:bg-slate-50 hover:text-slate-900
                                px-6 text-[11px] shadow-sm rounded-xl uppercase 
                              "
                            >
                              View docket
                              <ArrowUpRight
                                className="ml-2 h-4 w-4"
                                strokeWidth={3}
                              />
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
