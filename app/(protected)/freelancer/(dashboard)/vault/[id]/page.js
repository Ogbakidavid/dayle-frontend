'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { useVault } from '@/lib/store/vault-context';
import { cn } from '@/lib/utils';
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
    Zap,
    LayoutGrid
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
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Vault Not Found</h2>
                    <Button variant="link" onClick={() => router.back()} className="text-emerald-500">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pb-20 text-gray-200">
            {/* Project Header */}
            <header className="mb-10">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">
                    <button onClick={() => router.push('/freelancer')} className="hover:text-white transition-colors flex items-center gap-1.5">
                        <ArrowLeft size={14} /> Dashboard
                    </button>
                    <span>/</span>
                    <span className="text-gray-400">Vault Detail</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{vault.title}</h1>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm border border-emerald-500/20">
                                {vault.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium font-mono uppercase">
                            Capital Locked: {vault.id}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Status Alert for Active work */}
                    {vault.status === 'active' && (
                        <div className="bg-emerald-600 rounded-sm p-8 text-black shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Zap size={140} className="text-black rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-black/60 font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                                    <TrendingUp size={12} />
                                    Work in progress
                                </div>
                                <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Initiate Settlement</h3>
                                <p className="text-black/70 text-sm mb-8 max-w-md font-medium leading-relaxed">
                                    Funds are already secured in the Cleard Vault. Provide your proof of work or public link to request immediate capital release.
                                </p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={submissionUrl}
                                            onChange={(e) => setSubmissionUrl(e.target.value)}
                                            placeholder="https://github.com/repo or https://loom.com/..."
                                            className="w-full bg-white/20 border border-black/10 rounded-sm h-16 px-6 text-sm font-bold focus:bg-white/30 outline-none transition-all placeholder:text-black/30 text-black"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSubmitMilestone}
                                        disabled={!submissionUrl || actionLoading}
                                        className="w-full h-16 bg-black hover:bg-black/90 text-white font-black uppercase text-sm tracking-[0.2em] rounded-sm transition-all active:scale-[0.98]"
                                    >
                                        {actionLoading ? 'Processing...' : 'Submit for Release'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Project Timeline Tracking */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-xl font-semibold text-white">Project Milestones</h2>
                        </div>
                        <div className="space-y-3">
                            {(vault.milestones || []).map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-6 bg-[#111111] border rounded-sm transition-all group ${m.status === 'completed'
                                        ? 'border-emerald-500/20'
                                        : 'border-gray-900 hover:border-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-xs font-black border transition-colors ${m.status === 'completed'
                                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                                : 'bg-black/50 border-gray-800 text-gray-500'
                                                }`}>
                                                {m.status === 'completed' ? <CheckCircle2 size={18} /> : i + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wide">{m.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{m.description}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm border",
                                            m.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-800 text-gray-400 border-gray-700"
                                        )}>
                                            {m.status}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-900/50 flex items-center justify-between">
                                        <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-gray-500">Allocation:</span>
                                            <span className="text-white">${m.amount.toLocaleString()}</span>
                                        </div>
                                        {m.status === 'completed' && (
                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Zap size={12} /> Settled
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Payout Guarantee Card */}
                    <Card className="bg-[#111111] border-gray-900 rounded-sm overflow-hidden shadow-2xl">
                        <div className="bg-black/40 p-5 border-b border-gray-900">
                            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" />
                                Payout Guarantee
                            </h3>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-sm p-6 text-center group">
                                <Lock className="w-10 h-10 text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-xs font-black text-white uppercase tracking-tight">Capital Fully Secured</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase mt-2">100% of project funds are locked</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Earnings</span>
                                    <span className="text-xl font-bold text-white tracking-tight">${(vault.totalAmount || vault.amount).toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                        style={{ width: `${(vault.milestones?.filter(m => m.status === 'completed').length / (vault.milestones?.length || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Details Section */}
                    <section className="bg-[#111111] border border-gray-900 rounded-sm p-8 shadow-2xl">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Securing Client</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center font-bold text-white text-lg shadow-xl">
                                {vault.clientName?.substring(0, 1) || 'C'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-wide">{vault.clientName || 'Cleard Client'}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Verified Institution</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
