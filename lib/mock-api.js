/**
 * Mock API Service
 * Simulates backend latency
 */

import { vaults as seedVaults } from '@/lib/mock/vaults';

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

let mockVaults = seedVaults.map((vault) => ({ ...vault }));

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
                milestones: [],
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
