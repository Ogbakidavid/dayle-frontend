Dayle System Design Architecture
0) Product Rules the Architecture Must Enforce
These are hard constraints. If we break them, the product becomes Upwork + crypto confusion.
Core Truths
Vault is the source of truth for payment intent (off-chain record + on-chain escrow state).


Money moves only on allowed state transitions (no freeform payouts).


AI never judges taste. AI verifies objective compliance only.


AI never releases funds. AI can only produce an audit result.


Client approval is always required to move money.
 Even if AI audit passes, the client must explicitly approve release.


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


Client approves / requests changes / rejects


Only approve triggers money release


Milestones are not split into “Compliance vs Approval milestones.”
 They are one milestone with:
Deliverable requirements


Submission


AI audit result


Client decision



1) High-Level Architecture (Services + Responsibilities)
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


Approve (release funds)


Request changes


Reject (with reason codes)


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



C. Custody Layer (Wallets & Signing)
Because Dayle uses custodial wallets (abstracted away from users):
generates wallet addresses at signup


signs on-chain transactions for:


funding escrow


releasing milestone payouts


refunds/cancellations


stores keys in KMS / MPC / custody provider (never DB)


exposes signing as a secure internal service



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


AI does not release funds.


Client always approves payout.


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



2) Data Model (Core Entities)
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


address


keyRef (pointer to custody/KMS)


chain


createdAt



Vaults
id (UUID)


clientId


freelancerId (nullable)


totalAmount


status:


DRAFT


AWAITING_FUNDING


INVITED


FUNDED_UNASSIGNED


FUNDED_ASSIGNED


ACTIVE


IN_REVIEW


COMPLETED


CANCELLED


PAUSED


escrowRef (vaultId used in contract mapping)


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


deliverableTypeId (e.g. github_repo, figma_link)


deliverableMode: LINK | FILE


auditEnabled: boolean


requirementItemsJson: array of structured requirement items:


{ reqId, label, type, field, operator, expectedValue, required }


createdAt



Submissions
id


milestoneId


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



Ledger Entries (Double-Entry)
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



Evidence (Communication)
All evidence is structured, no chat room chaos.
id


vaultId


milestoneId (optional)


type:


CLARIFICATION_REQUEST


REQUIREMENT_CONFIRMATION


FILE_COMMENT


DISPUTE_NOTE


DISPUTE_OPENED


DISPUTE_EVIDENCE


DISPUTE_DECISION


payloadJson


immutableAfterSubmission: true


createdAt



Reputation
freelancerId


confidenceScore


completedVaultCycles


onTimeRate


disputeRate


lastActiveAt



3) Sync Strategy (Truth Reconciliation)
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



4) Workflows (End-to-End)
Workflow A: Signup → Wallet Created
user signs up (role chosen)


backend creates user record


backend calls custody service:


generate wallet address + keyRef


store wallet address + keyRef


user sees dashboard with $0


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


custody signs tx fundVault(vaultId)


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


FAIL → milestone moves to REJECTED + reasons


FLAGGED/HUMAN_REVIEW → milestone moves to AWAITING_APPROVAL but marked “Needs extra review”


Important:
AI audit never releases funds.



Workflow F: Client Review → Release Payment
Client sees:
freelancer submission


AI audit summary + reason codes


Client actions:
APPROVE → milestone status VERIFIED → backend releases payout


REQUEST_CHANGES → milestone status REVISION_REQUESTED → freelancer resubmits


REJECT → milestone status REJECTED (structured reason codes required)


Release flow:
backend creates ledger RELEASE PENDING


custody signs tx releaseMilestone(vaultId, milestoneId)


chain emits MilestoneReleased


backend confirms:


RELEASE CONFIRMED


freelancer balance increases


vault becomes COMPLETED if all milestones VERIFIED



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



5) AI Implementation (Objective Verification Only)
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



6) Build Order (One-by-One)
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

7) What Will Break First
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



8) Minimal Diagram (Mental Model)
Frontend
 → Backend API (state machine + ledger + disputes)
 → Queue (audit + re-audit jobs)
 → AI Audit Service (objective checks + reason codes)
 → Custody Service (sign tx)
 → Escrow Contract (moves funds)
 → Chain Listener (updates DB)
 → Ramp Provider (fiat in/out)
 → Reconciler (truth alignment)


