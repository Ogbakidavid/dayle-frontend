'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDisputeById, getMilestoneById, getVaultById } from '@/lib/mock';
import { DISPUTE_REASON_CODES } from '@/lib/rules/disputes';
import { ChevronLeft, Gavel, FileText, Calendar } from 'lucide-react';

function getReasonLabel(code) {
    return DISPUTE_REASON_CODES.find((item) => item.code === code)?.label || code;
}

export function DisputeDetailView({ disputeId, role }) {
    const dispute = getDisputeById(disputeId);

    if (!dispute) {
        return <div className="text-white/70">Dispute not found.</div>;
    }

    const vault = getVaultById(dispute.vaultId);
    const milestone = getMilestoneById(dispute.vaultId, dispute.milestoneId);

    return (
        <div className="space-y-8">
            <Link href={`/${role}/disputes`} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                Back to disputes
            </Link>

            <header className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">Dispute Case</div>
                <h1 className="text-3xl font-bold text-white">{dispute.id}</h1>
                <p className="text-sm text-white/60">
                    Vault: {vault?.title || 'Vault'} · Milestone: {milestone?.title || dispute.milestoneId}
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-[#111111] border-white/10">
                    <CardContent className="py-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Status</p>
                        <p className="text-lg font-bold text-white mt-2">{dispute.status}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-white/10">
                    <CardContent className="py-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Opened by</p>
                        <p className="text-lg font-bold text-white mt-2">{dispute.openedBy}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-white/10">
                    <CardContent className="py-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Requirement</p>
                        <p className="text-lg font-bold text-white mt-2">{dispute.requirementId || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
                <Card className="bg-[#111111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Gavel className="w-4 h-4 text-amber-400" />
                            Case Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 text-sm text-white/70">
                            <FileText className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span>{dispute.summary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <Calendar className="w-4 h-4" />
                            Opened {new Date(dispute.openedAt).toLocaleDateString()}
                        </div>
                        {dispute.closedAt && (
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <Calendar className="w-4 h-4" />
                                Closed {new Date(dispute.closedAt).toLocaleDateString()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Reason Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {dispute.reasonCodes.map((code) => (
                            <div key={code} className="flex items-center justify-between border border-white/5 bg-black/40 rounded-lg px-3 py-2">
                                <span className="text-sm text-white/70">{getReasonLabel(code)}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{code}</span>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white">
                            Review Evidence
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
