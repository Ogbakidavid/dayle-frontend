/**
 * Mock API Service
 * Simulates backend latency
 */

import { vaults as seedVaults } from "@/lib/mock/vaults";
import { disputes as seedDisputes } from "@/lib/mock/disputes";
import { seedInvites } from "@/lib/mock/invites";

const SESSION_KEY = "mock_user_session";

const DELAY_MS = 600;

export const UserRole = {
  CLIENT: "CLIENT",
  FREELANCER: "FREELANCER",
  ADMIN: "ADMIN",
  NONE: "NONE",
};

export const KycStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  NONE: "NONE",
};

export const VerificationResult = {
  PASS: "PASS",
  FAIL: "FAIL",
  FLAGGED: "FLAGGED",
  HUMAN_REVIEW: "HUMAN_REVIEW",
};

export const LedgerEntryType = {
  DEPOSIT: "DEPOSIT",
  LOCK: "LOCK",
  RELEASE: "RELEASE",
  REFUND: "REFUND",
  WITHDRAW: "WITHDRAW",
  FEE: "FEE",
};

export const VaultStatus = {
  DRAFT: "DRAFT",
  INVITED: "INVITED",
  FUNDED_UNASSIGNED: "FUNDED_UNASSIGNED",
  FUNDED_ASSIGNED: "FUNDED_ASSIGNED",
  ACTIVE: "ACTIVE",
  IN_REVIEW: "IN_REVIEW",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PAUSED: "PAUSED",
};

// Mock Database
let mockUser = {
  id: "u_guest",
  email: "",
  name: "Guest",
  role: UserRole.NONE,
  kycStatus: KycStatus.NONE,
  profileImage: null,
};

let mockWallet = {
  available: 0,
  pending: 0,
  transactions: [],
};

const mockVaults = seedVaults.map((vault) => ({ ...vault }));
const mockDisputes = seedDisputes.map((dispute) => ({ ...dispute }));
const mockInvites = seedInvites.map((invite) => ({ ...invite }));

// Simple idempotency map for money/create operations in the mock API
const mockIdempotencyMap = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate a stable professional male avatar URL
function getProfessionalAvatar(email, id) {
  return null; // Using jdenticon on frontend instead
}

// Helper to restore session
function ensureSession() {
  if (typeof window !== "undefined" && mockUser.role === UserRole.NONE) {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        mockUser = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      await sleep(DELAY_MS);
      if (email.includes("client")) {
        mockUser = {
          ...mockUser,
          id: "u_client_1",
          email, // Track login email
          name: "Demo Client", // Set a better name
          role: UserRole.CLIENT,
          kycStatus: KycStatus.VERIFIED,
        };
      } else if (email.includes("freelancer")) {
        mockUser = {
          ...mockUser,
          id: "u_freelancer_1",
          email, // Track login email
          name: "Demo Freelancer", // Set a better name
          role: UserRole.FREELANCER,
          kycStatus: KycStatus.VERIFIED,
        };
      } else {
        // Default generic user
        const nameFromEmail = email.split("@")[0];
        mockUser = {
          ...mockUser,
          id: `u_${Math.random().toString(36).substr(2, 9)}`,
          email,
          name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
          role: UserRole.FREELANCER,
          kycStatus: KycStatus.VERIFIED,
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      
      // Ensure profile image exists
      if (!mockUser.profileImage && mockUser.role !== UserRole.NONE) {
        mockUser.profileImage = getProfessionalAvatar(mockUser.email, mockUser.id);
      }

      return { ...mockUser };
    },
    signup: async (email, password, name, role) => {
      await sleep(DELAY_MS);
      // Use the provided role, or default to Freelancer
      const finalRole = role || UserRole.FREELANCER;
      const nameFromEmail = email.split("@")[0];
      const displayName = name || (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
      
      mockUser = {
        ...mockUser,
        email,
        name: displayName,
        id: `u_${Math.random().toString(36).substr(2, 9)}`,
        role: finalRole,
        kycStatus: KycStatus.NONE,
        emailVerified: false,
        profileImage: getProfessionalAvatar(email, null)
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      return { ...mockUser };
    },
    sendVerificationEmail: async (email) => {
      await sleep(DELAY_MS);
      console.log(`[API] Verification code sent to ${email}`);
      return { success: true };
    },
    verifyEmail: async (code) => {
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
    updateProfile: async (updates) => {
      await sleep(DELAY_MS);
      mockUser = { ...mockUser, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
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
        const nameFromEmail = mockUser.email.split("@")[0];
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
      };
      if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_KEY);
      }
      return { success: true };
    },
  },
  wallet: {
    getBalance: async () => {
      await sleep(DELAY_MS);
      // Simulate some funds for demo
      if (mockUser.role === UserRole.CLIENT) {
        return { available: 50000, pending: 2500 };
      }
      return { available: 1200, pending: 800 };
    },
    withdraw: async (amount, opts = {}) => {
      await sleep(DELAY_MS);
      ensureSession();

      const idempotencyKey = opts.idempotencyKey;
      if (idempotencyKey && mockIdempotencyMap[idempotencyKey]) {
        return mockIdempotencyMap[idempotencyKey];
      }

      const tx = {
        id: `TX_${Date.now()}`,
        createdAt: new Date().toISOString(),
        type: 'WITHDRAW',
        amount: -Math.abs(Number(amount) || 0),
        currency: 'USD',
        status: 'PENDING',
      };

      // In a real system we'd update balances after webhook confirmation. Here we simulate immediate effect.
      mockWallet.available = Math.max(0, (mockWallet.available || 0) + tx.amount);
      mockWallet.transactions = mockWallet.transactions || [];
      mockWallet.transactions.unshift(tx);

      if (idempotencyKey) mockIdempotencyMap[idempotencyKey] = tx;
      return tx;
    },
    getTransactions: async () => {
      await sleep(DELAY_MS);
      return [
        {
          id: "TX_1001",
          createdAt: "2025-09-30",
          type: "DEPOSIT",
          amount: 5000,
          currency: "USD",
          status: "CONFIRMED",
        },
        {
          id: "TX_1002",
          createdAt: "2025-10-04",
          type: "WITHDRAW",
          amount: -2500,
          currency: "USD",
          status: "CONFIRMED",
        },
      ];
    },
  },
  vaults: {
    list: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // HACK: Self-heal stale data if HMR didn't update mockVaults with new schema keys
      if (mockVaults.length > 0 && !mockVaults[0].clientId) {
        console.warn(
          "[API] Detected stale mock data (missing clientId), re-syncing from seed..."
        );
        const fresh = seedVaults.map((v) => ({ ...v }));
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
    create: async (data) => {
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
    releaseMilestone: async (vaultId, milestoneId, opts = {}) => {
      await sleep(DELAY_MS);
      ensureSession();

      // Validate vault access
      const vault = mockVaults.find((v) => v.id === vaultId);
      if (!vault) throw new Error('Vault not found');
      if (vault.clientId !== mockUser.id) throw new Error('Unauthorized');

      const milestone = (vault.milestones || []).find((m) => m.id === milestoneId);
      if (!milestone) throw new Error('Milestone not found');

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
        status: 'PENDING',
        amount: Number(milestone.amount) || 0,
        currency: 'USD',
        description: `Release for ${milestone.title}`,
      };

      // Mark milestone as verified/pending release in mock
      milestone.status = 'VERIFIED';
      milestone.releasedAt = new Date().toISOString();

      if (idempotencyKey) mockIdempotencyMap[idempotencyKey] = ledgerEntry;

      return ledgerEntry;
    },
    getById: async (id) => {
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
    updateStatus: async (id, status) => {
      await sleep(DELAY_MS);
      const idx = mockVaults.findIndex((v) => v.id === id);
      if (idx !== -1) {
        mockVaults[idx] = { ...mockVaults[idx], status };
        return mockVaults[idx];
      }
      throw new Error("Vault not found");
    },
  },
  disputes: {
    list: async () => {
      await sleep(DELAY_MS);
      ensureSession();

      // HACK: Self-heal stale data if HMR didn't update mockVaults with new schema keys
      if (mockVaults.length > 0 && !mockVaults[0].clientId) {
        console.warn(
          "[API] Detected stale mock data (missing clientId), re-syncing from seed..."
        );
        const fresh = seedVaults.map((v) => ({ ...v }));
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
    listForVault: async (vaultId) => {
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
    getById: async (id) => {
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
    create: async (payload) => {
      await sleep(DELAY_MS);
      // Validate access to vault
      const vault = mockVaults.find((v) => v.id === payload.vaultId);
      if (
        !vault ||
        (vault.clientId !== mockUser.id && vault.freelancerId !== mockUser.id)
      ) {
        throw new Error("Unauthorized");
      }

      const newDispute = {
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
    getByToken: async (token) => {
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
          totalAmount: vault.totalAmount || vault.amount,
          milestoneCount: vault.milestones?.length || 0,
          status: vault.status,
          isFunded: vault.status.includes("FUNDED") || vault.status === "ACTIVE",
        },
      };
    },
    getByVaultId: async (vaultId) => {
      await sleep(DELAY_MS);
      // Get the most recent invite for this vault
      const invitesForVault = mockInvites.filter((i) => i.vaultId === vaultId);
      if (invitesForVault.length === 0) return null;

      // Sort by invitedAt descending
      invitesForVault.sort((a, b) => new Date(b.invitedAt) - new Date(a.invitedAt));
      return invitesForVault[0];
    },
    respond: async (token, { decision, reasonCode }) => {
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
        invite.status = "ACCEPTED";
        invite.respondedAt = new Date().toISOString();

        // Update Vault
        vault.freelancerId = mockUser.id;
        // simplistic update to freelancer object on vault
        vault.freelancer = {
          name: mockUser.name || "Freelancer",
          email: mockUser.email,
        };

        // State Transitions
        // State Transitions
        if (vault.status === VaultStatus.FUNDED_UNASSIGNED) {
          vault.status = VaultStatus.FUNDED_ASSIGNED;
        } else {
          // If not funded, it stays INVITED but now has a freelancer assigned
          vault.status = VaultStatus.INVITED;
        }

        return { success: true, vaultId: vault.id };
      } else if (decision === "DECLINE") {
        invite.status = "DECLINED";
        invite.respondedAt = new Date().toISOString();
        invite.declineReason = reasonCode;

        // Vault logic: Clear placeholder if any, status logic
        if (vault.freelancerId === mockUser.id) {
          vault.freelancerId = null;
          vault.freelancer = null;
        }
        // Status typically stays as is (FUNDED_UNASSIGNED or INVITED) if declined

        return { success: true };
      } else {
        throw new Error("Invalid decision");
      }
    },
  },
  milestones: {
    submit: async (milestoneId, submissionData) => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId);
      
      milestone.status = "SUBMITTED";
      milestone.submission = {
        ...submissionData,
        submittedAt: new Date().toISOString(),
        milestoneId
      };
      // Normalize rename summary to notes if it exists in data
      if (milestone.submission.summary) {
        milestone.submission.notes = milestone.submission.summary;
        delete milestone.submission.summary;
      }
      return milestone;
    },
    verify: async (milestoneId) => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId);
      
      milestone.status = "AWAITING_APPROVAL";
      milestone.verification = {
        milestoneId,
        result: "PASS",
        ruleResultsJson: [
          { code: "FORMAT", passed: true, message: "Valid deliverable format" },
          { code: "METADATA", passed: true, message: "Metadata extracted successfully" }
        ],
        verifiedAt: new Date().toISOString(),
        reviewedBy: "AI",
      };
      return milestone;
    },
    review: async (milestoneId, reviewData) => {
      await sleep(DELAY_MS);
      const vault = mockVaults.find(v => v.milestones.some(m => m.id === milestoneId));
      if (!vault) throw new Error("Milestone not found");
      const milestone = vault.milestones.find(m => m.id === milestoneId);
      
      milestone.status = reviewData.outcome; // VERIFIED | REJECTED | REVISION_REQUESTED
      milestone.review = {
        ...reviewData,
        reviewedAt: new Date().toISOString(),
        milestoneId
      };
      
      // Update Vault status if all milestones terminal
      if (vault.milestones.every(m => m.status === "VERIFIED")) {
        vault.status = "COMPLETED";
      }
      
      return milestone;
    },
    getEvidence: async (milestoneId) => {
      await sleep(DELAY_MS / 2);
      const { evidence } = await import("@/lib/mock/evidence");
      return evidence.filter(e => e.milestoneId === milestoneId);
    }
  },
  onboarding: {
    setRole: async (role) => {
      await sleep(DELAY_MS);
      mockUser.role = role;
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      return mockUser;
    },
    submitKyc: async (kycData) => {
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
};
