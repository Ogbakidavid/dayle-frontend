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
  AWAITING_FUNDING: "AWAITING_FUNDING",
  INVITED: "INVITED",
  FUNDED_UNASSIGNED: "FUNDED_UNASSIGNED",
  FUNDED_ASSIGNED: "FUNDED_ASSIGNED",
  ACTIVE: "ACTIVE",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PAUSED: "PAUSED",
} as const;

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
} as const;

// ============================================================================
// VERIFICATION RESULT (AI Compliance)
// ============================================================================

export const VerificationResult = {
  PASS: "PASS",
  FAIL: "FAIL",
  FLAGGED: "FLAGGED",
  HUMAN_REVIEW: "HUMAN_REVIEW",
} as const;

// ============================================================================
// MILESTONE REVIEW OUTCOME (Client Decision)
// ============================================================================

export const MilestoneReviewOutcome = {
  APPROVE: "APPROVE",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  REJECT: "REJECT",
} as const;

// ============================================================================
// DISPUTE STATUS
// ============================================================================

export const DisputeStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  NEEDS_INFO: "NEEDS_INFO",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;

// ============================================================================
// TRANSACTION STATUS (Canonical: use CONFIRMED not COMPLETED)
// ============================================================================

export const TransactionStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
} as const;

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
} as const;

// ============================================================================
// INVITE STATUS
// ============================================================================

export const InviteStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
} as const;
