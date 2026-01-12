'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Lock, Plus, Clock, CheckCircle, Search,
    ArrowUpRight, Zap, Shield, Users, FileText,
    TrendingUp, MoreHorizontal, Filter
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const mockVaults = [
    { id: '1', title: 'Mobile App Development', freelancerEmail: 'alex@devstudio.com', status: 'active', amount: 25000, description: 'Complete mobile application for iOS and Android', date: 'Oct 12, 2025' },
    { id: '2', title: 'Website Redesign', freelancerEmail: 'sarah@design.co', status: 'pending', amount: 15000, description: 'Modern responsive website with CMS', date: 'Oct 14, 2025' },
    { id: '3', title: 'Marketing Campaign', freelancerEmail: 'mike@marketing.pro', status: 'completed', amount: 35000, description: 'Q1 digital marketing strategy', date: 'Sep 28, 2025' },
    { id: '4', title: 'API Integration', freelancerEmail: 'jane@tech.dev', status: 'active', amount: 12000, description: 'Third-party API integration', date: 'Oct 01, 2025' },
    { id: '5', title: 'Brand Identity', freelancerEmail: 'tom@brand.studio', status: 'completed', amount: 8000, description: 'Complete brand guidelines', date: 'Aug 15, 2025' },
    { id: '6', title: 'E-commerce Platform', freelancerEmail: 'unassigned@vault.io', status: 'pending', amount: 45000, description: 'Online store with payment processing', date: 'Oct 20, 2025' }
];

export default function VaultsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVaults = mockVaults.filter(vault =>
        vault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vault.freelancerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Value', value: '$140,000', change: '+12.5%', icon: Shield, color: 'text-emerald-500' },
        { label: 'Active Vaults', value: '12', change: '+2', icon: Zap, color: 'text-blue-500' },
        { label: 'Completion Rate', value: '94%', change: '+0.4%', icon: TrendingUp, color: 'text-purple-500' }
    ];

    return (
        <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto px-6 space-y-10">

                {/* 1. TOP NAVIGATION / HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Financial Vaults</h1>
                        <p className="text-sm text-slate-500 font-medium">Overview of your smart-escrow deployments</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 text-white h-11 px-5 rounded-xl transition-all">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            Filters
                        </Button>
                        <Link href="/client/create-vault">
                            <Button className="bg-white text-black hover:bg-emerald-400 hover:text-black h-11 px-6 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all lg:hidden">
                                <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                                New Vault
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* 2. ANALYTICS GRID */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="relative group bg-[#0D0D0E] border border-white/5 p-6 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/[0.04] transition-all" />
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/5", stat.color)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <h2 className="text-3xl font-bold text-white mt-1 tracking-tight">{stat.value}</h2>
                        </div>
                    ))}
                </section>

                {/* 3. SEARCH & TOOLS */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="search"
                        placeholder="Search assets, emails, or transaction IDs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0D0D0E] border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-slate-600 transition-all shadow-inner"
                    />
                </div>

                {/* 4. DATA TABLE (LIST) */}
                <div className="bg-[#0D0D0E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vault Detail</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Counterparty</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Value</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredVaults.map((vault) => (
                                    <tr key={vault.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{vault.title}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{vault.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                                                    {vault.freelancerEmail[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-slate-400 font-medium">{vault.freelancerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
                                                vault.status === 'active' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                                                    vault.status === 'completed' ? "bg-blue-500/5 border-blue-500/20 text-blue-500" :
                                                        "bg-amber-500/5 border-amber-500/20 text-amber-500"
                                            )}>
                                                <div className={cn("w-1 h-1 rounded-full",
                                                    vault.status === 'active' ? "bg-emerald-500" :
                                                        vault.status === 'completed' ? "bg-blue-500" : "bg-amber-500"
                                                )} />
                                                {vault.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-bold text-white tracking-tight">${vault.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase">USDC / USDT</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/client/vault/${vault.id}`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. FOOTER SUMMARY */}
                <footer className="flex items-center justify-between py-2">
                    <p className="text-xs text-slate-600 font-medium italic">
                        Secured by Multi-Sig Protocol v2.4.0
                    </p>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(p => (
                            <button key={p} className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-all", p === 1 ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:bg-white/10")}>
                                {p}
                            </button>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}