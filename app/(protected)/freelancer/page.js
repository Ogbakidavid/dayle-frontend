'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmountDisplay } from '@/components/ui/amount-display';
import { StatusBadge } from '@/components/ui/status-badge';
import { useVault } from '@/lib/store/vault-context';
import { useWallet } from '@/lib/store/wallet-context';
import { Briefcase, ArrowRight, TrendingUp, Clock } from 'lucide-react';

export default function FreelancerDashboard() {
    const { vaults, loading } = useVault();
    const { balance } = useWallet();

    // Work categories
    const activeVaults = vaults.filter(v => ['active', 'pending', 'review'].includes(v.status));
    const completedVaults = vaults.filter(v => v.status === 'completed');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Work</h1>
                            <p className="text-sm text-slate-500 mt-1">Track deliverables and earnings</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Available to Withdraw</div>
                                <AmountDisplay amount={balance?.available || 0} size="medium" className="text-green-600" />
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Pending in Vaults</div>
                                <AmountDisplay amount={balance?.pending || 0} size="medium" />
                            </div>
                            <Link href="/freelancer/wallet">
                                <Button size="default" className="ml-4">
                                    Wallet
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-10">
                {/* Active Work Assignment Table */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Active Work Assignments</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="spinner w-8 h-8" />
                        </div>
                    ) : activeVaults.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                            <CardContent className="py-20 text-center">
                                <div className="max-w-md mx-auto">
                                    <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-base font-bold text-slate-900 mb-2">No active assignments</h3>
                                    <p className="text-sm text-slate-500">
                                        Assignments will appear here once secured by clients in work vaults.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault Value</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {activeVaults.map((vault) => (
                                        <tr key={vault.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{vault.title}</div>
                                                <div className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{vault.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {vault.clientName || 'Cleard Client'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={vault.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AmountDisplay amount={vault.totalAmount || vault.amount} size="small" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/freelancer/vault/${vault.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2 group-hover:text-blue-600">
                                                        Submit Work
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
