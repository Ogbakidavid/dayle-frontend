/**
 * Mock API Service
 * Simulates backend latency
 */

import { vaults as seedVaults } from "@/lib/mock/vaults";
import { disputes as seedDisputes } from "@/lib/mock/disputes";

const SESSION_KEY = "mock_user_session";

const DELAY_MS = 600;

export const UserRole = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  NONE: "none",
};

export const KycStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  NONE: "none",
};

export const VaultStatus = {
  PENDING: "pending", // Draft
  ACTIVE: "active", // Funded, work in progress
  REVIEW: "review", // Work submitted
  COMPLETED: "completed", // Funds released
  CANCELLED: "cancelled",
};

// Mock Database
let mockUser = {
  id: "u_123456",
  email: "demo@cleard.com",
  name: "Demo User",
  role: UserRole.NONE,
  kycStatus: KycStatus.NONE,
};

let mockWallet = {
  available: 0,
  pending: 0,
  transactions: [],
};

const mockVaults = seedVaults.map((vault) => ({ ...vault }));
const mockDisputes = seedDisputes.map((dispute) => ({ ...dispute }));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
          role: UserRole.CLIENT,
          kycStatus: KycStatus.VERIFIED,
        };
      } else if (email.includes("freelancer")) {
        mockUser = {
          ...mockUser,
          id: "u_freelancer_1",
          role: UserRole.FREELANCER,
          kycStatus: KycStatus.VERIFIED,
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
      }
      return { ...mockUser };
    },
    signup: async (email, password) => {
      await sleep(DELAY_MS);
      mockUser = { ...mockUser, email };
      return { ...mockUser };
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

      return { ...mockUser };
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
    getTransactions: async () => {
      await sleep(DELAY_MS);
      return [
        {
          id: "TX_1001",
          date: "2025-09-30",
          type: "deposit",
          amount: 5000,
          status: "completed",
          description: "Project Settlement: Website Redesign",
        },
        {
          id: "TX_1002",
          date: "2025-10-04",
          type: "withdraw",
          amount: -2500,
          status: "completed",
          description: "Withdrawal to External Bank",
        },
        {
          id: "TX_1003",
          date: "2025-10-10",
          type: "deposit",
          amount: 1500,
          status: "completed",
          description: "Milestone 1: Backend API",
        },
        {
          id: "TX_1004",
          date: "2025-10-15",
          type: "withdraw",
          amount: -800,
          status: "completed",
          description: "Platform Service Fee",
        },
        {
          id: "TX_1005",
          date: "2025-10-20",
          type: "deposit",
          amount: 3200,
          status: "completed",
          description: "Project Settlement: Mobile App UI",
        },
        {
          id: "TX_1006",
          date: "2025-10-25",
          type: "withdraw",
          amount: -1200,
          status: "completed",
          description: "Batch Payout to Card",
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
      const newVault = {
        id: `v_${Date.now()}`,
        status: VaultStatus.PENDING,
        createdAt: new Date().toISOString(),
        milestones: [],
        clientId: mockUser.role === UserRole.CLIENT ? mockUser.id : undefined,
        freelancerId:
          mockUser.role === UserRole.FREELANCER ? mockUser.id : undefined,
        ...data,
      };
      mockVaults.push(newVault);
      return newVault;
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
        openedBy: mockUser.role, // "client" or "freelancer" string
        openedByUserId: mockUser.id,
        openedAt: new Date().toISOString(),
        status: "open",
        events: [],
        ...payload,
      };

      // Initial event
      newDispute.events.push({
        id: `ev-${Date.now()}`,
        timestamp: newDispute.openedAt,
        actor: mockUser.role === UserRole.CLIENT ? "Client" : "Freelancer",
        type: "OPENED",
        payload: {
          reasonCode: payload.reasonCode,
          requirementRef: payload.requirementRef,
          summary: payload.summary,
        },
      });

      mockDisputes.push(newDispute);
      return newDispute;
    },
  },
};
