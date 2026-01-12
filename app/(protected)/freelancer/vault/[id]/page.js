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
    Upload,
    FileText,
    TrendingUp,
    Lock,
    ExternalLink,
    Zap
} from 'lucide-react';

export default function FreelancerVaultDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getVault, updateVaultStatus, loading: contextLoading } = useVault();
    const [vault, setVault] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [submissionUrl, setSubmissionUrl] = useState('');

    useEffect(() => {
        const fetchVault = async () => {
            const data = await getVault(id);
            setVault(data);
            setLoading(false);
        };
        fetchVault();
    }, [id, getVault]);

    const handleSubmitMilestone = async () => {
        if (!submissionUrl) return;
        setActionLoading(true);
        try {
            await updateVaultStatus(id, 'review');
            const data = await getVault(id);
            setVault(data);
            setSubmissionUrl('');
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
                                onClick={() => router.push('/freelancer')}
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
                                    Contract ID: {vault.id} • Created {new Date(vault.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Guaranteed Payout</div>
                                <AmountDisplay amount={vault.totalAmount || vault.amount} size="medium" className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Status Alert for Active work */}
                        {vault.status === 'active' && (
                            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden animate-slide-in">
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <Zap size={140} className="text-white rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                                        <TrendingUp size={12} />
                                        Work in progress
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 uppercase">Submit Final Deliverables</h3>
                                    <p className="text-slate-400 text-sm mb-8 max-w-md leading-relaxed">
                                        Provide the proof of work or public link to initiate the capital release request. Funds are already secured in the vault.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={submissionUrl}
                                                onChange={(e) => setSubmissionUrl(e.target.value)}
                                                placeholder="https://github.com/repo or https://loom.com/..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl h-14 px-5 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSubmitMilestone}
                                            isLoading={actionLoading}
                                            disabled={!submissionUrl}
                                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                                        >
                                            Submit for Client Release
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Timeline Tracking */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                                <Clock className="w-5 h-5 text-slate-400" />
                                Project Progress
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
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : m.status === 'pending'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {m.status === 'completed' ? <CheckCircle2 size={16} /> : i + 1}
                                                </div>
                                                <h4 className="font-bold text-slate-900">{m.title}</h4>
                                            </div>
                                            <StatusBadge status={m.status === 'pending' ? 'active' : m.status} />
                                        </div>
                                        <div className="pl-12">
                                            <p className="text-xs text-slate-500 font-medium">{m.description}</p>
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    Locked Capital: <AmountDisplay amount={m.amount} size="small" className="scale-75 origin-left" />
                                                </div>
                                                {m.status === 'completed' && (
                                                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> Released to Wallet
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-10">
                        {/* Guaranteed Payout Ledger */}
                        <Card className="border-slate-200 overflow-hidden shadow-sm">
                            <div className="bg-slate-900 p-4 border-b border-white/10">
                                <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    Payout Guarantee
                                </h3>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Escrow Status</div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                                        <Lock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                        <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Capital Fully Secured</p>
                                        <p className="text-[10px] text-emerald-700 font-medium uppercase mt-1">100% of project funds are locked</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium uppercase tracking-tight">Potential Earnings</span>
                                        <AmountDisplay amount={vault.totalAmount || vault.amount} size="small" className="text-green-600" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium uppercase tracking-tight">Platform Fee</span>
                                        <span className="font-bold text-slate-400">0%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-1000"
                                            style={{ width: `${(vault.milestones?.filter(m => m.status === 'completed').length / (vault.milestones?.length || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Client Details */}
                        <section className="bg-white border border-slate-200 rounded-2xl p-6">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Securing Client</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-100">
                                    {vault.clientName?.substring(0, 1) || 'C'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{vault.clientName || 'Cleard Client'}</p>
                                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Verified Account</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
