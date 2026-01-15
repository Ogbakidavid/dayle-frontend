export const disputes = [
    {
        id: 'd_001',
        vaultId: 'v_2',
        milestoneId: 'm_201',
        requirementId: 'REQ-401',
        status: 'open',
        openedBy: 'client',
        openedAt: '2025-02-02T08:30:00Z',
        reasonCodes: ['EVIDENCE_INCOMPLETE', 'REQ_NOT_MET'],
        summary: 'Static scan evidence missing reproducible steps.'
    },
    {
        id: 'd_002',
        vaultId: 'v_1',
        milestoneId: 'm_102',
        requirementId: null,
        status: 'resolved',
        openedBy: 'freelancer',
        openedAt: '2025-02-07T10:00:00Z',
        closedAt: '2025-02-10T15:00:00Z',
        reasonCodes: ['APPROVAL_DELAY'],
        summary: 'Approval decision exceeded SLA.'
    }
];
