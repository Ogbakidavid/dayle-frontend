'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    FileText,
    TrendingUp,
    Lock,
    ExternalLink,
    Loader2,
    Zap,
    ChevronRight
} from 'lucide-react';
import { useVault } from '@/lib/store/vault-context';

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
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">Vault Not Found</h2>
                    <Button variant="link" className="text-emerald-500" onClick={() => router.back()}>Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-20 p-8 md:p-12">

            {/* Breadcrumb & Navigation */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/client')}
                        className="bg-white/5 hover:bg-white/10 text-slate-400 p-3 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{vault.title}</h1>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-md border border-emerald-500/20">
                                {vault.status}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                            PROTOCOL ID: {vault.id} • ORIGINATED: {new Date(vault.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 bg-[#0A0A0A] p-4 px-8 rounded-[24px] border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Total Locked Capital</p>
                        <p className="text-3xl font-black text-white tracking-tighter tabular-nums">
                            ${(vault.totalAmount || vault.amount).toLocaleString()}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <Button className="bg-white text-black hover:bg-emerald-500 font-black uppercase tracking-widest text-[10px] px-6 rounded-xl">
                        View Agreement
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">

                {/* Main Content: Timeline & Actions */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Active Review Protocol */}
                    {vault.status === 'review' && (
                        <div className="bg-emerald-500 rounded-[32px] p-8 text-black relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-2xl">
                                    <Zap className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Review Required</h3>
                                    <p className="text-black/70 font-bold text-sm leading-snug mb-0 max-w-md">
                                        The final milestone submission is ready. Verify the assets before authorizing the final capital release.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <Button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="bg-black text-white hover:bg-slate-900 font-black uppercase tracking-widest px-8 h-14 rounded-2xl transition-all"
                                    >
                                        {actionLoading ? <Loader2 className="animate-spin" /> : "Authorize Release"}
                                    </Button>
                                    <Button variant="ghost" className="text-black/50 hover:text-black hover:bg-black/5 font-black uppercase tracking-widest h-14">
                                        Request Revision
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestone Execution Path */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Clock className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Execution Roadmap</h2>
                        </div>

                        <div className="space-y-4">
                            {(vault.milestones || []).map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-8 rounded-[32px] border transition-all ${m.status === 'completed'
                                            ? 'bg-[#080808] border-emerald-500/20 opacity-60'
                                            : m.status === 'pending'
                                                ? 'bg-[#0A0A0A] border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
                                                : 'bg-[#080808] border-white/5 opacity-40'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${m.status === 'completed'
                                                    ? 'bg-emerald-500 text-black'
                                                    : 'bg-white/5 text-slate-400'
                                                }`}>
                                                {m.status === 'completed' ? <CheckCircle2 size={24} /> : i + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight">{m.title}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">
                                                        ALLOCATED: ${(m.amount).toLocaleString()}
                                                    </span>
                                                    <div className="h-1 w-1 rounded-full bg-slate-700" />
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{m.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pl-0 md:pl-16 space-y-6">
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                                            {m.description || "Milestone description and verification logic are currently active for this node."}
                                        </p>

                                        {m.submissionUrl && (
                                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">proof_of_work_submission.pdf</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Documented Asset</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-emerald-500 hover:text-emerald-400 hover:bg-transparent font-black uppercase tracking-widest text-[10px] flex gap-2">
                                                    Verify <ExternalLink size={14} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Financial Ledger & Network */}
                <div className="space-y-8">

                    {/* Security Ledger */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden">
                        <div className="bg-white/5 p-6 border-b border-white/5 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Security Ledger</h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
                                <div className="flex gap-4">
                                    <Lock className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-white uppercase tracking-tight">Ring-Fenced</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest">
                                            Full capital is isolated in a non-custodial objective vault. Payouts are code-governed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Net Capital</span>
                                    <span className="text-lg font-black text-white tabular-nums">${(vault.totalAmount || vault.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Fee (1.0%)</span>
                                    <span className="text-sm font-black text-slate-500 tabular-nums">-${((vault.totalAmount || vault.amount) * 0.01).toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Settlement Type</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">On-Chain Instant</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Network Participants */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Network Participants</h3>
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-6 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl">
                                {vault.freelancerEmail?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[150px]">
                                    {vault.freelancerEmail || 'Awaiting Node'}
                                </p>
                                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">Talent Node</p>
                            </div>
                            <div className="ml-auto">
                                <ChevronRight className="w-5 h-5 text-slate-700" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}