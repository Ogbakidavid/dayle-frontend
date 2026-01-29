# Changelog

## [2026-01-29] - Paid vs Approved Differentiation

- **ARCHITECTURE.md**:
  - Resolved semantic conflict in `MilestoneStatus.VERIFIED`.
  - Documented UI logic for determining "Paid" vs "Approved" using the `payoutStatus` truth signal.
- **BACKEND_CONTRACT.md**:
  - Added `payoutStatus` (derived from `TransactionStatus`) as an internal truth signal on the Milestone object.
  - Updated `GET /api/vaults/:id` and action responses to include this signal.
- **BACKEND_SAMPLES_PAID_VS_APPROVED.md**: Created new sample resource showing exact JSON transitions.

### [2026-01-29] - Review ≠ Release Alignment

- **ARCHITECTURE.md**:
  - Decoupled Milestone Approval from Fund Release.
  - Updated "Product Rules" to explicitly state that Review recorded decision and Release is a separate idempotent action.
  - Updated "Milestone Philosophy" to clarify the split lifecycle.
  - Updated "Client Review Screen" UI section to show explicit Approve and Release actions.
- **BACKEND_CONTRACT.md**:
  - Updated `MilestoneStatus.VERIFIED` description to "Approved by client; eligible for explicit release".

## [2026-01-29] - VaultStatus Alignment

### Updated

- **ARCHITECTURE.md**: Updated `VaultStatus` list to include granular states: `AWAITING_FUNDING`, `INVITED`, `FUNDED_UNASSIGNED`, `FUNDED_ASSIGNED`, `IN_REVIEW`.
- **BACKEND_CONTRACT.md**:
  - Added comprehensive `Canonical Domain Enums` section for `VaultStatus`, `MilestoneStatus`, and `UserRole`.
  - Updated `VaultStatus` to match the 11-value set: `DRAFT`, `AWAITING_FUNDING`, `INVITED`, `FUNDED_UNASSIGNED`, `FUNDED_ASSIGNED`, `ACTIVE`, `IN_REVIEW`, `COMPLETED`, `CANCELLED`, `DISPUTED`, `PAUSED`.
  - Updated state transition documentation in `Vault Module` and `Invite Module` to use the granular statuses.
  - Renumbered Table of Contents and section headers for consistency.

### Alignment Notes

- Standardized `VaultStatus` across all system documentation.
- Ensured that "computed views" like `INVITED` and `AWAITING_FUNDING` are treated as explicit enum values exposed by the API, satisfying the requirements for the frontend contracts.
- Maintained `DISPUTED` as a valid Vault status as per implementation and state machine diagrams.
