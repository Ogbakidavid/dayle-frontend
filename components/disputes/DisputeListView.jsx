"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Button } from "@/components/ui/button";
import { api } from "@/lib/mock-api";
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
} from "lucide-react";

const statusConfig = {
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

function formatDate(date) {
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

function StatusPill({ status }) {
  const cfg = statusConfig[status] || statusConfig.open;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        cfg.pill
      )}
    >
      {cfg.label}
    </span>
  );
}

function IconBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.open;
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl border",
        cfg.iconWrap
      )}
    >
      <Icon className={cn("h-4 w-4", cfg.iconColor)} />
    </div>
  );
}

function StatCard({ title, value, hint, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral: "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
    amber: "border-amber-500/15 bg-amber-500/[0.06] hover:bg-amber-500/[0.09]",
    emerald:
      "border-emerald-500/15 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09]",
    sky: "border-sky-500/15 bg-sky-500/[0.06] hover:bg-sky-500/[0.09]",
  };

  return (
    <Card className={cn("transition-colors", toneMap[tone] || toneMap.neutral)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
              {title}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
            {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
            <Icon className="h-5 w-5 text-white/70" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DisputeListView({ role }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | investigating | resolved | closed
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest

  const [disputesData, setDisputesData] = useState([]);
  const [vaultsData, setVaultsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useState(() => {
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
      (d) => d.status === "investigating"
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
          d.milestoneId,
          d.vaultTitle,
          d.milestoneId,
          d.requirementRef || "",
          d.summary || "",
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
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Gavel className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Disputes
              </h1>
              <p className="text-sm text-white/60">
                {role === "client"
                  ? "Review and manage disputes tied to your milestones."
                  : "Open and track disputes for fair milestone resolution."}
              </p>
            </div>
          </div>
        </div>

        <Link href={`/${role}/disputes/create`} className="w-full sm:w-auto">
          <Button className="h-11 w-full sm:w-auto bg-amber-500 px-5 font-bold text-black hover:bg-amber-400">
            <Plus className="mr-2 h-5 w-5" />
            Open dispute
          </Button>
        </Link>
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
      <Card className="border-white/10 bg-[#0B0B0C]">
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
                className="h-11 w-full sm:w-auto border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
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
          <div className="mt-4 flex flex-wrap gap-2">
            {statusTabs.map((t) => {
              const active = statusFilter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setStatusFilter(t.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                    active
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <Filter
                    className={cn(
                      "h-3.5 w-3.5",
                      active ? "text-amber-200" : "text-white/40"
                    )}
                  />
                  {t.label}
                  <span
                    className={cn(
                      "ml-1 rounded-full px-2 py-0.5 text-[11px]",
                      active
                        ? "bg-amber-500/15 text-amber-200"
                        : "bg-white/5 text-white/50"
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

      {/* List */}
      {/* List */}
      <Card className="border-white/10 bg-[#0B0B0C]">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-amber-300" />
              <span className="text-lg font-semibold tracking-tight">
                Cases
              </span>
              <span className="text-sm font-normal text-white/40">
                ({filtered.length})
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 md:p-14">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                  <Gavel className="h-6 w-6 text-white/60" />
                </div>
                <p className="text-base font-semibold text-white">
                  No disputes found
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Try adjusting filters or open a new dispute.
                </p>
                <div className="mt-5 flex justify-center">
                  <Link href={`/${role}/disputes/create`}>
                    <Button className="h-11 bg-amber-500 px-5 font-bold text-black hover:bg-amber-400">
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
                    className="group px-5 py-5 transition-colors hover:bg-white/[0.02] md:px-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left */}
                      <div className="flex items-start gap-4 min-w-0">
                        <IconBadge status={dispute.status} />

                        <div className="min-w-0">
                          {/* Primary line: Vault title */}
                          <p className="truncate text-[15px] font-medium leading-snug text-white">
                            {dispute.vaultTitle}
                          </p>

                          {/* Meta line: ID + status */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold text-white/85">
                              {dispute.id}
                            </span>
                            <StatusPill status={dispute.status} />
                          </div>

                          {/* Metadata */}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-white/45">
                            <span>
                              Milestone:{" "}
                              <span className="text-white/70">
                                {dispute.milestoneId}
                              </span>
                            </span>

                            {dispute.requirementRef ? (
                              <span>
                                Requirement:{" "}
                                <span className="text-white/70">
                                  {dispute.requirementRef}
                                </span>
                              </span>
                            ) : null}

                            <span>
                              Opened:{" "}
                              <span className="text-white/70">
                                {formatDate(dispute.openedAt)}
                              </span>
                            </span>
                          </div>

                          {/* Summary */}
                          {dispute.summary ? (
                            <p className="mt-3 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-white/55">
                              {dispute.summary}
                            </p>
                          ) : (
                            <p className="mt-3 text-[13px] text-white/35">
                              No summary provided.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-2 lg:justify-end">
                        <Link href={`/${role}/disputes/${dispute.id}`}>
                          <Button
                            variant="outline"
                            className="
                        h-10 border-white/10 bg-white/[0.03]
                        text-white/70 hover:bg-white/[0.06] hover:text-white
                        group-hover:border-white/20
                      "
                          >
                            View details
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
    </div>
  );
}
