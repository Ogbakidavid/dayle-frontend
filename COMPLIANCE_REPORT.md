# Compliance Documentation & Audit Report

## 1. Status Field Write Locations

### `vault.status`

- **Writes (Backend Simulation)**:
  - `lib/mock-api.js:382`: `status: VaultStatus.DRAFT` (in `vaults.create`)
  - `lib/mock-api.js:453`: `mockVaults[idx] = { ...mockVaults[idx], status }` (in `vaults.updateStatus`)
  - `lib/mock-api.js:630`: `vault.status = VaultStatus.FUNDED_ASSIGNED` (in `invites.respond`)
  - `lib/mock-api.js:634`: `vault.status = VaultStatus.INVITED` (in `invites.respond`)
  - `lib/mock-api.js:710`: `vault.status = "COMPLETED"` (in `milestones.review`)
- **Writes (Frontend Local State)**:
  - `app/(protected)/client/(with-sidebar)/vault/[vaultId]/page.js:366`: `toast.success(...)` (Funding mock - no actual status write)

### `milestone.status`

- **Writes (Backend Simulation)**:
  - `lib/mock-api.js:429`: `milestone.status = 'VERIFIED'` (in `vaults.releaseMilestone`)
  - `lib/mock-api.js:663`: `milestone.status = "SUBMITTED"` (in `milestones.submit`)
  - `lib/mock-api.js:682`: `milestone.status = "AWAITING_APPROVAL"` (in `milestones.verify`)
  - `lib/mock-api.js:701`: `milestone.status = reviewData.outcome` (in `milestones.review`)
- **Writes (Frontend Local State)**:
  - `app/(protected)/client/(with-sidebar)/vault/[vaultId]/page.js:233`: `[activeReview.id]: "VERIFIED"` (in `handleApprove`)
  - `app/(protected)/client/(with-sidebar)/vault/[vaultId]/page.js:258`: `[activeReview.id]: reviewAction ...` (in `handleReviewSubmit`)

### `milestone.verification.result`

- **Writes (Backend Simulation)**:
  - `lib/mock-api.js:685`: `result: "PASS"` (in `milestones.verify`)

### `ledger.status` / Wallet Balance Mutations

- **Writes (Backend Simulation)**:
  - `lib/mock-api.js:313`: `mockWallet.available = ...` (in `wallet.withdraw`)
  - `lib/mock-api.js:422`: `status: 'PENDING'` (in `vaults.releaseMilestone` - Ledger Entry creation)
  - `lib/mock/ledger.js:9`: `status: 'CONFIRMED'` (Seed Data)
  - `lib/mock/ledger.js:22`: `status: 'PENDING'` (Seed Data)
  - `lib/mock/ledger.js:35`: `status: 'CONFIRMED'` (Seed Data)
  - `lib/mock/ledger.js:48`: `status: 'PENDING'` (Seed Data)
  - `lib/mock/ledger.js:61`: `status: 'CONFIRMED'` (Seed Data)

### `dispute.status`

- **Writes (Backend Simulation)**:
  - `lib/mock-api.js:524`: `status: "OPEN"` (in `disputes.create`)
  - `lib/mock/disputes.js:8`: `status: "OPEN"` (Seed Data)
  - `lib/mock/disputes.js:24`: `status: "RESOLVED"` (Seed Data)
  - `lib/mock/disputes.js:40`: `status: "OPEN"` (Seed Data)
  - `lib/mock/disputes.js:55`: `status: "UNDER_REVIEW"` (Seed Data)

---

## 2. Literal Status Strings

### Vault Status

- `DRAFT`
- `AWAITING_FUNDING`
- `INVITED`
- `FUNDED_UNASSIGNED`
- `FUNDED_ASSIGNED`
- `ACTIVE`
- `IN_REVIEW`
- `COMPLETED`
- `CANCELLED`
- `PAUSED`
- `PENDING_FUNDING` (Found in UI check at `page.js:361`)

### Milestone Status

- `PENDING`
- `SUBMITTED`
- `AWAITING_APPROVAL`
- `VERIFIED`
- `REVISION_REQUESTED`
- `REJECTED`
- `DISPUTED`
- `APPROVED` (Found in UI checks at `page.js:280` and `page.js:682` - **Potential Inconsistency**)

### User Role

- `CLIENT`
- `FREELANCER`
- `ADMIN`
- `NONE`

### Verification Result

- `PASS`
- `FAIL`
- `FLAGGED`
- `HUMAN_REVIEW`

### Dispute Status

- `OPEN`
- `UNDER_REVIEW`
- `NEEDS_INFO`
- `RESOLVED`
- `REJECTED`

---

## 3. State Transition Table (Derived from `lib/mock-api.js`)

| Entity        | Function Triggers         | From Status          | To Status                              | Logic/Condition                                                                                                         |
| :------------ | :------------------------ | :------------------- | :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Vault**     | `create()`                | `undefined`          | `DRAFT`                                | Initial creation                                                                                                        |
| **Vault**     | `invites.respond(ACCEPT)` | `FUNDED_UNASSIGNED`  | `FUNDED_ASSIGNED`                      | Freelancer accepts invite                                                                                               |
| **Vault**     | `invites.respond(ACCEPT)` | `!FUNDED_UNASSIGNED` | `INVITED`                              | Freelancer accepts but vault not fully funded                                                                           |
| **Vault**     | `milestones.review()`     | `ACTIVE`             | `COMPLETED`                            | If `vault.milestones.every(m => m.status === "VERIFIED")`                                                               |
| **Vault**     | `updateStatus()`          | `Any`                | `Arg Status`                           | Manual override                                                                                                         |
| **Milestone** | `submit()`                | `PENDING`            | `SUBMITTED`                            | Freelancer submission                                                                                                   |
| **Milestone** | `verify()`                | `SUBMITTED`          | `AWAITING_APPROVAL`                    | AI Verification passes                                                                                                  |
| **Milestone** | `releaseMilestone()`      | `AWAITING_APPROVAL`  | `VERIFIED`                             | Client release funds                                                                                                    |
| **Milestone** | `review()`                | `AWAITING_APPROVAL`  | `Arg Outcome`                          | `APPROVE` \| `REJECT` \| `REQUEST_CHANGES`                                                                              |
| **Milestone** | `review(APPROVE)`         | `AWAITING_APPROVAL`  | `APPROVE` (Likely `VERIFIED` intended) | Note: `mock-api.js` sets status directly to `reviewData.outcome`, so if outcome is `APPROVE`, status becomes `APPROVE`. |

---

## 4. Release Safety Trace

**Hypothesis**: Clicking "Approve" in the Client UI triggers a secure API call that moves money via the Ledger.

**Trace**:

1.  **UI Action**: User clicks "Approve" in `ClientVaultDetailPage` or `ClientReviewPage`.
    - Target: `handleApprove` function / `handleReviewSubmit` function.
    - File: `app/(protected)/client/(with-sidebar)/vault/[vaultId]/page.js`

2.  **Frontend Handler**:

    ```javascript
    // app/(protected)/client/(with-sidebar)/vault/[vaultId]/page.js:229
    const handleApprove = () => {
      if (activeReview) {
        setMilestoneStates((prev) => ({
          ...prev,
          [activeReview.id]: "VERIFIED", // <--- UPDATE LOCAL STATE ONLY
        }));
        setActiveReview(null);
        setShowSuccess(true);
        // ...
      }
    };
    ```

    - **Finding**: The handler updates local React state (`milestoneStates`). It **DOES NOT** make an API call.

3.  **API Layer (`lib/mock-api.js`)**:
    - Method `vaults.releaseMilestone` exists and contains ledger logic:
      ```javascript
      // lib/mock-api.js:416
      const ledgerEntry = {
        // ...
        amount: Number(milestone.amount) || 0,
        type: "RELEASE",
      };
      milestone.status = "VERIFIED";
      ```
    - **Finding**: This method is **ORPHANED** (not called by the UI).

4.  **Conclusion**:
    - **SAFETY FAILURE**: The current frontend implementation mimics approval visually but fails to trigger the backend (mock) transaction logic.
    - **Money Movement**: No money is moved in the current execution flow. The `ledgerEntry` creation code in `mock-api.js` is unreachable from the current UI.
