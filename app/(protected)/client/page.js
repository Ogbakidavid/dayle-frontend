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

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl">

            {/* Financial Overview Section */}
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Wallet Balance</span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            ${balance?.available?.toLocaleString() || '0.00'}
                        </h2>
                        <p className="text-emerald-500/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Fully Liquid
                        </p>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[32px] hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Locked in Vaults</span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            ${activeVaults.reduce((acc, v) => acc + (v.totalAmount || v.amount), 0).toLocaleString()}
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{activeVaults.length} Active Contracts</p>
                    </div>
                </div>

                <div className="bg-emerald-500 p-8 rounded-[32px] flex flex-col justify-between group cursor-pointer hover:bg-emerald-400 transition-all">
                    <div className="flex justify-between items-start text-black">
                        <Plus className="w-10 h-10 stroke-[3px]" />
                        <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </div>
                    <Link href="/client/create-vault">
                        <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-tight">
                            Build New <br /> Project Vault
                        </h3>
                    </Link>
                </div>
            </div>

            {/* Vault List Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                        <LayoutGrid className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Pipelines</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-28 bg-white/5 animate-pulse rounded-[32px]" />)}
                    </div>
                ) : activeVaults.length === 0 ? (
                    <div className="py-24 text-center bg-[#080808] border border-dashed border-white/10 rounded-[40px]">
                        <Activity className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest">No active protocols detected</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeVaults.map((vault) => (
                            <Link
                                key={vault.id}
                                href={`/client/vault/${vault.id}`}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-[#0A0A0A] border border-white/5 rounded-[32px] hover:border-emerald-500/50 hover:bg-[#0c0c0c] transition-all"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{vault.title}</h4>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/10">
                                            {vault.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">{vault.freelancerEmail || 'Unassigned Talent'}</p>
                                </div>

                                <div className="flex items-center gap-12 mt-6 md:mt-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Contract Value</p>
                                        <p className="text-2xl font-black text-white tabular-nums">
                                            ${(vault.totalAmount || vault.amount).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                                        <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-black transition-colors" />
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