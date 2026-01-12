'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useVault } from '@/lib/store/vault-context';
import { useWallet } from '@/lib/store/wallet-context';
import {
    Wallet, Plus, Shield, Activity,
    ArrowUpRight, LayoutGrid, Zap
} from 'lucide-react';

export default function ClientDashboard() {
    const { vaults, loading } = useVault();
    const { balance } = useWallet();

    const activeVaults = vaults.filter(v => v.status !== 'completed' && v.status !== 'cancelled');
    const totalLocked = activeVaults.reduce((acc, v) => acc + (v.totalAmount || v.amount), 0);

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            {/* Stats Cards - Cleaner */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-[#111111] border border-gray-900 p-6 rounded-2xl hover:border-gray-800 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Available Balance</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-semibold text-white">
                            ${balance?.available?.toLocaleString() || '0.00'}
                        </h2>
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            Fully Liquid
                        </div>
                    </div>
                </div>

                <div className="bg-[#111111] border border-gray-900 p-6 rounded-2xl hover:border-gray-800 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Locked in Vaults</span>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-semibold text-white">
                            ${totalLocked.toLocaleString()}
                        </h2>
                        <p className="text-gray-400 text-xs font-medium">
                            {activeVaults.length} Active Contracts
                        </p>
                    </div>
                </div>

                <Link href="/client/create-vault">
                    <div className="bg-emerald-600 hover:bg-emerald-700 p-6 rounded-2xl transition-colors cursor-pointer h-full flex flex-col justify-between group">
                        <div className="flex justify-between items-start">
                            <Plus className="w-8 h-8 text-white" />
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <ArrowUpRight className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-4">
                            New Vault
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1">
                            Create secure escrow
                        </p>
                    </div>
                </Link>
            </div>

            {/* Active Vaults Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutGrid className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-xl font-semibold text-white">Active Vaults</h2>
                    </div>
                    <div className="text-sm text-gray-400">
                        {activeVaults.length} active
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : activeVaults.length === 0 ? (
                    <div className="py-16 text-center bg-[#111111] border border-gray-900 rounded-2xl">
                        <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">No active vaults</p>
                        <p className="text-sm text-gray-500 mt-2">Get started by creating your first vault</p>
                        <Link href="/client/create-vault">
                            <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Vault
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeVaults.map((vault) => (
                            <Link
                                key={vault.id}
                                href={`/client/vault/${vault.id}`}
                                className="group flex items-center justify-between p-5 bg-[#111111] border border-gray-900 rounded-xl hover:border-gray-800 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-medium text-white">{vault.title}</h4>
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-medium rounded border border-emerald-500/20">
                                            {vault.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {vault.freelancerEmail || 'Unassigned'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 mb-1">Value</p>
                                        <p className="text-lg font-semibold text-white">
                                            ${(vault.totalAmount || vault.amount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}