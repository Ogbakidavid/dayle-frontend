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

let mockVaults = [
    { id: 'v_1', title: 'Enterprise CRM Migration', clientName: 'Global Tech Corp', freelancerEmail: 'alex@devstudio.com', status: VaultStatus.ACTIVE, amount: 15000, totalAmount: 15000, createdAt: '2025-01-10T10:00:00Z', description: 'Migration of legacy CRM data.' },
    { id: 'v_2', title: 'Mobile App Security Audit', clientName: 'Fintech Solutions', freelancerEmail: 'sarah@design.co', status: VaultStatus.REVIEW, amount: 8500, totalAmount: 8500, createdAt: '2025-01-12T14:30:00Z', description: 'Security assessment.' },
    { id: 'v_3', title: 'Cloud Infrastructure Setup', clientName: 'SkyLine Direct', freelancerEmail: 'mike@marketing.pro', status: VaultStatus.ACTIVE, amount: 12000, totalAmount: 12000, createdAt: '2025-01-15T09:00:00Z', description: 'AWS infrastructure.' },
    { id: 'v_4', title: 'E-commerce Frontend Rebuild', clientName: 'Retail Giant', freelancerEmail: 'jane@tech.dev', status: VaultStatus.ACTIVE, amount: 25000, totalAmount: 25000, createdAt: '2025-01-18T11:15:00Z', description: 'Next.js conversion.' },
    { id: 'v_5', title: 'Data Analytics Dashboard', clientName: 'Insight Partners', freelancerEmail: 'tom@brand.studio', status: VaultStatus.REVIEW, amount: 6000, totalAmount: 6000, createdAt: '2025-01-20T16:45:00Z', description: 'Tableau integration.' },
    { id: 'v_6', title: 'Smart Contract Audit', clientName: 'Crypto Ventures', freelancerEmail: 'crypto.pro@vault.io', status: VaultStatus.ACTIVE, amount: 9500, totalAmount: 9500, createdAt: '2025-01-22T13:20:00Z', description: 'Solidity audit.' },
    { id: 'v_7', title: 'Legacy System Maintenance', clientName: 'Old Guard Inc', freelancerEmail: 'legacy.dev@web.com', status: VaultStatus.ACTIVE, amount: 4500, totalAmount: 4500, createdAt: '2025-01-25T10:00:00Z', description: 'PHP maintenance.' },
    { id: 'v_8', title: 'Marketing Platform API', clientName: 'AdTech Pro', freelancerEmail: 'api.guru@marketing.pro', status: VaultStatus.ACTIVE, amount: 18000, totalAmount: 18000, createdAt: '2025-01-28T09:30:00Z', description: 'API development.' },
    { id: 'v_9', title: 'UI/UX Design System', clientName: 'Creative Studio', freelancerEmail: 'pixel.perfect@design.co', status: VaultStatus.REVIEW, amount: 11000, totalAmount: 11000, createdAt: '2025-01-30T15:00:00Z', description: 'Figma to Code.' },
    { id: 'v_10', title: 'Payment Gateway Integration', clientName: 'SwiftPay', freelancerEmail: 'pay.ninja@swiftpay.com', status: VaultStatus.ACTIVE, amount: 14000, totalAmount: 14000, createdAt: '2025-02-01T11:00:00Z', description: 'Stripe/Plural.' },
    { id: 'v_11', title: 'AI Model Training Ops', clientName: 'Neuron AI', freelancerEmail: 'ai.brain@neuron.io', status: VaultStatus.ACTIVE, amount: 30000, totalAmount: 30000, createdAt: '2025-02-03T14:00:00Z', description: 'MLOps pipeline.' },
    { id: 'v_12', title: 'Compliance Portal Dev', clientName: 'TrustGuard', freelancerEmail: 'safety.first@trustguard.io', status: VaultStatus.ACTIVE, amount: 16500, totalAmount: 16500, createdAt: '2025-02-05T12:00:00Z', description: 'KYC/AML portal.' }
];

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
                { id: 'TX_1001', date: '2025-09-30', type: 'deposit', amount: 5000, status: 'completed', description: 'Project Settlement: Website Redesign' },
                { id: 'TX_1002', date: '2025-10-04', type: 'withdraw', amount: -2500, status: 'completed', description: 'Withdrawal to External Bank' },
                { id: 'TX_1003', date: '2025-10-10', type: 'deposit', amount: 1500, status: 'completed', description: 'Milestone 1: Backend API' },
                { id: 'TX_1004', date: '2025-10-15', type: 'withdraw', amount: -800, status: 'completed', description: 'Platform Service Fee' },
                { id: 'TX_1005', date: '2025-10-20', type: 'deposit', amount: 3200, status: 'completed', description: 'Project Settlement: Mobile App UI' },
                { id: 'TX_1006', date: '2025-10-25', type: 'withdraw', amount: -1200, status: 'completed', description: 'Batch Payout to Card' },
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
