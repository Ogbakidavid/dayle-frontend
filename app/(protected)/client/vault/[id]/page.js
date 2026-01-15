'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Shield, Clock, DollarSign, Lock, AlertTriangle, FileText, Cpu, Scale, History,
    ExternalLink, Flag, CheckCircle2, XCircle, Orbit, ArrowLeft, TrendingUp, Sparkles, X, ChevronRight, Loader2
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
            { label: 'GitHub repo exists', status: 'passed' },
            { label: 'Architecture docs present', status: 'passed' },
            { label: 'Commits after vault creation', status: 'passed' }
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
            { label: 'Endpoints reachable', status: 'passed' },
            { label: 'Unit tests passing', status: 'passed' },
            { label: 'Live deployment verified', status: 'passed' }
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
            { label: 'GitHub repo linked', status: 'passed' },
            { label: 'Live deployment reachable', status: 'passed' },
            { label: 'Webhook events active', status: 'failed' } // Initially failed to demonstrate simulation
        ],
        notes: 'Objective AI Audit in progress. Manual override available.',
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
    const [processingId, setProcessingId] = useState(null);
    const [simulatingId, setSimulatingId] = useState(null);

    const handleRaiseDispute = (id) => {
        setMilestones(ms => ms.map(m => m.id === id ? { ...m, disputeRaised: true, status: 'DISPUTED' } : m));
    };

    const runSimulation = async (id) => {
        if (simulatingId) return;
        setSimulatingId(id);

        // Reset to pending
        setMilestones(ms => ms.map(m => m.id === id ? {
            ...m,
            aiChecks: m.aiChecks.map(c => ({ ...c, status: 'pending' }))
        } : m));

        await new Promise(r => setTimeout(r, 800));

        const updateStatus = (index, status) => {
            setMilestones(ms => ms.map(m => m.id === id ? {
                ...m,
                aiChecks: m.aiChecks.map((c, i) => i === index ? { ...c, status } : c)
            } : m));
        };

        // Sequence
        for (let i = 0; i < 3; i++) {
            updateStatus(i, 'checking');
            await new Promise(r => setTimeout(r, 1200)); // Processing time
            updateStatus(i, 'passed');
            await new Promise(r => setTimeout(r, 400)); // Pause between checks
        }

        setSimulatingId(null);
    };

    const handleApprove = async (id) => {
        setProcessingId(id);

        // Simulate Blockchain Transaction
        await new Promise(r => setTimeout(r, 2500));

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
        setProcessingId(null);
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
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-emerald-500 uppercase">Vault Protocol</span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="text-sm font-bold text-white uppercase">{VAULT_DATA.id}</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{VAULT_DATA.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-2 pl-6 rounded-full">
                        <div className="text-right">
                            <p className="text-sm font-bold text-white uppercase">Custodian Agency</p>
                            <p className="text-base font-semibold">{VAULT_DATA.custodian}</p>
                        </div>
                        <div className="h-11 w-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: SETTLEMENT LEDGER */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold uppercase flex items-center gap-3 text-white">
                                <Orbit className="w-5 h-5 text-emerald-500" />
                                Settlement Ledger
                            </h2>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-bold text-white uppercase">Live Sync</span>
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
                                        className="p-6 cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300",
                                                m.status === 'RELEASED' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-black/40 border-white/10 text-white"
                                            )}>
                                                {m.status === 'RELEASED' ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-mono text-base">0{index + 1}</span>}
                                            </div>
                                            <div>
                                                <h3 className={cn("text-lg font-bold tracking-tight mb-1", m.status === 'RELEASED' ? "text-emerald-400" : "text-white")}>{m.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-white bg-white/5 px-2.5 py-1 rounded border border-white/5">${m.amount.toLocaleString()}</span>
                                                    <span className="text-sm font-bold text-white uppercase">{m.authority.replace('AI + ', '')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "text-sm font-bold uppercase px-3 py-1.5 rounded-full border",
                                                m.status === 'RELEASED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                    m.status === 'UNDER_REVIEW' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-white border-white/10"
                                            )}>
                                                {m.status.replace('_', ' ')}
                                            </span>
                                            <ChevronRight className={cn("w-5 h-5 text-white transition-transform duration-300", expandedId === m.id && "rotate-90 text-white")} />
                                        </div>
                                    </div>

                                    {expandedId === m.id && (
                                        <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2">
                                            <div className="h-px w-full bg-white/5 mb-6" />
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-5">
                                                    {m.aiChecks && m.aiChecks.length > 0 && (
                                                        <div className="bg-black/40 border border-white/5 rounded-xl p-5">
                                                            <div className="flex items-center justify-between mb-5">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                                                    <span className="text-sm font-bold uppercase text-white">Objective AI Audit</span>
                                                                </div>
                                                                {m.status === 'UNDER_REVIEW' && !m.aiChecks.every(c => c.status === 'passed') && (
                                                                    <button
                                                                        onClick={() => runSimulation(m.id)}
                                                                        disabled={simulatingId === m.id}
                                                                        className="text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold px-3 py-1.5 rounded border border-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {simulatingId === m.id ? 'Running Diagnostic...' : 'Run Simulation'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="space-y-4">
                                                                {m.aiChecks.map((c, i) => (
                                                                    <div key={i} className="flex justify-between items-center group/check">
                                                                        <span className={cn("text-sm font-medium transition-colors",
                                                                            c.status === 'passed' ? 'text-white' :
                                                                                c.status === 'failed' ? 'text-red-400' :
                                                                                    c.status === 'checking' ? 'text-emerald-500 animate-pulse' : 'text-white'
                                                                        )}>{c.label}</span>

                                                                        <div className={cn("w-5 h-5 rounded flex items-center justify-center border transition-all duration-300",
                                                                            c.status === 'passed' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                                                                                c.status === 'failed' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                                                                    "bg-white/5 border-white/10"
                                                                        )}>
                                                                            {c.status === 'passed' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                                                                c.status === 'failed' ? <XCircle className="w-3.5 h-3.5" /> :
                                                                                    c.status === 'checking' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> :
                                                                                        <div className="w-2 h-2 rounded-full bg-white" />
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                                                        <p className="text-sm text-white leading-relaxed font-medium">"{m.notes}"</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-5">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {(m.status === 'UNDER_REVIEW' || m.status === 'SUBMITTED' || m.status === 'RELEASED' || m.status === 'DISPUTED') && (
                                                            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 h-11 text-sm font-bold uppercase hover:bg-white/10 hover:text-white transition-all" onClick={() => setViewingEvidence(m)}>
                                                                <FileText className="w-4 h-4 mr-2" /> Evidence
                                                            </Button>
                                                        )}
                                                        {(m.status === 'UNDER_REVIEW' || m.status === 'SUBMITTED') && (
                                                            <Button
                                                                className={cn("rounded-xl h-11 text-sm font-bold uppercase transition-all",
                                                                    m.aiChecks.every(c => c.status === 'passed')
                                                                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                                        : "bg-white/10 text-white hover:bg-white/20" // Unlocked button: remove pointer-events-none and lighten bg
                                                                )}
                                                                disabled={processingId === m.id}
                                                                onClick={() => handleApprove(m.id)}
                                                            >
                                                                {processingId === m.id ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Settling...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Shield className="w-4 h-4 mr-2" />
                                                                        Release
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {m.status === 'UNDER_REVIEW' && (
                                                        <div className="space-y-4">
                                                            <div className="bg-[#120f0a] border border-amber-500/20 p-5 rounded-xl relative overflow-hidden">
                                                                <div className="relative z-10 mb-3">
                                                                    <p className="text-sm font-bold text-amber-500 uppercase mb-1">Auto-Settlement</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                                        <span className="text-2xl font-bold text-amber-500 tracking-tight tabular-nums">47H 59M</span>
                                                                    </div>
                                                                </div>
                                                                <div className="h-1.5 bg-amber-500/10 rounded-full overflow-hidden relative z-10">
                                                                    <div className="h-full bg-amber-500 w-[65%]" />
                                                                </div>
                                                            </div>

                                                            <Button
                                                                onClick={() => handleRaiseDispute(m.id)}
                                                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/30 h-11 rounded-xl text-sm font-bold uppercase transition-all"
                                                            >
                                                                <Flag className="w-4 h-4 mr-2" />
                                                                Raise Dispute & Halt Release
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {m.status === 'DISPUTED' && (
                                                        <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-xl flex gap-4 animate-in fade-in zoom-in duration-300">
                                                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-red-500 uppercase">Settlement Halted</p>
                                                                <p className="text-sm text-white font-medium mt-1">Dispute raised manually. Funds frozen pending arbitration logic.</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {m.status === 'RELEASED' && (
                                                        <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl animate-in fade-in zoom-in duration-300">
                                                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-emerald-500 uppercase">Settlement Finalized</p>
                                                                <p className="text-sm text-white font-medium opacity-90">{m.timestamp}</p>
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
                        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 space-y-8 shadow-xl sticky top-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-white mb-5 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500" /> Capital Summary
                                </h3>
                                <div className="space-y-1 mb-6">
                                    <p className="text-5xl font-bold tracking-tight text-white transition-all duration-1000 key={releasedCapital}">${releasedCapital.toLocaleString()}</p>
                                    <p className="text-sm font-bold text-emerald-500 uppercase">Total Settled Capital</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold uppercase">
                                        <span className="text-white">Pipeline Flow</span>
                                        <span className="text-white">${pendingCapital.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                            style={{ width: `${(releasedCapital / VAULT_DATA.totalCapital) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold uppercase pt-1">
                                        <span className="text-white">Vault Capacity</span>
                                        <span className="text-white">${VAULT_DATA.totalCapital.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Scale className="w-5 h-5 text-white mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold uppercase text-white mb-1">Compliance Engine</p>
                                        <p className="text-sm text-white leading-relaxed font-medium">The vault operates under Cleard Protocol v2.4. All releases are subject to automated verification logs.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white transition-all rounded-xl h-11 font-bold uppercase text-sm">
                                    <ExternalLink className="w-4 h-4 mr-2" /> Public Ledger
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
                                <p className="text-sm font-bold text-emerald-500 uppercase mb-1">Verification Trace</p>
                                <h2 className="text-2xl font-bold tracking-tight text-white">Audit Evidence</h2>
                            </div>
                            <button onClick={() => setViewingEvidence(null)} className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-bold uppercase text-white">System Diagnostics</span>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(viewingEvidence.evidence).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-sm font-bold text-white uppercase mb-1.5">{key.replace(/([A-Z])/g, ' $1')}</p>
                                            <p className="text-sm font-bold text-white break-all bg-black/40 p-3 rounded border border-white/5">{Array.isArray(value) ? value.join(', ') : value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="text-sm font-bold uppercase text-white">Milestone History</h4>
                                <div className="border-l border-white/10 ml-2 space-y-8 pl-8">
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border-2 border-[#111111]" />
                                        <p className="text-sm font-bold text-emerald-500 uppercase">Protocol Released</p>
                                        <p className="text-sm text-white mt-1.5 font-medium">Cleard automated verified tranches successfully.</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-1.5 w-3.5 h-3.5 rounded-full bg-white/10 border-2 border-[#111111]" />
                                        <p className="text-sm font-bold text-white uppercase">Submission Received</p>
                                        <p className="text-sm text-white mt-1.5 font-medium">External assets linked via cryptographic hash.</p>
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