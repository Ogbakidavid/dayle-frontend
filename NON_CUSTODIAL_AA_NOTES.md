# Non-Custodial AA Transition: Security & Transition Notes

This document covers the security requirements and a comprehensive list of changes for the transition from custodial wallets to non-custodial Account Abstraction (AA) via Privy/Web3Auth.

---

## 4. Security Notes: Backend Validation Requirements

To maintain security in a non-custodial AA environment, the backend must enforce the following:

### 1. Idempotency & Replay Protection

- **Idempotency Keys**: MUST be enforced for all wallet-linking and transaction-initiation requests (`POST /api/auth/wallet`, `POST /api/vaults/:id/fund`, etc.).
- **Transaction Tracking**: All `LedgerEntry` records for money actions must include the `providerRef` (transaction hash or user operation hash) to prevent duplicate processing of the same on-chain event.

### 2. Webhook Verification

- **Signature Validation**: Fail-closed validation for all incoming webhooks from the provider. Use the provider's SDK or public key to verify that the request originated from Privy/Web3Auth.
- **Event Deduplication**: Store incoming webhooks in the `WebhookEvent` table and check for existing `id` before processing.

### 3. State Machine Integrity

- **Verification Guard**: The backend must NEVER initiate a `RELEASE` via the provider unless the milestone status is exactly `VERIFIED`.
- **Authorization Guard**: Cross-reference the `userId` associated with the API request with the `clientId` or `freelancerId` of the target vault before sending an initiation request to the provider.

### 4. Provider Token Verification

- When linking a wallet (`POST /api/auth/wallet`), the backend must verify the provider-issued JWT (e.g., Privy access token) to ensure the user actually owns the `providerUserId` they are claiming.

---

## 5. “What Changed” List

### Documentation

- **[ARCHITECTURE.md](file:///home/creativeogbaki/Desktop/Cleard-Frontend/ARCHITECTURE.md)**:
  - **Section 1.C**: Rewritten to "Wallet Abstraction Layer (Non-Custodial AA)".
  - **Section 2**: Updated `Wallet` entity definition.
  - **Section 4 (Workflow A)**: Updated Signup flow to focus on Provider association.
  - **Section 4 (Workflow C/F)**: Updated funding and release workflows to use Provider initiation.
- **[BACKEND_CONTRACT.md](file:///home/creativeogbaki/Desktop/Cleard-Frontend/BACKEND_CONTRACT.md)**:
  - **TOC**: Added Section 15 "Wallet & Provider Integration".
  - **Auth Module**: Added `POST /api/auth/wallet` for linking.
  - **Vault Module**: Updated `fund` and `release-milestone` response shapes to include `transactionRequest` and `userOperation`.
  - **New Section 15**: Added detailed AA workflow and security requirements.

### Database Schema

- **[backend-prisma-schema.prisma](file:///home/creativeogbaki/Desktop/Cleard-Frontend/backend-prisma-schema.prisma)**:
  - **NEW** `WalletProvider` enum (`PRIVY`, `WEB3AUTH`).
  - **NEW** `WalletStatus` enum (`ACTIVE`, `SUSPENDED`).
  - **NEW** `Wallet` model (linked to User, stores provider metadata).
  - **MODIFIED** `User` model: Added relation to `Wallet`.
  - **REMOVED** Any references to `keyRef` or custodial metadata.

### TODO / Flagged Items

- **[TODO]**: The `LedgerEntry.providerRef` field should be used to store transaction hashes returned by the provider SDK.
- **[TODO]**: Implementing the gasless Paymaster logic requires choosing a specific bundler/relayer service (e.g., Pimlico, Alchemy) to be integrated with the provider SDK.
