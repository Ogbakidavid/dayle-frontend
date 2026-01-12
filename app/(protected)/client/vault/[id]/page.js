'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { useVault } from '@/lib/store/vault-context';
import {
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Box,
    FileText,
    TrendingUp,
    Lock,
    ExternalLink
} from 'lucide-react';

export default function ClientVaultDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getVault, updateVaultStatus, loading: contextLoading } = useVault();
    const [vault, setVault] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchVault = async () => {
            const data = await getVault(id);
            setVault(data);
            setLoading(false);
        };
        fetchVault();
    }, [id, getVault]);

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await updateVaultStatus(id, 'completed');
            const data = await getVault(id);
            setVault(data);
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || contextLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="spinner w-8 h-8" />
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">Vault Not Found</h2>
                    <Button variant="link" onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Project Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => router.push('/client')}
                                className="text-slate-400 hover:text-slate-900"
                            >
                                <ArrowLeft size={18} />
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{vault.title}</h1>
                                    <StatusBadge status={vault.status} />
                                </div>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                    Vault ID: {vault.id} • Created {new Date(vault.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Vault Value</div>
                                <AmountDisplay amount={vault.totalAmount || vault.amount} size="medium" />
                            </div>
                            <div className="w-px h-10 bg-slate-200 hidden md:block" />
                            <Button variant="outline" className="hidden md:flex gap-2 text-xs font-bold uppercase tracking-widest">
                                <FileText size={14} />
                                Agreement
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Status Alert */}
                        {vault.status === 'review' && (
                            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 animate-slide-in">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-1">Milestone Complete - Ready for Review</h3>
                                        <p className="text-blue-100 text-sm mb-6 max-w-lg leading-relaxed">
                                            The freelancer has submitted proof of work for the final milestone. Please review the deliverables and release the secured funds.
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleApprove}
                                                isLoading={actionLoading}
                                                className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 h-11"
                                            >
                                                Approve & Release Funds
                                            </Button>
                                            <Button variant="ghost" className="text-white hover:bg-white/10 font-bold px-6 h-11">
                                                Request Revision
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Timeline */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                                <Clock className="w-5 h-5 text-slate-400" />
                                Project Timeline
                            </h2>
                            <div className="space-y-4">
                                {(vault.milestones || []).map((m, i) => (
                                    <div
                                        key={i}
                                        className={`p-6 rounded-2xl border transition-all ${m.status === 'completed'
                                            ? 'bg-green-50/30 border-green-100'
                                            : m.status === 'pending'
                                                ? 'bg-white border-blue-200 shadow-sm'
                                                : 'bg-white border-slate-200 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : m.status === 'pending'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {m.status === 'completed' ? <CheckCircle2 size={16} /> : i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{m.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            Allocated: <AmountDisplay amount={m.amount} size="small" className="scale-75 origin-left" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <StatusBadge status={m.status === 'pending' ? 'active' : m.status} />
                                        </div>
                                        <div className="pl-12 space-y-4">
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {m.description || "Milestone verification criteria is active. Funds will be released upon manual approval or objective verification."}
                                            </p>
                                            {m.submissionUrl && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">proof_of_work_submission.pdf</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 gap-2 font-bold px-3">
                                                        View <ExternalLink size={12} />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-10">
                        {/* Security Ledger Sidebar */}
                        <Card className="border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-900 p-4 border-b border-white/10">
                                <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    Security Ledger
                                </h3>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Custodial Status</div>
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                        <div className="flex gap-3">
                                            <Lock className="w-5 h-5 text-green-600 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-green-900 mb-1">Funds Ring-fenced</p>
                                                <p className="text-[10px] text-green-700 font-medium leading-relaxed uppercase tracking-tight">
                                                    Full capital is held in an objective, milestone-locked environment. Cleard Protocol ensures funds can only be moved upon validation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium uppercase tracking-tight">Total Locked</span>
                                        <AmountDisplay amount={vault.totalAmount || vault.amount} size="small" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium uppercase tracking-tight">Fee (1.0%)</span>
                                        <AmountDisplay amount={(vault.totalAmount || vault.amount) * 0.01} size="small" className="text-slate-400" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium uppercase tracking-tight">Settlement Type</span>
                                        <span className="font-bold text-slate-900 uppercase">Instant</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Participants */}
                        <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contract Participants</h3>
                            <div className="space-y-3">
                                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        {vault.freelancerEmail?.substring(0, 1).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{vault.freelancerEmail || 'Unassigned'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Freelancer</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
