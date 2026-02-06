/**
 * Core Type Definitions for Cleard Frontend
 * 
 * This file contains all the TypeScript interfaces and types used throughout the application.
 */

import {
    VaultStatus,
    MilestoneStatus,
    DisputeStatus,
    TransactionStatus,
    UserRole,
    InviteStatus,
    VerificationResult,
    MilestoneReviewOutcome
} from '@/lib/domain/enums';

// ============================================================================
// ENUM TYPE UNIONS
// ============================================================================

export type VaultStatusType = typeof VaultStatus[keyof typeof VaultStatus];
export type MilestoneStatusType = typeof MilestoneStatus[keyof typeof MilestoneStatus];
export type DisputeStatusType = typeof DisputeStatus[keyof typeof DisputeStatus];
export type TransactionStatusType = typeof TransactionStatus[keyof typeof TransactionStatus];
export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type InviteStatusType = typeof InviteStatus[keyof typeof InviteStatus];
export type VerificationResultType = typeof VerificationResult[keyof typeof VerificationResult];
export type MilestoneReviewOutcomeType = typeof MilestoneReviewOutcome[keyof typeof MilestoneReviewOutcome];

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRoleType;
    kycStatus: "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
    profileImage: string | null;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    password: string | null;
    emailVerified?: boolean;
}

export interface Session {
    id: string;
    deviceName: string;
    browser: string;
    os: string;
    location: string;
    ip: string;
    lastActive: string;
    createdAt: string;
    isCurrent: boolean;
}

export interface TwoFactorSetup {
    secret: string;
    qrCode: string;
}

// ============================================================================
// WALLET & TRANSACTIONS
// ============================================================================

export interface WalletBalance {
    available: number;
    pending: number;
}

export interface Transaction {
    id: string;
    createdAt: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW' | 'RELEASE' | 'REFUND' | 'FEE';
    amount: number;
    currency: string;
    status: TransactionStatusType;
    description: string;
    vaultId?: string;
    milestoneId?: string;
    completedAt?: string;
}

export interface Wallet extends WalletBalance {
    transactions: Transaction[];
}

export interface LedgerEntry {
    id: string;
    createdAt: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW' | 'RELEASE' | 'REFUND' | 'FEE';
    amount: number;
    currency: string;
    status: TransactionStatusType;
    description: string;
    vaultId?: string;
    milestoneId?: string;
    balance: number;
}

// ============================================================================
// VAULTS & MILESTONES
// ============================================================================

export interface Deliverable {
    id: string;
    label: string;
    type: 'link' | 'file';
    rules: string[];
}

export interface VaultPurpose {
    label: string;
    icon: any; // Lucide icon component
    deliverables: Deliverable[];
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: MilestoneStatusType;
    submittedAt?: string;
    verifiedAt?: string;
    reviewedAt?: string;
    deliverables?: {
        type: 'link' | 'file';
        url?: string;
        fileName?: string;
        fileSize?: number;
    }[];
    verificationResult?: VerificationResultType;
    verificationDetails?: {
        score: number;
        flags: string[];
        aiNotes: string;
    };
    verification?: {
        result: string;
        verifiedAt: string | null;
        checks: string[];
        ruleResultsJson?: any[];
    };
    reviewOutcome?: MilestoneReviewOutcomeType;
    reviewNotes?: string;
    submission?: {
        submittedAt: string;
        notes: string;
        filesJson?: any[];
    };
    review?: {
        status: string;
        submittedAt: string;
        decidedAt?: string;
        reasonCodes?: string[];
    };
    releasedAt?: string;
    requirements?: any[];
    exceededSla?: boolean;
}

export interface Vault {
    id: string;
    title: string;
    description: string;
    purpose: 'development' | 'design' | 'content_ai';
    totalAmount: number;
    currency: string;
    status: VaultStatusType;
    createdAt: string;
    updatedAt: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    freelancerId?: string | null;
    freelancerName?: string;
    freelancerEmail?: string;
    milestones: Milestone[];
    inviteToken?: string;
    inviteStatus?: InviteStatusType;
    escrowRef?: string;
    auditEnabled?: boolean;
}

// ============================================================================
// DISPUTES & EVIDENCE
// ============================================================================

export interface Evidence {
    id: string;
    disputeId: string;
    createdAt: string;
    authorId: string;
    authorName: string;
    authorRole: UserRoleType;
    type: string;
    content: string;
    attachments?: {
        fileName: string;
        fileUrl: string;
        fileSize: number;
    }[];
}

export interface Dispute {
    id: string;
    vaultId: string;
    vaultTitle: string;
    milestoneId?: string;
    milestoneTitle?: string;
    reason: string;
    description: string;
    status: DisputeStatusType;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    createdByName: string;
    createdByRole: UserRoleType;
    resolution?: string;
    resolvedAt?: string;
    evidence: Evidence[];
}

// ============================================================================
// INVITES
// ============================================================================

export interface Invite {
    id?: string;
    vaultId: string;
    vaultTitle?: string;
    token: string;
    email: string;
    status: InviteStatusType;
    createdAt?: string;
    invitedAt?: string;
    expiresAt: string;
    acceptedAt?: string;
    respondedAt?: string;
    declineReason?: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface LoginFormData {
    email: string;
    password: string;
}

export interface SignupFormData {
    email: string;
    password: string;
    name: string;
    role: UserRoleType;
}

export interface CreateVaultFormData {
    title: string;
    description: string;
    purpose: 'development' | 'design' | 'content_ai';
    freelancerEmail: string;
    milestones: {
        title: string;
        description: string;
        amount: number;
        dueDate: string;
    }[];
}

export interface CreateDisputeFormData {
    vaultId: string;
    milestoneId?: string;
    reason: string;
    description: string;
    attachments?: File[];
}

export interface WithdrawFormData {
    amount: number;
    bankAccount?: string;
    cardLast4?: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface VaultCardProps {
    vault: Vault;
    role: UserRoleType;
}

export interface MilestoneCardProps {
    milestone: Milestone;
    vaultId: string;
    role: UserRoleType;
}

export interface DisputeCardProps {
    dispute: Dispute;
}

export interface WalletBalanceProps {
    balance: WalletBalance;
}

// ============================================================================
// NEXT.JS PAGE PROPS
// ============================================================================

export interface PageProps<T = Record<string, never>> {
    params: Promise<T>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface VaultPageParams {
    vaultId: string;
}

export interface MilestonePageParams {
    vaultId: string;
    milestoneId: string;
}

export interface DisputePageParams {
    disputeId: string;
}

export interface InvitePageParams {
    inviteToken: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface UserContextType {
    user: User | null;
    loading: boolean;
    unreadCount: number;
    login: (email: string, password: string) => Promise<User>;
    signup: (email: string, password: string, name: string, role: UserRoleType) => Promise<User>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    refreshUser: () => Promise<void>;
}

export interface WalletContextType {
    balance: WalletBalance;
    transactions: Transaction[];
    loading: boolean;
    refreshWallet: () => Promise<void>;
    withdraw: (amount: number) => Promise<Transaction>;
}

export interface VaultContextType {
    vaults: Vault[];
    loading: boolean;
    refreshVaults: () => Promise<void>;
    createVault: (data: CreateVaultFormData) => Promise<Vault>;
    getVault: (id: string) => Vault | undefined;
}
