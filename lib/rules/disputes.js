export const DISPUTE_REASON_CODES = [
    {
        code: 'REQ_NOT_MET',
        label: 'Requirement not met',
        description: 'A listed requirement failed verification.'
    },
    {
        code: 'EVIDENCE_INCOMPLETE',
        label: 'Evidence incomplete',
        description: 'Required evidence or files are missing.'
    },
    {
        code: 'VERIFICATION_ERROR',
        label: 'Verification error',
        description: 'Objective verification was applied incorrectly.'
    },
    {
        code: 'APPROVAL_DELAY',
        label: 'Approval delay',
        description: 'Approval exceeded the agreed review window.'
    }
];

export function getDisputeEligibility(milestone, requirementId) {
    if (!milestone) {
        return {
            eligible: false,
            reason: 'Select a milestone to open a dispute.'
        };
    }

    const policy = milestone.disputePolicy || {
        eligibleStatuses: ['failed', 'rejected'],
        requiresRequirementId: true
    };

    if (!policy.eligibleStatuses.includes(milestone.status)) {
        return {
            eligible: false,
            reason: `Disputes open only when status is ${policy.eligibleStatuses.join(', ')}.`
        };
    }

    if (policy.requiresRequirementId && !requirementId) {
        return {
            eligible: false,
            reason: 'Select the requirement tied to this dispute.'
        };
    }

    return {
        eligible: true,
        reason: 'Eligible for dispute submission.'
    };
}
