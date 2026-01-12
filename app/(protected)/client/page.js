'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AmountDisplay } from '@/components/ui/amount-display';
import { StatusBadge } from '@/components/ui/status-badge';
import { useVault } from '@/lib/store/vault-context';
import { useWallet } from '@/lib/store/wallet-context';
import { Wallet, Plus, ArrowRight, Shield } from 'lucide-react';

export default function ClientDashboard() {
    const { vaults, loading } = useVault();
    const { balance } = useWallet();

    const activeVaults = vaults.filter(v => v.status !== 'completed' && v.status !== 'cancelled');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container-custom py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Dashboard</h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your workforce settlements</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Wallet Balance</div>
                                <AmountDisplay amount={balance?.available || 0} size="medium" />
                            </div>
                            <Link href="/client/create-vault">
                                <Button size="lg" className="gap-2 shadow-md">
                                    <Plus className="w-4 h-4" />
                                    New Vault
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-10 space-y-10">
                {/* Active Vaults Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-slate-400" />
                            Active Project Vaults
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="spinner w-8 h-8" />
                        </div>
                    ) : activeVaults.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                            <CardContent className="py-20 text-center">
                                <div className="max-w-md mx-auto">
                                    <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-base font-bold text-slate-900 mb-2">No active vaults</h3>
                                    <p className="text-sm text-slate-500 mb-8">
                                        Secure your project capital and eliminate non-payment risk by creating your first work vault.
                                    </p>
                                    <Link href="/client/create-vault">
                                        <Button variant="outline" className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Build a Project Vault
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contractor</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeVaults.map((vault) => (
                                        <tr key={vault.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{vault.title}</div>
                                                <div className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{vault.description}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {vault.freelancerEmail || 'Unassigned'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={vault.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 tabular-nums">
                                                <AmountDisplay amount={vault.totalAmount || vault.amount} size="small" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/client/vault/${vault.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-2 group-hover:text-blue-600">
                                                        Details
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
