'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EvidencePanel } from '@/components/shared/EvidencePanel';
import { cn } from '@/lib/utils';
import { getEvidenceForMilestone, getVaultById } from '@/lib/mock';
import { MILESTONE_STATUS_LABELS } from '@/lib/rules/milestones';
import {
    Calendar,
    FileText,
    BadgeCheck,
    ShieldCheck,
    ClipboardList
} from 'lucide-react';

const typeStyles = {
    COMPLIANCE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    APPROVAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

export function VaultDetailView({ vaultId, role }) {
    const vault = useMemo(() => getVaultById(vaultId), [vaultId]);
    const milestones = vault?.milestones || [];
    const [activeMilestoneId, setActiveMilestoneId] = useState(null);

    useEffect(() => {
        if (milestones.length === 0) {
            setActiveMilestoneId(null);
            return;
        }
        if (!activeMilestoneId || !milestones.some((milestone) => milestone.id === activeMilestoneId)) {
            setActiveMilestoneId(milestones[0].id);
        }
    }, [activeMilestoneId, milestones]);

    const activeMilestone = milestones.find((milestone) => milestone.id === activeMilestoneId) || null;
    const evidence = activeMilestone ? getEvidenceForMilestone(activeMilestone.id) : null;

    if (!vault) {
        return (
            <div className="text-white/70">Vault not found.</div>
        );
    }

    const totalAmount = vault.totalAmount || vault.amount || 0;

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    Vault Detail
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">{vault.title}</h1>
                        <p className="text-sm text-white/60 max-w-2xl">{vault.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                            <span>Client: {vault.clientName}</span>
                            <span>Freelancer: {vault.freelancer?.name || vault.freelancer?.email || vault.freelancerEmail || 'Unassigned'}</span>
                            <span>Created: {new Date(vault.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-2">
                        <StatusBadge status={vault.status} />
                        <div className="text-3xl font-bold text-white">
                            ${totalAmount.toLocaleString()}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Total locked</span>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-emerald-500" />
                            Milestones
                        </h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                            {milestones.length} total
                        </span>
                    </div>

                    {milestones.length === 0 ? (
                        <Card className="bg-[#111111] border-white/10">
                            <CardContent className="py-10 text-center text-white/50">
                                No milestones added to this vault yet.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((milestone) => {
                                const milestoneBase = `/${role}/vault/${vault.id}/milestones/${milestone.id}`;
                                const showVerification = milestone.type === 'COMPLIANCE';
                                const showApproval = milestone.type === 'APPROVAL';
                                const active = milestone.id === activeMilestoneId;
                                return (
                                    <Card
                                        key={milestone.id}
                                        className={cn(
                                            'bg-[#111111] border-white/10 transition-all cursor-pointer',
                                            active && 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                        )}
                                        onClick={() => setActiveMilestoneId(milestone.id)}
                                    >
                                        <CardHeader className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <CardTitle className="text-white text-lg">
                                                    {milestone.title}
                                                </CardTitle>
                                                <div className={cn(
                                                    'px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border',
                                                    typeStyles[milestone.type]
                                                )}>
                                                    {milestone.type}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Due {milestone.dueDate}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                    {MILESTONE_STATUS_LABELS[milestone.status] || milestone.status}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Milestone value</p>
                                                    <p className="text-2xl font-bold text-white">${milestone.amount.toLocaleString()}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {role === 'freelancer' && (
                                                        <Link href={`${milestoneBase}/submit`}>
                                                            <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">
                                                                Submit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {showVerification && (
                                                        <Link href={`${milestoneBase}/verification`}>
                                                            <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">
                                                                Verification
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {showApproval && (
                                                        <Link href={`${milestoneBase}/approval`}>
                                                            <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">
                                                                Approval Review
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-white/5 bg-black/40 p-4 space-y-2">
                                                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Requirements</p>
                                                <div className="space-y-2">
                                                    {(milestone.requirements || []).map((req) => (
                                                        <div key={req.reqId} className="flex items-start gap-3 text-sm text-white/70">
                                                            <FileText className="w-4 h-4 text-emerald-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-semibold text-white">{req.reqId} · {req.label}</p>
                                                                <p className="text-xs text-white/50">{req.acceptance}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <EvidencePanel milestone={activeMilestone} evidence={evidence} />
                </div>
            </div>
        </div>
    );
}
