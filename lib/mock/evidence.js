export const evidenceByMilestone = {
    m_101: {
        clarifications: [
            {
                id: 'q_101',
                question: 'Confirm total export row count and checksum method.',
                answer: '15,248 rows. SHA-256 checksums attached in the report.',
                askedBy: 'Client',
                answeredBy: 'Freelancer',
                answeredAt: '2025-01-20T12:20:00Z'
            },
            {
                id: 'q_102',
                question: 'Which PII fields were removed before delivery?',
                answer: 'Names, phone numbers, and email fields were removed.',
                askedBy: 'Client',
                answeredBy: 'Freelancer',
                answeredAt: '2025-01-20T12:45:00Z'
            }
        ],
        fileComments: [
            {
                id: 'c_101',
                fileName: 'crm_export.csv',
                requirementId: 'REQ-101',
                comment: 'Export includes all 12 customer segments and the audit footer.',
                author: 'Freelancer',
                createdAt: '2025-01-20T11:50:00Z'
            },
            {
                id: 'c_102',
                fileName: 'checksum_report.pdf',
                requirementId: 'REQ-102',
                comment: 'Checksum log signed by data lead.',
                author: 'Freelancer',
                createdAt: '2025-01-20T11:55:00Z'
            }
        ]
    },
    m_102: {
        clarifications: [
            {
                id: 'q_201',
                question: 'Provide rollback steps for the import scripts.',
                answer: 'Rollback steps included in section 4 of the runbook.',
                askedBy: 'Client',
                answeredBy: 'Freelancer',
                answeredAt: '2025-02-05T17:10:00Z'
            }
        ],
        fileComments: [
            {
                id: 'c_201',
                fileName: 'import_runner.zip',
                requirementId: 'REQ-201',
                comment: 'Scripts include a dry-run flag and retry logic.',
                author: 'Freelancer',
                createdAt: '2025-02-05T17:05:00Z'
            }
        ]
    },
    m_201: {
        clarifications: [
            {
                id: 'q_301',
                question: 'Which findings need reproducible steps?',
                answer: 'Two high-severity items require detailed reproduction steps.',
                askedBy: 'Client',
                answeredBy: 'Freelancer',
                answeredAt: '2025-02-01T09:30:00Z'
            }
        ],
        fileComments: [
            {
                id: 'c_301',
                fileName: 'scan_report.pdf',
                requirementId: 'REQ-401',
                comment: 'Missing repro steps for findings 2 and 5.',
                author: 'Verifier',
                createdAt: '2025-02-01T10:05:00Z'
            }
        ]
    },
    m_302: {
        clarifications: [
            {
                id: 'q_401',
                question: 'Confirm the lighthouse run was taken on prod build.',
                answer: 'Yes, report generated from prod build pipeline.',
                askedBy: 'Client',
                answeredBy: 'Freelancer',
                answeredAt: '2025-02-18T12:10:00Z'
            }
        ],
        fileComments: [
            {
                id: 'c_401',
                fileName: 'lighthouse_report.pdf',
                requirementId: 'REQ-701',
                comment: 'Score meets target, awaiting verification pass.',
                author: 'Freelancer',
                createdAt: '2025-02-18T12:12:00Z'
            }
        ]
    }
};
