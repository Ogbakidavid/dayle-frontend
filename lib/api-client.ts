/**
 * Real API Client for Dayle Backend
 * Connects to NestJS backend at http://localhost:4000
 */

// Re-export enums from domain
export {
  VaultStatus,
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

  // Automatically add Authorization header if token exists in localStorage
  if (typeof window !== "undefined" && !config.headers.hasOwnProperty("Authorization")) {
    const token = localStorage.getItem("dayle_access_token");
    if (token) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }

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

export interface ApiClient {
  auth: {
    updateProfile: (updates: any) => Promise<any>;
    getCurrentUser: (token?: string) => Promise<any>;
    logout: () => Promise<any>;
    socialLogin: (dto: any) => Promise<any>;
  };
  security: {
    getSessions: () => Promise<any>;
    revokeSession: (sessionId: string) => Promise<any>;
    revokeAllSessions: () => Promise<any>;
  };
  ledger: {
    getBalance: () => Promise<any>;
    withdraw: (amount: number, currency: string, bankDetails: any, opts?: any) => Promise<any>;
    getTransactions: () => Promise<any>;
  };
  paymentMethods: {
    list: () => Promise<any[]>;
    addBank: (data: any) => Promise<any>;
    remove: (id: string) => Promise<any>;
    setDefault: (id: string) => Promise<any>;
    getBanks: (currency?: string) => Promise<any[]>;
    resolveBank: (bankCode: string, accountNumber: string, currency?: string) => Promise<any>;
  };
  vaults: {
    list: () => Promise<any[]>;
    create: (data: any) => Promise<any>;
    fund: (vaultId: string, data: any) => Promise<any>;
    release: (vaultId: string, opts?: any) => Promise<any>;
    submit: (vaultId: string, opts?: any) => Promise<any>;
    refund: (vaultId: string, opts?: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    updateStatus: (id: string, status: string) => Promise<any>;
    requestRefund: (vaultId: string, data: any) => Promise<any>;
    updateFreelancer: (vaultId: string, data: any) => Promise<any>;
    getStatus: (id: string) => Promise<any>;
    withdraw: (vaultId: string, data: { accountNumber: string, bankCode: string, accountName: string }) => Promise<any>;
    mockDeposit: (vaultId: string, data: { amount?: number, accountName?: string }) => Promise<any>;
    confirmPayment: (vaultId: string) => Promise<any>;
    requestRelease: (vaultId: string) => Promise<any>;
  };
  disputes: {
    list: () => Promise<any[]>;
    listForVault: (vaultId: string) => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (payload: any) => Promise<any>;
    proposeSettlement: (id: string, data: { amountToFreelancer: number; notes: string }) => Promise<any>;
    acceptSettlement: (id: string) => Promise<any>;
    requestTotalRefund: (id: string, data: { notes: string }) => Promise<any>;
    requestTotalRelease: (id: string, data: { notes: string }) => Promise<any>;
  };
  invites: {
    getByToken: (token: string) => Promise<any>;
    getByVaultId: (vaultId: string) => Promise<any>;
    listMyInvites: () => Promise<any[]>;
    create: (payload: any) => Promise<any>;
    respond: (token: string, data: { decision: string; reasonCode?: string }) => Promise<any>;
  };
  onboarding: {
    initialize: () => Promise<any>;
    setRole: (role: string) => Promise<any>;
    submitIdentity: (data: any) => Promise<any>;
    verifyIdentity: (data: any) => Promise<any>;
    selectKycMethod: (method: string) => Promise<any>;
    confirmKycPhone: (phone: string) => Promise<any>;
    verifyOtp: (otp: string) => Promise<any>;
    submitKyc: (kycData: any) => Promise<any>;
    getStatus: () => Promise<any>;
    getDiditSession: () => Promise<{ sessionId: string; url: string }>;
    devBypassIdentity: () => Promise<any>;
  };
  rates: {
    getDisplayRate: (currency: string, amount: number) => Promise<any>;
    getTransactionRate: (currency: string, amount: number, vaultId: string, type: 'funding' | 'withdrawal') => Promise<any>;
  };
  evidence: {
    list: (params?: { vaultId?: string; disputeId?: string }) => Promise<any[]>;
    create: (payload: any) => Promise<any>;
  };
  notifications: {
    list: () => Promise<any[]>;
    markAllAsRead: () => Promise<any>;
    markAsRead: (id: number | string) => Promise<any>;
    getPreferences: () => Promise<any>;
    updatePreferences: (prefs: any) => Promise<any>;
    createTest: () => Promise<any>;
  };
  telegram: {
    getLinkToken: () => Promise<any>;
    simulateConnect: (username: string) => Promise<any>;
    disconnect: () => Promise<any>;
  };
  whatsapp: {
    startVerification: (phone: string) => Promise<any>;
    confirmVerification: (code: string, consent: boolean) => Promise<any>;
    disable: () => Promise<any>;
  };
  uploads: {
    getPresignedUrl: (data: { fileName: string; fileType: string; fileSize: number; purpose: string }) => Promise<{ url: string; key: string }>;
    getDownloadUrl: (key: string) => Promise<{ url: string }>;
  };
}

const pendingRateRequests = new Map<string, Promise<any>>();

export const api: ApiClient = {
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("dayle_access_token");
      }
      const result = await request("/auth/logout", {
        method: "POST",
      });
      // Backend clears cookies, no need to clear localStorage manually for cookies
      return result;
    },

    socialLogin: async (dto: any): Promise<any> => {
      const data = await request("/auth/privy-login", {
        method: "POST",
        body: dto,
      });
      
      if (data.accessToken && typeof window !== "undefined") {
        localStorage.setItem("dayle_access_token", data.accessToken);
      }
      
      return data;
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

    withdraw: async (
      amount: number,
      currency: string,
      bankDetails: any,
      opts: any = {},
    ): Promise<any> => {
      const { idempotencyKey } = opts;
      return await request("/ledger/withdraw", {
        method: "POST",
        body: { amount, currency, bankDetails, idempotencyKey },
      });
    },

    getTransactions: async (): Promise<any> => {
      const data = await request("/ledger/transactions");
      return data.transactions;
    },
  },

  paymentMethods: {
    list: async (): Promise<any[]> => {
      return await request("/payment-methods");
    },
    addBank: async (data: any): Promise<any> => {
      return await request("/payment-methods/bank", {
        method: "POST",
        body: data,
      });
    },
    remove: async (id: string): Promise<any> => {
      return await request(`/payment-methods/${id}`, { method: "DELETE" });
    },
    setDefault: async (id: string): Promise<any> => {
      return await request(`/payment-methods/${id}/default`, { method: "POST" });
    },
    getBanks: async (currency?: string): Promise<any[]> => {
      const q = currency ? `?currency=${currency}` : "";
      return await request(`/payment-methods/banks${q}`);
    },
    resolveBank: async (bankCode: string, accountNumber: string, currency?: string): Promise<any> => {
      return await request("/payment-methods/resolve-bank", {
        method: "POST",
        body: { bankCode, accountNumber, currency },
      });
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

    release: async (vaultId: string, opts: any = {}): Promise<any> => {
      return await request(`/vaults/${vaultId}/release`, {
        method: "POST",
        body: { ...opts },
      });
    },

    submit: async (vaultId: string, opts: any = {}): Promise<any> => {
      return await request(`/vaults/${vaultId}/submit`, {
        method: "POST",
        body: { ...opts },
      });
    },

    refund: async (vaultId: string, opts: any = {}): Promise<any> => {
      return await request(`/vaults/${vaultId}/refund`, {
        method: "POST",
        body: { ...opts },
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

    requestRefund: async (vaultId: string, data: any): Promise<any> => {
      return await request(`/vaults/${vaultId}/request-refund`, {
        method: "POST",
        body: data,
      });
    },

    updateFreelancer: async (vaultId: string, data: any): Promise<any> => {
      return await request(`/vaults/${vaultId}/update-freelancer`, {
        method: "PATCH",
        body: data,
      });
    },
    getStatus: async (id: string): Promise<any> => {
      return await request(`/vaults/${id}/status`);
    },
    withdraw: async (vaultId: string, data: any): Promise<any> => {
      return await request(`/vaults/${vaultId}/withdraw`, {
        method: "POST",
        body: data,
      });
    },
    mockDeposit: async (vaultId: string, data: any): Promise<any> => {
      return await request(`/vaults/${vaultId}/mock-deposit`, {
        method: "POST",
        body: data,
      });
    },
    confirmPayment: async (vaultId: string): Promise<any> => {
      return await request(`/vaults/${vaultId}/confirm-payment`, {
        method: "POST",
      });
    },
    requestRelease: async (vaultId: string): Promise<any> => {
      return await request(`/vaults/${vaultId}/request-release`, {
        method: "POST",
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

    proposeSettlement: async (id: string, data: { amountToFreelancer: number; notes: string }): Promise<any> => {
      return await request(`/disputes/${id}/propose-settlement`, {
        method: "POST",
        body: data,
      });
    },

    acceptSettlement: async (id: string): Promise<any> => {
      return await request(`/disputes/${id}/accept-settlement`, {
        method: "POST",
      });
    },
    requestTotalRefund: async (id: string, data: { notes: string }): Promise<any> => {
      return await request(`/disputes/${id}/request-total-refund`, {
        method: "POST",
        body: data,
      });
    },
    requestTotalRelease: async (id: string, data: { notes: string }): Promise<any> => {
      return await request(`/disputes/${id}/request-total-release`, {
        method: "POST",
        body: data,
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

    listMyInvites: async (): Promise<any[]> => {
      return await request("/invites/my-invites");
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


  onboarding: {
    initialize: async (): Promise<any> => {
      return await request("/onboarding/initialize", {
        method: "POST",
      });
    },

    setRole: async (role: string): Promise<any> => {
      return await request("/onboarding/role", {
        method: "PATCH",
        body: { role },
      });
    },

    submitIdentity: async (data: any): Promise<any> => {
      return await request("/onboarding/identity", {
        method: "POST",
        body: data,
      });
    },
    
    verifyIdentity: async (data: any): Promise<any> => {
      return await request("/onboarding/verify-identity", {
        method: "POST",
        body: data,
      });
    },

    selectKycMethod: async (method: string): Promise<any> => {
      return await request("/onboarding/kyc-method", {
        method: "POST",
        body: { method },
      });
    },

    confirmKycPhone: async (phone: string): Promise<any> => {
      return await request("/onboarding/kyc-confirm-phone", {
        method: "POST",
        body: { phone },
      });
    },

    verifyOtp: async (otp: string): Promise<any> => {
      return await request("/onboarding/kyc-otp", {
        method: "POST",
        body: { otp },
      });
    },

    devBypassIdentity: async (): Promise<any> => {
      return await request("/onboarding/dev-bypass-identity", {
        method: "POST",
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

    getDiditSession: async (): Promise<{ sessionId: string; url: string }> => {
      return await request("/onboarding/didit/session");
    },
  },
  rates: {
    getDisplayRate: async (currency: string, amount: number): Promise<any> => {
      const cacheKey = currency.toUpperCase();
      
      // If a request for this currency is already pending, reuse that promise
      if (pendingRateRequests.has(cacheKey)) {
        return pendingRateRequests.get(cacheKey);
      }

      const q = `?currency=${currency}&amount=${amount}`;
      const promise = request(`/rates/display${q}`).finally(() => {
        // Remove from pending map once resolved or rejected
        pendingRateRequests.delete(cacheKey);
      });

      pendingRateRequests.set(cacheKey, promise);
      return promise;
    },
    getTransactionRate: async (currency: string, amount: number, vaultId: string, type: 'funding' | 'withdrawal'): Promise<any> => {
      const q = `?currency=${currency}&amount=${amount}&vaultId=${vaultId}&type=${type}`;
      return await request(`/rates/transaction${q}`);
    },
  },

  evidence: {
    list: async (params?: { vaultId?: string; disputeId?: string }): Promise<any[]> => {
      const queryParams = new URLSearchParams();
      if (params?.vaultId) queryParams.append("vaultId", params.vaultId);
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
  uploads: {
    getPresignedUrl: async (data: { fileName: string; fileType: string; fileSize: number; purpose: string }): Promise<{ url: string; key: string }> => {
      return await request("/uploads/presigned-url", {
        method: "POST",
        body: data,
      });
    },
    getDownloadUrl: async (key: string): Promise<{ url: string }> => {
      return await request("/uploads/download-url", {
        method: "POST",
        body: { key },
      });
    },
  },
};