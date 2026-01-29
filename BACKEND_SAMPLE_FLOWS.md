# Frontend Compatibility Pack - Sample Request/Response Flows

This document provides sample JSON for the top 12 critical flows to ensure frontend-backend compatibility.

---

## 1. Create Vault

**Request**: `POST /api/vaults`

```json
{
  "title": "Enterprise CRM Migration",
  "description": "Migration of legacy CRM data to new system",
  "type": "development",
  "totalAmount": 15000,
  "milestones": [
    {
      "title": "Data export and validation",
      "amount": 5000,
      "dueDate": "2026-02-15T00:00:00Z",
      "deliverableTypeId": "csv_export",
      "deliverableMode": "FILE",
      "auditEnabled": true,
      "requirementItemsJson": [
        {
          "reqId": "REQ-101",
          "label": "CSV export delivered",
          "required": true,
          "acceptance": "Valid CSV with all customer records"
        },
        {
          "reqId": "REQ-102",
          "label": "Data integrity verified",
          "required": true
        }
      ]
    },
    {
      "title": "System integration",
      "amount": 7000,
      "dueDate": "2026-03-01T00:00:00Z",
      "deliverableTypeId": "api_integration",
      "deliverableMode": "LINK",
      "auditEnabled": true,
      "requirementItemsJson": [
        {
          "reqId": "REQ-201",
          "label": "API endpoints functional",
          "required": true
        }
      ]
    },
    {
      "title": "Final testing and deployment",
      "amount": 3000,
      "dueDate": "2026-03-15T00:00:00Z",
      "deliverableTypeId": "deployment",
      "deliverableMode": "LINK",
      "auditEnabled": true
    }
  ],
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**: `201 Created`

```json
{
  "id": "v_1",
  "title": "Enterprise CRM Migration",
  "description": "Migration of legacy CRM data to new system",
  "type": "development",
  "status": "DRAFT",
  "totalAmount": 15000,
  "clientId": "u_client_1",
  "clientName": "Demo Client",
  "freelancerId": null,
  "freelancerName": null,
  "escrowRef": null,
  "createdAt": "2026-01-29T12:00:00Z",
  "milestones": [
    {
      "id": "m_101",
      "title": "Data export and validation",
      "status": "PENDING",
      "amount": 5000,
      "dueDate": "2026-02-15T00:00:00Z",
      "deliverableTypeId": "csv_export",
      "deliverableMode": "FILE",
      "auditEnabled": true,
      "requirementItemsJson": [
        {
          "reqId": "REQ-101",
          "label": "CSV export delivered",
          "required": true,
          "acceptance": "Valid CSV with all customer records"
        },
        {
          "reqId": "REQ-102",
          "label": "Data integrity verified",
          "required": true
        }
      ],
      "submission": null,
      "verification": null,
      "review": null
    },
    {
      "id": "m_102",
      "title": "System integration",
      "status": "PENDING",
      "amount": 7000,
      "dueDate": "2026-03-01T00:00:00Z",
      "deliverableTypeId": "api_integration",
      "deliverableMode": "LINK",
      "auditEnabled": true,
      "requirementItemsJson": [
        {
          "reqId": "REQ-201",
          "label": "API endpoints functional",
          "required": true
        }
      ],
      "submission": null,
      "verification": null,
      "review": null
    },
    {
      "id": "m_103",
      "title": "Final testing and deployment",
      "status": "PENDING",
      "amount": 3000,
      "dueDate": "2026-03-15T00:00:00Z",
      "deliverableTypeId": "deployment",
      "deliverableMode": "LINK",
      "auditEnabled": true,
      "requirementItemsJson": [],
      "submission": null,
      "verification": null,
      "review": null
    }
  ]
}
```

---

## 2. List Vaults

**Request**: `GET /api/vaults`

**Response**: `200 OK`

```json
{
  "vaults": [
    {
      "id": "v_1",
      "title": "Enterprise CRM Migration",
      "description": "Migration of legacy CRM data to new system",
      "type": "development",
      "status": "ACTIVE",
      "totalAmount": 15000,
      "clientId": "u_client_1",
      "clientName": "Demo Client",
      "freelancerId": "u_freelancer_1",
      "freelancerName": "Demo Freelancer",
      "escrowRef": "v_1",
      "createdAt": "2026-01-29T12:00:00Z",
      "milestones": []
    }
  ],
  "total": 1
}
```

---

## 3. Get Vault by ID

**Request**: `GET /api/vaults/v_1`

**Response**: `200 OK`

```json
{
  "id": "v_1",
  "title": "Enterprise CRM Migration",
  "description": "Migration of legacy CRM data to new system",
  "type": "development",
  "status": "ACTIVE",
  "totalAmount": 15000,
  "clientId": "u_client_1",
  "clientName": "Demo Client",
  "freelancerId": "u_freelancer_1",
  "freelancerName": "Demo Freelancer",
  "escrowRef": "v_1",
  "createdAt": "2026-01-29T12:00:00Z",
  "milestones": [
    {
      "id": "m_101",
      "title": "Data export and validation",
      "status": "AWAITING_APPROVAL",
      "amount": 5000,
      "dueDate": "2026-02-15T00:00:00Z",
      "deliverableTypeId": "csv_export",
      "deliverableMode": "FILE",
      "auditEnabled": true,
      "requirementItemsJson": [
        {
          "reqId": "REQ-101",
          "label": "CSV export delivered",
          "required": true,
          "acceptance": "Valid CSV with all customer records"
        }
      ],
      "submission": {
        "submittedAt": "2026-01-29T14:00:00Z",
        "notes": "Export complete with all customer records",
        "filesJson": [
          {
            "name": "crm_export.csv",
            "size": "18MB",
            "tag": "Primary export"
          }
        ]
      },
      "verification": {
        "result": "PASS",
        "verifiedAt": "2026-01-29T14:05:00Z",
        "verifiedBy": "AI",
        "ruleResultsJson": [
          {
            "code": "ROW_COUNT",
            "passed": true,
            "message": "Row count matches signed brief"
          },
          {
            "code": "FILE_FORMAT",
            "passed": true,
            "message": "Valid CSV format"
          }
        ]
      },
      "review": null
    }
  ]
}
```

---

## 4. Create Invite

**Request**: `POST /api/invites`

```json
{
  "vaultId": "v_1",
  "email": "freelancer@example.com",
  "expiresInDays": 7
}
```

**Response**: `201 Created`

```json
{
  "id": "inv_001",
  "token": "550e8400-e29b-41d4-a716-446655440001",
  "vaultId": "v_1",
  "email": "freelancer@example.com",
  "status": "PENDING",
  "invitedAt": "2026-01-29T12:00:00Z",
  "expiresAt": "2026-02-05T12:00:00Z"
}
```

---

## 5. Respond to Invite

**Request**: `POST /api/invites/550e8400-e29b-41d4-a716-446655440001/respond`

```json
{
  "action": "accept"
}
```

**Response**: `200 OK`

```json
{
  "invite": {
    "id": "inv_001",
    "token": "550e8400-e29b-41d4-a716-446655440001",
    "vaultId": "v_1",
    "email": "freelancer@example.com",
    "status": "ACCEPTED",
    "invitedAt": "2026-01-29T12:00:00Z",
    "expiresAt": "2026-02-05T12:00:00Z",
    "respondedAt": "2026-01-29T13:00:00Z"
  },
  "vault": {
    "id": "v_1",
    "title": "Enterprise CRM Migration",
    "status": "ACTIVE",
    "totalAmount": 15000,
    "clientName": "Demo Client",
    "freelancerId": "u_freelancer_1",
    "freelancerName": "Demo Freelancer",
    "milestones": []
  }
}
```

---

## 6. Submit Milestone

**Request**: `POST /api/milestones/m_101/submit`

```json
{
  "notes": "Export complete with all customer records. Data validated against source system.",
  "filesJson": [
    {
      "name": "crm_export.csv",
      "size": "18MB",
      "tag": "Primary export",
      "url": "https://s3.amazonaws.com/dayle-uploads/crm_export.csv"
    },
    {
      "name": "validation_report.pdf",
      "size": "2.4MB",
      "tag": "Validation report",
      "url": "https://s3.amazonaws.com/dayle-uploads/validation_report.pdf"
    }
  ]
}
```

**Response**: `200 OK`

```json
{
  "id": "m_101",
  "title": "Data export and validation",
  "status": "SUBMITTED",
  "amount": 5000,
  "dueDate": "2026-02-15T00:00:00Z",
  "deliverableTypeId": "csv_export",
  "deliverableMode": "FILE",
  "auditEnabled": true,
  "requirementItemsJson": [
    {
      "reqId": "REQ-101",
      "label": "CSV export delivered",
      "required": true
    }
  ],
  "submission": {
    "submittedAt": "2026-01-29T14:00:00Z",
    "submittedBy": "u_freelancer_1",
    "notes": "Export complete with all customer records. Data validated against source system.",
    "filesJson": [
      {
        "name": "crm_export.csv",
        "size": "18MB",
        "tag": "Primary export",
        "url": "https://s3.amazonaws.com/dayle-uploads/crm_export.csv"
      },
      {
        "name": "validation_report.pdf",
        "size": "2.4MB",
        "tag": "Validation report",
        "url": "https://s3.amazonaws.com/dayle-uploads/validation_report.pdf"
      }
    ]
  },
  "verification": null,
  "review": null
}
```

---

## 7. Milestone Verify (System)

**Internal Process**: Triggered automatically after submit

**Result**: Milestone updated with verification

```json
{
  "id": "m_101",
  "status": "AWAITING_APPROVAL",
  "verification": {
    "milestoneId": "m_101",
    "result": "PASS",
    "verifiedAt": "2026-01-29T14:05:00Z",
    "verifiedBy": "AI",
    "confidence": 98.5,
    "checksCompleted": 12,
    "checksTotal": 12,
    "riskLevel": "LOW",
    "flags": [],
    "ruleResultsJson": [
      {
        "code": "FILE_PRESENCE",
        "passed": true,
        "message": "Required file crm_export.csv found"
      },
      {
        "code": "FILE_FORMAT",
        "passed": true,
        "message": "Valid CSV format"
      },
      {
        "code": "ROW_COUNT",
        "passed": true,
        "message": "Row count matches signed brief (12,450 records)"
      },
      {
        "code": "COLUMN_VALIDATION",
        "passed": true,
        "message": "All required columns present"
      }
    ]
  }
}
```

---

## 8. Review Milestone

**Request**: `POST /api/milestones/m_101/review`

```json
{
  "outcome": "APPROVE",
  "reasonCodes": [],
  "notes": "Excellent work! Data export looks perfect."
}
```

**Response**: `200 OK`

```json
{
  "id": "m_101",
  "title": "Data export and validation",
  "status": "VERIFIED",
  "amount": 5000,
  "submission": {
    "submittedAt": "2026-01-29T14:00:00Z",
    "notes": "Export complete with all customer records"
  },
  "verification": {
    "result": "PASS",
    "verifiedAt": "2026-01-29T14:05:00Z"
  },
  "review": {
    "milestoneId": "m_101",
    "reviewerId": "u_client_1",
    "outcome": "APPROVE",
    "reasonCodes": [],
    "notes": "Excellent work! Data export looks perfect.",
    "reviewedAt": "2026-01-29T15:00:00Z"
  }
}
```

**CRITICAL NOTE**: Review with outcome "APPROVE" sets status to "VERIFIED" but does NOT release funds. Client must explicitly call release-milestone endpoint.

---

## 9. Release Milestone

**Request**: `POST /api/vaults/v_1/release-milestone`

```json
{
  "milestoneId": "m_101",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response**: `200 OK`

```json
{
  "milestone": {
    "id": "m_101",
    "status": "VERIFIED",
    "amount": 5000
  },
  "ledgerEntry": {
    "id": "lg_1001",
    "userId": "u_freelancer_1",
    "vaultId": "v_1",
    "milestoneId": "m_101",
    "type": "RELEASE",
    "amount": 5000,
    "currency": "USD",
    "status": "CONFIRMED",
    "description": "Release for milestone: Data export and validation",
    "createdAt": "2026-01-29T15:05:00Z",
    "completedAt": "2026-01-29T15:05:00Z"
  }
}
```

---

## 10. Get Wallet Balance

**Request**: `GET /api/wallet/balance`

**Response**: `200 OK`

```json
{
  "available": 5000,
  "pending": 0,
  "total": 5000
}
```

**Calculation**:

- `available`: Sum of CONFIRMED RELEASE entries - Sum of CONFIRMED WITHDRAW entries
- `pending`: Sum of PENDING RELEASE/WITHDRAW entries
- `total`: available + pending

---

## 11. Get Wallet Transactions

**Request**: `GET /api/wallet/transactions?limit=10`

**Response**: `200 OK`

```json
{
  "transactions": [
    {
      "id": "lg_1001",
      "createdAt": "2026-01-29T15:05:00Z",
      "vaultId": "v_1",
      "milestoneId": "m_101",
      "type": "RELEASE",
      "amount": 5000,
      "currency": "USD",
      "status": "CONFIRMED",
      "description": "Release for milestone: Data export and validation",
      "completedAt": "2026-01-29T15:05:00Z"
    },
    {
      "id": "lg_1002",
      "createdAt": "2026-01-28T10:00:00Z",
      "vaultId": "v_2",
      "milestoneId": "m_205",
      "type": "RELEASE",
      "amount": 3000,
      "currency": "USD",
      "status": "CONFIRMED",
      "description": "Release for milestone: UI Design",
      "completedAt": "2026-01-28T10:00:05Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

---

## 12. Withdraw Funds

**Request**: `POST /api/wallet/withdraw`

```json
{
  "amount": 2500,
  "bankDetails": {
    "accountNumber": "123456789",
    "routingNumber": "021000021",
    "accountName": "Demo Freelancer"
  },
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Response**: `200 OK`

```json
{
  "id": "lg_1003",
  "createdAt": "2026-01-29T16:00:00Z",
  "type": "WITHDRAW",
  "amount": -2500,
  "currency": "USD",
  "status": "PENDING",
  "description": "Withdrawal to bank account ***6789",
  "completedAt": null
}
```

**Reconciliation Flow**:

1. **Initiation**: Create WITHDRAW ledger entry with status PENDING
2. **Balance Update**: Move $2500 from `available` to `pending`
3. **Webhook** (async): Ramp provider confirms withdrawal
4. **Completion**: Update ledger entry status to CONFIRMED, decrement `pending`

---

## 13. Create Dispute

**Request**: `POST /api/disputes`

```json
{
  "vaultId": "v_1",
  "milestoneId": "m_101",
  "requirementRef": "REQ-101",
  "disputeType": "VERIFICATION_ERROR",
  "reasonCode": "VERIFICATION_ERROR",
  "description": "AI incorrectly flagged the CSV export as incomplete. The export contains all 12,450 customer records as specified in the brief. I have verified the row count manually and it matches the source system exactly."
}
```

**Response**: `201 Created`

```json
{
  "id": "d_001",
  "vaultId": "v_1",
  "milestoneId": "m_101",
  "requirementRef": "REQ-101",
  "disputeType": "VERIFICATION_ERROR",
  "reasonCode": "VERIFICATION_ERROR",
  "openedByUserId": "u_freelancer_1",
  "openedByRole": "FREELANCER",
  "status": "OPEN",
  "description": "AI incorrectly flagged the CSV export as incomplete. The export contains all 12,450 customer records as specified in the brief. I have verified the row count manually and it matches the source system exactly.",
  "createdAt": "2026-01-29T16:30:00Z",
  "events": [
    {
      "id": "de_001",
      "disputeId": "d_001",
      "actorId": "u_freelancer_1",
      "actorRole": "FREELANCER",
      "eventType": "OPENED",
      "payload": {
        "reasonCode": "VERIFICATION_ERROR",
        "requirementRef": "REQ-101"
      },
      "createdAt": "2026-01-29T16:30:00Z"
    }
  ]
}
```

---

## 14. List Disputes

**Request**: `GET /api/disputes?status=OPEN`

**Response**: `200 OK`

```json
{
  "disputes": [
    {
      "id": "d_001",
      "vaultId": "v_1",
      "milestoneId": "m_101",
      "requirementRef": "REQ-101",
      "disputeType": "VERIFICATION_ERROR",
      "reasonCode": "VERIFICATION_ERROR",
      "openedByUserId": "u_freelancer_1",
      "openedByRole": "FREELANCER",
      "status": "OPEN",
      "description": "AI incorrectly flagged the CSV export...",
      "createdAt": "2026-01-29T16:30:00Z",
      "updatedAt": "2026-01-29T16:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

## Error Response Examples

### Validation Error

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "totalAmount",
      "message": "totalAmount must be at least 1"
    },
    {
      "field": "milestones",
      "message": "milestones must contain at least 1 elements"
    }
  ],
  "statusCode": 400
}
```

### State Transition Error

```json
{
  "code": "INVALID_STATE_TRANSITION",
  "message": "Milestone must be in AWAITING_APPROVAL status, currently SUBMITTED",
  "statusCode": 400
}
```

### Authorization Error

```json
{
  "code": "UNAUTHORIZED",
  "message": "Only vault client can release milestones",
  "statusCode": 403
}
```

### Idempotency Error (Duplicate Key)

```json
{
  "code": "DUPLICATE_REQUEST",
  "message": "Idempotency key already used with different requestHash",
  "statusCode": 409
}
```

---

## 🚀 Idempotency Test Vectors

Use these examples to verify idempotency enforcement on money operations (e.g., `POST /api/vaults/:id/release-milestone`).

### TV-1: Success (Fresh Key)

**Request**:

```json
{
  "milestoneId": "m_101",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response**: `200 OK` (Processes normally)

### TV-2: Replay (Same Key, Same Body)

**Request**:

```json
{
  "milestoneId": "m_101",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response**: `200 OK` (Returns cached response from TV-1, no new ledger entry)

### TV-3: Conflict (Same Key, Different Body)

**Request**:

```json
{
  "milestoneId": "m_102",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response**: `409 Conflict`

```json
{
  "code": "DUPLICATE_REQUEST",
  "message": "Idempotency key already used with different request",
  "statusCode": 409
}
```

### TV-4: Missing Key (Money Operation)

**Request**:

```json
{
  "milestoneId": "m_101"
}
```

**Response**: `400 Bad Request`

```json
{
  "code": "VALIDATION_ERROR",
  "message": "idempotencyKey is required for money operations",
  "field": "idempotencyKey",
  "statusCode": 400
}
```

---

**End of Sample Flows**
