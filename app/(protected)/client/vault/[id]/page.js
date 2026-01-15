'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Shield, Clock, DollarSign, Lock, AlertTriangle, FileText, Cpu, Scale, History,
    ExternalLink, Flag, CheckCircle2, XCircle, Orbit, ArrowLeft, TrendingUp, Sparkles, X
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

function CheckIcon({ passed }) {
    return passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
}

export default function ClientVaultPage() {
    const router = useRouter();
    const [expandedId, setExpandedId] = useState(3);
    const [milestones, setMilestones] = useState(milestonesInitial);
    const [viewingEvidence, setViewingEvidence] = useState(null);

    const handleRaiseDispute = (id) => {
        setMilestones(ms => ms.map(m => m.id === id ? { ...m, disputeRaised: true, status: 'DISPUTED' } : m));
    };

    const releasedCapital = milestones
        .filter(m => m.status === 'RELEASED')
        .reduce((sum, m) => sum + m.amount, 0);

    const pendingCapital = milestones
        .filter(m => ['SUBMITTED', 'UNDER_REVIEW', 'DISPUTED'].includes(m.status))
        .reduce((sum, m) => sum + m.amount, 0);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10 font-sans selection:bg-emerald-500/30">
            {/* COMPACT DASHBOARD HEADER */}
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/client')}
                            className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                            {VAULT_DATA.title}
                        </h1>
                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            {VAULT_DATA.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium ml-14">
                        Managed by <span className="text-gray-200 font-semibold">{VAULT_DATA.custodian}</span> • <span className="font-mono text-[10px] opacity-60">ID: {VAULT_DATA.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* LEDGER */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
                                <Orbit className="w-5 h-5 text-emerald-500 animate-pulse" />
                                Settlement Ledger
                            </h2>
                        </div>

                        {milestones.map(m => (
                            <div key={m.id} className={cn(
                                "group border rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl",
                                m.status === 'RELEASED' ? "bg-[#0A0F0A] border-emerald-500/10" : "bg-[#111111] border-white/5",
                                expandedId === m.id ? "ring-1 ring-white/10" : "hover:border-white/10"
                            )}>
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
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full border shadow-sm",
                                            m.status === 'RELEASED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/5"
                                        )}>
                                            {m.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {expandedId === m.id && (
                                    <div className="p-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex gap-3">
                                                    <Cpu className="w-4 h-4 text-emerald-500" />
                                                    <div>
                                                        <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Verification Authority</p>
                                                        <p className="text-sm text-white font-semibold">{m.authority}</p>
                                                    </div>
                                                </div>

                                                {m.aiChecks && m.aiChecks.length > 0 && (
                                                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
                                                        <p className="text-[10px] uppercase text-gray-600 font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3" /> Audit Criteria
                                                        </p>
                                                        {m.aiChecks.map((c, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                                <CheckIcon passed={c.passed} />
                                                                <span className={cn("font-medium", c.passed ? 'text-gray-300' : 'text-red-400')}>{c.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-400 font-medium leading-relaxed italic">{m.notes}</div>

                                                <div className="flex gap-3 pt-2">
                                                    {(m.status === 'UNDER_REVIEW' || m.status === 'SUBMITTED' || m.status === 'RELEASED') && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl border-white/10 hover:bg-white/5 h-10 px-6 text-[10px] font-black uppercase tracking-widest"
                                                            onClick={() => setViewingEvidence(m)}
                                                        >
                                                            <FileText className="w-3 h-3 mr-2" />
                                                            View Evidence
                                                        </Button>
                                                    )}
                                                    {m.status === 'UNDER_REVIEW' && !m.disputeRaised && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest"
                                                            onClick={() => handleRaiseDispute(m.id)}
                                                        >
                                                            <Flag className="w-3 h-3 mr-2" />
                                                            Raise Dispute
                                                        </Button>
                                                    )}
                                                    {m.status === 'UNDER_REVIEW' && (
                                                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 font-bold uppercase tracking-widest bg-white/5 px-3 rounded-xl h-10">
                                                            <Clock className="w-3 h-3" /> Dispute window: {m.disputeWindowHours}h
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {m.status === 'RELEASED' && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex gap-3 shadow-lg">
                                                <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                                                <p className="text-[10px] text-emerald-500 leading-relaxed font-bold uppercase tracking-tight">
                                                    Capital released on {m.timestamp}. Action is final and irreversible via Cleard Protocol.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* PREMIUM SUMMARY BAR */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <TrendingUp className="w-24 h-24 text-emerald-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em] flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" /> Capital Summary
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white tracking-tighter">${releasedCapital.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Settled</span>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center group/item cursor-help">
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Vault Pipeline</span>
                                <span className="text-lg font-bold text-gray-200 group-hover/item:text-emerald-500 transition-colors">${pendingCapital.toLocaleString()}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-600">Total Escrowed</span>
                                    <span className="text-white">${VAULT_DATA.totalCapital.toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 bg-black rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-[2000ms] ease-out rounded-full"
                                        style={{ width: `${(releasedCapital / VAULT_DATA.totalCapital) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3 mt-6 shadow-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-500 leading-relaxed font-bold uppercase tracking-tight">
                                AI-Driven Release: Funds are released automatically upon verification. Manual approval is disabled.
                            </p>
                        </div>
                    </div>

                    {/* COMPLIANCE NODE */}
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-6">
                        <h3 className="text-[10px] uppercase text-gray-500 font-black tracking-[0.3em] flex items-center gap-2">
                            <Scale className="w-4 h-4 text-gray-600" /> Compliance Node
                        </h3>
                        <div className="space-y-5">
                            <div className="group">
                                <p className="text-[10px] uppercase text-gray-700 font-black tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Protocol</p>
                                <p className="text-sm text-gray-200 font-bold">Objective AI v2.4 <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded ml-2 uppercase">Online</span></p>
                            </div>
                            <div className="group">
                                <p className="text-[10px] uppercase text-gray-700 font-black tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Custodian</p>
                                <p className="text-sm text-gray-200 font-bold">{VAULT_DATA.custodian}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full border-white/5 bg-white/5 rounded-2xl h-12 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all mt-4 shadow-sm">
                            <ExternalLink className="w-4 h-4 mr-3 opacity-50" /> Settlement Log
                        </Button>
                    </div>
                </div>
            </div>

            {/* EVIDENCE SIDE PANEL */}
            {viewingEvidence && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0D0D0D] border-l border-white/5 p-8 shadow-2xl animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white tracking-tight">Audit Evidence</h2>
                                <p className="text-[10px] uppercase text-gray-500 font-black tracking-[0.2em]">Verification Log Trace</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setViewingEvidence(null)} className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-600 font-black mb-1 block">Selected Milestone</label>
                                <p className="text-lg text-white font-bold tracking-tight">{viewingEvidence.title}</p>
                            </div>

                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                                    <Shield className="w-24 h-24 text-emerald-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Automated Diagnostics</span>
                                    </div>
                                    <div className="space-y-5">
                                        {Object.entries(viewingEvidence.evidence).map(([key, value]) => (
                                            <div key={key} className="group">
                                                <p className="text-[10px] uppercase text-gray-550 font-black mb-1.5 opacity-40 group-hover:text-emerald-500/50 transition-colors uppercase tracking-widest">{key}</p>
                                                <p className="text-sm text-gray-200 font-medium break-all leading-relaxed">
                                                    {Array.isArray(value) ? value.join(', ') : value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">Full Audit Trail</h4>
                                <div className="border-l border-white/5 ml-2 space-y-8 pl-6">
                                    <div className="relative">
                                        <div className="absolute -left-[28.5px] top-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Automated Release</p>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">AI verified criteria. Payout triggered via Cleard Protocol.</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[28.5px] top-1 w-1.5 h-1.5 rounded-full bg-gray-700" />
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Work Submitted</p>
                                        <p className="text-xs text-gray-500 mt-1 font-medium italic">Freelancer linked external performance assets.</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-white text-black hover:bg-emerald-500 hover:text-white transition-all font-bold rounded-2xl h-14 mt-8 shadow-xl active:scale-95" onClick={() => setViewingEvidence(null)}>
                                Close Audit View
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
