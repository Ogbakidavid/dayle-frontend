export const MILESTONE_TYPES = {
    COMPLIANCE: 'COMPLIANCE',
    APPROVAL: 'APPROVAL'
};

export const APPROVAL_REJECTION_CODES = [
    {
        code: 'REQ_MISSED',
        label: 'Requirement missed',
        description: 'One or more listed requirements were not met.'
    },
    {
        code: 'QUALITY_GAP',
        label: 'Quality gap',
        description: 'Work quality does not meet the defined standard.'
    },
    {
        code: 'EVIDENCE_INCOMPLETE',
        label: 'Evidence incomplete',
        description: 'Required proof or files are missing.'
    },
    {
        code: 'REVISION_REQUIRED',
        label: 'Revision required',
        description: 'Deliverable needs a revision before approval.'
    }
];

export const MILESTONE_STATUS_LABELS = {
    in_progress: 'In progress',
    submitted: 'Submitted',
    awaiting_approval: 'Awaiting approval',
    approved: 'Approved',
    rejected: 'Rejected',
    passed: 'Passed',
    failed: 'Failed'
};
