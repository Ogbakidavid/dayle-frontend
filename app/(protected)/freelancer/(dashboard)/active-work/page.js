'use client';

import { useVault } from '@/lib/store/vault-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, ArrowUpRight, LayoutGrid, Activity } from 'lucide-react';
import { useState } from 'react';

export default function ActiveWorkPage() {
    const { vaults, loading } = useVault();
    // Filter for active work context
    const activeVaults = vaults.filter(v => ['active', 'pending', 'review'].includes(v.status));

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const totalPages = Math.ceil(activeVaults.length / itemsPerPage);
    const paginatedVaults = activeVaults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Breadcrumbs / Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-widest">
                    <Link href="/freelancer" className="hover:text-white transition-colors">Dashboard</Link>
                    <span>/</span>
                    <span className="text-gray-400">Active Work</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                            Active Assignments
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Manage your ongoing contracts and deliverables</p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 animate-pulse rounded-sm" />
                        ))}
                    </div>
                ) : activeVaults.length === 0 ? (
                    <div className="py-20 text-center bg-[#111111] border border-gray-900 rounded-sm">
                        <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium text-lg text-white">No active assignments</p>
                        <p className="text-sm text-gray-500 mt-2">New work assignments will appear here once secured.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            {paginatedVaults.map((vault) => (
                                <Link
                                    key={vault.id}
                                    href={`/freelancer/vault/${vault.id}`}
                                    className="group flex items-center justify-between p-6 bg-[#111111] border border-gray-900 rounded-sm hover:border-gray-800 transition-colors"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{vault.title}</h4>
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-sm border border-emerald-500/20">
                                                {vault.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <p className="flex items-center gap-1.5 font-medium">
                                                Client: <span className="text-gray-300">{vault.clientName || 'Cleard Client'}</span>
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-gray-800" />
                                            <p className="font-medium">
                                                Created {new Date(vault.createdAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Contract Value</p>
                                            <p className="text-xl font-bold text-white tracking-tight">
                                                ${(vault.totalAmount || vault.amount).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-sm bg-gray-900 flex items-center justify-center group-hover:bg-emerald-500 transition-colors shadow-lg">
                                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-gray-900 pt-6">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    Displaying {paginatedVaults.length} of {activeVaults.length} assignments
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="h-9 px-4 text-sm border-gray-800 bg-transparent hover:bg-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="h-9 px-4 text-sm border-gray-800 bg-transparent hover:bg-gray-800 text-gray-400 font-bold uppercase tracking-widest hover:text-white transition-all"
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
