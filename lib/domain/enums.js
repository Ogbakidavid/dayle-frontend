/**
 * Canonical Domain Enums
 * 
 * This module defines all status enums used throughout the application.
 * These are the single source of truth for state values.
 * 
 * Reference: CANONICAL_SPEC.md
 */

// ============================================================================
// VAULT STATUS
// ============================================================================

export const VaultStatus = {
  DRAFT: "DRAFT",
  AWAITING_FUNDING: "AWAITING_FUNDING",
  FUNDED_UNASSIGNED: "FUNDED_UNASSIGNED",
  INVITED: "INVITED",
  FUNDED_ASSIGNED: "FUNDED_ASSIGNED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
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
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
};

// ============================================================================
// DISPUTE STATUS
// ============================================================================

export const DisputeStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
};

// ============================================================================
// LEDGER ENTRY STATUS
// ============================================================================

export const LedgerEntryStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
};

// ============================================================================
// TRANSACTION STATUS
// ============================================================================

export const TransactionStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

// ============================================================================
// USER ROLE
// ============================================================================

export const UserRole = {
  CLIENT: "CLIENT",
  FREELANCER: "FREELANCER",
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
