"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/store/vault-context";
import { useWallet } from "@/lib/store/wallet-context";
import {
  Wallet,
  Plus,
  Shield,
  Activity,
  ArrowUpRight,
  LayoutGrid,
  Zap,
} from "lucide-react";

export default function ClientDashboard() {
  const { vaults, loading } = useVault();
  const { balance } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const activeVaults = vaults.filter(
    (v) => v.status !== "completed" && v.status !== "cancelled"
  );
  const totalLocked = activeVaults.reduce(
    (acc, v) => acc + (v.totalAmount || v.amount),
    0
  );

  const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
  const paginatedVaults = activeVaults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className=" space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Overview
          </h1>
          <p className="text-sm text-white font-bold uppercase tracking-wide">
            Welcome back to your client dashboard
          </p>
        </div>
      </header>
      {/* Stats Cards - Cleaner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#111111] border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              Available Balance
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">
              ${balance?.available?.toLocaleString() || "0.00"}
            </h2>
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              Fully Liquid
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-6 rounded-sm hover:border-white/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-wide text-white">
              Locked in Vaults
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-white">
              ${totalLocked.toLocaleString()}
            </h2>
            <p className="text-white text-sm font-bold uppercase tracking-wide">
              {activeVaults.length} Active Contracts
            </p>
          </div>
        </div>

        {/* <Link href="/client/create-vault">
          <div className="bg-emerald-600 hover:bg-emerald-700 p-6 rounded-sm transition-colors cursor-pointer h-full flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <Plus className="w-8 h-8 text-white" />
              <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-4">
              New Vault
            </h3>
            <p className="text-emerald-100 text-sm mt-1 font-bold uppercase tracking-wide">
              Create secure escrow
            </p>
          </div>
        </Link> */}
      </div>

      {/* Active Vaults Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">Active Vaults</h2>
          </div>
          <div className="text-sm text-white font-bold uppercase tracking-wide">{activeVaults.length} active</div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/5 animate-pulse rounded-sm"
              />
            ))}
          </div>
        ) : activeVaults.length === 0 ? (
          <div className="py-16 text-center bg-[#111111] border border-white/10 rounded-sm">
            <Activity className="w-12 h-12 text-white mx-auto mb-4" />
            <p className="text-white font-bold uppercase tracking-wide">No active vaults</p>
            <p className="text-sm text-white mt-2">
              Get started by creating your first vault
            </p>
            <Link href="/client/create-vault">
              <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Vault
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedVaults.map((vault) => (
              <Link
                key={vault.id}
                href={`/client/vault/${vault.id}`}
                className="group flex items-center justify-between p-5 bg-[#111111] border border-white/10 rounded-sm hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold uppercase tracking-wide text-white ">{vault.title}</h4>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-sm font-black uppercase tracking-wide rounded-sm border border-emerald-500/20">
                      {vault.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                    {vault.freelancerEmail ||
                      vault.freelancer?.email ||
                      "Unassigned"}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold uppercase tracking-wide text-white mb-1">Value</p>
                    <p className="text-lg font-bold uppercase tracking-wide text-white">
                      ${(vault.totalAmount || vault.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between px-2">
                <p className="text-sm font-black text-white uppercase tracking-wide">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-wide"
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
                    className="h-8 px-3 text-sm border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-wide"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
