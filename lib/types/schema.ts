import {
  VaultStatus,
  UserRole,
  UserStatus,
  KycStatus,
  VerificationResult,
  DisputeStatus,
  DisputeType,
  EvidenceType,
  TransactionStatus,
} from "@/lib/domain/enums";

// ============================================================================
// BASE INTERFACES (Matching Prisma Model Structure)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KycStatus;
  profileImage?: string | null;
  emailVerified: boolean;
  twoFaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  wallet?: Wallet | null;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  privyDid: string;
  provider: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vault {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: VaultStatus;
  totalAmount: number;
  paidAmount?: number; // Computed field
  clientId: string;
  clientName?: string; // Computed/Included
  freelancerId?: string | null;
  freelancerName?: string; // Computed/Included
  freelancerEmail?: string; // Computed/Included
  isFrozen: boolean;
  frozenReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  
  // Single-release model
  submission?: Submission | null;
  verification?: Verification | null;
  review?: VaultReview | null;
}

export interface Submission {
  id: string;
  vaultId: string;
  submittedAt: string;
  submittedBy: string;
  notes?: string | null;
  filesJson?: any;
  deliverableType?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  requirements?: any; // Added for convenience in frontend
}

export interface Verification {
  id: string;
  vaultId: string;
  result: VerificationResult;
  verifiedAt: string;
  verifiedBy: string;
  confidence?: number | null;
  checksCompleted?: number | null;
  checksTotal?: number | null;
  riskLevel?: string | null;
  flags?: any;
  checks?: any;
  ruleResultsJson?: any;
  notes?: string | null;
}

export interface VaultReview {
  id: string;
  vaultId: string;
  reviewerId: string;
  outcome: string; // RELEASE | REFUND | REQUEST_CHANGES
  reasonCodes?: any;
  notes?: string | null;
  reviewedAt: string;
}

export interface Dispute {
  id: string;
  vaultId: string;
  requirementRef?: string | null;
  disputeType: DisputeType;
  reasonCode: string;
  openedByUserId: string;
  openedByRole: UserRole;
  status: DisputeStatus;
  description: string;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  events?: DisputeEvent[];
  evidence?: Evidence[];
}

export interface DisputeEvent {
  id: string;
  disputeId: string;
  actorId?: string | null;
  actorRole?: string | null;
  eventType: string;
  payload?: any;
  createdAt: string;
}

export interface Evidence {
  id: string;
  vaultId: string;
  disputeId?: string | null;
  type: EvidenceType;
  payload: any;
  createdBy: string;
  immutableAfterSubmission: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: string | null;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  telegramConnected: boolean;
  telegramUsername?: string | null;
  whatsappPhoneVerified: boolean;
  whatsappPhoneE164?: string | null;
  updatedAt: string;
}
