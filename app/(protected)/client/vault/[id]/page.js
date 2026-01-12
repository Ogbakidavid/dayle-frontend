'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Shield, Clock, CheckCircle2, DollarSign,
    MessageSquare, Send, Lock, AlertTriangle, FileText,
    Cpu, UserCheck, Scale, History, ExternalLink, ArrowUpRight
} from 'lucide-react';

const VAULT_DATA = {
    id: 'SK-VLT-2024-00812',
    title: 'Enterprise E-commerce Architecture',
    status: 'ACTIVE',
    createdAt: 'Jan 12, 2026',
    totalCapital: 65000,
    releasedCapital: 26000,
    security: 'Multi-Sig AI-Escrow'
};

const initialMilestones = [
    {
        id: 1,
        title: 'System Architecture & Schema Design',
        amount: 13000,
        status: 'RELEASED',
        timestamp: 'Feb 10, 2024 14:30 UTC',
        txId: 'TX-88210944',
        authority: 'AI + Human Advisor',
        comments: [{ id: 1, user: 'System', text: 'Capital released following verified audit.', time: '2 days ago' }]
    },
    {
        id: 2,
        title: 'Core Authentication Engine',
        amount: 13000,
        status: 'RELEASED',
        timestamp: 'Mar 05, 2024 09:12 UTC',
        txId: 'TX-88299102',
        authority: 'AI Verification',
        comments: []
    },
    {
        id: 3,
        title: 'Payment Gateway Protocol',
        amount: 13000,
        status: 'SUBMITTED',
        description: 'Implementation of Stripe Connect and automated tax reconciliation.',
        authority: 'AI + Human Advisor',
        comments: [{ id: 102, user: 'Contractor', text: 'Protocols submitted. Documentation attached.', time: '1 hour ago' }]
    },
    {
        id: 4,
        title: 'Analytics & Reporting Suite',
        amount: 13000,
        status: 'LOCKED',
        description: 'Real-time data visualization and automated monthly exports.',
        authority: 'AI Verification',
        comments: []
    }
];

export default function SkentralVaultPage() {
    const [milestones] = useState(initialMilestones);
    const [expandedId, setExpandedId] = useState(3);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'RELEASED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'SUBMITTED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'LOCKED': return 'text-gray-500 bg-gray-900 border-gray-800';
            default: return 'text-gray-400 bg-gray-800 border-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-6 animate-in fade-in duration-500 space-y-8">

            {/* 1️⃣ Institutional Header */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-full">
                            <Shield className="w-3.5 h-3.5" /> {VAULT_DATA.status}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            ID: {VAULT_DATA.id}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                            {VAULT_DATA.title}
                        </h1>
                        <p className="text-sm text-gray-400">
                            Protocol initialized by <span className="text-gray-300 font-medium">Skentral Clearing House</span> • {VAULT_DATA.createdAt}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-medium text-amber-500">Capital Locked</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 border-gray-800 bg-[#111111] hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Contract
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">

                {/* 3️⃣ Milestone Ledger (CORE) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-400" /> Capital Tranche Ledger
                        </h2>
                        <span className="text-xs text-gray-500 font-medium bg-[#111111] px-3 py-1 rounded-full border border-gray-900">
                            Compliance Verified: 2/4
                        </span>
                    </div>

                    <div className="space-y-4">
                        {milestones.map((m) => (
                            <div key={m.id} className={`rounded-2xl transition-all duration-300 border overflow-hidden ${expandedId === m.id
                                    ? 'bg-[#111111] border-gray-800 ring-1 ring-white/5'
                                    : 'bg-[#111111] border-gray-900 hover:border-gray-800'
                                }`}>
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer group"
                                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${m.status === 'RELEASED'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : m.status === 'LOCKED' ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {m.id}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{m.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Amount: <span className="text-gray-300 font-medium">${m.amount.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${getStatusStyles(m.status)}`}>
                                        {m.status}
                                    </div>
                                </div>

                                {expandedId === m.id && (
                                    <div className="px-5 pb-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                        <div className="h-px bg-gray-800 w-full" />

                                        {/* 5️⃣ Verification Logic Display */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-900/50 p-3 rounded-xl flex items-center gap-3 border border-gray-800">
                                                <Cpu className="w-4 h-4 text-blue-400" />
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Verification Engine</p>
                                                    <p className="text-xs text-white font-medium">{m.authority}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/50 p-3 rounded-xl flex items-center gap-3 border border-gray-800">
                                                <Clock className="w-4 h-4 text-amber-500" />
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Release Window</p>
                                                    <p className="text-xs text-white font-medium">48H Auto-Finalize</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4️⃣ Interaction Panel */}
                                        {m.status === 'SUBMITTED' ? (
                                            <div className="border border-blue-500/20 bg-blue-500/5 p-5 rounded-xl">
                                                <div className="flex gap-4">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                                                        <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-white">Verification Underway</h4>
                                                        <p className="text-xs text-gray-400 leading-relaxed">
                                                            Objective AI analysis active. Institutional human review window expires in 42 hours. Capital remains locked until 100% confirmation.
                                                        </p>
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
                                                            Review Audit Documents
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : m.status === 'LOCKED' ? (
                                            <div className="py-8 flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-xl text-gray-600 bg-gray-900/20">
                                                <Lock className="w-5 h-5 mb-2 opacity-50" />
                                                <p className="text-xs font-medium">Tranche Sequence Locked</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <UserCheck className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs text-emerald-500 font-medium">Finalized & Capital Released</span>
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">{m.timestamp}</span>
                                            </div>
                                        )}

                                        {/* 6️⃣ Chat & Context Log */}
                                        <div className="pt-2">
                                            <p className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide">Immutable Context Log</p>
                                            <div className="space-y-4 mb-5 pl-2 border-l border-gray-800 ml-1">
                                                {m.comments.map(c => (
                                                    <div key={c.id} className="flex gap-3 items-start relative left-[-5px]">
                                                        <div className="w-2 h-2 rounded-full bg-gray-700 mt-1.5 ring-4 ring-[#111111]" />
                                                        <div>
                                                            <p className="text-sm text-gray-300 leading-tight">"{c.text}"</p>
                                                            <p className="text-[10px] text-gray-500 mt-1 font-medium">{c.user} • {c.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {m.status !== 'RELEASED' && (
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-[#0A0A0A] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors placeholder:text-gray-600"
                                                        placeholder="Enter protocol log entry..."
                                                    />
                                                    <Button size="sm" className="bg-gray-800 hover:bg-gray-700 rounded-lg px-4 text-white border border-gray-700">
                                                        <Send className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Capital Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#111111] border border-gray-900 p-6 rounded-2xl space-y-6 sticky top-24">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" /> Capital Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end pb-4 border-b border-gray-800">
                                <span className="text-xs text-gray-500 font-medium">Initial Escrowed</span>
                                <span className="text-xl font-semibold text-white">${VAULT_DATA.totalCapital.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end text-emerald-500 pb-4 border-b border-gray-800">
                                <span className="text-xs font-medium">Verified Release</span>
                                <span className="text-lg font-semibold">-${VAULT_DATA.releasedCapital.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="text-xs text-gray-400 font-medium">Current Locked</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white block">${(VAULT_DATA.totalCapital - VAULT_DATA.releasedCapital).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500">Secured via Multi-Sig</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-500 font-medium leading-relaxed">
                                Automated capital release protocol active. Funds bypass client manual approval following 100% verification success.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#111111] border border-gray-900 p-6 rounded-2xl space-y-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Scale className="w-4 h-4 text-gray-400" /> Compliance Protocol
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-gray-600">Dispute Authority</span>
                                <span className="text-gray-300">Skentral Clearing</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-gray-600">Verification Engine</span>
                                <span className="text-gray-300">V.2.4 Objective AI</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-800">
                            <p className="text-[10px] leading-relaxed text-gray-500">
                                This vault is a binding financial record. All interactions and capital movements are cryptographically logged.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}