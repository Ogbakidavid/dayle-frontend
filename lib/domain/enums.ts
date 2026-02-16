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

export enum VaultStatus {
  DRAFT = "DRAFT",
  AWAITING_FUNDING = "AWAITING_FUNDING",
  FUNDED = "FUNDED",
  PAUSED = "PAUSED",
  DISPUTED = "DISPUTED",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED",
}

// ============================================================================
// MILESTONE STATUS
// ============================================================================

export enum MilestoneStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  VERIFIED = "VERIFIED",
  REVISION_REQUESTED = "REVISION_REQUESTED",
  REJECTED = "REJECTED",
  DISPUTED = "DISPUTED",
}

// ============================================================================
// RELEASE STATUS (Money Action Status)
// ============================================================================

export enum ReleaseStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING_SIGNATURE = "PENDING_SIGNATURE",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

// ============================================================================
// VERIFICATION RESULT (AI Compliance)
// ============================================================================

export enum VerificationResult {
  PASS = "PASS",
  FAIL = "FAIL",
  FLAGGED = "FLAGGED",
  HUMAN_REVIEW = "HUMAN_REVIEW",
}

// ============================================================================
// MILESTONE REVIEW OUTCOME (Client Decision)
// ============================================================================

export enum MilestoneReviewOutcome {
  APPROVE = "APPROVE",
  REQUEST_CHANGES = "REQUEST_CHANGES",
  REJECT = "REJECT",
}

// ============================================================================
// DISPUTE STATUS
// ============================================================================

export enum DisputeStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  NEEDS_INFO = "NEEDS_INFO",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

// ============================================================================
// TRANSACTION STATUS (Generic Transaction Rows)
// ============================================================================

export enum TransactionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
}

// ============================================================================
// LEDGER ENTRY STATUS (Alias for TransactionStatus)
// ============================================================================

export const LedgerEntryStatus = TransactionStatus;
export type LedgerEntryStatus = TransactionStatus;

// ============================================================================
// USER ROLE
// ============================================================================

export enum UserRole {
  NONE = "NONE",        // Unauthenticated/onboarding placeholder only
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  SUSPENDED = "SUSPENDED",
}

// ============================================================================
// INVITE STATUS
// ============================================================================

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

// ============================================================================
// KYC STATUS
// ============================================================================

export enum KycStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

// ============================================================================
// DISPUTE TYPE
// ============================================================================

export enum DisputeType {
  VERIFICATION_ERROR = "VERIFICATION_ERROR",
  REQUIREMENT_MISMATCH = "REQUIREMENT_MISMATCH",
  SCOPE_CHANGE = "SCOPE_CHANGE",
  BAD_FAITH = "BAD_FAITH",
  FRAUD = "FRAUD",
  PROCESS_BREACH = "PROCESS_BREACH",
  SECURITY = "SECURITY",
}

// ============================================================================
// LEDGER ENTRY TYPE
// ============================================================================

export enum LedgerEntryType {
  DEPOSIT = "DEPOSIT",
  LOCK = "LOCK",
  RELEASE = "RELEASE",
  REFUND = "REFUND",
  WITHDRAW = "WITHDRAW",
  FEE = "FEE",
}
// ============================================================================
// EVIDENCE TYPE (Append-only communication & events)
// ============================================================================

export enum EvidenceType {
  // Submission & Verification
  SUBMISSION_CREATED = "SUBMISSION_CREATED",
  VERIFICATION_COMPLETED = "VERIFICATION_COMPLETED",
  REVIEW_SUBMITTED = "REVIEW_SUBMITTED",
  REQUIREMENTS_SNAPSHOTTED = "REQUIREMENTS_SNAPSHOTTED",
  
  // Money Actions
  RELEASE_INITIATED = "RELEASE_INITIATED",
  RELEASE_CONFIRMED = "RELEASE_CONFIRMED",
  REFUND_INITIATED = "REFUND_INITIATED",
  REFUND_CONFIRMED = "REFUND_CONFIRMED",
 
  // Communication
  MESSAGE_SENT = "MESSAGE_SENT",
  MESSAGE_EDITED = "MESSAGE_EDITED",
  CLARIFICATION_REQUEST = "CLARIFICATION_REQUEST",
  REQUIREMENT_CONFIRMATION = "REQUIREMENT_CONFIRMATION",
  FILE_COMMENT = "FILE_COMMENT",
  
  // Disputes
  DISPUTE_OPENED = "DISPUTE_OPENED",
  DISPUTE_EVIDENCE_ADDED = "DISPUTE_EVIDENCE_ADDED",
  DISPUTE_RESOLVED = "DISPUTE_RESOLVED",
  DISPUTE_NOTE = "DISPUTE_NOTE",
  DISPUTE_EVIDENCE = "DISPUTE_EVIDENCE",
  DISPUTE_DECISION = "DISPUTE_DECISION",
  
  // Vault & Milestone Lifecycle
  MILESTONE_STATUS_CHANGED = "MILESTONE_STATUS_CHANGED",
  VAULT_FUNDED = "VAULT_FUNDED",
  VAULT_STATUS_CHANGED = "VAULT_STATUS_CHANGED",
  VAULT_PAUSED = "VAULT_PAUSED",
}

// Helper for derived UI labels (Invisible Blockchain)
export const getVaultDerivedLabel = (status: string | undefined): string => {
  switch (status?.toUpperCase()) {
    case VaultStatus.DRAFT:
      return "DRAFT";
    case VaultStatus.AWAITING_FUNDING:
      return "PENDING DEPOSIT";
    case VaultStatus.FUNDED:
      return "IN PROGRESS";
    case VaultStatus.PAUSED:
      return "PAUSED";
    case VaultStatus.DISPUTED:
      return "IN DISPUTE";
    case VaultStatus.CANCELLED:
      return "CANCELLED";
    case VaultStatus.CLOSED:
      return "CLOSED";
    default:
      return status || "UNKNOWN";
  }
};

export const getMilestoneStatusDisplay = (milestone: any): { label: string; color: string } => {
  const status = milestone?.status?.toUpperCase();
  const releaseStatus = milestone?.releaseStatus?.toUpperCase();

  if (releaseStatus === ReleaseStatus.CONFIRMED) {
    return { label: "PAID", color: "text-emerald-500" };
  }
  
  if (status === MilestoneStatus.VERIFIED) {
      return { label: "APPROVED", color: "text-emerald-400" };
  }

  if (status === MilestoneStatus.AWAITING_APPROVAL || status === MilestoneStatus.SUBMITTED) {
    return { label: "IN REVIEW", color: "text-amber-500" };
  }
  
  if (status === MilestoneStatus.REJECTED || status === MilestoneStatus.REVISION_REQUESTED) {
    return { label: "NEED CHANGES", color: "text-red-500" };
  }
  
  if (status === MilestoneStatus.DISPUTED) {
      return { label: "DISPUTED", color: "text-red-400" };
  }

  return { label: "PENDING", color: "text-gray-400" };
};