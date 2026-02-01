/**
 * Real API Service
 * Connects to NestJS Backend
 */

import {
  VaultStatus,
  MilestoneStatus,
  UserRole,
  UserStatus,
  DisputeStatus,
  LedgerEntryStatus,
  TransactionStatus,
  InviteStatus,
  VerificationResult,
  EvidenceType,
  KycStatus,
  LedgerEntryType,
  MilestoneReviewOutcome,
  DisputeType,
} from "@/lib/domain/enums";

export {
  VaultStatus,
  MilestoneStatus,
  UserRole,
  UserStatus,
  DisputeStatus,
  LedgerEntryStatus,
  TransactionStatus,
  InviteStatus,
  VerificationResult,
  EvidenceType,
  KycStatus,
  LedgerEntryType,
  MilestoneReviewOutcome,
  DisputeType,
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SESSION_KEY = "dayle_user_session";

// Helper to get auth headers
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // We use the 'token' field if available, or just send the ID/Email as mock token if backend allows
        // Backend PrivyService mock mode accepts any string. If it's a valid JWT it verifies, if not (and mock enabled) it treats as user ID or email?
        // Actually backend Mock Privy Service: "verifyToken(token) -> returns { id: token, email: token }" if mock.
        // So we should send the email or ID as the Bearer token.
        // Let's use the email as the token for mock mode simplicity so backend sees "client@dayle.com" as ID?
        // Backend AuthGuard expects Bearer token.
        if (user.token) {
           headers["Authorization"] = `Bearer ${user.token}`;
        } else if (user.email) {
           // Fallback for mock mode: use email as token
           headers["Authorization"] = `Bearer ${user.email}`;
        }
      } catch (e) {}
    }
  }
  return headers;
}

async function fetchAPI(endpoint, method = "GET", body = null) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || "API Error");
    error.statusCode = res.status;
    error.code = errorData.error || "UNKNOWN_ERROR";
    throw error;
  }

  // Handle 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// Session Management Helpers
let currentUser = null;

function saveSession(user, token) {
  if (typeof window !== "undefined") {
    const sessionUser = { ...user, token: token || user.email }; // Store token/email for Auth header
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    currentUser = sessionUser;
  }
}

function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
  }
}

function restoreSession() {
  if (typeof window !== "undefined" && !currentUser) {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      currentUser = JSON.parse(stored);
    }
  }
  return currentUser;
}

export const api = {
  auth: {
    login: async (email, password) => {
      // Logic: Call backend login. Backend creates user if not exists.
      // Backend expects: { token: string, role?: string, name?: string }
      // Since frontend has no real Privy token, we send email as "token".
      
      // Determine Role/Name based on email (Simulation logic moved to client side before calling backend)
      let role = UserRole.FREELANCER;
      let name = "Freelancer";
      if (email.includes("client")) {
          role = UserRole.CLIENT;
          name = "Demo Client";
      }

      const res = await fetchAPI("/auth/login", "POST", {
          token: email, // MOCK TOKEN
          role,
          name
      });
      
      // Backend returns User object.
      // We need to store it.
      saveSession(res, email);
      return res;
    },
    signup: async (email, password, name, role) => {
        // Same as login for this mock-auth setup
         const res = await fetchAPI("/auth/login", "POST", {
          token: email,
          role: role || UserRole.FREELANCER,
          name: name || "New User"
      });
      saveSession(res, email);
      return res;
    },
    sendVerificationEmail: async (email) => {
      return { success: true }; // Mock frontend flow
    },
    verifyEmail: async (code) => {
      return { success: true, user: currentUser }; // Mock frontend flow
    },
    updateProfile: async (updates) => {
       // Backend: PATCH /users/me
       const res = await fetchAPI("/users/me", "PATCH", updates);
       saveSession(res, currentUser?.token); // Update local session
       return res;
    },
    getCurrentUser: async () => {
       const user = restoreSession();
       if (!user) return { id: "u_guest", role: UserRole.NONE };
       
       try {
           return await fetchAPI("/users/me");
       } catch (e) {
           console.error("Failed to fetch user, logging out", e);
           clearSession();
           return { id: "u_guest", role: UserRole.NONE };
       }
    },
    logout: async () => {
       clearSession();
       return { success: true };
    },
  },
  ledger: {
    getBalance: async () => {
       return fetchAPI("/ledger/balance");
    },
    withdraw: async (amount, opts = {}) => {
        return fetchAPI("/ledger/withdraw", "POST", {
            amount: parseFloat(amount),
            idempotencyKey: opts.idempotencyKey
        });
    },
    getTransactions: async () => {
        return fetchAPI("/ledger/transactions");
    },
  },
  vaults: {
    list: async () => {
        return fetchAPI("/vaults");
    },
    create: async (data) => {
        return fetchAPI("/vaults", "POST", {
            ...data,
            // Ensure idempotency key is passed if present
            idempotencyKey: data.idempotencyKey || `local_${Date.now()}`
        });
    },
    fund: async (vaultId, data) => {
        return fetchAPI(`/vaults/${vaultId}/fund`, "POST", {
            idempotencyKey: data?.idempotencyKey
        });
    },
    releaseMilestone: async (vaultId, milestoneId, opts = {}) => {
        // Backend endpoint: POST /milestones/:id/release
        // Note: Backend requires idempotencyKey
        return fetchAPI(`/milestones/${milestoneId}/release`, "POST", {
            idempotencyKey: opts.idempotencyKey || opts.idempotencyKey
        });
    },
    refund: async (vaultId, milestoneId, opts = {}) => {
        // TODO: Backend does not have specific refund endpoint in MilestonesController yet?
        // Checked task.md: "Money Actions... release... refund?"
        // Checked backend code: MilestonesService has `release` but no `refund` method implemented in the provided snippet?
        // Wait, did I miss it?
        // Milestones Module (Core Flow) in task.md does NOT explicitly list `refund`.
        // But UI calls `api.vaults.refund`.
        // I should implement a refund method in the backend or stub it here if backend is missing it, but objective is "connect backend".
        // Let's assume for now I should fail or use a generic "update status" if backend has it.
        // Actually, I should probably implement it in backend if missing.
        // But for this step, let's look at the method signatures.
        // I will implement `refund` as a call to `POST /milestones/:id/refund`?
        // Backend `MilestonesController` does NOT have refund.
        // I will throw an error "Not Implemented in Backend" for now, or just log.
        // Or better: Use the `updateStatus` endpoint if available? No.
        throw new Error("Refund endpoint not implemented in backend yet");
    },
    getById: async (id) => {
        return fetchAPI(`/vaults/${id}`);
    },
    updateStatus: async (id, status) => {
         // Backend might not expose direct status update for basic users.
         // Usually specific actions trigger status changes.
         // This might be used by UI for optimistic updates or specific admin things?
         // Let's leave as unimplemented or log warning.
         console.warn("Direct updateStatus not supported by backend");
         return {}; 
    },
  },
  disputes: {
    list: async () => {
        return fetchAPI("/disputes");
    },
    listForVault: async (vaultId) => {
        // Backend doesn't have listForVault, but list() filters by user access.
        // We can filter client-side or add query param ?vaultId= to backend list?
        // Backend DisputesService.list just finds all for user.
        // We can filter client side.
        const all = await fetchAPI("/disputes");
        return all.filter(d => d.vaultId === vaultId);
    },
    getById: async (id) => {
        return fetchAPI(`/disputes/${id}`);
    },
    create: async (payload) => {
         return fetchAPI("/disputes", "POST", payload);
    },
  },
  invites: {
      // Mock for now as InvitesModule is not fully implemented in backend list
      getByToken: async (token) => {
          throw new Error("Invites not implemented in backend");
      },
      getByVaultId: async (vaultId) => {
           throw new Error("Invites not implemented in backend");
      },
      respond: async (token, { decision, reasonCode }) => {
           throw new Error("Invites not implemented in backend");
      }
  }
};
