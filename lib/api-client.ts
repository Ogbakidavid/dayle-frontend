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

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_PREFIX = "/api";

interface RequestOptions extends RequestInit {
  body?: any;
}

// HTTP request helper
async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Important: sends cookies with requests
  };

  // Add body if present
  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    let data: any;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle error responses
      const error: any = new Error(data.message || "API request failed");
      error.code = data.code;
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error: any) {
    // Silently handle 401 errors (user not authenticated)
    // These are expected and not actual errors
    if (error.statusCode !== 401) {
      console.error(`API Error [${method} ${endpoint}]:`, {
        message: error.message,
        code: error.code,
        data: error.data,
        status: error.statusCode
      });
    }
    throw error;
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<any> => {
      const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      
      // Tokens are now in httpOnly cookies, no need to store manually
      return data.user;
    },

    signup: async (email: string, password: string, name: string, role: string): Promise<any> => {
      const data = await request("/auth/signup", {
        method: "POST",
        body: { email, password, name, role },
      });
      
      // Tokens are now in httpOnly cookies, no need to store manually
      return data.user;
    },

    sendVerificationEmail: async (email: string): Promise<any> => {
      return await request("/auth/send-verification-email", {
        method: "POST",
        body: { email },
      });
    },

    verifyEmail: async (token: string): Promise<any> => {
      const data = await request("/auth/verify-email", {
        method: "POST",
        body: { token },
      });
      return data;
    },

    updateProfile: async (updates: any): Promise<any> => {
      return await request("/auth/profile", {
        method: "PATCH",
        body: updates,
      });
    },

    getCurrentUser: async (token?: string): Promise<any> => {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return await request("/auth/me", { headers });
    },

    logout: async (): Promise<any> => {
      const result = await request("/auth/logout", {
        method: "POST",
      });
      // Backend clears cookies, no need to clear localStorage
      return result;
    },

    // 2FA Pending State Management (client-side only)
    setPending2FA: (email: string, password: string): void => {
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

    clearPending2FA: (): void => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_2fa_auth");
      }
    },

    linkSmartAccount: async (payload: any): Promise<any> => {
      return await request("/auth/smart-account", {
        method: "POST",
        body: payload,
      });
    },

    socialLogin: async (dto: { accessToken: string; role?: string }): Promise<any> => {
      const data = await request("/auth/social-login", {
        method: "POST",
        body: dto,
      });
      return data.user;
    },
  },

  security: {
    // Two-Factor Authentication
    enable2FA: async (): Promise<any> => {
      return await request("/auth/2fa/enable", {
        method: "POST",
      });
    },

    verify2FA: async (code: string, tempSecret: string): Promise<any> => {
      return await request("/auth/2fa/verify", {
        method: "POST",
        body: { code, tempSecret },
      });
    },

    disable2FA: async (code: string): Promise<any> => {
      return await request("/auth/2fa/disable", {
        method: "POST",
        body: { code },
      });
    },

    get2FAStatus: async (): Promise<any> => {
      return await request("/auth/2fa/status");
    },

    // Session Management
    getSessions: async (): Promise<any> => {
      return await request("/auth/sessions");
    },

    revokeSession: async (sessionId: string): Promise<any> => {
      return await request(`/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });
    },

    revokeAllSessions: async (): Promise<any> => {
      return await request("/auth/sessions", {
        method: "DELETE",
      });
    },

    // Password Management
    changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
      return await request("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
    },

    // Login-specific 2FA methods
    check2FAOnLogin: async (email: string, password: string): Promise<any> => {
      // This would be part of the login flow
      // For now, return false as backend handles this
      return { requires2FA: false };
    },

    verify2FAOnLogin: async (email: string, code: string): Promise<any> => {
      return await request("/auth/2fa/verify-login", {
        method: "POST",
        body: { email, code },
      });
    },
  },

  ledger: {
    getBalance: async (): Promise<any> => {
      return await request("/ledger/balance");
    },

    withdraw: async (amount: number, opts: any = {}): Promise<any> => {
      const { idempotencyKey } = opts;
      return await request("/ledger/withdraw", {
        method: "POST",
        body: { amount, idempotencyKey },
      });
    },

    getTransactions: async (): Promise<any> => {
      const data = await request("/ledger/transactions");
      return data.transactions;
    },
  },

  vaults: {
    list: async (): Promise<any[]> => {
      const data = await request("/vaults");
      return data.vaults;
    },

    create: async (data: any): Promise<any> => {
      return await request("/vaults", {
        method: "POST",
        body: data,
      });
    },

    fund: async (vaultId: string, data: any): Promise<any> => {
      return await request(`/vaults/${vaultId}/fund`, {
        method: "POST",
        body: data,
      });
    },

    releaseMilestone: async (vaultId: string, milestoneId: string, opts: any = {}): Promise<any> => {
      return await request(`/vaults/${vaultId}/release-milestone`, {
        method: "POST",
        body: { milestoneId, ...opts },
      });
    },

    refund: async (vaultId: string, milestoneId: string, opts: any = {}): Promise<any> => {
      return await request(`/vaults/${vaultId}/refund`, {
        method: "POST",
        body: { milestoneId, ...opts },
      });
    },

    getById: async (id: string): Promise<any> => {
      return await request(`/vaults/${id}`);
    },

    updateStatus: async (id: string, status: string): Promise<any> => {
      return await request(`/vaults/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
  },

  disputes: {
    list: async (): Promise<any[]> => {
      const data = await request("/disputes");
      return data.disputes;
    },

    listForVault: async (vaultId: string): Promise<any[]> => {
      const data = await request(`/disputes?vaultId=${vaultId}`);
      return data.disputes;
    },

    getById: async (id: string): Promise<any> => {
      return await request(`/disputes/${id}`);
    },

    create: async (payload: any): Promise<any> => {
      return await request("/disputes", {
        method: "POST",
        body: payload,
      });
    },
  },

  invites: {
    getByToken: async (token: string): Promise<any> => {
      return await request(`/invites/token/${token}`);
    },

    getByVaultId: async (vaultId: string): Promise<any> => {
      return await request(`/invites/vault/${vaultId}`);
    },
    
    create: async (payload: any): Promise<any> => {
      return await request("/invites", {
        method: "POST",
        body: payload,
      });
    },

    respond: async (token: string, { decision, reasonCode }: { decision: string; reasonCode?: string }): Promise<any> => {
      return await request(`/invites/${token}/respond`, {
        method: "POST",
        body: { 
          action: decision === "ACCEPTED" || decision === "ACCEPT" ? "accept" : "decline", 
          declineReason: reasonCode 
        },
      });
    },
  },

  milestones: {
    submit: async (milestoneId: string, submissionData: any): Promise<any> => {
      return await request(`/milestones/${milestoneId}/submit`, {
        method: "POST",
        body: submissionData,
      });
    },

    verify: async (milestoneId: string): Promise<any> => {
      return await request(`/milestones/${milestoneId}/verify`, {
        method: "POST",
      });
    },

    review: async (milestoneId: string, reviewData: any): Promise<any> => {
      return await request(`/milestones/${milestoneId}/review`, {
        method: "POST",
        body: reviewData,
      });
    },

    getEvidence: async (milestoneId: string): Promise<any> => {
      return await request(`/milestones/${milestoneId}/evidence`);
    },
  },

  onboarding: {
    setRole: async (role: string): Promise<any> => {
      return await request("/onboarding/role", {
        method: "PATCH",
        body: { role },
      });
    },

    submitKyc: async (kycData: any): Promise<any> => {
      return await request("/onboarding/kyc", {
        method: "POST",
        body: kycData,
      });
    },

    getStatus: async (): Promise<any> => {
      return await request("/onboarding/status");
    },
  },

  evidence: {
    list: async (params?: { vaultId?: string; milestoneId?: string; disputeId?: string }): Promise<any[]> => {
      const queryParams = new URLSearchParams();
      if (params?.vaultId) queryParams.append("vaultId", params.vaultId);
      if (params?.milestoneId) queryParams.append("milestoneId", params.milestoneId);
      if (params?.disputeId) queryParams.append("disputeId", params.disputeId);
      
      const query = queryParams.toString();
      return await request(`/evidence${query ? `?${query}` : ""}`);
    },

    create: async (payload: any): Promise<any> => {
      return await request("/evidence", {
        method: "POST",
        body: payload,
      });
    },
  },
};
