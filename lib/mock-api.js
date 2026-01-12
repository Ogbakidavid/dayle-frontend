/**
 * Mock API Service
 * Simulates backend latency
 */

const DELAY_MS = 600;

export const UserRole = {
    CLIENT: 'client',
    FREELANCER: 'freelancer',
    NONE: 'none',
};

export const KycStatus = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
    NONE: 'none',
};

export const VaultStatus = {
    PENDING: 'pending', // Draft
    ACTIVE: 'active',   // Funded, work in progress
    REVIEW: 'review',   // Work submitted
    COMPLETED: 'completed', // Funds released
    CANCELLED: 'cancelled',
};

// Mock Database
let mockUser = {
    id: 'u_123456',
    email: 'demo@cleard.com',
    name: 'Demo User',
    role: UserRole.NONE,
    kycStatus: KycStatus.NONE,
};

let mockWallet = {
    available: 0,
    pending: 0,
    transactions: [],
};

let mockVaults = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (email, password) => {
            await sleep(DELAY_MS);
            if (email.includes('client')) {
                mockUser = { ...mockUser, role: UserRole.CLIENT, kycStatus: KycStatus.VERIFIED };
            } else if (email.includes('freelancer')) {
                mockUser = { ...mockUser, role: UserRole.FREELANCER, kycStatus: KycStatus.VERIFIED };
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
            return { ...mockUser };
        },
        getCurrentUser: async () => {
            await sleep(DELAY_MS / 2);
            return { ...mockUser };
        }
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
                { id: 'tx_1', date: '2025-10-01', type: 'deposit', amount: 5000, status: 'completed' },
                { id: 'tx_2', date: '2025-10-05', type: 'release', amount: -2500, status: 'completed' },
            ];
        }
    },
    vaults: {
        list: async () => {
            await sleep(DELAY_MS);
            return [...mockVaults];
        },
        create: async (data) => {
            await sleep(DELAY_MS);
            const newVault = {
                id: `v_${Date.now()}`,
                status: VaultStatus.PENDING,
                createdAt: new Date().toISOString(),
                ...data,
            };
            mockVaults.push(newVault);
            return newVault;
        },
        getById: async (id) => {
            await sleep(DELAY_MS);
            return mockVaults.find(v => v.id === id);
        },
        updateStatus: async (id, status) => {
            await sleep(DELAY_MS);
            const idx = mockVaults.findIndex(v => v.id === id);
            if (idx !== -1) {
                mockVaults[idx] = { ...mockVaults[idx], status };
                return mockVaults[idx];
            }
            throw new Error('Vault not found');
        }
    }
};
