Dayle — System Design Architecture (v0)
Table of Contents

Product Rules (Non-Negotiables)

Milestone Philosophy (Canonical Lifecycle)

High-Level Architecture (Services & Responsibilities)

Core Data Model (Entities & Key Fields)

State Machines (Allowed Transitions + Guards)

Truth & Reconciliation (DB vs Chain vs Ramp)

End-to-End Workflows

AI Audit (Objective Verification Only)

Build Order (Phased Delivery)

Failure Modes (What Breaks First)

Minimal Diagram (Mental Model)

1. Product Rules (Non-Negotiables)
   1.1 Core Truths

Vault is the source of truth for payment intent (off-chain record + on-chain escrow state).

Money moves only on allowed state transitions via defined money actions. No manual/freeform payouts.

AI never judges taste. AI verifies objective compliance only.

AI never releases funds. AI produces an audit result only.

Client approval is always required to verify work.

Even if AI audit passes, the client must explicitly approve the milestone before money can move.

Review ≠ Release. Release is a separate explicit money action after approval.

Communication is evidence tied to vaults/milestones/submissions (append-only), not chat rooms.

Blockchain is invisible in UX. UI shows USD balances and processing states; never chain terms (wallets/tokens/gas/tx hashes).

Dayle is non-custodial for user wallets. Private keys never touch Dayle systems (DB, logs, servers).

Embedded wallet provider manages key generation/storage (secure enclave / MPC / social recovery depending on provider).

Dayle may control smart-contract escrow logic, but cannot sign user-wallet transactions or access user private keys.

1.3 Invisible Blockchain

All blockchain-specific terminology (Wallet, Hash, Token, Gas) must be abstracted away in the UI.

- "Wallet" -> "Balance" or "Ledger"
- "Tx Hash" -> "Reference ID" or "Transaction ID"
- "Address" -> "Account Details"

If a flow requires Dayle to move funds without user authorization/signature, it is custodial and out-of-scope for v0.

Disputes are eligibility-gated. Disputes exist only if tied to:

a milestone + requirement item (reqId), or

structured fraud/process/security reason codes.

Creative work is supported. Client can reject for subjective reasons, but rejection is structured and does not automatically create a dispute.

Freeze is a first-class safety mechanism. Any reconciliation mismatch/fraud trigger pauses affected vaults and blocks money movement until resolved.

1.2 Terminology (Prevent Misinterpretation)

Custody refers strictly to private key control (wallet custody).

Escrow custody is contract-based custody and does not imply key custody.

2. Milestone Philosophy (Canonical Lifecycle)
   2.1 One Milestone = One Lifecycle

A milestone includes:

Deliverable requirements (reqIds)

Submission (file/link) with immutable hash

AI audit result (advisory)

Client decision (approve/request changes/reject)

Money actions (release/refund) executed explicitly and confirmed

Milestones are not split into “Compliance milestone vs Approval milestone.”

2.2 Canonical Flow

Freelancer submits deliverable (file/link).

System runs objective AI audit (optional but recommended).

Client reviews submission + audit results.

Client chooses one:

Approve (verify work)

Request changes

Reject (structured reason codes)

Release is a separate explicit money action after approval.

2.3 Key Rule

Approval records intent.

Release moves money.

No release occurs without client approval.

3. High-Level Architecture (Services & Responsibilities)
   A) Frontend (Web2 UX)

Responsibilities:

Auth (email/password, social login as needed)

Client dashboard + freelancer dashboard

Vault creation + milestone definition

Submission upload UI (files + links)

Audit results UI (PASS / FAIL / FLAGGED / HUMAN_REVIEW)

Evidence channel (structured Q&A, comments, attachments)

Ledger + balances snapshot (USD, processing states)

Add funds / Withdraw via ramp embedded UI

Dispute initiation UI (milestone-scoped; reason-code based)

Dispute case view (timeline + evidence bundle + status)

Client review screen:
Approve
Release (explicit money action)

Request changes

Reject (reason codes)

Hard constraint:

Frontend must never display: wallets, tokens, gas, chain names, tx hashes.

UI must use derived status labels (e.g., "In progress" instead of "ACTIVE") to maintain the illusion of a standard fintech app.

B) Backend API (System of Record)

Stores and enforces:

Users + roles + approval/KYC status

Vaults + milestones + submissions

Audit results + reason codes

Evidence events (append-only)

Money actions (releases/refunds) + ledger/journal

Disputes + eligibility gating

Orchestration to wallet provider + chain + ramp

Reconciliation + freeze/hold logic

Backend must be:

A state machine + reconciler

Idempotent for all money-moving actions

Audit-trail complete for evidence, disputes, and money actions

C) Wallet Abstraction Layer (Non-Custodial AA)

Use an embedded wallet provider (Privy/Web3Auth or equivalent).

Provider manages key generation/storage; Dayle never sees private keys.

Users interact through AA smart accounts (ERC-4337 or similar).

Backend can sponsor gas via relayer/paymaster for “invisible blockchain.”

Backend orchestrates money actions; user signs when required via provider UI/session.

Signature authorization primitives:

Interactive: User signs each transaction manually via provider modal UI.

Session Keys: User signs a one-time session grant (bound by time/allowance) allowing backend to sign specific money actions (e.g., releases below $1k) on their behalf.

D) Smart Contract Escrow (On-Chain)

Minimal escrow contract:

Holds stablecoin funds

Maps vaultId → escrow state

Allows:

fundVault(vaultId)

releaseMilestone(vaultId, milestoneId, amount, recipient)

refundVault(vaultId, amount, recipient)

pauseVault(vaultId) (optional)

Events emitted:

VaultFunded

MilestoneReleased

VaultRefunded

VaultPaused

Hard constraints:

No AI logic

No file storage

No dispute logic

E) Ramp Provider (Fiat On/Off-Ramp)

Deposit and withdrawal must be abstracted because providers vary.

Deposit behavior:

Ramp processes fiat payment.

Value settles either:

on-chain to a destination address, or

off-chain balance that later withdraws on-chain
Backend supports both by treating deposit as provider settlement + optional chain confirmation.

Withdraw behavior:

stablecoin → fiat → bank/card (provider dependent)

Backend integrates:

Checkout/session creation

Webhook handlers (status updates)

Reconciliation with chain deposits/withdrawals

Manual review lane for mismatches

F) AI Audit Service (Objective Verification Only)

Performs objective checks only:

Link reachability/validity

File presence/type/size

Metadata extraction

Formatting validation

ZIP integrity scan

Basic “not empty” detection

Outputs:

PASS / FAIL / FLAGGED / HUMAN_REVIEW

Structured reason codes

Rule-level results referencing reqIds

Rules:

Advisory only

Never releases funds

Client approval always required

Human advisor can override (becomes training data)

G) Storage

PostgreSQL (ACID transactions)

Object storage: S3/R2 (deliverables + evidence attachments)

Queue: BullMQ/Redis (or SQS later) for async jobs

Cache (optional): Redis

H) Observability & Security

Request + event logs (sensitive-safe)

Metrics: failure rates, reconciliation mismatches, dispute rate

Audit trails: every action tied to actor + timestamp

Rate limits + fraud rules

Idempotency keys for money actions

Chain event dedupe by (txHash, logIndex) + confirmation threshold

Freeze/hold mechanisms for anomalies

4. Core Data Model (Entities & Key Fields)
   4.1 Users

id, email

role: CLIENT | FREELANCER | ADMIN

status: ACTIVE | PENDING_APPROVAL | SUSPENDED

kycStatus: NONE | PENDING | VERIFIED | REJECTED

createdAt

4.2 Smart Accounts

id, userId

provider: PRIVY | WEB3AUTH

providerUserId (unique)

address (public)

chainId

status: ACTIVE | SUSPENDED

createdAt, updatedAt

4.3 Vaults

Vault.status (authoritative, API-exposed):

DRAFT

AWAITING_FUNDING

FUNDED

PAUSED

DISPUTED

CANCELLED

CLOSED

Core fields:

id (UUID)

clientId

freelancerId (nullable)

totalAmount

status

lastTransitionAt, lastTransitionBy, lastTransitionReason

escrowRef (vaultId used by contract mapping)

internalMetadata (admin-only; chain/provider details)

createdAt

Pause fields:

pausedReasonCode (enum)

pausedAt

pausedBy (SYSTEM or admin)

Derived fields (returned by API, computed only, not stored):

assignmentStatus: UNASSIGNED | ASSIGNED

progressStatus: NEEDS_SUBMISSION | NEEDS_REVIEW | VERIFIED_AWAITING_RELEASE | RELEASING | SETTLED

settlementStatus: OPEN | PARTIAL | FULL

Definition of CLOSED

Vault may be CLOSED only when:

escrow balance is zero, AND

all releases/refunds are CONFIRMED, AND

no open disputes exist.

4.4 Milestones

id, vaultId, title, amount, dueDate

status:

PENDING

SUBMITTED

AWAITING_APPROVAL

VERIFIED

REVISION_REQUESTED

REJECTED

DISPUTED

auditStatus (advisory):

PENDING | IN_PROGRESS | PASS | FAIL | FLAGGED | HUMAN_REVIEW | SKIPPED

deliverableTypeId (e.g., github_repo, figma_link)

deliverableMode: LINK | FILE

auditEnabled: boolean

requirementItemsJson: [{ reqId, label, type, field, operator, expectedValue, required }]

requirementSchemaVersion

createdAt

Rules:

Client may approve even if auditStatus = FAIL (UI shows warning + requires explicit acknowledgement).

Requirements must be snapshotted into Evidence Events on review to prevent retroactive edits.

4.5 Submissions (Immutable)

id, milestoneId, submittedByUserId, submittedAt, notes

filesJson: [{ url, hash, type, size, metadata }]

linksJson: [{ url, label, metadata }]

contentHash (SHA256 of submission payload)

hashAlgorithm (default SHA256)

immutableAt, immutableBy

Constraints:

No updates after creation.

Client approval must reference submissionId + submission.contentHash.

4.6 Verifications (AI Audit Results)

id, submissionId

result: PASS | FAIL | FLAGGED | HUMAN_REVIEW

confidenceScore (optional)

ruleResultsJson: [{ code, passed, message, field, reqId }]

reviewedBy: AI | HUMAN

createdAt

4.7 Milestone Reviews (Client Decision)

id

milestoneId

submissionId (must be the reviewed submission)

submissionContentHash (must match submission)

reviewerUserId (client)

outcome: APPROVE | REQUEST_CHANGES | REJECT

reasonCodes: required if REQUEST_CHANGES or REJECT

notes (optional)

acknowledgeAuditWarning (boolean; required when approving with audit FAIL)

Rule: Audit output is advisory only. Audit never sets status to REJECTED or REVISION_REQUESTED; only client decisions can trigger these terminal/loop states.

createdAt

4.8 Money Actions: Releases (First-Class)

Money does not “just happen”. It happens via explicit actions with durable records.

Releases

id

vaultId

milestoneId

initiatedByUserId (client)

amount

currency (USD)

feeAmount (explicit; assessed at release time)

status:

NOT_STARTED

PENDING_SIGNATURE

SUBMITTED

CONFIRMED

FAILED

CANCELED

idempotencyKey

providerRef (wallet provider request/session id)

chainTxHash (nullable until submitted)

failureCode (enum)

failureMessage (optional, admin-only)

createdAt, updatedAt, confirmedAt

Rule:

No ledger posting for RELEASE is final until Release.status == CONFIRMED.

4.9 Money Actions: Refund Requests (First-Class)

Refunds are also explicit, idempotent, and chain-confirmed.

Refunds

id

vaultId

milestoneId (nullable; can refund remaining escrow after terminal outcomes)

initiatedByUserId (client or admin; rule-gated)

amount

currency

status: PENDING_SIGNATURE | SUBMITTED | CONFIRMED | FAILED | CANCELED

idempotencyKey

providerRef

chainTxHash

createdAt, updatedAt, confirmedAt

Rule:

Refund eligibility is policy-gated (see Disputes & Rejection Policy).

4.10 Ramp Transactions (Provider Abstraction)

RampTransactions

id

userId

direction: DEPOSIT | WITHDRAW

amount, currency

status: INITIATED | PENDING | SETTLED | FAILED | CANCELED

providerRef

destinationAddress (nullable if off-chain settlement)

chainTxHash (nullable)

createdAt, updatedAt

Rules:

Ledger balances become available only after sufficient confirmation of settlement:

Provider webhook SETTLED and, where applicable, chain confirmation.

Manual review lane exists when webhook and chain disagree.

4.11 Disputes (Eligibility-Gated Case Files)

id, vaultId, milestoneId

openedByUserId

openedByRole: CLIENT | FREELANCER

disputeType:

VERIFICATION_ERROR

REQUIREMENT_MISMATCH

SCOPE_CHANGE

BAD_FAITH

FRAUD

PROCESS_BREACH

SECURITY

reasonCode (structured enum)

requirementRef (reqId; required for requirement-based disputes)

status: OPEN | UNDER_REVIEW | NEEDS_INFO | RESOLVED | REJECTED

outcome (on resolve):

RELEASE_TO_FREELANCER

REFUND_TO_CLIENT

SPLIT_PAYMENT

ALLOW_RESUBMISSION

ESCALATE

DISMISS

splitPercentage (required if SPLIT_PAYMENT)

resolvedBy, createdAt, resolvedAt

Dispute opening permissions:

Client may open: VERIFICATION_ERROR, REQUIREMENT_MISMATCH, SCOPE_CHANGE, BAD_FAITH, FRAUD, PROCESS_BREACH, SECURITY

Freelancer may open: BAD_FAITH, PROCESS_BREACH, REQUIREMENT_MISMATCH (reqId required), SCOPE_CHANGE

4.12 Dispute Events (Append-Only Timeline)

id, disputeId

actorUserId (or SYSTEM)

actorRole (optional)

eventType:

OPENED

EVIDENCE_ADDED

AI_REAUDIT

ADVISOR_DECISION

CLIENT_RESPONSE

FREELANCER_RESPONSE

RESOLVED

payloadJson

createdAt

4.13 Accounting (Simplified Ledger v0)

v0 uses a single-entry ledger model for simplicity. Double-entry is deferred to v1.

LedgerEntries

id, vaultId, milestoneId (optional), userId

type: DEPOSIT | RELEASE | REFUND | WITHDRAW | FEE

amount, currency

status: PENDING | CONFIRMED | FAILED

idempotencyKey, providerRef

chainTxHash (nullable)

createdAt, confirmedAt

Rules:

sum(LedgerEntries(userId, CONFIRMED)) == current user balance

sum(LedgerEntries(vaultId, CONFIRMED)) == total released from vault

Refund Confirmed: Post LedgerEntry(REFUND, NEGATIVE amount)

Release Confirmed: Post LedgerEntry(RELEASE, amount)

4.14 Evidence Events (Append-Only Legal Record)

All communication is evidence events; no deletes.

id, eventNumber

vaultId, milestoneId (optional), disputeId (optional)

eventType:

SUBMISSION_CREATED

VERIFICATION_COMPLETED

REVIEW_SUBMITTED

REQUIREMENTS_SNAPSHOTTED

MESSAGE_SENT

MESSAGE_EDITED (references previous event)

RELEASE_INITIATED

RELEASE_CONFIRMED

REFUND_INITIATED

REFUND_CONFIRMED

DISPUTE_OPENED

DISPUTE_EVIDENCE_ADDED

DISPUTE_RESOLVED

MILESTONE_STATUS_CHANGED

VAULT_FUNDED

VAULT_STATUS_CHANGED

VAULT_PAUSED

actorUserId, actorRole

payloadJson (content, supersedesEventId, attachments, snapshots)

contentHash (SHA256)

createdAt

Threading:

Messages are tied to vault or milestone.

MESSAGE_EDITED appends a new event that supersedes prior event in UI; original remains immutable.

5. State Machines (Allowed Transitions + Guards)
   5.1 Vault.status Allowed Transitions

DRAFT → AWAITING_FUNDING
Guard: vault created; milestones defined (optional depending on UX)

AWAITING_FUNDING → FUNDED
Guard: escrow funding CONFIRMED (chain + required confirmations)

FUNDED → PAUSED
Guard: reconciliation mismatch, fraud trigger, admin pause

PAUSED → FUNDED
Guard: mismatch resolved; admin/system unpauses with reason

FUNDED → DISPUTED
Guard: eligible dispute OPENED for a milestone

DISPUTED → FUNDED
Guard: dispute resolved without terminal outcome and vault continues

FUNDED → CANCELLED
Guard: only if no active dispute and refund policy satisfied for remaining funds

FUNDED / CANCELLED / DISPUTED → CLOSED
Guard: escrow balance zero AND all money actions CONFIRMED AND no open disputes

Invariant:

If Vault.status in {PAUSED, DISPUTED} → no money actions allowed except those explicitly executed by admin resolution paths.

5.2 Milestone.status Allowed Transitions

PENDING → SUBMITTED
Guard: submission created (immutable) + hashes recorded

SUBMITTED → AWAITING_APPROVAL
Guard: audit job finished OR audit skipped; milestone ready for client review

AWAITING_APPROVAL → VERIFIED
Guard: client submits MilestoneReview(APPROVE) referencing submissionId+contentHash

AWAITING_APPROVAL → REVISION_REQUESTED
Guard: client submits MilestoneReview(REQUEST_CHANGES) + reason codes

REVISION_REQUESTED → SUBMITTED
Guard: new submission created (immutable)

AWAITING_APPROVAL → REJECTED
Guard: client submits MilestoneReview(REJECT) + reason codes

Any → DISPUTED
Guard: eligible dispute opened with reqId or reason code

Invariant: Milestone VERIFICATION (VERIFIED) does not move money.

Money moves only via Releases/Refunds reaching CONFIRMED.

5.3 Money Action Guards (Release / Refund)

Release creation allowed only if:
milestone.status == VERIFIED

vault.status == FUNDED

no open dispute for the milestone

idempotencyKey unique for (milestoneId, actionType)

Refund creation allowed only if:

vault.status in {FUNDED, CANCELLED} and not DISPUTED

refund eligibility satisfied (see Section 7.9)

idempotencyKey unique for (vaultId, actionType)

6. Truth & Reconciliation (DB vs Chain vs Ramp)
   6.1 Three Truth Sources

DB state (internal belief)

Chain state (actual escrow events)

Ramp/provider state (fiat lifecycle)

6.2 Golden Rule

DB never assumes money moved. DB finalizes balances only after:

chain event confirmed (with confirmation threshold), or

provider webhook confirms settlement AND, where applicable, chain proof exists

6.3 Required Mechanisms

Idempotency keys on all money operations

Chain event listener:

confirmation-gated

dedupe by (txHash, logIndex)

reorg-safe handling

Ramp webhook handler:

idempotent ingestion

dedupe by providerRef + event id

Scheduled reconciliation:

chain escrow balances vs escrow accounts

provider settlement vs ledger

journal balance checks

Mismatch rule:

If mismatch detected → set Vault.status = PAUSED and block money actions.

Evidence event VAULT_PAUSED appended with reason code.

7. End-to-End Workflows
   7.1 Signup → Smart Account Associated

User signs up via provider.

Backend receives providerUserId + publicAddress.

Backend creates user + smart account association.

Freelancer gating: PENDING_APPROVAL until reviewed → ACTIVE.

7.2 Client Deposit (Ramp)

Client clicks “Add funds”.

Backend creates ramp checkout/session (amount + destination parameters).

Webhook updates deposit state.

If provider settles on-chain: chain listener confirms arrival.

Ledger: deposit available only after settlement confirmation.

UI: processing → available (USD).

7.3 Create Vault → Fund Escrow

Client creates vault + milestones (DB).

Vault.status = DRAFT → AWAITING_FUNDING.

Client funds vault:

backend checks client available balance

creates funding transaction via wallet provider

chain emits VaultFunded

after confirmations: Vault.status = FUNDED

ledger/journal posts only on confirmation

7.4 Freelancer Submit Deliverable

Freelancer uploads files/posts links.

Backend creates immutable Submission + contentHash.

Milestone.status = SUBMITTED.

Audit job queued.

7.5 AI Audit (Objective Only)

Deterministic checks based on requirementItemsJson (reqIds).

Outputs PASS/FAIL/FLAGGED/HUMAN_REVIEW.

Milestone.status → AWAITING_APPROVAL (always).

Audit never blocks approval; never releases funds.

7.6 Client Review (Verify Work)

Client sees:

Submission

Audit summary + reason codes

Client actions:

Approve → milestone.status = VERIFIED

Review must reference submissionId + contentHash

If audit FAIL, client must set acknowledgeAuditWarning = true

Request changes → REVISION_REQUESTED (reason codes)

Reject → REJECTED (reason codes)

On review submission, backend must append evidence:

REQUIREMENTS_SNAPSHOTTED (snapshot of requirements at that time)

REVIEW_SUBMITTED

7.7 Release Payment (Explicit Money Action)

Client clicks Release.

Backend creates Release with idempotencyKey.

Release.status progresses:

PENDING_SIGNATURE (if user signature required)

SUBMITTED (tx submitted)

CONFIRMED (after chain confirmations)

On CONFIRMED:

post journal entry for release

append evidence RELEASE_CONFIRMED

milestone considered “paid” in UI (via Release status)

7.8 Freelancer Withdraw (Ramp)

Freelancer clicks Withdraw.

Backend checks: KYC, limits, available settled balance.

Creates ramp withdrawal transaction.

After provider settlement confirmation:

post journal entry

UI shows “Sent to bank”.

7.9 Rejection Policy & Refund Eligibility

Rejection

Client may reject for subjective reasons using structured codes.

Rejection does not move money and does not auto-create a dispute.

Dispute window

Either party may open an eligible dispute within 7 days of rejection (policy default; configurable).

Cooling-off window

Refund request cannot be initiated until 72 hours after rejection (policy default; configurable).

Refund eligibility

If milestone is REJECTED and no eligible dispute is opened within the dispute window:

client may initiate Refund for unreleased escrow as allowed by policy.

Refund is a money action:

must be idempotent

must be chain-confirmed before ledger is final

Refund Eligibility Gating:

Refunds are disabled if a dispute is OPEN for the milestone/vault.

Cooling-off window (default 72h) must elapse after rejection before refund becomes available.

Bad-faith rejection pattern (clawback intent without objective failure) triggers an automated freeze (Vault.status = PAUSED) for manual review.

7.10 Dispute Resolution

Dispute opens → vault.status = DISPUTED (and/or milestone.status = DISPUTED).

System bundles evidence:

requirements snapshot

submission hashes

audit output

evidence messages

chain/provider events

Human advisor resolves outcome:

release / refund / split / allow resubmission / dismiss

Backend applies outcome via money actions; ledger finalizes only after confirmation.

Vault may return to FUNDED or proceed toward CLOSED based on settlement.

8. AI Audit Implementation (Objective Only)
   Layer 1: Deterministic Rules Engine (Mandatory)

File type checks

Required file presence

Naming conventions

Size limits

Image resolution

PDF page count

ZIP content listing

Link reachability (HTTP 200)

Schema validation (for API outputs)

Layer 2: Lightweight ML (Optional)

Placeholder detection

Risk scoring for HUMAN_REVIEW routing

Layer 3: Human Overrides as Training Data

Advisor overrides → labeled examples

Improves rule library + reason codes

Rule:

All outputs must reference reqIds:

Example: FAIL because req_03 “Repo must contain README.md” is missing.

9. Build Order (Phased)
   Phase 1: Backend Spine (No Chain)

Auth + roles

Vault + milestone CRUD

State machine guards

Submissions + hashing + evidence events

Deterministic verification engine (mock)

Ledger/journal skeleton

Disputes + eligibility gating

Dispute UI timeline

Goal: full flow simulation with mock money actions.

Phase 2: Wallet + Escrow (Testnet)

Wallet abstraction integration

Minimal escrow contract

Chain event listener (confirmation-gated + dedupe)

Reconciliation jobs

Pause/refund flows

Goal: proof of funds + releases.

Phase 3: Ramp Integration

Deposit sessions + webhooks

Withdraw flows

Ramp/chain reconciliation + manual review lane

Goal: full Web2 deposit/withdraw UX.

Phase 4: AI Audit Expansion

More deterministic checks

Metadata extractors

Human review dashboard

Re-audit snapshots attached to disputes

Goal: fewer disputes, higher confidence.

10. Failure Modes (What Breaks First)

Expected failure points:

Idempotency bugs → double releases

Webhook duplication → double crediting

Chain confirmation assumptions → false success

Reorg/duplicate logs → incorrect posting

Vague requirements → disputes explode

Free-text disputes → becomes Upwork

Missing snapshotting → “approved submission changed later”

Therefore enforce:

Idempotency keys + dedupe everywhere

Confirmation thresholds before posting money

Non-custodial keys only (no keys in DB, logs, env vars)

Requirement builder with reqIds + schema version

Requirements + submission snapshot binding to reviews/releases

Structured disputes only

Freeze to PAUSED on mismatches

11. Minimal Diagram (Mental Model)

Frontend
→ Backend API (state machine + evidence + money actions + ledger + disputes)
→ Queue (audit + re-audit jobs)
→ AI Audit Service (objective checks + reason codes)
→ Wallet Provider (signing / sessions)
→ Escrow Contract (moves funds)
→ Chain Listener (updates DB)
→ Ramp Provider (fiat in/out)
→ Reconciler (truth alignment + auto-pause)
