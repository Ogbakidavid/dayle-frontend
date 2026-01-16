export const DISPUTE_REASON_CODES = [
    // Compliance - Fail
    {
        code: 'VERIFICATION_ERROR',
        label: 'Verification Error',
        description: 'Objective verification was applied incorrectly.',
        types: ['COMPLIANCE'],
        statuses: ['failed', 'rejected']
    },
    {
        code: 'REQUIREMENT_MISMATCH',
        label: 'Requirement Mismatch',
        description: 'Deliverable meets requirement but was flagged.',
        types: ['COMPLIANCE'],
        statuses: ['failed', 'rejected']
    },
    // Compliance - Pass (Restricted)
    {
        code: 'PROCESS_BREACH',
        label: 'Process Breach',
        description: 'System process was circumvented.',
        types: ['COMPLIANCE', 'APPROVAL'],
        statuses: ['passed', 'verified', 'approved']
    },
    // General / Fraud
    {
        code: 'FRAUD',
        label: 'Fraudulent Activity',
        description: 'Evidence of fake data or bad faith.',
        types: ['COMPLIANCE', 'APPROVAL'],
        statuses: ['passed', 'failed', 'rejected', 'verified', 'approved']
    },
    {
        code: 'SECURITY',
        label: 'Security Concern',
        description: 'Malicious code or security risk detected.',
        types: ['COMPLIANCE', 'APPROVAL'],
        statuses: ['passed', 'failed', 'rejected', 'verified', 'approved']
    },
    // Approval
    {
        code: 'BAD_FAITH',
        label: 'Bad Faith Rejection',
        description: 'Client rejected valid work repeatedly/maliciously.',
        types: ['APPROVAL'],
        statuses: ['rejected']
    },
    {
        code: 'SCOPE_CHANGE',
        label: 'Scope Change',
        description: 'Rejection due to requirements not in original scope.',
        types: ['APPROVAL'],
        statuses: ['rejected']
    }
];

export function getDisputeEligibility(milestone, requirementId) {
    if (!milestone) {
        return {
            eligible: false,
            reason: 'Select a milestone to open a dispute.',
            allowedCodes: []
        };
    }

    // Default policy if not present
    const policy = milestone.disputePolicy || {
        eligibleStatuses: ['failed', 'rejected', 'passed', 'verified', 'approved'],
        requiresRequirementId: false
    };

    // 1. Status Check
    // We strictly follow the matrix:
    // Compliance PASS -> allowed (restricted codes)
    // Compliance FAIL -> allowed
    // Approval REJECTED -> allowed (restricted codes)
    // Approval APPROVED -> allowed (restricted codes like Fraud/Security)

    // Check if status is generally capable of having a dispute (even if restricted)
    // The architecture says:
    // Compliance PASS -> Dispute NOT for "taste", ONLY for FRAUD/SECURITY.
    // So "verified"/"passed" ARE eligible statuses, but with restricted codes.

    const isCompliance = milestone.type === 'COMPLIANCE';
    const isApproval = milestone.type === 'APPROVAL';

    // Determine allowed codes based on current state
    const allowedCodes = DISPUTE_REASON_CODES.filter(rc => {
        // Must match type
        if (!rc.types.includes(milestone.type)) return false;

        // Must match status context
        // For Compliance FAIL: VERIFICATION_ERROR, REQUIREMENT_MISMATCH, FRAUD, SECURITY
        // For Compliance PASS: FRAUD, SECURITY, PROCESS_BREACH
        // For Approval REJECTED: BAD_FAITH, SCOPE_CHANGE, FRAUD, SECURITY

        // We simulate "status groups" logic here
        const normalizedStatus = milestone.status.toLowerCase();

        if (isCompliance) {
            if (normalizedStatus === 'failed' || normalizedStatus === 'rejected') {
                return ['VERIFICATION_ERROR', 'REQUIREMENT_MISMATCH', 'FRAUD', 'SECURITY'].includes(rc.code);
            }
            if (normalizedStatus === 'passed' || normalizedStatus === 'verified') {
                return ['FRAUD', 'SECURITY', 'PROCESS_BREACH'].includes(rc.code);
            }
        }

        if (isApproval) {
            if (normalizedStatus === 'rejected') {
                return ['BAD_FAITH', 'SCOPE_CHANGE', 'FRAUD', 'SECURITY', 'PROCESS_BREACH'].includes(rc.code);
            }
            if (normalizedStatus === 'approved' || normalizedStatus === 'verified') {
                // Even approved milestones can be disputed for Fraud later? (Arch doesn't explicitly forbid, but focuses on Rejection)
                // "Dispute ineligible for taste... Dispute allowed ONLY for FRAUD..." implies it IS possible.
                return ['FRAUD', 'SECURITY'].includes(rc.code);
            }
        }

        return false;
    });

    if (allowedCodes.length === 0) {
        return {
            eligible: false,
            reason: 'This milestone status is not eligible for new disputes.',
            allowedCodes: []
        };
    }

    // 2. Requirement ID Check
    // Compliance usually requires it, Approval usually doesn't (scope/bad faith is general).
    // However, the rule says "Compliance FAIL ... Must reference reqId".
    const needsReqId = isCompliance && (milestone.status === 'failed' || milestone.status === 'rejected') && !['FRAUD', 'SECURITY'].includes(allowedCodes[0]?.code); // Heuristic: Fraud might not be req-specific

    // We simplify: if the policy says strict requirement ID, we enforce it unless it's a general fraud claim (which might not be specific).
    // Actually architecture says: "Dispute... Must reference reqId (req-based)... or fraud reason codes".
    // So if user picks a Req-Based code, they need a Req ID.

    // Let's rely on the passed requirementId argument.
    // If multiple codes are allowed, some might need ReqID, some might not.
    // We'll enforce ReqID if the *User* picks a code that needs it (in the UI).
    // Here we just check "Can we even start?"

    return {
        eligible: true,
        reason: 'Eligible for dispute submission.',
        allowedCodes,
        requiresRequirementSelection: isCompliance && (milestone.status === 'failed' || milestone.status === 'rejected')
    };
}
