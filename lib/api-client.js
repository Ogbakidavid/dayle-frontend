/**
 * Real API Client for Dayle Backend
 * Connects to NestJS backend at http://localhost:4000
 */

// Re-export enums from domain
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
} from "@/lib/domain/enums";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "dayle_access_token";
const REFRESH_TOKEN_KEY = "dayle_refresh_token";

// Helper to get auth token
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Helper to set tokens
function setTokens(accessToken, refreshToken) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

// Helper to clear tokens
function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// HTTP request helper
async function request(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Add body if present
  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle error responses
      const error = new Error(data.message || "API request failed");
      error.code = data.code;
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
        skipAuth: true,
      });
      
      // Store tokens
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      
      return data.user;
    },

    signup: async (email, password, name, role) => {
      const data = await request("/auth/signup", {
        method: "POST",
        body: { email, password, name, role },
        skipAuth: true,
      });
      
      // Store tokens
      if (data.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
      
      return data.user;
    },

    sendVerificationEmail: async (email) => {
      return await request("/auth/send-verification-email", {
        method: "POST",
        body: { email },
      });
    },

    verifyEmail: async (token) => {
      const data = await request("/auth/verify-email", {
        method: "POST",
        body: { token },
      });
      return data;
    },

    updateProfile: async (updates) => {
      return await request("/auth/profile", {
        method: "PATCH",
        body: updates,
      });
    },

    getCurrentUser: async () => {
      return await request("/auth/me");
    },

    logout: async () => {
      const result = await request("/auth/logout", {
        method: "POST",
      });
      clearTokens();
      return result;
    },

    // 2FA Pending State Management (client-side only)
    setPending2FA: (email, password) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_2fa_auth", JSON.stringify({ email, password, timestamp: Date.now() }));
      }
    },

    getPending2FA: () => {
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
      return await request("/auth/2fa/enable", {
        method: "POST",
      });
    },

    verify2FA: async (code, tempSecret) => {
      return await request("/auth/2fa/verify", {
        method: "POST",
        body: { code, tempSecret },
      });
    },

    disable2FA: async (code) => {
      return await request("/auth/2fa/disable", {
        method: "POST",
        body: { code },
      });
    },

    get2FAStatus: async () => {
      return await request("/auth/2fa/status");
    },

    // Session Management
    getSessions: async () => {
      return await request("/auth/sessions");
    },

    revokeSession: async (sessionId) => {
      return await request(`/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });
    },

    revokeAllSessions: async () => {
      return await request("/auth/sessions/revoke-all", {
        method: "POST",
      });
    },

    // Password Management
    changePassword: async (currentPassword, newPassword) => {
      return await request("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
    },

    // Login-specific 2FA methods
    check2FAOnLogin: async (email, password) => {
      // This would be part of the login flow
      // For now, return false as backend handles this
      return { requires2FA: false };
    },

    verify2FAOnLogin: async (email, code) => {
      return await request("/auth/2fa/verify-login", {
        method: "POST",
        body: { email, code },
        skipAuth: true,
      });
    },
  },

  ledger: {
    getBalance: async () => {
      return await request("/ledger/balance");
    },

    withdraw: async (amount, opts = {}) => {
      const { idempotencyKey } = opts;
      return await request("/ledger/withdraw", {
        method: "POST",
        body: { amount, idempotencyKey },
      });
    },

    getTransactions: async () => {
      return await request("/ledger/transactions");
    },
  },

  vaults: {
    list: async () => {
      return await request("/vaults");
    },

    create: async (data) => {
      return await request("/vaults", {
        method: "POST",
        body: data,
      });
    },

    fund: async (vaultId, data) => {
      return await request(`/vaults/${vaultId}/fund`, {
        method: "POST",
        body: data,
      });
    },

    releaseMilestone: async (vaultId, milestoneId, opts = {}) => {
      return await request(`/vaults/${vaultId}/milestones/${milestoneId}/release`, {
        method: "POST",
        body: opts,
      });
    },

    refund: async (vaultId, milestoneId, opts = {}) => {
      return await request(`/vaults/${vaultId}/milestones/${milestoneId}/refund`, {
        method: "POST",
        body: opts,
      });
    },

    getById: async (id) => {
      return await request(`/vaults/${id}`);
    },

    updateStatus: async (id, status) => {
      return await request(`/vaults/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
  },

  disputes: {
    list: async () => {
      return await request("/disputes");
    },

    listForVault: async (vaultId) => {
      return await request(`/disputes?vaultId=${vaultId}`);
    },

    getById: async (id) => {
      return await request(`/disputes/${id}`);
    },

    create: async (payload) => {
      return await request("/disputes", {
        method: "POST",
        body: payload,
      });
    },
  },

  invites: {
    getByToken: async (token) => {
      return await request(`/invites/${token}`, {
        skipAuth: true,
      });
    },

    getByVaultId: async (vaultId) => {
      return await request(`/invites/vault/${vaultId}`);
    },

    respond: async (token, { decision, reasonCode }) => {
      return await request(`/invites/${token}/respond`, {
        method: "POST",
        body: { decision, reasonCode },
      });
    },
  },

  milestones: {
    submit: async (milestoneId, submissionData) => {
      return await request(`/milestones/${milestoneId}/submit`, {
        method: "POST",
        body: submissionData,
      });
    },

    verify: async (milestoneId) => {
      return await request(`/milestones/${milestoneId}/verify`, {
        method: "POST",
      });
    },

    review: async (milestoneId, reviewData) => {
      return await request(`/milestones/${milestoneId}/review`, {
        method: "POST",
        body: reviewData,
      });
    },

    getEvidence: async (milestoneId) => {
      return await request(`/milestones/${milestoneId}/evidence`);
    },
  },

  onboarding: {
    setRole: async (role) => {
      return await request("/onboarding/role", {
        method: "POST",
        body: { role },
      });
    },

    submitKyc: async (kycData) => {
      return await request("/onboarding/kyc", {
        method: "POST",
        body: kycData,
      });
    },

    getStatus: async () => {
      return await request("/onboarding/status");
    },
  },

  evidence: {
    list: async (params) => {
      const queryParams = new URLSearchParams();
      if (params?.vaultId) queryParams.append("vaultId", params.vaultId);
      if (params?.milestoneId) queryParams.append("milestoneId", params.milestoneId);
      if (params?.disputeId) queryParams.append("disputeId", params.disputeId);
      
      const query = queryParams.toString();
      return await request(`/evidence${query ? `?${query}` : ""}`);
    },

    create: async (payload) => {
      return await request("/evidence", {
        method: "POST",
        body: payload,
      });
    },
  },
};
