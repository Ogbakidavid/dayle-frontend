'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { useUser } from './user-context';

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    status: string;
    dueDate?: string;
    amount?: string | number;
    completionPercentage?: number;
    [key: string]: any;
}

export interface Vault {
    id: string;
    title: string;
    description?: string;
    status: string;
    amount?: string | number;
    milestones?: Milestone[];
    [key: string]: any;
}

interface VaultContextType {
    vaults: Vault[];
    loading: boolean;
    createVault: (data: any) => Promise<Vault>;
    refreshVaults: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchVaults();
        }
    }, [user]);

    async function fetchVaults() {
        setLoading(true);
        try {
            const data = await api.vaults.list();
            setVaults(data);
        } catch (err: any) {
            // Silently handle auth errors (user not logged in)
            if (err.statusCode !== 401) {
                console.error('Vault fetch error:', err);
            }
        } finally {
            setLoading(false);
        }
    }

    async function createVault(data: any): Promise<Vault> {
        const newVault = await api.vaults.create(data);
        setVaults(prev => [...prev, newVault]);
        return newVault;
    }

    return (
        <VaultContext.Provider value={{ vaults, loading, createVault, refreshVaults: fetchVaults }}>
            {children}
        </VaultContext.Provider>
    );
}

export const useVault = () => {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};
