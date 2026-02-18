import {
  VaultStatus,
  MilestoneStatus,
  UserRole,
  UserStatus,
  KycStatus,
  VerificationResult,
  MilestoneReviewOutcome,
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
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  vaultId?: string;
  title: string;
  status: MilestoneStatus;
  amount: number;
  dueDate?: string | null;
  deliverableTypeId?: string | null;
  deliverableMode?: string | null;
  auditEnabled: boolean;
  requirementItemsJson?: any; // Json
  createdAt?: string;
  updatedAt?: string;
  
  // Relations / Computed
  submission?: Submission | null;
  verification?: Verification | null;
  review?: MilestoneReview | null;
  
  releaseStatus?: string; // Computed
  refundStatus?: string; // Computed
}

export interface Submission {
  id: string;
  milestoneId: string;
  submittedAt: string;
  submittedBy: string;
  notes?: string | null;
  filesJson?: any;
  deliverableType?: string | null;
  url?: string | null;
  fileUrl?: string | null;
}

export interface Verification {
  id: string;
  milestoneId: string;
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

export interface MilestoneReview {
  id: string;
  milestoneId: string;
  reviewerId: string;
  outcome: MilestoneReviewOutcome;
  reasonCodes?: any;
  notes?: string | null;
  reviewedAt: string;
}

export interface Dispute {
  id: string;
  vaultId: string;
  milestoneId: string;
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
  milestoneId?: string | null;
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
