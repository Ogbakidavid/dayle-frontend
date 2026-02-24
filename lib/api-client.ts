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

    socialLogin: async (dto: any): Promise<any> => {
      const data = await request("/auth/privy-login", {
        method: "POST",
        body: dto,
      });
      return data.user;
    },
  },

  security: {
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
  },

  ledger: {
    getBalance: async (): Promise<any> => {
      return await request("/ledger/balance");
    },

    withdraw: async (amount: number, bankDetails: any, opts: any = {}): Promise<any> => {
      const { idempotencyKey } = opts;
      return await request("/ledger/withdraw", {
        method: "POST",
        body: { amount, bankDetails, idempotencyKey },
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

  notifications: {
    list: async (): Promise<any[]> => {
      return await request("/notifications");
    },
    markAllAsRead: async (): Promise<any> => {
      return await request("/notifications/read-all", { method: "POST" });
    },
    markAsRead: async (id: number | string): Promise<any> => {
      return await request(`/notifications/${id}/read`, { method: "POST" });
    },
    getPreferences: async (): Promise<any> => {
      return await request("/notifications/preferences");
    },
    updatePreferences: async (prefs: any): Promise<any> => {
      return await request("/notifications/preferences", {
        method: "PATCH",
        body: prefs,
      });
    },
    createTest: async (): Promise<any> => {
      return await request("/notifications/test-seed", { method: "POST" });
    },
  },

  telegram: {
    getLinkToken: async (): Promise<any> => {
      return await request("/notifications/telegram/link-token");
    },
    simulateConnect: async (username: string): Promise<any> => {
       return await request("/notifications/telegram/connect", {
         method: "POST",
         body: { username },
       });
    },
    disconnect: async (): Promise<any> => {
       return await request("/notifications/telegram/disconnect", { method: "POST" });
    },
  },

  whatsapp: {
    startVerification: async (phone: string): Promise<any> => {
      return await request("/notifications/whatsapp/start-verification", {
         method: "POST",
         body: { phone },
       });
    },
    confirmVerification: async (code: string, consent: boolean): Promise<any> => {
      return await request("/notifications/whatsapp/confirm-verification", {
         method: "POST",
         body: { code, consent },
       });
    },
    disable: async (): Promise<any> => {
       return await request("/notifications/whatsapp/disable", { method: "POST" });
    },
  },
};