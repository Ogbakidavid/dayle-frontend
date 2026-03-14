"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useLedger } from "@/lib/store/ledger-context";
import {
  Briefcase,
  ArrowUpRight,
  Landmark,
  Shield,
  Activity,
  CheckCircle,
  Zap,
  Award, // Use Award instead of Badge icon to avoid conflict
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Import the actual component
import { VaultStatus } from "@/lib/domain/enums";
import { getVaultDerivedLabel } from "@/lib/domain/enums";
import { api } from "@/lib/api-client";
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

export default function FreelancerDashboard() {
  const { vaults, loading } = useVault();
  const { balance } = useLedger();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  React.useEffect(() => {
    async function fetchInvitations() {
      try {
        setInvitationsLoading(true);
        const data = await api.invites.listMyInvites();
        setInvitations(data);
      } catch (err) {
        console.error("Failed to fetch invitations:", err);
      } finally {
        setInvitationsLoading(false);
      }
    }
    fetchInvitations();
  }, []);

  // Work categories
  const activeVaults = vaults.filter((v: any) =>
    [VaultStatus.FUNDED, VaultStatus.DISPUTED].includes(v.status),
  );
  const completedVaults = vaults.filter(
    (v: any) =>
      v.status === VaultStatus.RELEASED || v.status === VaultStatus.REFUNDED,
  );
  const totalPending = activeVaults.reduce(
    (acc: number, v: any) => acc + (v.totalAmount || v.amount),
    0,
  );

  const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
  const paginatedVaults = activeVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto font-primary"
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 ">
            Overview
          </h1>
          <p className="text-[10px] md:text-xs text-slate-600 font-bold tracking-wide">
            Track your deliverables and secure earnings
          </p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-3">
          <Link href="/freelancer/balance" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs h-11 px-6 transition-all shadow-sm">
              Withdraw funds
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-emerald-500/20 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold tracking-wide text-slate-600 group-hover:text-slate-600 transition-colors">
              Available to withdraw
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tighter ">
              ${balance?.formattedAvailable || "0.00"}
            </h2>
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              Funds liquid
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-500/20 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold tracking-wide text-slate-600 group-hover:text-slate-600 transition-colors">
              Pending in projects
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tighter ">
              $
              {activeVaults
                .reduce(
                  (acc: number, v: any) =>
                    acc + (Number(v.formattedTotalAmount) || 0),
                  0,
                )
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </h2>
            <p className="text-blue-400 text-[10px] font-bold tracking-wide">
              {activeVaults.length} active assignments
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-amber-500/20 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold tracking-wide text-slate-600 group-hover:text-slate-600 transition-colors">
              Completed projects
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tighter ">
              {completedVaults.length}
            </h2>
            <p className="text-amber-400 text-[10px] font-bold tracking-wide">
              Project access level 1
            </p>
          </div>
        </motion.div>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="pt-4 space-y-6">
          <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold tracking-wide text-slate-900 ">
                Pending project invitations
              </h2>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
              {invitations.length} new
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {invitations.map((invite: any) => (
              <div
                key={invite.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-blue-500/20 rounded-2xl hover:border-emerald-500/30 transition-all gap-6 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold tracking-tight text-slate-900">
                      {invite.vault?.title}
                    </h4>
                    <span className="bg-blue-500/10 text-blue-500 text-[9px] font-bold tracking-wide rounded-lg border border-blue-500/20 py-1 px-3">
                      Action required
                    </span>
                    {invite.vault?.isFunded ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold tracking-wide rounded-lg border border-emerald-200 py-1 px-3">
                        Funded
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-[9px] font-bold tracking-wide rounded-lg border border-amber-200 py-1 px-3">
                        Payment Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <Landmark className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold tracking-widest">
                      From:{" "}
                      <span className="text-slate-600">
                        {invite.vault?.client?.name || "Dayle Client"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-600 font-bold tracking-wide mb-1">
                      Project value
                    </p>
                    <p className="text-xl font-bold text-slate-900 tracking-tight ">
                      $
                      {invite.vault?.formattedTotalAmount || "0.00"}
                    </p>
                  </div>
                  <Link href={`/invite/${invite.token}`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] h-10 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                      View invitation
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Assignments Section */}
      <div className="pt-8 space-y-6">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold tracking-wide text-slate-900 ">
              Active assignments
            </h2>
          </div>
          <div className="text-[10px] font-bold tracking-wide text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            {activeVaults.length} contracts
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : activeVaults.length === 0 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 group">
              <Activity className="w-8 h-8 text-slate-200 group-hover:text-slate-600 transition-colors" />
            </div>
            <p className="text-sm font-bold tracking-wide text-slate-900">
              No active assignments
            </p>
            <p className="text-[10px] text-slate-600 mt-3 font-semibold tracking-wide max-w-xs mx-auto leading-relaxed">
              Projects will appear here once secured by clients
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* PAGINATION WRAPPER */}
            <motion.div
              key={currentPage}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {paginatedVaults.map((vault: any) => (
                <Link key={vault.id} href={`/freelancer/vault/${vault.id}`}>
                  <motion.div
                    variants={itemVariants}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500/30 transition-all gap-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 truncate max-w-md">
                          {vault.title}
                        </h4>
                        <Badge
                          // variant="outline"
                          className="bg-emerald-50 text-emerald-700 text-[9px] font-bold tracking-wide rounded-lg border border-emerald-200 py-1 px-3 whitespace-nowrap"
                        >
                          {getVaultDerivedLabel(vault.status)}
                        </Badge>
                      </div>
                      {vault.description && (
                        <p className="text-[11px] text-slate-600 mb-3 line-clamp-1 max-w-xl font-bold tracking-wide leading-relaxed">
                          {vault.description}
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Briefcase className="w-2.5 h-2.5 text-slate-600" />
                          </div>
                          <p className="text-[10px] text-slate-600 font-bold tracking-wide">
                            Client:{" "}
                            <span className="text-slate-700">
                              {vault.clientName || "Dayle Client"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md",
                              vault.submissions?.length > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200",
                            )}
                          >
                            {vault.status === VaultStatus.RELEASED
                              ? "Released"
                              : vault.submissions?.length > 0
                                ? `${vault.submissions[0].deliverableStatus?.filter((d: any) => d.included).length || 0} of ${vault.deliverables?.length || 0} deliverables claimed`
                                : "Not started"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 border-slate-100 pt-6 sm:pt-0">
                      <div className="sm:text-right">
                        <p className="text-[9px] text-slate-600 font-bold tracking-wide mb-1">
                          Project value
                        </p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight ">
                          ${vault.formattedTotalAmount || "0.00"}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all group-hover:scale-110 shadow-sm group-hover:shadow-emerald-500/20">
                        <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-600 tracking-wide">
                  Page <span className="text-slate-600">{currentPage}</span> /{" "}
                  {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="h-10 px-4 text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold tracking-wide transition-all disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="h-10 px-4 text-[10px] border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold tracking-wide transition-all disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
