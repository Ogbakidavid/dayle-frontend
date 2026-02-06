'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EvidencePanel } from '@/components/shared/EvidencePanel';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { Vault, Milestone } from '@/lib/store/vault-context';
import {
    Calendar,
    FileText,
    ShieldCheck,
    ClipboardList,
    Loader2
} from 'lucide-react';

export interface VaultDetailViewProps {
    vaultId: string;
    role: 'client' | 'freelancer';
}

export function VaultDetailView({ vaultId, role }: VaultDetailViewProps) {
    const [vault, setVault] = useState<Vault | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
    const [evidence, setEvidence] = useState<any[] | null>(null);

    useEffect(() => {
        fetchVault();
    }, [vaultId]);

    const fetchVault = async () => {
        setLoading(true);
        try {
            const data = await api.vaults.getById(vaultId);
            setVault(data);
            if (data.milestones?.length > 0) {
                setActiveMilestoneId(data.milestones[0].id);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to load vault");
        } finally {
            setLoading(false);
        }
    };

    const milestones = useMemo(() => vault?.milestones || [], [vault]);

    useEffect(() => {
        if (activeMilestoneId) {
            fetchEvidence(activeMilestoneId);
        }
    }, [activeMilestoneId]);

    const fetchEvidence = async (milestoneId: string) => {
        try {
            const data = await api.evidence.list({ milestoneId });
            setEvidence(data);
        } catch (err) {
            console.error(err);
        }
    };

    const activeMilestone = useMemo(() => 
        milestones.find((m) => m.id === activeMilestoneId) || null,
        [milestones, activeMilestoneId]
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/50 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="font-bold uppercase tracking-widest text-xs">Securing data link...</p>
            </div>
        );
    }

    if (error || !vault) {
        return (
            <div className="text-white/70 py-10 text-center border border-white/10 rounded-lg bg-muted">
                <p className="font-bold uppercase mb-2">{error || "Vault not found"}</p>
                <Link href={`/${role}/vaults`}>
                    <Button variant="outline" size="sm">Back to list</Button>
                </Link>
            </div>
        );
    }

    const totalAmount = vault.totalAmount || vault.amount || 0;

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    Vault Detail
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">{vault.title}</h1>
                        <p className="text-sm text-white/60 max-w-2xl">{vault.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide text-white">
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
                        <span className="text-xs font-bold uppercase tracking-wide text-white">Total locked</span>
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
                        <span className="text-xs font-bold uppercase tracking-wide text-white">
                            {milestones.length} total
                        </span>
                    </div>

                    {milestones.length === 0 ? (
                        <Card className="bg-muted border-white/10">
                            <CardContent className="py-10 text-center text-white/50">
                                No milestones added to this vault yet.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((milestone) => {
                                const milestoneBase = `/${role}/vault/${vault.id}/milestones/${milestone.id}`;
                                const active = milestone.id === activeMilestoneId;
                                const hasVerification = (milestone as any).verification?.result;
                                
                                return (
                                    <Card
                                        key={milestone.id}
                                        className={cn(
                                            'bg-muted border-white/10 transition-all cursor-pointer',
                                            active && 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                        )}
                                        onClick={() => setActiveMilestoneId(milestone.id)}
                                    >
                                        <CardHeader className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <CardTitle className="text-white text-lg">
                                                    {milestone.title}
                                                </CardTitle>
                                                <StatusBadge status={milestone.status} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide text-white">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Due {milestone.dueDate}
                                                </span>
                                                {hasVerification && (
                                                    <span className="flex items-center gap-2">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                        AI: {(milestone as any).verification.result}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-white">Milestone value</p>
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
                                                    <Link href={`${milestoneBase}/verification`}>
                                                        <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">
                                                            Verification
                                                        </Button>
                                                    </Link>
                                                    {role === 'client' && (
                                                        <Link href={`${milestoneBase}/review`}>
                                                            <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white">
                                                                Review
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-white/5 bg-black/40 p-4 space-y-2">
                                                <p className="text-xs font-bold uppercase tracking-wide text-white">Requirements</p>
                                                <div className="space-y-2">
                                                    {(milestone.requirements || []).map((req) => (
                                                        <div key={(req as any).reqId} className="flex items-start gap-3 text-sm text-white/70">
                                                            <FileText className="w-4 h-4 text-emerald-500 mt-0.5" />
                                                            <div>
                                                                <p className="font-semibold text-white">{(req as any).reqId} · {(req as any).label}</p>
                                                                <p className="text-xs text-white/50">{(req as any).acceptance}</p>
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
                    <EvidencePanel milestone={activeMilestone as any} evidence={evidence || []} />
                </div>
            </div>
        </div>
    );
}
