# Sample Responses: Paid vs Approved

This document illustrates how the backend signals the difference between a client's verification decision and the actual fund release.

---

## 1. Milestone Approved (Work Verified, Fund Release Pending)

When a client calls `POST /api/milestones/:id/review` with `outcome: "APPROVE"`, the milestone is marked as `VERIFIED`, but `payoutStatus` remains inactive until the explicit release is triggered.

**Endpoint**: `GET /api/vaults/v_1`

```json
{
  "milestones": [
    {
      "id": "m_101",
      "title": "Initial Design Mockups",
      "amount": 1000,
      "status": "VERIFIED",
      "payoutStatus": null,
      "review": {
        "outcome": "APPROVE",
        "notes": "Approved! Please initiate the release so I can get paid.",
        "reviewedAt": "2026-01-29T15:00:00Z"
      }
    }
  ]
}
```

---

## 2. Milestone Releasing (Payment in Progress)

When a client calls `POST /api/vaults/:id/release-milestone`, the backend creates the ledger entry and the `payoutStatus` moves to `PENDING` while the blockchain transaction is processed.

**Endpoint**: `POST /api/vaults/v_1/release-milestone`

```json
{
  "milestone": {
    "id": "m_101",
    "status": "VERIFIED",
    "payoutStatus": "PENDING"
  },
  "ledgerEntry": {
    "type": "RELEASE",
    "amount": 1000,
    "status": "PENDING",
    "description": "Release for milestone: Initial Design Mockups"
  }
}
```

---

## 3. Milestone Paid (Funds Released)

After the blockchain confirmation (or instantly in mock mode), the `payoutStatus` moves to `CONFIRMED`.

**Endpoint**: `GET /api/vaults/v_1`

```json
{
  "milestones": [
    {
      "id": "m_101",
      "title": "Initial Design Mockups",
      "amount": 1000,
      "status": "VERIFIED",
      "payoutStatus": "CONFIRMED",
      "review": {
        "outcome": "APPROVE",
        "reviewedAt": "2026-01-29T15:00:00Z"
      }
    }
  ]
}
```

---

## UI Logic Summary

| Milestone Status | Payout Status | UI Display State                                |
| :--------------- | :------------ | :---------------------------------------------- |
| `VERIFIED`       | `null`        | **Approved** (Work done, awaiting release)      |
| `VERIFIED`       | `PENDING`     | **Processing** (Money moving on-chain)          |
| `VERIFIED`       | `CONFIRMED`   | **Paid** (Funds available in freelancer wallet) |
| `VERIFIED`       | `FAILED`      | **Payout Error** (Trigger manual retry)         |
