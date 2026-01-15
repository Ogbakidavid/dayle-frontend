'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft,
    Cpu,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Flag,
    Shield,
    Lock,
    DollarSign,
    Orbit,
    TrendingUp,
    Scale,
    FileText,
    Sparkles,
    AlertTriangle,
    Clock,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* -----------------------------
   VAULT META
----------------------------- */
const VAULT = {
    id: 'SK-VLT-2026-00812',
    title: 'Enterprise E-commerce Architecture',
    client: 'Acme Corp Infrastructure',
    status: 'ACTIVE',
    createdAt: 'Jan 12, 2026',
    custodian: 'Cleard Clearing House'
};

/* -----------------------------
   MILESTONES
----------------------------- */
const INITIAL_MILESTONES = [
    {
        id: 1,
        title: 'System Architecture & Schema Design',
        amount: 13000,
        status: 'RELEASED',
        evidence: 'https://arch.Cleard.io',
        specification: [
            'Architecture document published',
            'ER diagram included',
            'Scalability assumptions documented'
        ],
        aiChecks: [
            { label: 'Document reachable', status: 'passed' },
            { label: 'Schema completeness', status: 'passed' },
            { label: 'Scalability rationale', status: 'passed' }
        ],
        timestamp: 'Feb 10, 2026 14:30 UTC'
    },
    {
        id: 2,
        title: 'Core Authentication Engine',
        amount: 13000,
        status: 'RELEASED',
        evidence: 'https://github.com/Cleard/auth-engine',
        specification: [
            'Public GitHub repository',
            'Minimum 5 commits',
            'Unit tests present',
            'Auth flow functional'
        ],
        aiChecks: [
            { label: 'Repository public', status: 'passed' },
            { label: 'Commit threshold met', status: 'passed' },
            { label: 'Tests detected', status: 'passed' },
            { label: 'Auth flow valid', status: 'passed' }
        ],
        timestamp: 'Mar 05, 2026 09:12 UTC'
    },
    {
        id: 3,
        title: 'Payment Gateway Protocol',
        amount: 13000,
        status: 'OPEN',
        specification: [
            'Live deployment reachable',
            'Webhook handshake stable',
            'Transaction confirmation < 2s'
        ],
        aiChecks: [],
        disputeWindowHours: 48
    },
    {
        id: 4,
        title: 'Analytics & Reporting Suite',
        amount: 13000,
        status: 'LOCKED',
        specification: [
            'Dashboard available',
            'Monthly export automated',
            'Role-based access enforced'
        ],
        aiChecks: []
    },
    {
        id: 5,
        title: 'Final Documentation & Handover',
        amount: 13000,
        status: 'LOCKED',
        specification: [
            'Deployment manual',
            'API reference',
            'Credential handoff'
        ],
        aiChecks: []
    }
];

export default function FreelancerVaultPage() {
    const router = useRouter();
    const [milestones, setMilestones] = useState(INITIAL_MILESTONES);
    const [expandedId, setExpandedId] = useState(3);
    const [submissionUrl, setSubmissionUrl] = useState('');

    const totalValue = milestones.reduce((s, m) => s + m.amount, 0);
    const released = milestones
        .filter(m => m.status === 'RELEASED')
        .reduce((s, m) => s + m.amount, 0);
    const pending = milestones
        .filter(m => ['UNDER_REVIEW', 'DISPUTED', 'SUBMITTED'].includes(m.status))
        .reduce((s, m) => s + m.amount, 0);

    const submitWork = async (id) => {
        if (!submissionUrl.trim()) return;

        // 1. Initial State: Starting Audit
        setMilestones(ms =>
            ms.map(m =>
                m.id === id
                    ? {
                        ...m,
                        status: 'UNDER_REVIEW',
                        evidence: submissionUrl,
                        aiChecks: [
                            { label: 'Deployment reachable', status: 'checking' },
                            { label: 'Webhook handshake stable', status: 'pending' },
                            { label: 'Latency threshold met', status: 'pending' }
                        ],
                        notes: 'Scanning protocol initiated...'
                    }
                    : m
            )
        );
        setSubmissionUrl('');

        // 2. Sequential Check Resolution
        await new Promise(r => setTimeout(r, 1500));
        setMilestones(ms => ms.map(m => m.id === id ? {
            ...m,
            aiChecks: [
                { label: 'Deployment reachable', status: 'passed' },
                { label: 'Webhook handshake stable', status: 'checking' },
                { label: 'Latency threshold met', status: 'pending' }
            ],
            notes: 'Checking endpoint stability...'
        } : m));

        await new Promise(r => setTimeout(r, 2000));
        setMilestones(ms => ms.map(m => m.id === id ? {
            ...m,
            aiChecks: [
                { label: 'Deployment reachable', status: 'passed' },
                { label: 'Webhook handshake stable', status: 'failed' },
                { label: 'Latency threshold met', status: 'checking' }
            ],
            notes: 'Validating response velocity...'
        } : m));

        await new Promise(r => setTimeout(r, 1500));
        setMilestones(ms => ms.map(m => m.id === id ? {
            ...m,
            aiChecks: [
                { label: 'Deployment reachable', status: 'passed' },
                { label: 'Webhook handshake stable', status: 'failed' },
                { label: 'Latency threshold met', status: 'failed' }
            ],
            notes: 'AI Audit Complete: Deliverable does not meet all clearing criteria.'
        } : m));
    };

    const raiseDispute = (id) => {
        setMilestones(ms =>
            ms.map(m =>
                m.id === id ? { ...m, status: 'DISPUTED' } : m
            )
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 font-sans selection:bg-emerald-500/30">

            {/* COMPACT DASHBOARD HEADER */}
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/freelancer')}
                            className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                            {VAULT.title}
                        </h1>
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            {VAULT.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium ml-14">
                        Contract with <span className="text-gray-200 font-semibold">{VAULT.client}</span> • <span className="font-mono text-[10px] opacity-60">ID: {VAULT.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: SETTLEMENT LEDGER */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
                            <Orbit className="w-5 h-5 text-emerald-500 animate-pulse" />
                            Settlement Ledger
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {milestones.map(m => (
                            <div
                                key={m.id}
                                className={cn(
                                    "group border rounded-2xl overflow-hidden transition-all duration-500 shadow-xl",
                                    m.status === 'RELEASED' ? "bg-[#0A0F0A] border-emerald-500/10" : "bg-[#111111] border-white/5",
                                    expandedId === m.id ? "ring-1 ring-white/10 bg-[#161616]" : "hover:border-white/10"
                                )}
                            >
                                <div
                                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                                    className="p-5 flex justify-between cursor-pointer items-center"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-500",
                                            m.status === 'RELEASED' ? "bg-emerald-500 border-emerald-400 text-black translate-x-1" : "bg-black/40 border-white/5 text-gray-400"
                                        )}>
                                            {m.status === 'RELEASED' ? <CheckCircle2 className="w-5 h-5" /> : `0${m.id}`}
                                        </div>
                                        <div>
                                            <p className={cn(
                                                "text-base font-bold tracking-tight transition-colors",
                                                m.status === 'RELEASED' ? "text-emerald-500" : "text-white"
                                            )}>{m.title}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">${m.amount.toLocaleString()} Allocation</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <StatusBadge status={m.status} />
                                    </div>
                                </div>

                                {expandedId === m.id && (
                                    <div className="p-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">

                                        {/* TECHNICAL SPECS */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] uppercase text-gray-600 font-black tracking-[0.2em] flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Audit Requirements
                                            </p>
                                            <ul className="space-y-2">
                                                {m.specification.map((s, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* ACTION ZONE */}
                                        {m.status === 'OPEN' && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                                    <Sparkles className="w-16 h-16 text-emerald-500" />
                                                </div>
                                                <div className="relative z-10 space-y-4">
                                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Ready for verification?</p>
                                                    <div className="flex gap-3">
                                                        <Input
                                                            placeholder="Paste GitHub repository or live URL..."
                                                            value={submissionUrl}
                                                            onChange={e => setSubmissionUrl(e.target.value)}
                                                            className="bg-black border-white/10 h-11 text-sm rounded-xl focus:ring-emerald-500/20"
                                                        />
                                                        <Button
                                                            onClick={() => submitWork(m.id)}
                                                            className="bg-white text-black hover:bg-emerald-500 hover:text-white font-bold rounded-xl h-11 px-8 active:scale-95 transition-all"
                                                        >
                                                            Submit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* EVIDENCE & AI CHECKS */}
                                        {(m.evidence || m.aiChecks.length > 0) && (
                                            <div className="grid md:grid-cols-2 gap-6 pt-2">
                                                {m.evidence && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase text-gray-600 font-black tracking-[0.2em]">Verification Asset</p>
                                                        <a href={m.evidence} target="_blank" className="text-sm text-emerald-500 font-bold flex items-center gap-2 hover:underline">
                                                            <ExternalLink className="w-4 h-4" />
                                                            {m.evidence.replace('https://', '')}
                                                        </a>
                                                    </div>
                                                )}
                                                {m.aiChecks.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase text-gray-600 font-black tracking-[0.2em]">AI Verification Trace</p>
                                                        <div className="space-y-3">
                                                            {m.aiChecks.map((c, i) => (
                                                                <div key={i} className="flex items-center gap-2.5 text-xs">
                                                                    {c.status === 'passed' ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                    ) : c.status === 'failed' ? (
                                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                                    ) : c.status === 'checking' ? (
                                                                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                                                    ) : (
                                                                        <div className="w-4 h-4 rounded-full border border-white/10" />
                                                                    )}
                                                                    <span className={cn(
                                                                        "font-medium transition-colors",
                                                                        c.status === 'passed' ? "text-gray-200" :
                                                                            c.status === 'failed' ? "text-red-400" :
                                                                                c.status === 'checking' ? "text-emerald-500 animate-pulse" :
                                                                                    "text-gray-600"
                                                                    )}>{c.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* DISPUTE & STATUS MESSAGE */}
                                        {m.status === 'UNDER_REVIEW' && (
                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-lg">
                                                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                                                    Pending AI Verdict...
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl px-4 h-9 text-[10px] font-black uppercase tracking-widest"
                                                    onClick={() => raiseDispute(m.id)}
                                                >
                                                    <Flag className="w-3.5 h-3.5 mr-2" />
                                                    Dispute Verdict
                                                </Button>
                                            </div>
                                        )}

                                        {m.status === 'DISPUTED' && (
                                            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3 shadow-lg">
                                                <Lock className="w-5 h-5 text-red-500 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-red-500 leading-relaxed font-bold uppercase tracking-tight">
                                                        Settlement suspended: Dispute raised.
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-medium">Arbitration node will review the manual override request within 24h.</p>
                                                </div>
                                            </div>
                                        )}

                                        {m.status === 'RELEASED' && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3">
                                                <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <p className="text-[10px] text-emerald-500 leading-relaxed font-bold uppercase tracking-tight">
                                                    Capital released on {m.timestamp}. Payout settled via Cleard Protocol.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: EARNINGS RADAR & CONTEXT */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* EARNINGS RADAR */}
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <TrendingUp className="w-24 h-24 text-emerald-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em] flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" /> Earnings Radar
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tracking-tighter">${released.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Released</span>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center group/item cursor-help">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Awaiting Release</span>
                                <span className="text-lg font-bold text-gray-200 group-hover/item:text-emerald-500 transition-colors">${pending.toLocaleString()}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-600">Total Pipeline</span>
                                    <span className="text-white">${totalValue.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-black rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-[2000ms] ease-out rounded-full"
                                        style={{ width: `${(released / totalValue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3 mt-6 shadow-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-500 leading-relaxed font-bold uppercase tracking-tight">
                                Dispute Window active for {VAULT.id}. Standard 48h settlement buffer applied.
                            </p>
                        </div>
                    </div>

                    {/* GUARANTEED PAYOUT PIPELINE (EXPANDED TO FILL SPACE) */}
                    <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl flex flex-col justify-between min-h-[400px]">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0">
                            <Shield className="w-48 h-48 text-emerald-500" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                <Lock className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-[0.4em] leading-tight">Guaranteed<br />Payout Pipeline</h4>
                                <div className="w-12 h-1 bg-emerald-500 rounded-full opacity-50" />
                                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                    Cleard holds 100% of the contract value in escrow. Funds release automatically once the Objective AI verifies your work against the specifications. No manual client approval required for release.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-8 border-t border-emerald-500/10">
                            <ul className="space-y-4">
                                {[
                                    { label: 'Escrow Coverage', val: '100% Guaranteed' },
                                    { label: 'Release Type', val: 'Algorithmic' },
                                    { label: 'Protection', val: 'Vendor-First' }
                                ].map((item, i) => (
                                    <li key={i} className="flex justify-between items-center group/li">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover/li:text-gray-400 transition-colors">{item.label}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{item.val}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* -----------------------------
   SMALL COMPONENTS
----------------------------- */
function StatusBadge({ status }) {
    return (
        <span className={cn(
            'text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm transition-colors',
            status === 'RELEASED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                status === 'UNDER_REVIEW' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    status === 'DISPUTED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-white/5 text-gray-500 border-white/5"
        )}>
            {status.replace('_', ' ')}
        </span>
    );
}
