'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Gavel, CheckCircle2 } from 'lucide-react';
import { DISPUTE_REASON_CODES, getDisputeEligibility } from '@/lib/rules/disputes';

export function DisputeInitiationPanel({ milestone }) {
    const [selectedRequirement, setSelectedRequirement] = useState('');
    const [selectedReasons, setSelectedReasons] = useState([]);

    const policy = milestone?.disputePolicy || {
        eligibleStatuses: ['failed', 'rejected'],
        requiresRequirementId: true
    };
    const eligibility = useMemo(
        () => getDisputeEligibility(milestone, selectedRequirement || null),
        [milestone, selectedRequirement]
    );

    const canSubmit = eligibility.eligible && selectedReasons.length > 0;
    const EligibilityIcon = eligibility.eligible ? CheckCircle2 : AlertTriangle;
    const eligibilityTone = eligibility.eligible ? 'text-emerald-400' : 'text-amber-400';

    const toggleReason = (code) => {
        setSelectedReasons((prev) =>
            prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
        );
    };

    return (
        <Card className="bg-[#111111] border-white/10">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-400" />
                    Dispute Initiation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-white/60">
                    Disputes are milestone-scoped and require structured reason codes. Free-text complaints are not accepted.
                </p>

                {milestone && policy.requiresRequirementId && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Requirement scope</p>
                        <select
                            value={selectedRequirement}
                            onChange={(event) => setSelectedRequirement(event.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="">Select requirement</option>
                            {milestone?.requirements?.map((req) => (
                                <option key={req.reqId} value={req.reqId}>
                                    {req.reqId} · {req.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Reason codes</p>
                    <div className="grid gap-2">
                        {DISPUTE_REASON_CODES.map((reason) => (
                            <label key={reason.code} className="flex items-start gap-3 border border-white/5 bg-black/40 rounded-lg p-3 text-sm text-white/70">
                                <input
                                    type="checkbox"
                                    checked={selectedReasons.includes(reason.code)}
                                    onChange={() => toggleReason(reason.code)}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="text-white font-semibold">{reason.label}</p>
                                    <p className="text-xs text-white/40">{reason.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={`flex items-start gap-2 text-xs ${eligibilityTone}`}>
                    <EligibilityIcon className="w-4 h-4 mt-0.5" />
                    <span>{eligibility.reason}</span>
                </div>

                <Button
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
                    disabled={!canSubmit}
                >
                    {canSubmit ? 'Submit Dispute' : 'Dispute Locked'}
                </Button>
            </CardContent>
        </Card>
    );
}
