export const evidence = [
    {
        id: 'ev_101',
        vaultId: 'v_1',
        milestoneId: 'm_101',
        type: 'CLARIFICATION_REQUEST',
        immutableAfterSubmission: true,
        payloadJson: {
            question: 'Confirm total export row count and checksum method.',
            answer: '15,248 rows. SHA-256 checksums attached in the report.',
            askedBy: 'u_client_1',
            answeredBy: 'u_freelancer_1'
        },
        createdAt: '2025-01-20T12:20:00Z'
    },
    {
        id: 'ev_102',
        vaultId: 'v_1',
        milestoneId: 'm_101',
        type: 'CLARIFICATION_REQUEST',
        immutableAfterSubmission: true,
        payloadJson: {
            question: 'Which PII fields were removed before delivery?',
            answer: 'Names, phone numbers, and email fields were removed.',
            askedBy: 'u_client_1',
            answeredBy: 'u_freelancer_1'
        },
        createdAt: '2025-01-20T12:45:00Z'
    },
    {
        id: 'ev_103',
        vaultId: 'v_1',
        milestoneId: 'm_101',
        type: 'FILE_COMMENT',
        immutableAfterSubmission: true,
        payloadJson: {
            fileName: 'crm_export.csv',
            requirementRef: 'REQ-101',
            comment: 'Export includes all 12 customer segments and the audit footer.',
            authorId: 'u_freelancer_1'
        },
        createdAt: '2025-01-20T11:50:00Z'
    },
    {
        id: 'ev_104',
        vaultId: 'v_1',
        milestoneId: 'm_101',
        type: 'FILE_COMMENT',
        immutableAfterSubmission: true,
        payloadJson: {
            fileName: 'checksum_report.pdf',
            requirementRef: 'REQ-102',
            comment: 'Checksum log signed by data lead.',
            authorId: 'u_freelancer_1'
        },
        createdAt: '2025-01-20T11:55:00Z'
    }
];
