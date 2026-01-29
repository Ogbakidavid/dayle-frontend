Dayle System Design Architecture 0) Product Rules the Architecture Must Enforce
These are hard constraints. If we break them, the product becomes Upwork + crypto confusion.
Core Truths
Vault is the source of truth for payment intent (off-chain record + on-chain escrow state).

Money moves only on allowed state transitions (no freeform payouts).

AI never judges taste. AI verifies objective compliance only.

AI never releases funds. AI can only produce an audit result.

Client approval is always required to verify work.

Even if AI audit passes, the client must explicitly approve the milestone before funds can be released.

Review ≠ Release: Payout is an explicit, separate action taken AFTER approval.

Communication is evidence, tied to milestones/submissions, not chat rooms.

Blockchain is invisible in UX: UI shows USD balances and processing states, never chain terms.

Custodial wallets are real custody: keys must not live in your DB.

Disputes are eligibility-gated: disputes only exist if tied to a specific milestone + requirement item or structured fraud/process/security reason codes.

Creative work is supported: client can reject work for subjective reasons, but rejection is structured and does not automatically create a dispute.

Milestone Philosophy (Canonical)
Each milestone represents a deliverable and has one lifecycle:
Freelancer submits deliverable (file/link)

System runs objective AI audit (optional but recommended)

Client reviews submission + audit results

33. Client approves / requests changes / rejects
34. Payout (Release): Explicit money-moving action taken after approval
35. Approval records client intent; Release moves the money.

Only approve triggers money release

Milestones are not split into “Compliance vs Approval milestones.”
They are one milestone with:
Deliverable requirements

Submission

AI audit result

Client decision

1. High-Level Architecture (Services + Responsibilities)
   A. Frontend (Web2 UX)
   What the frontend does:
   Auth (email/password)

Client dashboard + freelancer dashboard

Vault creation & milestone definition

Submission upload UI (files + links)

AI audit results UI (PASS / FAIL / FLAGGED)

Evidence channel (structured Q&A + file comments)

Ledger + reputation snapshot

“Add funds” / “Withdraw” via ramp embedded checkout UI

Dispute initiation UI (milestone-scoped; reason-code based)

Dispute case view (timeline + evidence bundle + status)

Client review screen:

- Approve (Mark as VERIFIED)
- Release (Explicit money-moving action)
- Request changes
- Reject (with reason codes)

Frontend MUST NEVER:
show wallets, tokens, gas, chain names, hashes

B. Backend API (Core System of Record)
This is the brain (truth layer). It holds:
users, roles, approval status

vaults, milestones, submissions

verification/audit results + reason codes

ledger entries (double-entry)

dispute cases + eligibility gating

orchestration to chain + ramp

Backend must be:
state machine + reconciler

idempotent for money-moving actions

audit-trail complete for evidence and disputes

C. Wallet Abstraction Layer (Non-Custodial AA)
Instead of managing keys, Dayle uses an embedded wallet provider (Privy/Web3Auth) for Account Abstraction (AA):

- **User Ownership**: Keys are generated and stored by the provider (securely enclave-bound or social-shard based). Dayle NEVER sees seed phrases or private keys.
- **Smart Accounts**: Users interact with the chain through an AA Smart Account (ERC-4337 or similar).
- **Relayer/Paymaster**: Backend facilitates gasless transactions by sponsoring gas fees, maintaining the "Invisible Blockchain" UX.
- **Transaction Initiation**: Backend initiates money actions; User signs via Provider UI (or sessions) to authorize.

D. Smart Contract Escrow (On-chain)
Minimal escrow contract:
holds stablecoin funds

maps vaultId → escrow state

allows:

fundVault(vaultId)

releaseMilestone(vaultId, milestoneId)

refundVault(vaultId)

pauseVault(vaultId) (optional)

Contract emits events:
VaultFunded

MilestoneReleased

VaultRefunded

VaultPaused

Contract is tiny:
no AI

no files

no disputes logic

E. Ramp Provider (Fiat On/Off-ramp)
Deposit:
fiat → stablecoin → user custodial wallet

Withdraw:
stablecoin from custodial wallet → fiat → bank/card

Backend integrates:
checkout session creation

webhook handlers (status updates)

reconciliation with chain deposits/withdrawals

F. AI Audit Service (Objective Verification Only)
A separate service/module initially.
It performs objective checks only:
link validity

file presence

file type/size

metadata extraction

formatting validation

zip integrity scan

basic “not empty” detection

AI audit outputs:
PASS / FAIL / FLAGGED / HUMAN_REVIEW

structured reason codes

rule-level results

Important:
Audit is advisory.

AI does not release funds. 193. Client always approves work before release.

Human Advisor review (early MVP):
can override audit and label outcome (training data)

G. Storage
Database: PostgreSQL (ACID + transactions)

Object storage: S3/R2 for deliverable files

Queue: BullMQ/Redis (or SQS later) for async jobs

Cache (optional): Redis

H. Observability & Security
request + event logs

metrics: failures, reconciliation mismatches, dispute rates

audit trails: every action tied to actor + timestamp

rate limits + fraud rules

idempotency keys for money actions

2. Data Model (Core Entities)
   Users
   id

email

role: CLIENT | FREELANCER | ADMIN

status: ACTIVE | PENDING_APPROVAL | SUSPENDED

kycStatus: NONE | PENDING | VERIFIED | REJECTED

createdAt

Wallets
id
userId
provider (PRIVY | WEB3AUTH)
providerUserId (unique identifier from provider)
address (public wallet address)
chainId (target network)
status (ACTIVE | SUSPENDED)
createdAt
updatedAt

createdAt

Vaults
id (UUID)

clientId

freelancerId (nullable)

totalAmount

status:

- DRAFT
- AWAITING_FUNDING
- INVITED
- FUNDED_UNASSIGNED
- FUNDED_ASSIGNED
- ACTIVE
- IN_REVIEW
- COMPLETED
- CANCELLED
- DISPUTED
- PAUSED

> [!NOTE]
> These statuses are directly exposed by the API to the frontend. Internally, some may be derived from the combination of vault state and presence of linked records (e.g., `INVITED`), but they must be returned as explicit enum values in API responses.

lastTransitionAt

lastTransitionBy (userId or SYSTEM)

lastTransitionReason

escrowRef (vaultId used in contract mapping)

internalMetadata (admin-only, contains chain data)

createdAt

Milestones
id

vaultId

title

amount

dueDate

status:

PENDING

SUBMITTED

AWAITING_APPROVAL

VERIFIED

REVISION_REQUESTED

REJECTED

DISPUTED

auditStatus (AI advisory only):

PENDING

IN_PROGRESS

PASS

FAIL

FLAGGED

HUMAN_REVIEW

SKIPPED

deliverableTypeId (e.g. github_repo, figma_link)

deliverableMode: LINK | FILE

auditEnabled: boolean

requirementItemsJson: array of structured requirement items:

{ reqId, label, type, field, operator, expectedValue, required }

createdAt

Client can approve milestone even if auditStatus = FAIL (with warning).

### Determining "Paid" vs "Approved" in UI

The UI distinguishes between work that is approved by the client and work that has successfully moved funds:

- **Approved (Work Verified)**
  - Milestone `status === "VERIFIED"`
  - `payoutStatus` is `PENDING`, `FAILED`, or `null`
  - UI displays: "Approved" (and "Processing Payout" if PENDING)

- **Paid (Funds Released)**
  - Milestone `status === "VERIFIED"`
  - `payoutStatus === "CONFIRMED"`
  - UI displays: "Paid" or "Released"

This separation allows the system to remain idempotent and resilient to chain delays or failures while providing immediate feedback on work verification.

Submissions
id

submittedByUserId

notes

submittedAt

filesJson: [{ url, hash, type, size, metadata }]

linksJson: [{ url, label, metadata }]

Verifications (AI Audit Results)
id

submissionId

result: PASS | FAIL | FLAGGED | HUMAN_REVIEW

confidenceScore (optional)

ruleResultsJson: [{ code, passed, message, field }]

reviewedBy: AI | HUMAN

createdAt

Milestone Reviews (Client Decision)
id

milestoneId

reviewerUserId (client)

outcome: APPROVE | REQUEST_CHANGES | REJECT

reasonCodes: array of enums (required if REQUEST_CHANGES or REJECT)

notes (optional)

createdAt

Disputes (Case Files)
Eligibility-gated. Only exists when tied to milestone + requirement or structured reason code.
id

vaultId

milestoneId

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

requirementRef (reqId optional but required for requirement-based disputes)

status: OPEN | UNDER_REVIEW | NEEDS_INFO | RESOLVED | REJECTED

outcome (set when resolved):

RELEASE_TO_FREELANCER

REFUND_TO_CLIENT

SPLIT_PAYMENT

ALLOW_RESUBMISSION

ESCALATE

DISMISS

outcomeReason (required when resolved)

splitPercentage (1-99, required if outcome = SPLIT_PAYMENT)

resolvedBy (admin userId)

createdAt

resolvedAt

Dispute Events
id

disputeId

actorUserId (or SYSTEM/ADVISOR)

actorRole (optional)

eventType:

OPENED

EVIDENCE_ADDED

AI_REAUDIT

ADVISOR_DECISION

CLIENT_RESPONSE

FREELANCER_RESPONSE

RESOLVED
payloadJson (notes, attachments, decisions)

createdAt

Accounts (Chart of Accounts)
id

code (e.g., "1000", "2000.u_client_1")

name

type: ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE

normalBalance: DEBIT | CREDIT

userId (nullable, for user sub-accounts)

vaultId (nullable, for vault escrow accounts)

balance (cached)

createdAt

Standard Accounts:
1000 - Cash (Ramp) - ASSET
1100 - Cash (Chain) - ASSET
1200.{vaultId} - Escrow (Vaults) - ASSET
2000.{userId} - Client Deposits - LIABILITY
2100.{userId} - Freelancer Earnings - LIABILITY
3000 - Platform Equity - EQUITY
4000 - Fee Revenue - REVENUE
5000 - Ramp Fees - EXPENSE
5100 - Gas Fees - EXPENSE

Journal Entries (True Double-Entry)
id

entryNumber (sequential)

entryDate

description

vaultId (nullable)

milestoneId (nullable)

userId (nullable)

providerRef (rampTxId or chainTxHash)

idempotencyKey

status: PENDING | POSTED | REVERSED

postedAt

postedBy (userId or SYSTEM)

chainMetadata (admin-only, contains tx details)

createdAt

Journal Entry Lines
id

journalEntryId

lineNumber

accountId

debit (nullable, mutually exclusive with credit)

credit (nullable, mutually exclusive with credit)

memo

Constraint: Every journal entry must balance (SUM(debits) = SUM(credits))

Posting Rules Examples:

1. Client Deposit: DR Cash-Ramp, CR Client Deposits
2. Lock Escrow: DR Escrow-Vault, CR Client Deposits + Chain TX
3. Release Milestone: DR Freelancer Earnings + DR Fee Revenue, CR Escrow-Vault + Chain TX
4. Freelancer Withdrawal: DR Cash-Ramp + DR Ramp Fees, CR Freelancer Earnings
5. Refund Vault: DR Client Deposits, CR Escrow-Vault + Chain TX

Reconciliation Rules:

- Daily: Verify all journal entries balance
- Daily: Verify account balances = sum of posted lines
- Daily: Verify chain escrow balances match DB escrow accounts
- On mismatch: Auto-freeze affected vault/user

Ledger Entries (View - Backward Compatibility)
id

userId

vaultId (nullable)

type:

DEPOSIT

LOCK

RELEASE

REFUND

WITHDRAW

FEE

amount

currency: USD

status: PENDING | CONFIRMED | FAILED

providerRef (rampTxId or chainTxHash)

disputeId (optional)

createdAt

Submissions (Immutable)
id

milestoneId

submittedBy

submittedAt

notes

filesJson

url

contentHash (SHA256 of submission content)

hashAlgorithm (default: SHA256)

immutableAt

immutableBy

Constraint: Submissions cannot be updated after creation (trigger prevents updates)

Evidence Events (Append-Only Legal Record)
All evidence is structured, append-only event log. No updates or deletes allowed.
Communication (Messages) are stored here as evidence.

id

eventNumber (sequential)

vaultId

milestoneId (optional)

disputeId (optional)

eventType:

SUBMISSION_CREATED

VERIFICATION_COMPLETED

REVIEW_SUBMITTED

MESSAGE_SENT (Generic communication)

MESSAGE_EDITED (References previous event)

DISPUTE_OPENED

DISPUTE_EVIDENCE_ADDED

DISPUTE_RESOLVED

MILESTONE_STATUS_CHANGED

VAULT_FUNDED

VAULT_STATUS_CHANGED

actorUserId

actorRole

payloadJson:
content: string (for messages)
supersedesEventId: string (optional, for MESSAGE_EDITED)
filesJson: string (optional)

contentHash (SHA256 of payload for tamper detection)

createdAt

Constraint: Evidence events are append-only (triggers prevent updates and deletes). To "edit" a message, a new MESSAGE_EDITED event must be appended. UI displays the latest event in a thread but must allow viewing the full history.

Communication Threading
Communication is tied to either a Vault or a Milestone.
All messages are Evidence Events.
Querying: Clients should query Evidence Events by vaultId/milestoneId and filter for MESSAGE\_\* types.
If an event has `payload.supersedesEventId`, it replaces the referenced event in the primary view.
Historical Integrity: The original event remains in the log and cannot be changed.

Reputation
freelancerId

confidenceScore

completedVaultCycles

onTimeRate

disputeRate

lastActiveAt

Invites
id

token (unique invite token)

vaultId

email (invited freelancer email)

status:

PENDING

ACCEPTED

DECLINED

EXPIRED

invitedAt

expiresAt

respondedAt (nullable)

declineReason (nullable)

3. Sync Strategy (Truth Reconciliation)
   You have 3 truth sources:
   DB state (internal belief)

Chain state (actual money events)

Ramp state (fiat lifecycle)

Golden Rule
DB never assumes money moved.
DB finalizes balances only after:
chain event confirmed OR

ramp webhook confirmed (plus chain proof where needed)

Required mechanisms
idempotency keys on all money operations

event listener for contract events

webhook handler for ramp events

scheduled reconciliation jobs:

chain balances vs internal balances

vault escrow states vs DB states

Mismatch rule:
if reconciliation finds mismatch → auto-freeze affected vault/user

4. Workflows (End-to-End)
   Workflow A: Signup → Wallet Associated
   User signs up via email/social through the Provider (Privy/Web3Auth).

Backend receives:

- providerUserId
- publicAddress

Backend creates user record and associates the Non-Custodial Wallet.
status = ACTIVE

Freelancer gating:
status = PENDING_APPROVAL until reviewed

once approved → ACTIVE

Workflow B: Client Deposit (Ramp)
client clicks “Add funds”

backend creates ramp checkout session:

amount + destinationAddress = client wallet

ramp processes fiat payment

webhook: deposit initiated

stablecoins arrive on-chain to client wallet

chain listener detects incoming transfer

backend ledger:

DEPOSIT PENDING → CONFIRMED

UI shows processing → available

Workflow C: Create Vault → Fund Escrow
client creates vault + milestones (DB)

vault status = AWAITING_FUNDING / DRAFT depending on UX stage

client funds vault

backend checks:

client balance >= totalAmount

freelancer is ACTIVE (if assigned)

backend creates ledger LOCK PENDING

backend initiates deposit session via ramp/provider

client approves transaction via Provider UI (if required)

chain emits VaultFunded

listener confirms:

LOCK CONFIRMED

vault status = FUNDED_ASSIGNED or FUNDED_UNASSIGNED

Workflow D: Freelancer Submit Deliverable
freelancer uploads file(s) or posts link(s)

backend creates Submission + hashes

milestone status = SUBMITTED

verification job queued

Workflow E: AI Audit (Objective Only)
AI audit runs deterministic checks based on requirementItemsJson.
Outputs:
PASS → milestone moves to AWAITING_APPROVAL

FAIL → milestone moves to AWAITING_APPROVAL (AI is advisory, does not block)

FLAGGED/HUMAN_REVIEW → milestone moves to AWAITING_APPROVAL but marked “Needs extra review”

Important:
AI audit never releases funds.

AI audit never decides milestone outcome (FAIL is advisory only).

Workflow F: Client Review → Release Payment
Client sees:
freelancer submission

AI audit summary + reason codes

Client actions:
APPROVE → milestone status VERIFIED (Marked as approved; eligible for explicit release action)

REQUEST_CHANGES → milestone status REVISION_REQUESTED → freelancer resubmits

REJECT → milestone status REJECTED (structured reason codes required)

Important: Client can APPROVE even if auditStatus = FAIL
System shows warning but does not block approval
Client must acknowledge warning: acknowledgeAuditWarning = true

Release flow:
backend creates ledger RELEASE PENDING

backend initiates Release request via Provider SDK (using paymaster for gas)

Backend verifies request matches verified milestone status

chain emits MilestoneReleased

backend confirms:

RELEASE CONFIRMED

freelancer balance increases

vault becomes COMPLETED if all milestones are VERIFIED

Workflow G: Freelancer Withdraw (Ramp)
freelancer clicks withdraw

backend checks:

KYC status (if required)

velocity limits

available balance

backend initiates off-ramp session

ledger WITHDRAW PENDING → CONFIRMED after webhook

UI shows “Sent to bank”

Workflow H: Dispute Opening (Eligibility-Gated)
Dispute creation requires:
vaultId + milestoneId

disputeType

reasonCode

requirementRef reqId if requirement-based

Eligibility rules:
disputes are NOT “I don’t like it”

disputes exist only for:

VERIFICATION_ERROR

REQUIREMENT_MISMATCH

SCOPE_CHANGE

BAD_FAITH

FRAUD

PROCESS_BREACH

SECURITY

Workflow I: Dispute Resolution
dispute opens → milestone/vault becomes DISPUTED/PAUSED

system bundles evidence:

requirements

submission hashes

audit output

evidence messages

chain events

AI re-audit snapshot attaches to case

human advisor resolves outcome

backend applies outcome:

release funds / hold / refund vault / allow resubmission

ledger finalized only after chain confirmation

5. AI Implementation (Objective Verification Only)
   Layer 1: Deterministic Rules Engine (mandatory)
   file type checks

required file presence

naming conventions

size limits

image resolution

pdf page count

zip content listing

link reachability (200 OK)

schema response validation for APIs

Layer 2: Lightweight ML (optional)
anomaly detection (“empty placeholder”)

risk scoring for HUMAN_REVIEW routing

Layer 3: Human overrides become training data
advisor overrides become labeled examples

improves rule library + reason codes

Output must always reference requirement IDs:
Example:
FAIL because req_03 “Repo must contain README.md” is missing.

6. Build Order (One-by-One)
   Phase 1: Backend spine (no chain yet)
   auth + roles

vault + milestone CRUD

state machine guards

submissions

deterministic verification engine (mock PASS/FAIL)

ledger entries (internal)

disputes + eligibility gating

dispute UI timeline

Goal: simulate full flow with mock money.
Phase 2: Custody + escrow (testnet)
custody abstraction

minimal escrow contract

chain event listener

reconciliation jobs

pause/refund flows

Goal: real proof of funds + releases.
Phase 3: Ramp integration
deposit sessions + webhooks

withdraw flows

ramp/chain reconciliation

Goal: full Web2 deposit/withdraw UX.
Phase 4: AI audit expansion
more deterministic checks

metadata extractors

human review dashboard

re-audit snapshots

Goal: lower disputes, higher confidence.

7. What Will Break First
   Prepare for these failure modes:
   idempotency bugs → double releases

webhook duplication → double crediting

chain confirmations → false success

key management mistakes → catastrophic custody risk

vague requirements → disputes explode

free-text disputes → becomes Upwork

So you must enforce:
idempotency keys

event dedupe

confirmation thresholds

custody keyRef only

requirement builder with reqIds

8. Minimal Diagram (Mental Model)
   Frontend
   → Backend API (state machine + ledger + disputes)
   → Queue (audit + re-audit jobs)
   → AI Audit Service (objective checks + reason codes)
   → Custody Service (sign tx)
   → Escrow Contract (moves funds)
   → Chain Listener (updates DB)
   → Ramp Provider (fiat in/out)
   → Reconciler (truth alignment)
