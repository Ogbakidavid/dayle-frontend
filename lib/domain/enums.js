/**
 * Canonical Domain Enums
 * 
 * This module defines all status enums used throughout the application.
 * These are the single source of truth for state values.
 * 
 * Reference: Dayle System Design Architecture
 * 
 * CRITICAL: These enums define the frontend-backend contract.
 * Any changes must be coordinated with backend team.
 */

// ============================================================================
// VAULT STATUS
// ============================================================================

export const VaultStatus = {
  DRAFT: "DRAFT",
  FUNDED: "FUNDED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PAUSED: "PAUSED",
  DISPUTED: "DISPUTED",
};

// ============================================================================
// MILESTONE STATUS
// ============================================================================

export const MilestoneStatus = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  AWAITING_APPROVAL: "AWAITING_APPROVAL",
  VERIFIED: "VERIFIED",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  REJECTED: "REJECTED",
  DISPUTED: "DISPUTED",
};

// ============================================================================
// VERIFICATION RESULT (AI Compliance)
// ============================================================================

export const VerificationResult = {
  PASS: "PASS",
  FAIL: "FAIL",
  FLAGGED: "FLAGGED",
  HUMAN_REVIEW: "HUMAN_REVIEW",
};

// ============================================================================
// MILESTONE REVIEW OUTCOME (Client Decision)
// ============================================================================

export const MilestoneReviewOutcome = {
  APPROVE: "APPROVE",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  REJECT: "REJECT",
};

// ============================================================================
// DISPUTE STATUS
// ============================================================================

export const DisputeStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  NEEDS_INFO: "NEEDS_INFO",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

// ============================================================================
// TRANSACTION STATUS (Canonical: use CONFIRMED not COMPLETED)
// ============================================================================

export const TransactionStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
};

// ============================================================================
// LEDGER ENTRY STATUS (Alias for TransactionStatus)
// ============================================================================

export const LedgerEntryStatus = TransactionStatus;

// ============================================================================
// USER ROLE
// ============================================================================

export const UserRole = {
  NONE: "NONE",        // Unauthenticated/onboarding placeholder only
  CLIENT: "CLIENT",
  FREELANCER: "FREELANCER",
  ADMIN: "ADMIN",
};

export const UserStatus = {
  ACTIVE: "ACTIVE",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  SUSPENDED: "SUSPENDED",
};

// ============================================================================
// INVITE STATUS
// ============================================================================

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
};

// ============================================================================
// KYC STATUS
// ============================================================================

export const KycStatus = {
  NONE: "NONE",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
};

// ============================================================================
// DISPUTE TYPE
// ============================================================================

export const DisputeType = {
  VERIFICATION_ERROR: "VERIFICATION_ERROR",
  REQUIREMENT_MISMATCH: "REQUIREMENT_MISMATCH",
  SCOPE_CHANGE: "SCOPE_CHANGE",
  BAD_FAITH: "BAD_FAITH",
  FRAUD: "FRAUD",
  PROCESS_BREACH: "PROCESS_BREACH",
  SECURITY: "SECURITY",
};

// ============================================================================
// LEDGER ENTRY TYPE
// ============================================================================

export const LedgerEntryType = {
  DEPOSIT: "DEPOSIT",
  LOCK: "LOCK",
  RELEASE: "RELEASE",
  REFUND: "REFUND",
  WITHDRAW: "WITHDRAW",
  FEE: "FEE",
};
// ============================================================================
// EVIDENCE TYPE (Append-only communication & events)
// ============================================================================

export const EvidenceType = {
  // Submission & Verification
  SUBMISSION_CREATED: "SUBMISSION_CREATED",
  VERIFICATION_COMPLETED: "VERIFICATION_COMPLETED",
  REVIEW_SUBMITTED: "REVIEW_SUBMITTED",
  
  // Communication
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_EDITED: "MESSAGE_EDITED",
  CLARIFICATION_REQUEST: "CLARIFICATION_REQUEST",
  REQUIREMENT_CONFIRMATION: "REQUIREMENT_CONFIRMATION",
  FILE_COMMENT: "FILE_COMMENT",
  
  // Disputes
  DISPUTE_OPENED: "DISPUTE_OPENED",
  DISPUTE_EVIDENCE_ADDED: "DISPUTE_EVIDENCE_ADDED",
  DISPUTE_RESOLVED: "DISPUTE_RESOLVED",
  DISPUTE_NOTE: "DISPUTE_NOTE",
  DISPUTE_EVIDENCE: "DISPUTE_EVIDENCE",
  DISPUTE_DECISION: "DISPUTE_DECISION",
  
  // Vault & Milestone Lifecycle
  MILESTONE_STATUS_CHANGED: "MILESTONE_STATUS_CHANGED",
  VAULT_FUNDED: "VAULT_FUNDED",
  VAULT_STATUS_CHANGED: "VAULT_STATUS_CHANGED",
};
