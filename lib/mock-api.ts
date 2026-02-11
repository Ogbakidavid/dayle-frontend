/**
 * Mock API Service
 * Simulates backend latency
 */

import { vaults as seedVaults } from "@/lib/mock/vaults";
import { disputes as seedDisputes } from "@/lib/mock/disputes";
import { seedInvites } from "@/lib/mock/invites";
import { mockNotifications as seedNotifications } from "@/lib/mock/notifications";
import {
  VaultStatus,
  MilestoneStatus,
  UserRole,
  DisputeStatus,
  LedgerEntryStatus,
  TransactionStatus,
  InviteStatus,
} from "@/lib/domain/enums";
import type {
  User,
  Vault,
  Milestone,
  Dispute,
  Invite,
  Wallet,
  Transaction,
  UserRoleType,
  VaultStatusType,
  MilestoneStatusType,
} from "@/lib/types";

const SESSION_KEY = "mock_user_session";
const USERS_DB_KEY = "mock_users_db";
const NOTIFICATIONS_DB_KEY = "mock_notifications_db_v4";
const NOTIFICATION_PREFS_KEY = "mock_notification_preferences";

const DELAY_MS = 600;

// Re-export canonical enums for backward compatibility
export { VaultStatus, MilestoneStatus, UserRole, DisputeStatus };

// Local enums not in canonical spec (implementation-specific)
export const KycStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  NONE: "NONE",
} as const;

export const UserStatus = {
  ACTIVE: "ACTIVE",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  SUSPENDED: "SUSPENDED",
};

export const LedgerEntryType = {
  DEPOSIT: "DEPOSIT",
  LOCK: "LOCK",
  RELEASE: "RELEASE",
  REFUND: "REFUND",
  WITHDRAW: "WITHDRAW",
  FEE: "FEE",
};

export const MilestoneReviewOutcome = {
  APPROVE: "APPROVE",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  REJECT: "REJECT",
};

export const DisputeType = {
  VERIFICATION_ERROR: "VERIFICATION_ERROR",
  REQUIREMENT_MISMATCH: "REQUIREMENT_MISMATCH",
  SCOPE_CHANGE: "SCOPE_CHANGE",
  BAD_FAITH: "BAD_FAITH",
  FRAUD: "FRAUD",
  PROCESS_BREACH: "PROCESS_BREACH",
  SECURITY: "SECURITY",
};

export const EvidenceType = {
  CLARIFICATION_REQUEST: "CLARIFICATION_REQUEST",
  REQUIREMENT_CONFIRMATION: "REQUIREMENT_CONFIRMATION",
  FILE_COMMENT: "FILE_COMMENT",
  DISPUTE_NOTE: "DISPUTE_NOTE",
  DISPUTE_OPENED: "DISPUTE_OPENED",
  DISPUTE_EVIDENCE: "DISPUTE_EVIDENCE",
  DISPUTE_DECISION: "DISPUTE_DECISION",
};

// Mock Database
let mockUser: User = {
  id: "u_guest",
  email: "",
  name: "Guest",
  role: UserRole.NONE,
  kycStatus: "NONE",
  profileImage: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  password: null, // Mock password storage
};

// Mock sessions storage
let mockSessions: any[] = [];

// Helper to save user to persistent DB
function saveUserToDB(user: User) {
  if (typeof window === "undefined" || !user.email) return;

  try {
    const dbStr = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, User> = dbStr ? JSON.parse(dbStr) : {};
    db[user.email] = user;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save user to DB", e);
  }
}

// Helper to get user from persistent DB
function getUserFromDB(email: string): User | null {
  if (typeof window === "undefined" || !email) return null;

  try {
    const dbStr = localStorage.getItem(USERS_DB_KEY);
    if (!dbStr) return null;
    const db: Record<string, User> = JSON.parse(dbStr);
    return db[email] || null;
  } catch (e) {
    console.error("Failed to get user from DB", e);
    return null;
  }
}

// Initialize mockWallet with seed data
let mockWallet: Wallet = {
  available: 1200,
  pending: 800,
  transactions: [
    {
      id: "TX_1001",
      createdAt: "2025-09-30",
      type: "DEPOSIT",
      amount: 5000,
      currency: "USD",
      status: TransactionStatus.CONFIRMED,
      description: "Initial Deposit",
    },
    {
      id: "TX_1002",
      createdAt: "2025-10-04",
      type: "WITHDRAWAL" as any, // Using enum values
      amount: -2500,
      currency: "USD",
      status: TransactionStatus.CONFIRMED,
      description: "Bank Withdrawal",
    },
  ],
};

const mockVaults: Vault[] = (seedVaults as any[]).map((v) => ({
  ...v,
  purpose: v.purpose || v.type || "development",
  currency: v.currency || "USD",
  updatedAt: v.updatedAt || v.createdAt,
  clientEmail: v.clientEmail || "client@example.com",
}));
const mockDisputes: Dispute[] = (seedDisputes as any[]).map((dispute) => ({ ...dispute }));
const mockInvites: Invite[] = (seedInvites as any[]).map((invite) => ({ ...invite }));

// Notifications State
// (using local storage via getNotificationsFromDB)

// Helper to save notifications to persistent DB
function saveNotificationsToDB(notifications: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_DB_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error("Failed to save notifications", e);
  }
}

// Helper to get notifications from persistent DB
function getNotificationsFromDB(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_DB_KEY);
    if (stored) return JSON.parse(stored);

    // Initialize with seeds if empty
    const isClient = mockUser.role === UserRole.CLIENT;
    const seeds = isClient ? seedNotifications.client : seedNotifications.freelancer;
    saveNotificationsToDB(seeds);
    return seeds;
  } catch (e) {
    return [];
  }
}

// Simple idempotency map for money/create operations in the mock API
const mockIdempotencyMap: Record<string, any> = {};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate a stable professional male avatar URL
function getProfessionalAvatar(email: string, id: string | null) {
  return null; // Using jdenticon on frontend instead
}

// Helper to get device and location info (mock)
function getDeviceInfo() {
  const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
  let device = "Unknown Device";

  if (userAgent.includes("Chrome")) device = "Chrome";
  else if (userAgent.includes("Safari")) device = "Safari";
  else if (userAgent.includes("Firefox")) device = "Firefox";
  else if (userAgent.includes("Edge")) device = "Edge";

  if (userAgent.includes("Mac")) device += " on MacBook Pro";
  else if (userAgent.includes("Windows")) device += " on Windows PC";
  else if (userAgent.includes("Linux")) device += " on Linux";
  else if (userAgent.includes("iPhone")) device += " on iPhone";
  else if (userAgent.includes("Android")) device += " on Android";

  return device;
}

function getLocationInfo(): string {
  // Mock location - in real app would use IP geolocation
  const locations = ["New York, US", "San Francisco, US", "London, UK", "Toronto, CA"];
  return locations[0] as string; // Default to New York
}

// Helper to get relative time string
function getRelativeTime(timestamp: number | string | Date): string {
  const ts = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
  const seconds = Math.floor((new Date().getTime() - ts) / 1000);
  if (seconds < 60) return 'Active now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${Math.floor(seconds / 60) === 1 ? 'hour' : 'hours'} ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${Math.floor(seconds / 3600) === 1 ? 'hour' : 'hours'} ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${Math.floor(seconds / 86400) === 1 ? 'day' : 'days'} ago`;
  return `${Math.floor(seconds / 604800)} ${Math.floor(seconds / 604800) === 1 ? 'week' : 'weeks'} ago`;
}

// Helper to create a new session
function createSession() {
  const session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    device: getDeviceInfo(),
    location: getLocationInfo(),
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    current: true,
  };

  // Mark all other sessions as not current
  mockSessions.forEach(s => s.current = false);

  mockSessions.push(session);

  // Keep only last 10 sessions
  if (mockSessions.length > 10) {
    mockSessions = mockSessions.slice(-10);
  }

  return session;
}

// Helper to restore session
function ensureSession() {
  if (typeof window !== "undefined" && mockUser.role === UserRole.NONE) {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        mockUser = JSON.parse(stored);
      }
      // Restore sessions
      const storedSessions = localStorage.getItem("mock_sessions");
      if (storedSessions) {
        mockSessions = JSON.parse(storedSessions);
      }
    } catch (e) {
      // ignore
    }
  }
}

export const api = {
  auth: {
    login: async (email: string, password?: string): Promise<User> => {
      await sleep(DELAY_MS);

      // Check if user exists in persistent DB
      const existingUser = getUserFromDB(email);

      if (existingUser) {
        // If password provided and user has a password, verify it
        if (existingUser.password && password && existingUser.password !== password) {
          throw new Error("Invalid password");
        }
        mockUser = { ...existingUser };
      } else {
        // Create new mock user based on email pattern
        if (email.includes("client")) {
          mockUser = {
            id: "u_client_1",
            email,
            name: "Demo Client",
            role: UserRole.CLIENT,
            kycStatus: "VERIFIED",
            password: password || "password123", // Default if not provided
            profileImage: null,
            twoFactorEnabled: false,
            twoFactorSecret: null,
          };
        } else if (email.includes("freelancer")) {
          mockUser = {
            id: "u_freelancer_1",
            email,
            name: "Demo Freelancer",
            role: UserRole.FREELANCER,
            kycStatus: "VERIFIED",
            password: password || "password123", // Default if not provided
            profileImage: null,
            twoFactorEnabled: false,
            twoFactorSecret: null,
          };
        } else {
          // Default generic user
          const nameFromEmail = email.split("@")[0] || "User";
          mockUser = {
            id: `u_${Math.random().toString(36).substr(2, 9)}`,
            email,
            name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
            role: UserRole.FREELANCER,
            kycStatus: "VERIFIED",
            password: password || null,
            profileImage: null,
            twoFactorEnabled: false,
            twoFactorSecret: null,
          };
        }
      }

      // Create a new session
      createSession();

      // Persist user to DB
      saveUserToDB(mockUser);

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
        localStorage.setItem("mock_sessions", JSON.stringify(mockSessions));
      }

      // Ensure profile image exists
      if (!mockUser.profileImage && mockUser.role !== UserRole.NONE) {
        mockUser.profileImage = getProfessionalAvatar(mockUser.email, mockUser.id);
      }

      return { ...mockUser };
    },
    signup: async (
      email: string,
      password: string,
      name: string,
      role: UserRoleType
    ): Promise<User> => {
      await sleep(DELAY_MS * 1.5);

      const nameFromEmail = email.split("@")[0] || "User";
      const finalName = name || nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

      // Check if user exists (mock)
      if (email === "demo@orynex.com") {
        throw new Error("User already exists");
      }

      mockUser = {
        id: `u_${Date.now()}`,
        email,
        name: finalName,
        role: role || UserRole.NONE,
        kycStatus: "NONE",
        profileImage: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        password: password || null,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }

      // Persist user to DB
      saveUserToDB(mockUser);

      return { ...mockUser };
    },
    sendVerificationEmail: async (email: string): Promise<{ success: boolean }> => {
      await sleep(DELAY_MS);
      console.log(`[API] Verification code sent to ${email}`);
      return { success: true };
    },
    verifyEmail: async (code: string): Promise<{ success: boolean; user: User }> => {
      await sleep(DELAY_MS);
      if (code === "123456") { // Mock success code
        mockUser = { ...mockUser, emailVerified: true };
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
        }
        return { success: true, user: { ...mockUser } };
      }
      throw new Error("Invalid verification code");
    },
    updateProfile: async (updates: Partial<User>): Promise<User> => {
      await sleep(DELAY_MS);
      mockUser = { ...mockUser, ...updates };

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }

      // Persist user to DB
      saveUserToDB(mockUser);

      return { ...mockUser };
    },
    getCurrentUser: async () => {
      await sleep(DELAY_MS / 2);

      if (typeof window !== "undefined" && mockUser.role === UserRole.NONE) {
        try {
          const stored = localStorage.getItem(SESSION_KEY);
          if (stored) {
            mockUser = JSON.parse(stored);
          }
        } catch (e) {
          console.error("Failed to restore mock session", e);
        }
      }

      // Repair: If user has a role but name is still "Guest", give them a better name
      if (mockUser.role !== UserRole.NONE && mockUser.name === "Guest" && mockUser.email) {
        const nameFromEmail = mockUser.email.split("@")[0] || "User";
        mockUser.name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      }

      // Ensure profile image
      if (mockUser.role !== UserRole.NONE && !mockUser.profileImage) {
        mockUser.profileImage = getProfessionalAvatar(mockUser.email, mockUser.id);
      }

      return { ...mockUser };
    },
    logout: async () => {
      await sleep(DELAY_MS / 4);
      mockUser = {
        id: "u_guest",
        email: "",
        name: "Guest",
        role: UserRole.NONE,
        kycStatus: KycStatus.NONE,
        profileImage: null, // Ensure profileImage is set
        twoFactorEnabled: false, // Ensure 2FA props are set
        twoFactorSecret: null,
        password: null,
      };
      if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_KEY);
      }
      return { success: true };
    },

    // 2FA Pending State Management
    setPending2FA: (email: string, password?: string): void => {
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_2fa_auth", JSON.stringify({ email, password, timestamp: Date.now() }));
      }
    },

    getPending2FA: (): any => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("pending_2fa_auth");
        if (stored) {
          const data = JSON.parse(stored);
          // Expire after 5 minutes
          if (Date.now() - data.timestamp > 5 * 60 * 1000) {
            localStorage.removeItem("pending_2fa_auth");
            return null;
          }
          return data;
        }
      }
      return null;
    },

    clearPending2FA: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_2fa_auth");
      }
    },
  },
  security: {
    // Two-Factor Authentication
    enable2FA: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // Generate a mock secret for 2FA
      const secret = `MOCK${Math.random().toString(36).substr(2, 16).toUpperCase()}`;

      // In a real app, this would be a proper TOTP secret
      // For mock purposes, we'll accept any 6-digit code
      return {
        secret,
        qrCodeUrl: `otpauth://totp/Dayle:${mockUser.email}?secret=${secret}&issuer=Dayle`,
        recoveryCodes: [
          Math.random().toString(36).substr(2, 8).toUpperCase(),
          Math.random().toString(36).substr(2, 8).toUpperCase(),
          Math.random().toString(36).substr(2, 8).toUpperCase(),
          Math.random().toString(36).substr(2, 8).toUpperCase(),
          Math.random().toString(36).substr(2, 8).toUpperCase(),
        ],
        tempSecret: secret, // Store temporarily until verified
      };
    },
    verify2FA: async (code: string, tempSecret: string): Promise<{ success: boolean; user: User }> => {
      await sleep(DELAY_MS);
      ensureSession();

      // Mock verification - accept any 6-digit code
      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code. Please enter a 6-digit code.");
      }

      // Enable 2FA
      mockUser.twoFactorEnabled = true;
      mockUser.twoFactorSecret = tempSecret;

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }

      // Persist user to DB
      saveUserToDB(mockUser);

      return { success: true, user: { ...mockUser } };
    },
    disable2FA: async (code: string): Promise<{ success: boolean; user: User }> => {
      await sleep(DELAY_MS);
      ensureSession();

      if (!mockUser.twoFactorEnabled) {
        throw new Error("Two-factor authentication is not enabled");
      }

      // Mock verification - accept any 6-digit code
      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code. Please enter a 6-digit code.");
      }

      // Disable 2FA
      mockUser.twoFactorEnabled = false;
      mockUser.twoFactorSecret = null;

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }

      // Persist user to DB
      saveUserToDB(mockUser);

      return { success: true, user: { ...mockUser } };
    },
    get2FAStatus: async () => {
      await sleep(DELAY_MS / 2);
      ensureSession();

      return {
        enabled: mockUser.twoFactorEnabled || false,
      };
    },

    // Session Management
    getSessions: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // Return sessions with relative time
      return mockSessions.map(session => ({
        ...session,
        time: getRelativeTime(new Date(session.lastActive)),
      }));
    },
    revokeSession: async (sessionId: string): Promise<{ success: boolean }> => {
      await sleep(DELAY_MS);
      ensureSession();

      const sessionIndex = mockSessions.findIndex(s => s.id === sessionId);
      if (sessionIndex === -1) {
        throw new Error("Session not found");
      }

      // Don't allow revoking current session
      if (mockSessions[sessionIndex].current) {
        throw new Error("Cannot revoke current session");
      }

      mockSessions.splice(sessionIndex, 1);

      if (typeof window !== "undefined") {
        localStorage.setItem("mock_sessions", JSON.stringify(mockSessions));
      }

      return { success: true };
    },
    revokeAllSessions: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // Keep only the current session
      mockSessions = mockSessions.filter(s => s.current);

      if (typeof window !== "undefined") {
        localStorage.setItem("mock_sessions", JSON.stringify(mockSessions));
      }

      return { success: true, revokedCount: mockSessions.length };
    },

    // Password Management
    changePassword: async (currentPassword?: string, newPassword?: string): Promise<{ success: boolean }> => {
      await sleep(DELAY_MS);
      ensureSession();

      // Validate current password
      if (mockUser.password && currentPassword !== mockUser.password) {
        throw new Error("Current password is incorrect");
      }

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      if (newPassword === currentPassword) {
        throw new Error("New password must be different from current password");
      }

      // Update password
      mockUser.password = newPassword;

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }

      // Persist user to DB
      saveUserToDB(mockUser);

      return { success: true };
    },

    // Login-specific 2FA methods
    check2FAOnLogin: async (email: string, password?: string): Promise<{ requires2FA: boolean }> => {
      await sleep(DELAY_MS / 2);

      // In a real app, this would verify credentials first
      // For mock, we'll check if a user with this email has 2FA enabled
      // We check the persistent DB
      const user = getUserFromDB(email);

      if (user && user.twoFactorEnabled) {
        return { requires2FA: true };
      }

      return { requires2FA: false };
    },

    verify2FAOnLogin: async (email: string, code: string): Promise<{ success: boolean }> => {
      await sleep(DELAY_MS);

      // Mock verification - accept any 6-digit code
      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code. Please enter a 6-digit code.");
      }

      return { success: true };
    },
  },
  wallet: {
    getBalance: async () => {
      await sleep(DELAY_MS);
      // Return real mockWallet state
      const available = mockWallet.available || 0;
      const pending = mockWallet.pending || 0;
      return {
        available,
        pending,
        total: available + pending
      };
    },
    withdraw: async (amount: number | string, opts: { idempotencyKey?: string } = {}): Promise<Transaction> => {
      await sleep(DELAY_MS);
      ensureSession();

      const idempotencyKey = opts.idempotencyKey;
      if (idempotencyKey && mockIdempotencyMap[idempotencyKey]) {
        return mockIdempotencyMap[idempotencyKey];
      }

      const withdrawAmount = Math.abs(Number(amount) || 0);

      // RECONCILIATION TRUTH MODEL:
      // 1. Move funds from available -> pending (not decrement available immediately)
      // 2. On confirmation, decrement pending and finalize

      // Check if sufficient available balance
      const currentAvailable = mockWallet.available || 0;
      if (currentAvailable < withdrawAmount) {
        throw {
          code: "INSUFFICIENT_FUNDS",
          message: `Insufficient available balance. Available: ${currentAvailable}, Requested: ${withdrawAmount}`,
          available: currentAvailable,
          requested: withdrawAmount
        };
      }

      const tx: Transaction = {
        id: `TX_${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'WITHDRAWAL' as any,
        amount: -withdrawAmount,
        currency: 'USD',
        status: TransactionStatus.PENDING,
        description: `Withdrawal of ${withdrawAmount} USD`,
      };

      // Move from available to pending
      mockWallet.available = currentAvailable - withdrawAmount;
      mockWallet.pending = (mockWallet.pending || 0) + withdrawAmount;

      mockWallet.transactions = mockWallet.transactions || [];
      mockWallet.transactions.unshift(tx);

      // Simulate confirmation after delay (in real system, this would be a webhook)
      setTimeout(() => {
        // Find the transaction and confirm it
        const txIndex = mockWallet.transactions.findIndex(t => t.id === tx.id);
        const transaction = mockWallet.transactions[txIndex];
        if (txIndex !== -1 && transaction && transaction.status === TransactionStatus.PENDING) {
          transaction.status = TransactionStatus.CONFIRMED;
          transaction.completedAt = new Date().toISOString();
          mockWallet.transactions[txIndex] = transaction; // Re-assign if needed, though objects are ref
          // Decrement pending (funds already removed from available)
          mockWallet.pending = Math.max(0, mockWallet.pending - withdrawAmount);
        }
      }, 3000); // Simulate 3 second confirmation delay

      if (idempotencyKey) mockIdempotencyMap[idempotencyKey] = tx;
      return tx;
    },
    getTransactions: async () => {
      await sleep(DELAY_MS);
      // Return real mockWallet transactions
      return mockWallet.transactions || [];
    },
  },
  vaults: {
    list: async (): Promise<Vault[]> => {
      await sleep(DELAY_MS);
      ensureSession();

      // HACK: Self-heal stale data if HMR didn't update mockVaults with new schema keys
      if (mockVaults[0] && !mockVaults[0].clientId) {
        console.warn(
          "[API] Detected stale mock data (missing clientId), re-syncing from seed..."
        );
        const fresh: Vault[] = (seedVaults as any[]).map((v) => ({
          ...v,
          purpose: v.purpose || v.type || "development",
          currency: v.currency || "USD",
          updatedAt: v.updatedAt || v.createdAt,
          clientEmail: v.clientEmail || "client@example.com",
        }));
        mockVaults.length = 0;
        mockVaults.push(...fresh);
      }

      const participantVaults = mockVaults.filter(
        (v) => v.clientId === mockUser.id || v.freelancerId === mockUser.id
      );
      console.log(
        `[API] list vaults for ${mockUser.id} (${mockUser.role}): found ${participantVaults.length}`
      );
      return participantVaults;
    },
    create: async (data: any): Promise<Vault> => {
      await sleep(DELAY_MS);
      ensureSession();

      // Only clients can create vaults
      if (mockUser.role !== UserRole.CLIENT) {
        throw new Error("Only clients can create vaults");
      }

      // Idempotency handling: if provided, return cached vault
      if (data && data.idempotencyKey) {
        const existing = mockIdempotencyMap[data.idempotencyKey];
        if (existing) return existing;
      }

      const newVault = {
        id: `v_${Date.now()}`,
        status: VaultStatus.DRAFT,
        createdAt: new Date().toISOString(),
        milestones: [],
        clientId: mockUser.id,
        freelancerId: null,
        totalAmount: data.totalAmount || data.amount || 0,
        ...data,
      };
      mockVaults.push(newVault);

      if (data && data.idempotencyKey) {
        mockIdempotencyMap[data.idempotencyKey] = newVault;
      }

      return newVault;
    },
    releaseMilestone: async (vaultId: string, milestoneId: string, opts: { idempotencyKey?: string } = {}): Promise<any> => {
      await sleep(DELAY_MS);
      ensureSession();

      // Validate vault access
      const vault = mockVaults.find((v) => v.id === vaultId);
      if (!vault) throw new Error('Vault not found');
      if (vault.clientId !== mockUser.id) throw new Error('Unauthorized');

      const milestone = (vault.milestones || []).find((m) => m.id === milestoneId);
      if (!milestone) throw new Error('Milestone not found');

      // STATE TRANSITION GUARD: Only allow release from AWAITING_APPROVAL
      if (milestone.status !== MilestoneStatus.AWAITING_APPROVAL) {
        throw {
          code: "INVALID_STATE_TRANSITION",
          message: `Cannot release milestone from status "${milestone.status}". Must be "${MilestoneStatus.AWAITING_APPROVAL}".`,
          currentStatus: milestone.status,
          allowedStatuses: [MilestoneStatus.AWAITING_APPROVAL],
          attemptedAction: "releaseMilestone"
        };
      }

      // VERIFICATION GUARD: Check if audit is enabled and verification result
      const auditEnabled = vault.auditEnabled !== false; // Default to true if not specified
      if (auditEnabled) {
        if (!milestone.verification) {
          throw {
            code: "VERIFICATION_REQUIRED",
            message: "Cannot release milestone: verification is required but not found.",
            milestoneId,
            auditEnabled
          };
        }
        if (milestone.verification.result === "FAIL") {
          throw {
            code: "VERIFICATION_FAILED",
            message: "Cannot release milestone: verification result is FAIL.",
            milestoneId,
            verificationResult: milestone.verification.result
          };
        }
      }

      const idempotencyKey = opts.idempotencyKey;
      if (idempotencyKey && mockIdempotencyMap[idempotencyKey]) {
        return mockIdempotencyMap[idempotencyKey];
      }

      // Create a ledger-like release object
      const ledgerEntry = {
        id: `LG_${Date.now()}`,
        createdAt: new Date().toISOString(),
        vaultId,
        milestoneId,
        type: 'RELEASE',
        status: LedgerEntryStatus.PENDING,
        amount: Number(milestone.amount) || 0,
        currency: 'USD',
        description: `Release for ${milestone.title}`,
      };

      // Mark milestone as verified/pending release in mock
      milestone.status = MilestoneStatus.VERIFIED;
      milestone.releasedAt = new Date().toISOString();

      if (idempotencyKey) mockIdempotencyMap[idempotencyKey] = ledgerEntry;

      return ledgerEntry;
    },
    getById: async (id: string): Promise<Vault | null> => {
      await sleep(DELAY_MS);
      ensureSession();
      const vault = mockVaults.find((v) => v.id === id);
      // Access check
      if (
        vault &&
        (vault.clientId === mockUser.id || vault.freelancerId === mockUser.id)
      ) {
        return vault;
      }
      return null; // Or throw error
    },
    updateStatus: async (id: string, status: VaultStatusType): Promise<Vault> => {
      await sleep(DELAY_MS);
      const idx = mockVaults.findIndex((v) => v.id === id);
      if (idx !== -1) {
        mockVaults[idx] = { ...mockVaults[idx]!, status };
        return mockVaults[idx]!;
      }
      throw new Error("Vault not found");
    },
  },
  disputes: {
    list: async (): Promise<Dispute[]> => {
      await sleep(DELAY_MS);
      ensureSession();

      // HACK: Self-heal stale data if HMR didn't update mockVaults with new schema keys
      if (mockVaults.length > 0 && !mockVaults[0]?.clientId) {
        console.warn(
          "[API] Detected stale mock data (missing clientId), re-syncing from seed..."
        );
        const fresh = (seedVaults as any[]).map((v) => ({ ...v }));
        mockVaults.length = 0;
        mockVaults.push(...fresh);
      }

      // Return disputes for visible vaults
      const visibleVaults = mockVaults
        .filter(
          (v) => v.clientId === mockUser.id || v.freelancerId === mockUser.id
        )
        .map((v) => v.id);

      return mockDisputes.filter((d) => visibleVaults.includes(d.vaultId));
    },
    listForVault: async (vaultId: string): Promise<Dispute[]> => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find((v) => v.id === vaultId);
      if (
        !vault ||
        (vault.clientId !== mockUser.id && vault.freelancerId !== mockUser.id)
      ) {
        throw new Error("Unauthorized Access or Vault Not Found");
      }
      return mockDisputes.filter((d) => d.vaultId === vaultId);
    },
    getById: async (id: string): Promise<Dispute | null> => {
      await sleep(DELAY_MS);
      const dispute = mockDisputes.find((d) => d.id === id);
      if (!dispute) return null;

      const vault = mockVaults.find((v) => v.id === dispute.vaultId);
      if (
        !vault ||
        (vault.clientId !== mockUser.id && vault.freelancerId !== mockUser.id)
      ) {
        return null;
      }
      return dispute;
    },
    create: async (payload: any): Promise<Dispute> => {
      await sleep(DELAY_MS);
      // Validate access to vault
      const vault = mockVaults.find((v) => v.id === payload.vaultId);
      if (
        !vault ||
        (vault.clientId !== mockUser.id && vault.freelancerId !== mockUser.id)
      ) {
        throw new Error("Unauthorized");
      }

      const newDispute: any = {
        id: `d_${Date.now()}`,
        openedByUserId: mockUser.id,
        openedByRole: mockUser.role,
        createdAt: new Date().toISOString(),
        status: "OPEN",
        events: [],
        ...payload,
      };

      // Initial event
      newDispute.events.push({
        id: `ev-${Date.now()}`,
        createdAt: newDispute.createdAt,
        actorUserId: mockUser.id,
        eventType: "OPENED",
        payloadJson: {
          reasonCode: payload.reasonCode,
          requirementRef: payload.requirementRef,
          notes: payload.description,
        },
      });

      mockDisputes.push(newDispute);
      return newDispute;
    },
  },
  invites: {
    getByToken: async (token: string): Promise<{ invite: Invite; vault: any } | null> => {
      await sleep(DELAY_MS);
      const invite = mockInvites.find((i) => i.token === token);
      if (!invite) throw new Error("Invite not found");

      // Check Expiration
      if (new Date(invite.expiresAt) < new Date()) {
        throw new Error("Invite expired");
      }

      const vault = mockVaults.find((v) => v.id === invite.vaultId);
      if (!vault) throw new Error("Associated vault not found");

      return {
        invite,
        vault: {
          id: vault.id,
          title: vault.title,
          clientName: vault.clientName,
          totalAmount: vault.totalAmount,
          milestoneCount: vault.milestones?.length || 0,
          status: vault.status,
          isFunded: vault.status.includes("FUNDED") || vault.status === "ACTIVE",
        },
      };
    },
    getByVaultId: async (vaultId: string): Promise<Invite | null> => {
      await sleep(DELAY_MS);
      // Get the most recent invite for this vault
      const invitesForVault = mockInvites.filter((i) => i.vaultId === vaultId);
      if (invitesForVault.length === 0) return null;

      // Sort by invitedAt descending
      invitesForVault.sort((a, b) => {
        const dateA = new Date(a.invitedAt || 0).getTime();
        const dateB = new Date(b.invitedAt || 0).getTime();
        return dateB - dateA;
      });
      return invitesForVault[0]!;
    },
    respond: async (token: string, { decision, reasonCode }: { decision: 'ACCEPT' | 'DECLINE'; reasonCode?: string }): Promise<{ success: boolean; vaultId?: string }> => {
      await sleep(DELAY_MS);
      ensureSession();

      if (mockUser.role !== UserRole.FREELANCER) {
        throw new Error("Only freelancers can respond to invites");
      }

      const invite = mockInvites.find((i) => i.token === token);
      if (!invite) throw new Error("Invite not found");

      if (invite.status !== "PENDING") {
        throw new Error("Invite already responded to");
      }

      const vault = mockVaults.find((v) => v.id === invite.vaultId);
      if (!vault) throw new Error("Vaul not found");

      // Check if vault is already assigned to someone else
      if (vault.freelancerId && vault.freelancerId !== mockUser.id) {
        throw new Error("Vault is already assigned to another freelancer");
      }

      // IDENTITY CHECK: Ensure logged in user matches the invitation email
      if (mockUser.email !== invite.email) {
        throw new Error(`This invitation was sent to ${invite.email}, but you are logged in as ${mockUser.email}`);
      }

      // Check Expiration again
      if (new Date(invite.expiresAt) < new Date()) {
        throw new Error("Invite expired");
      }

      if (decision === "ACCEPT") {
        invite.status = InviteStatus.ACCEPTED;
        invite.respondedAt = new Date().toISOString();

        // Update Vault
        vault.freelancerId = mockUser.id;
        vault.freelancerName = mockUser.name || "Freelancer";
        vault.freelancerEmail = mockUser.email;

        // State Transitions
        if (vault.status === VaultStatus.FUNDED_UNASSIGNED) {
          vault.status = VaultStatus.FUNDED_ASSIGNED;
        } else {
          // If not funded, it stays INVITED but now has a freelancer assigned
          vault.status = VaultStatus.INVITED;
        }

        return { success: true, vaultId: vault.id };
      } else if (decision === "DECLINE") {
        invite.status = InviteStatus.DECLINED;
        invite.respondedAt = new Date().toISOString();
        invite.declineReason = reasonCode;

        // Vault logic: Clear placeholder if any, status logic
        if (vault.freelancerId === mockUser.id) {
          vault.freelancerId = null;
          vault.freelancerName = undefined;
          vault.freelancerEmail = undefined;
        }
        // Status typically stays as is (FUNDED_UNASSIGNED or INVITED) if declined

        return { success: true };
      } else {
        throw new Error("Invalid decision");
      }
    },
  },
  milestones: {
    submit: async (milestoneId: string, submissionData: any): Promise<Milestone> => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId)!;

      // STATE TRANSITION GUARD: Only allow submission from PENDING, REVISION_REQUESTED, or REJECTED
      const allowedStatuses: MilestoneStatusType[] = [MilestoneStatus.PENDING, MilestoneStatus.REVISION_REQUESTED, MilestoneStatus.REJECTED];
      if (!allowedStatuses.includes(milestone.status)) {
        throw {
          code: "INVALID_STATE_TRANSITION",
          message: `Cannot submit milestone from status "${milestone.status}". Allowed: ${allowedStatuses.join(", ")}.`,
          currentStatus: milestone.status,
          allowedStatuses,
          attemptedAction: "submit"
        };
      }

      milestone.status = MilestoneStatus.SUBMITTED;
      milestone.submission = {
        ...submissionData,
        submittedAt: new Date().toISOString(),
      };
      // Normalize rename summary to notes if it exists in data
      if (milestone.submission && (milestone.submission as any).summary) {
        milestone.submission.notes = (milestone.submission as any).summary;
        delete (milestone.submission as any).summary;
      }
      return milestone;
    },
    verify: async (milestoneId: string): Promise<Milestone> => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId)!;

      // STATE TRANSITION GUARD: Only allow verification from SUBMITTED
      if (milestone.status !== MilestoneStatus.SUBMITTED) {
        throw {
          code: "INVALID_STATE_TRANSITION",
          message: `Cannot verify milestone from status "${milestone.status}". Must be "${MilestoneStatus.SUBMITTED}".`,
          currentStatus: milestone.status,
          allowedStatuses: [MilestoneStatus.SUBMITTED],
          attemptedAction: "verify"
        };
      }

      milestone.status = MilestoneStatus.AWAITING_APPROVAL;
      milestone.verification = {
        result: "PASS",
        ruleResultsJson: [
          { code: "FORMAT", passed: true, message: "Valid deliverable format" },
          { code: "METADATA", passed: true, message: "Metadata extracted successfully" }
        ],
        verifiedAt: new Date().toISOString(),
        checks: ["AI", "Format", "Metadata"],
      };
      return milestone;
    },
    review: async (milestoneId: string, reviewData: any): Promise<Milestone> => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId)!;

      // STATE TRANSITION GUARD: Only allow review from AWAITING_APPROVAL
      if (milestone.status !== MilestoneStatus.AWAITING_APPROVAL) {
        throw {
          code: "INVALID_STATE_TRANSITION",
          message: `Cannot review milestone from status "${milestone.status}". Must be "${MilestoneStatus.AWAITING_APPROVAL}".`,
          currentStatus: milestone.status,
          allowedStatuses: [MilestoneStatus.AWAITING_APPROVAL],
          attemptedAction: "review"
        };
      }

      // MAP OUTCOME TO STATUS (never assign outcome directly to status)
      let newStatus: MilestoneStatusType;
      switch (reviewData.outcome) {
        case "APPROVE":
          newStatus = MilestoneStatus.VERIFIED;
          break;
        case "REQUEST_CHANGES":
          newStatus = MilestoneStatus.REVISION_REQUESTED;
          break;
        case "REJECT":
          newStatus = MilestoneStatus.REJECTED;
          break;
        default:
          throw {
            code: "INVALID_REVIEW_OUTCOME",
            message: `Invalid review outcome "${reviewData.outcome}". Must be one of: APPROVE, REQUEST_CHANGES, REJECT.`,
            providedOutcome: reviewData.outcome,
            allowedOutcomes: ["APPROVE", "REQUEST_CHANGES", "REJECT"]
          };
      }

      milestone.status = newStatus;
      milestone.review = {
        ...reviewData,
        submittedAt: new Date().toISOString(),
        status: newStatus,
      };

      // Update Vault status if all milestones terminal
      if (vault.milestones.every(m => m.status === MilestoneStatus.VERIFIED)) {
        vault.status = VaultStatus.COMPLETED;
      }

      return milestone;
    },
    getEvidence: async (milestoneId: string): Promise<any[]> => {
      await sleep(DELAY_MS / 2);
      const { evidence } = await import("@/lib/mock/evidence");
      return (evidence as any[]).filter(e => e.milestoneId === milestoneId);
    }
  },
  onboarding: {
    setRole: async (role: UserRoleType): Promise<User> => {
      await sleep(DELAY_MS);
      mockUser.role = role;
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      return mockUser;
    },
    submitKyc: async (_kycData: any): Promise<User> => {
      await sleep(DELAY_MS * 2);
      mockUser.kycStatus = "VERIFIED";
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      return mockUser;
    },
    getStatus: async () => {
      await sleep(DELAY_MS / 2);
      return {
        roleSet: mockUser.role !== UserRole.NONE,
        kycVerified: mockUser.kycStatus === "VERIFIED",
        emailVerified: mockUser.emailVerified
      };
    }
  },
  notifications: {
    list: async () => {
      await sleep(DELAY_MS);
      return getNotificationsFromDB();
    },
    markAsRead: async (id: number) => {
      await sleep(DELAY_MS / 2);
      const notifications = getNotificationsFromDB();
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotificationsToDB(updated);
      return { success: true };
    },
    markAllAsRead: async () => {
      await sleep(DELAY_MS / 2);
      const notifications = getNotificationsFromDB();
      const updated = notifications.map(n => ({ ...n, read: true }));
      saveNotificationsToDB(updated);
      return { success: true };
    },
    getUnreadCount: async () => {
      const notifications = getNotificationsFromDB();
      return notifications.filter(n => !n.read).length;
    },

    // Notification Preferences
    getPreferences: async () => {
      await sleep(DELAY_MS / 2);
      ensureSession();

      if (typeof window === "undefined") {
        return getDefaultNotificationPreferences();
      }

      try {
        const stored = localStorage.getItem(`${NOTIFICATION_PREFS_KEY}_${mockUser.id}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to load notification preferences", e);
      }

      return getDefaultNotificationPreferences();
    },

    updatePreferences: async (updates: any) => {
      await sleep(DELAY_MS);
      ensureSession();

      const current = await api.notifications.getPreferences();
      const updated = {
        ...current,
        ...updates,
        // Deep merge for nested objects
        telegram: updates.telegram ? { ...current.telegram, ...updates.telegram } : current.telegram,
        whatsapp: updates.whatsapp ? { ...current.whatsapp, ...updates.whatsapp } : current.whatsapp,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(`${NOTIFICATION_PREFS_KEY}_${mockUser.id}`, JSON.stringify(updated));
      }

      return updated;
    }
  },

  telegram: {
    getLinkToken: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // Generate a unique link token
      const token = `tg_${mockUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store the token temporarily (in real app, this would be in backend)
      if (typeof window !== "undefined") {
        localStorage.setItem(`telegram_link_token_${mockUser.id}`, token);
      }

      return { linkToken: token };
    },

    // Simulate Telegram bot callback (in real app, this would be a webhook)
    simulateConnect: async (username: string) => {
      await sleep(DELAY_MS);
      ensureSession();

      const prefs = await api.notifications.getPreferences();
      const updated = await api.notifications.updatePreferences({
        telegram: {
          connected: true,
          enabled: true,
          username: username,
        }
      });

      return { success: true, preferences: updated };
    },

    disconnect: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      const updated = await api.notifications.updatePreferences({
        telegram: {
          connected: false,
          enabled: false,
          username: undefined,
        }
      });

      // Clear link token
      if (typeof window !== "undefined") {
        localStorage.removeItem(`telegram_link_token_${mockUser.id}`);
      }

      return { success: true, preferences: updated };
    }
  },

  whatsapp: {
    startVerification: async (phoneE164: string) => {
      await sleep(DELAY_MS);
      ensureSession();

      // Validate phone format (basic)
      if (!phoneE164.startsWith('+') || phoneE164.length < 10) {
        throw new Error("Invalid phone number format. Use E.164 format (e.g., +1234567890)");
      }

      // Store pending verification
      if (typeof window !== "undefined") {
        localStorage.setItem(`whatsapp_pending_${mockUser.id}`, JSON.stringify({
          phoneE164,
          code: "123456", // Mock verification code
          timestamp: Date.now()
        }));
      }

      return { success: true, message: "Verification code sent via WhatsApp" };
    },

    confirmVerification: async (code: string, consented: boolean) => {
      await sleep(DELAY_MS);
      ensureSession();

      if (!consented) {
        throw new Error("You must consent to receive WhatsApp alerts");
      }

      // Check pending verification
      if (typeof window === "undefined") {
        throw new Error("No pending verification found");
      }

      const pendingStr = localStorage.getItem(`whatsapp_pending_${mockUser.id}`);
      if (!pendingStr) {
        throw new Error("No pending verification found. Please request a new code.");
      }

      const pending = JSON.parse(pendingStr);

      // Check if code expired (5 minutes)
      if (Date.now() - pending.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem(`whatsapp_pending_${mockUser.id}`);
        throw new Error("Verification code expired. Please request a new code.");
      }

      // Verify code (mock - accept "123456")
      if (code !== pending.code) {
        throw new Error("Invalid verification code");
      }

      // Update preferences
      const updated = await api.notifications.updatePreferences({
        whatsapp: {
          enabled: true,
          phoneVerified: true,
          phoneE164: pending.phoneE164,
          consentedAt: new Date().toISOString(),
        }
      });

      // Clear pending verification
      localStorage.removeItem(`whatsapp_pending_${mockUser.id}`);

      return { success: true, preferences: updated };
    },

    disable: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      const updated = await api.notifications.updatePreferences({
        whatsapp: {
          enabled: false,
          phoneVerified: false,
          phoneE164: undefined,
          consentedAt: undefined,
        }
      });

      return { success: true, preferences: updated };
    }
  }
};

// Helper function for default notification preferences
function getDefaultNotificationPreferences() {
  return {
    inApp: true,
    emailEnabled: true,
    telegram: {
      enabled: false,
      connected: false,
      username: undefined,
    },
    whatsapp: {
      enabled: false,
      phoneVerified: false,
      phoneE164: undefined,
      consentedAt: undefined,
    }
  };
}
