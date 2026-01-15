'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Shield, Clock, DollarSign, Lock, AlertTriangle, FileText, Cpu, Scale, History,
    ExternalLink, Flag, CheckCircle2, XCircle, Orbit, ArrowLeft, TrendingUp, Sparkles, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const VAULT_DATA = {
    id: 'SK-VLT-2026-00812',
    title: 'Enterprise E-commerce Architecture',
    status: 'ACTIVE',
    createdAt: 'Jan 12, 2026',
    totalCapital: 65000,
    custodian: 'Cleard Clearing House'
};

const milestonesInitial = [
    {
        id: 1,
        title: 'System Architecture & Schema Design',
        amount: 13000,
        status: 'RELEASED',
        authority: 'AI + Clearing Review',
        aiChecks: [
            { label: 'GitHub repo exists', passed: true },
            { label: 'Architecture docs present', passed: true },
            { label: 'Commits after vault creation', passed: true }
        ],
        notes: 'Capital released automatically after AI verification.',
        timestamp: 'Feb 10, 2026 14:30 UTC',
        evidence: {
            repo: 'https://github.com/Cleard/ecommerce-core',
            deployment: 'https://arch.Cleard.io',
            lastCommit: '7a2b5c1'
        }
    },
    {
        id: 2,
        title: 'Core Authentication Engine',
        amount: 13000,
        status: 'RELEASED',
        authority: 'AI Verification',
        aiChecks: [
            { label: 'Endpoints reachable', passed: true },
            { label: 'Unit tests passing', passed: true },
            { label: 'Live deployment verified', passed: true }
        ],
        notes: 'Capital released automatically after AI verification.',
        timestamp: 'Mar 05, 2026 09:12 UTC',
        evidence: {
            endpoints: ['/auth/login', '/auth/signup', '/auth/mfa'],
            testCoverage: '98%',
            logs: 'All verification probes returned 200 OK'
        }
    },
    {
        id: 3,
        title: 'Payment Gateway Protocol',
        amount: 13000,
        status: 'UNDER_REVIEW',
        authority: 'AI + Human Audit',
        aiChecks: [
            { label: 'GitHub repo linked', passed: true },
            { label: 'Live deployment reachable', passed: true },
            { label: 'Webhook events active', passed: false }
        ],
        notes: 'Under AI review. Client cannot manually release funds yet.',
        disputeRaised: false,
        timestamp: 'Mar 10, 2026 10:00 UTC',
        disputeWindowHours: 48,
        evidence: {
            repo: 'https://github.com/Cleard/payments-svc',
            deployment: 'https://pay-stg.Cleard.io',
            issues: 'Webhook handshake failing intermittently'
        }
    },
    {
        id: 4,
        title: 'Analytics & Reporting Suite',
        amount: 13000,
        status: 'SUBMITTED',
        authority: 'AI Audit Pending',
        aiChecks: [],
        notes: 'Freelancer submitted work. AI audit starting shortly.',
        evidence: {
            submission: 'archive_v2.zip',
            size: '12.4MB'
        }
    },
    {
        id: 5,
        title: 'Final Documentation & Handover',
        amount: 13000,
        status: 'LOCKED',
        authority: 'Pending Sequence',
        aiChecks: [],
        notes: 'This milestone unlocks after prior tranche release.',
    }
];

export default function ClientVaultPage() {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState(3);
    const [milestones, setMilestones] = useState(milestonesInitial);
    const [viewingEvidence, setViewingEvidence] = useState(null);

    const handleRaiseDispute = (id) => {
        setMilestones(ms => ms.map(m => m.id === id ? { ...m, disputeRaised: true, status: 'DISPUTED' } : m));
    };

    const handleApprove = (id) => {
        setMilestones(ms => ms.map(m =>
            m.id === id
                ? {
                    ...m,
                    status: 'RELEASED',
                    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' UTC',
                    notes: 'Capital released manually by client approval.'
                }
                : m
        ));
    };

    const releasedCapital = milestones
        .filter(m => m.status === 'RELEASED')
        .reduce((sum, m) => sum + m.amount, 0);

    const pendingCapital = milestones
        .filter(m => ['SUBMITTED', 'UNDER_REVIEW', 'DISPUTED'].includes(m.status))
        .reduce((sum, m) => sum + m.amount, 0);

    return (
        <div className="min-h-screen text-white font-sans selection:bg-emerald-500/30">
            <div className="max-w-[1400px] mx-auto p-6 space-y-8">

                {/* COMPACT HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => router.push('/client')}
                            className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-emerald-500 uppercase">Vault Protocol</span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="text-xs font-bold text-gray-500 uppercase">{VAULT_DATA.id}</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{VAULT_DATA.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-2 pl-5 rounded-full">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Custodian Agency</p>
                            <p className="text-sm font-semibold">{VAULT_DATA.custodian}</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: SETTLEMENT LEDGER */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase flex items-center gap-3 text-white">
                                <Orbit className="w-4 h-4 text-emerald-500" />
                                Settlement Ledger
                            </h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Live Sync</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {milestones.map((m, index) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "group relative rounded-xl transition-all duration-300 border shadow-sm",
                                        m.status === 'RELEASED' ? "bg-emerald-500/[0.02] border-emerald-500/20" : "bg-[#111111] border-white/5",
                                        expandedId === m.id && "bg-[#161616] border-white/10 ring-1 ring-white/5 shadow-xl"
                                    )}
                                >
                                    <div
                                        onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                                        className="p-5 cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border transition-all duration-300",
                                                m.status === 'RELEASED' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-black/40 border-white/10 text-gray-500"
                                            )}>
                                                {m.status === 'RELEASED' ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-mono text-sm">0{index + 1}</span>}
                                            </div>
                                            <div>
                                                <h3 className={cn("text-base font-bold tracking-tight mb-0.5", m.status === 'RELEASED' ? "text-emerald-400" : "text-white")}>{m.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">${m.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{m.authority.replace('AI + ', '')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase px-3 py-1 rounded-full border",
                                                m.status === 'RELEASED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    m.status === 'UNDER_REVIEW' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-gray-500 border-white/10"
                                            )}>
                                                {m.status.replace('_', ' ')}
                                            </span>
                                            <ChevronRight className={cn("w-4 h-4 text-gray-600 transition-transform duration-300", expandedId === m.id && "rotate-90 text-white")} />
                                        </div>
                                    </div>

                                    {expandedId === m.id && (
                                        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2">
                                            <div className="h-px w-full bg-white/5 mb-5" />
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    {m.aiChecks && m.aiChecks.length > 0 && (
                                                        <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                                                    <span className="text-[10px] font-bold uppercase text-white">Objective AI Audit</span>
                                                                </div>
                                                                <span className="text-[9px] text-emerald-500 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded">v2.4 Ready</span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {m.aiChecks.map((c, i) => (
                                                                    <div key={i} className="flex justify-between items-center group/check">
                                                                        <span className={cn("text-xs font-medium transition-colors", c.passed ? 'text-gray-300' : 'text-red-400')}>{c.label}</span>
                                                                        <div className={cn("w-4 h-4 rounded flex items-center justify-center border", c.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-red-500/10 border-red-500/30 text-red-500")}>
                                                                            {c.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                                        <p className="text-xs text-gray-400 leading-relaxed font-medium">"{m.notes}"</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {(m.status === 'UNDER_REVIEW' || m.status === 'SUBMITTED' || m.status === 'RELEASED') && (
                                                            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 h-10 text-[10px] font-bold uppercase hover:bg-white/10 hover:text-white transition-all" onClick={() => setViewingEvidence(m)}>
                                                                <FileText className="w-3.5 h-3.5 mr-2" /> Evidence
                                                            </Button>
                                                        )}
                                                        {(m.status === 'UNDER_REVIEW' || m.status === 'SUBMITTED') && (
                                                            <Button
                                                                className={cn("rounded-xl h-10 text-[10px] font-bold uppercase", m.aiChecks.every(c => c.passed) ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/5 text-gray-500 pointer-events-none")}
                                                                onClick={() => handleApprove(m.id)}
                                                            >
                                                                <Shield className="w-3.5 h-3.5 mr-2" /> Release
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {m.status === 'UNDER_REVIEW' && (
                                                        <div className="space-y-3">
                                                            <div className="bg-[#120f0a] border border-amber-500/20 p-4 rounded-xl relative overflow-hidden">
                                                                <div className="relative z-10 mb-3">
                                                                    <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Auto-Settlement</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                                        <span className="text-xl font-bold text-amber-500 tracking-tight tabular-nums">47H 59M</span>
                                                                    </div>
                                                                </div>
                                                                <div className="h-1 bg-amber-500/10 rounded-full overflow-hidden relative z-10">
                                                                    <div className="h-full bg-amber-500 w-[65%]" />
                                                                </div>
                                                            </div>

                                                            <Button
                                                                onClick={() => handleRaiseDispute(m.id)}
                                                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 h-10 rounded-xl text-[10px] font-bold uppercase transition-all"
                                                            >
                                                                <Flag className="w-3.5 h-3.5 mr-2" />
                                                                Raise Dispute & Halt Release
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {m.status === 'RELEASED' && (
                                                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-emerald-500 uppercase">Settlement Finalized</p>
                                                                <p className="text-[10px] text-gray-400 font-medium opacity-80">{m.timestamp}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FINANCIAL STATS */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-8 shadow-xl sticky top-6">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase text-gray-500 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-500" /> Capital Summary
                                </h3>
                                <div className="space-y-1 mb-6">
                                    <p className="text-4xl font-bold tracking-tight text-white">${releasedCapital.toLocaleString()}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase">Total Settled Capital</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                        <span className="text-gray-500">Pipeline Flow</span>
                                        <span className="text-white">${pendingCapital.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                            style={{ width: `${(releasedCapital / VAULT_DATA.totalCapital) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-1">
                                        <span className="text-gray-500">Vault Capacity</span>
                                        <span className="text-white">${VAULT_DATA.totalCapital.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Scale className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-white mb-1">Compliance Engine</p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">The vault operates under Cleard Protocol v2.4. All releases are subject to automated verification logs.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-xl h-10 font-bold uppercase text-[10px]">
                                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> Public Ledger
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* AUDIT EVIDENCE PANEL (SIDE DRAWER) */}
            {viewingEvidence && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#111111] border-l border-white/10 p-8 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Verification Trace</p>
                                <h2 className="text-xl font-bold tracking-tight text-white">Audit Evidence</h2>
                            </div>
                            <button onClick={() => setViewingEvidence(null)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase text-white">System Diagnostics</span>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(viewingEvidence.evidence).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">{key.replace(/([A-Z])/g, ' $1')}</p>
                                            <p className="text-xs font-bold text-white break-all bg-black/40 p-2 rounded border border-white/5">{Array.isArray(value) ? value.join(', ') : value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase text-gray-500">Milestone History</h4>
                                <div className="border-l border-white/10 ml-1.5 space-y-6 pl-6">
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-emerald-500/20 border-2 border-[#111111]" />
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Protocol Released</p>
                                        <p className="text-[11px] text-gray-400 mt-1 font-medium">Cleard automated verified tranches successfully.</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-white/10 border-2 border-[#111111]" />
                                        <p className="text-[10px] font-bold text-white uppercase">Submission Received</p>
                                        <p className="text-[11px] text-gray-400 mt-1 font-medium">External assets linked via cryptographic hash.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}