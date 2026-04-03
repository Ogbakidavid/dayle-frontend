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

export enum VaultType {
  FIXED_PRICE = 'FIXED_PRICE',
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  CONTENT_AI = 'CONTENT_AI',
}

export enum VaultStatus {
  DRAFT = "DRAFT",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  PROCESSING_PAYMENT = "PROCESSING_PAYMENT",
  WITHDRAWAL_PENDING = "WITHDRAWAL_PENDING",
  FUNDED = "FUNDED",
  RELEASED = "RELEASED",
  REFUNDED = "REFUNDED",
  DISPUTED = "DISPUTED",
  CANCELLED = "CANCELLED",
  RELEASING = "RELEASING",
  RELEASE_FAILED = "RELEASE_FAILED",
  REFUNDING = "REFUNDING",
  REFUND_FAILED = "REFUND_FAILED",
  WITHDRAWAL_FAILED = "WITHDRAWAL_FAILED",
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
// DISPUTE STATUS
// ============================================================================

export enum DisputeStatus {
  OPEN = "OPEN",
  MUTUAL_RESOLUTION = "MUTUAL_RESOLUTION",
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
  INTEGRITY_VIOLATION = "INTEGRITY_VIOLATION",
  SCOPE_DISPUTE = "SCOPE_DISPUTE",
  COOPERATION_ISSUE = "COOPERATION_ISSUE",
  TECHNICAL_ERROR = "TECHNICAL_ERROR",
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
  
  // Vault Lifecycle
  VAULT_FUNDED = "VAULT_FUNDED",
  VAULT_STATUS_CHANGED = "VAULT_STATUS_CHANGED",
  VAULT_PAUSED = "VAULT_PAUSED",
}

// ============================================================================
// SUBMISSION TYPE
// ============================================================================

export enum SubmissionType {
  FILE = 'FILE',
  LINK = 'LINK',
  BOTH = 'BOTH',
}


export const getVaultDerivedLabel = (status: string | undefined): string => {
  switch (status?.toUpperCase()) {
    case VaultStatus.DRAFT:
      return "DRAFT";
    case VaultStatus.AWAITING_PAYMENT:
      return "AWAITING PAYMENT";
    case VaultStatus.WITHDRAWAL_PENDING:
      return "WITHDRAWAL PENDING";
    case VaultStatus.FUNDED:
      return "IN PROGRESS";
    case VaultStatus.RELEASED:
      return "RELEASED";
    case VaultStatus.REFUNDED:
      return "REFUNDED";
    case VaultStatus.DISPUTED:
      return "IN DISPUTE";
    case VaultStatus.CANCELLED:
      return "CANCELLED";
    case VaultStatus.RELEASING:
      return "RELEASING FUNDS...";
    case VaultStatus.REFUNDING:
      return "REFUNDING FUNDS...";
    case VaultStatus.RELEASE_FAILED:
      return "RELEASE FAILED";
    case VaultStatus.REFUND_FAILED:
      return "REFUND FAILED";
    case VaultStatus.WITHDRAWAL_FAILED:
      return "WITHDRAWAL FAILED — CONTACT SUPPORT";
    case VaultStatus.PROCESSING_PAYMENT:
      return "PROCESSING PAYMENT";
    default:
      return status || "UNKNOWN";
  }
};

export const getVaultStatusDisplay = (vault: any): { label: string; color: string } => {
  const status = vault?.status?.toUpperCase();

  switch (status) {
    case VaultStatus.RELEASED:
      return { label: "PAID", color: "text-emerald-500" };
    case VaultStatus.AWAITING_PAYMENT:
      return { label: "AWAITING PAYMENT", color: "text-amber-500" };
    case VaultStatus.WITHDRAWAL_PENDING:
      return { label: "WITHDRAWAL PENDING", color: "text-amber-500" };
    case VaultStatus.FUNDED:
      return { label: "IN PROGRESS", color: "text-amber-500" };
    case VaultStatus.DISPUTED:
      return { label: "DISPUTED", color: "text-red-400" };
    case VaultStatus.REFUNDED:
      return { label: "REFUNDED", color: "text-gray-400" };
    case VaultStatus.CANCELLED:
      return { label: "CANCELLED", color: "text-gray-500" };
    case VaultStatus.RELEASING:
    case VaultStatus.REFUNDING:
      return { label: status, color: "text-amber-500" };
    case VaultStatus.RELEASE_FAILED:
    case VaultStatus.REFUND_FAILED:
    case VaultStatus.WITHDRAWAL_FAILED:
      return { label: status, color: "text-red-400" };
    case VaultStatus.PROCESSING_PAYMENT:
      return { label: "PROCESSING", color: "text-amber-500" };
    case VaultStatus.DRAFT:
    default:
      return { label: "DRAFT", color: "text-gray-400" };
  }
};
