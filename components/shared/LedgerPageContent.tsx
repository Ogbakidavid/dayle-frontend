"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AmountDisplay } from "@/components/ui/amount-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { LedgerBalance } from "./LedgerBalance";
import { Transaction, useLedger } from "@/lib/store/ledger-context";
import { TransactionStatus, KycStatus, VaultStatus } from "@/lib/domain/enums";
import { useVault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { CurrencyEstimate } from "./currency-estimate";
import { useUser } from "@/lib/store/user-context";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  AlertCircle,
  PiggyBank,
  CheckCircle2,
  Lock,
  ArrowRight,
  Download,
  Search,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

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

// Helper: format a raw USDC amount stored in 6-decimal base units
const formatAmount = (raw: bigint | number | string): number => {
  try {
    return parseFloat(ethers.formatUnits(BigInt(raw), 6));
  } catch {
    return 0;
  }
};

export default function LedgerPageContent() {
  const { balance, transactions, loading, withdraw } = useLedger();
  const { vaults } = useVault();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { user } = useUser();
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isWithdrawing) return;

    if (user?.kycStatus !== KycStatus.VERIFIED) {
      toast.error("Identity Verification Required", {
        description: "You must complete full identity verification (Tier 2) to release funds to your bank account."
      });
      return;
    }

    // Redirect to the new withdrawal flow with amount
    const url = `/withdraw?amount=${withdrawAmount}`;
    window.location.href = url;
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatRef = (id: string | number | undefined | null) => {
    if (!id) return "";
    try {
      const s = String(id);
      if (s.length <= 12) return s;
      return `${s.slice(0, 6)}...${s.slice(-4)}`;
    } catch (e) {
      return id;
    }
  };

  // Calculate total pending from vaults (active projects with at least one submission)
  const pendingFromVaults = vaults.filter(
    (v: any) => v.status === VaultStatus.FUNDED && v.submissions?.length > 0
  ).reduce((acc: number, v: any) => acc + (Number(v.formattedTotalAmount) || 0), 0);

  // Merge the ledger balance with vault-pending amounts
  const enhancedBalance = {
    ...balance,
    formattedPending: (
      Number(balance?.formattedPending || 0) + pendingFromVaults
    ).toString()
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-20 text-slate-900"
    >
      {/* Header */}
      <header className="mb-6 md:mb-10 px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div variants={itemVariants} className="space-y-1">
            <div className="flex items-center gap-2 text-sm md:text-sm font-bold text-emerald-500 tracking-wide mb-2 ">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Secured Settlement Account
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter  flex items-center gap-3">
              Financial Center
            </h1>
            <p className="text-sm md:text-sm font-bold text-slate-600 ">
              Manage your vault earnings and global settlements
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 font-bold h-11 px-6 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 shrink-0  shadow-sm"
            >
              <Download size={16} />
              Export Ledger
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="space-y-10">
        {/* Balance Visualization */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 rounded-sm p-1 shadow-sm"
        >
          <LedgerBalance balance={enhancedBalance} role="freelancer" />
        </motion.div>

        <div className="grid xl:grid-cols-3 gap-10">
          {/* Withdrawal Interface */}
          <div className="xl:col-span-1 min-w-0">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-slate-200 overflow-hidden sticky top-32 rounded-sm shadow-xl w-full max-w-full">
                <div className="bg-emerald-50 border-b border-emerald-100 py-4 px-6">
                  <h3 className="text-emerald-700 font-bold  text-sm">
                    Instant withdrawal
                  </h3>
                </div>
                <CardContent className="p-4 sm:p-6 lg:p-8 space-y-8">
                  <form onSubmit={handleWithdraw} className="space-y-8">
                    <div>
                      <label className="text-sm font-bold text-slate-900  mb-4 block">
                        Withdrawal amount
                      </label>
                      <div className="relative group">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-900 group-focus-within:text-emerald-600 transition-colors">
                        </span>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tabular-nums bg-transparent border-b border-slate-200 focus:border-emerald-600 outline-none py-2 md:py-4 pl-0 transition-all text-slate-900 placeholder:text-slate-900"
                          min="1"
                          step="0.01"
                        />
                      </div>
                      {parseFloat(withdrawAmount) > 0 && (
                        <div className="mt-2 text-sm font-bold">
                          <CurrencyEstimate 
                            usdAmount={parseFloat(withdrawAmount)} 
                            className="text-slate-900" 
                            showNote={false}
                          />
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between text-sm font-bold ">
                        <span className="text-slate-600">Available Limit</span>
                        <CurrencyEstimate 
                          usdAmount={parseFloat(balance?.formattedAvailable || balance?.available || "0")} 
                          className="text-emerald-600 text-sm font-bold"
                          showNote={false}
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-sm p-3 sm:p-4 border border-emerald-100">
                      <div className="flex gap-4">
                        {/* <Zap className="w-5 h-5 text-emerald-600 shrink-0" /> */}
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-emerald-700  mb-1">
                            Turbo settlement
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
                            Withdrawals are processed instantly via private
                            settlement rails.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm  rounded-sm transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
                      disabled={
                        !withdrawAmount ||
                        isWithdrawing ||
                        parseFloat(withdrawAmount) > parseFloat(balance?.formattedAvailable || balance?.available || "0")
                      }
                    >
                      {isWithdrawing ? "Processing..." : "Execute Settlement"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Transaction History Ledger */}
          <motion.div
            variants={itemVariants}
            className="xl:col-span-2 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <History className="w-5 h-5 text-emerald-600" />
                Settlement Ledger
              </h2>
              <div className="relative w-auto">
                <Search className="w-4 h-4 text-slate-900 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm font-medium outline-none focus:border-emerald-500 transition-all text-slate-900 w-full sm:w-64 placeholder:text-slate-900 shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-5 text-left text-[11px] font-bold text-slate-600">
                      Transaction
                    </th>
                    <th className="hidden sm:table-cell px-6 py-5 text-left text-[11px] font-bold text-slate-600">
                      Status
                    </th>
                    <th className="px-2 sm:px-4 md:px-6 py-5 text-right text-[11px] font-bold text-slate-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-20 text-center text-slate-600 text-sm font-bold tracking-wide"
                      >
                        No transactions found in ledger
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx: Transaction) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-2 sm:px-4 md:px-6 py-6">
                          <div className="flex items-center gap-3 md:gap-5">
                            <div
                              className={`hidden xs:flex w-10 h-10 md:w-11 md:h-11 rounded-sm items-center justify-center shrink-0 border transition-colors ${
                                tx.amount < 0
                                  ? "bg-amber-50 border-amber-100 text-amber-600"
                                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
                              }`}
                            >
                              {tx.amount < 0 ? (
                                <ArrowUpRight className="w-5 h-5" />
                              ) : (
                                <ArrowDownLeft className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm  group-hover:text-emerald-700 transition-colors truncate">
                                {tx.description}
                              </div>
                              <div className=" md:text-sm text-slate-600 font-bold  mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                {tx.date && !isNaN(new Date(tx.date).getTime()) 
                                  ? new Date(tx.date).toLocaleDateString()
                                  : "Recently"}
                                <span className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
                                <span className="truncate">
                                  Ref: {formatRef(tx.id)}
                                </span>
                                <span className="sm:hidden px-1.5 py-0.5 rounded-sm bg-slate-50 border border-slate-200 text-[9px] text-slate-600">
                                  {tx.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-6">
                          <span
                            className={cn(
                              "px-2.5 py-1 text-[11px] font-bold  rounded-sm border",
                              tx.status === TransactionStatus.CONFIRMED
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : tx.status === TransactionStatus.PENDING
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200",
                            )}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 md:px-6 py-6 text-right">
                          <div
                            className={cn(
                              "text-base md:text-lg font-bold tracking-tight flex items-center justify-end gap-1",
                              tx.amount < 0
                                ? "text-slate-900"
                                : "text-emerald-600",
                            )}
                          >
                            <span>{tx.amount < 0 ? "-" : "+"}</span>
                            <CurrencyEstimate 
                              usdAmount={Math.abs(formatAmount(tx.amount))} 
                              className={tx.amount < 0 ? "text-slate-900" : "text-emerald-600"} 
                              showNote={false}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="text-sm font-bold text-slate-600 ">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="h-10 sm:h-8 px-4 sm:px-3 text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="h-10 sm:h-8 px-4 sm:px-3 text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
