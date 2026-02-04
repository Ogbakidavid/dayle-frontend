'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvidencePanel } from '@/components/shared/EvidencePanel';
import { DisputeInitiationPanel } from '@/components/disputes/DisputeInitiationPanel';
import { getEvidenceForMilestone, getMilestoneById, getVaultById } from '@/lib/mock';
import { APPROVAL_REJECTION_CODES, MILESTONE_STATUS_LABELS } from '@/lib/rules/milestones';
import { BadgeCheck, ChevronLeft, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';

export function MilestoneApprovalView({ vaultId, milestoneId, role }) {
    const vault = getVaultById(vaultId);
    const milestone = getMilestoneById(vaultId, milestoneId);
    const evidence = milestone ? getEvidenceForMilestone(milestone.id) : null;
    const [rejectionCodes, setRejectionCodes] = useState([]);

    if (!vault || !milestone) {
        return <div className="text-white/70">Milestone not found.</div>;
    }

    const toggleReason = (code) => {
        setRejectionCodes((prev) =>
            prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
        );
    };

    const handleReview = async (outcome) => {
        // Validate negative outcomes
        if (outcome !== 'APPROVE' && rejectionCodes.length === 0) {
            alert('Please select at least one reason code for this decision.');
            return;
        }

        const idempotencyKey = `rev_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

        try {
            if (outcome === 'APPROVE') {
                // Approval triggers money movement, so we use releaseMilestone which does both verification and release in this mock
                await api.vaults.releaseMilestone(vaultId, milestoneId, { idempotencyKey });
            } else {
                // Rejection / Revision updates status but moves no money
                await api.milestones.review(milestoneId, {
                    outcome,
                    reasonCodes: rejectionCodes,
                    notes: `Client decision: ${outcome}`
                });
            }
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Review action failed');
        }
    };

    const canReject = rejectionCodes.length > 0;
    const canAct = role === 'client';
    const approvalStatus = milestone.approval?.status || 'pending';

    return (
        <div className="space-y-8">
            <Link href={`/${role}/vault/${vaultId}`} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                Back to vault
            </Link>

            <header className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-400">Approval Review</div>
                <h1 className="text-3xl font-bold text-white">{milestone.title}</h1>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-white">
                    <span>Status: {MILESTONE_STATUS_LABELS[milestone.status] || milestone.status}</span>
                    <span>Vault: {vault.title}</span>
                </div>
            </header>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
                <div className="space-y-6">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Approval Outcome</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                    disabled={!canAct}
                                    onClick={() => handleReview('APPROVE')}
                                >
                                    Approve & Release
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-white/10 text-white/70 hover:text-white"
                                    disabled={!canReject || !canAct}
                                    onClick={() => handleReview('REQUEST_CHANGES')}
                                >
                                    Request Changes
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                                    disabled={!canReject || !canAct}
                                    onClick={() => handleReview('REJECT')}
                                >
                                    Reject (Terminal)
                                </Button>
                            </div>
                            <p className="text-xs text-white/50">
                                {canAct
                                    ? 'Rejection requires structured reason codes. It does not create a dispute by default.'
                                    : 'Client sign-off controls approval. Rejection is not a dispute by default.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Rejection Reason Codes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {APPROVAL_REJECTION_CODES.map((reason) => (
                                <label key={reason.code} className="flex items-start gap-3 border border-white/5 bg-black/40 rounded-lg p-3 text-sm text-white/70">
                                    <input
                                        type="checkbox"
                                        checked={rejectionCodes.includes(reason.code)}
                                        onChange={() => toggleReason(reason.code)}
                                        className="mt-1"
                                        disabled={!canAct}
                                    />
                                    <div>
                                        <p className="text-white font-semibold">{reason.label}</p>
                                        <p className="text-xs text-white">{reason.description}</p>
                                    </div>
                                </label>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Approval Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                {approvalStatus === 'approved' ? (
                                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                                ) : approvalStatus === 'rejected' ? (
                                    <XCircle className="w-4 h-4 text-red-400" />
                                ) : (
                                    <Clock className="w-4 h-4 text-amber-400" />
                                )}
                                <span>{approvalStatus === 'approved' ? 'VERIFIED' : approvalStatus}</span>
                            </div>
                            <p className="text-xs text-white">
                                Approved milestones release after client sign-off. Processing states will appear in the ledger.
                            </p>
                        </CardContent>
                    </Card>

                    <DisputeInitiationPanel milestone={milestone} />
                </div>

                <EvidencePanel milestone={milestone} evidence={evidence} />
            </div>
        </div>
    );
}
