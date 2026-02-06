'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/mock-api';
import { useUser } from './user-context';
import { Vault, CreateVaultFormData, VaultContextType } from '@/lib/types';

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchVaults();
        } else {
            setVaults([]);
        }
    }, [user]);

    async function fetchVaults() {
        setLoading(true);
        try {
            const data = await api.vaults.list();
            setVaults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function createVault(data: CreateVaultFormData) {
        const newVault = await api.vaults.create(data);
        setVaults(prev => [...prev, newVault]);
        return newVault;
    }

    function getVault(id: string) {
        return vaults.find(v => v.id === id);
    }

    return (
        <VaultContext.Provider value={{ vaults, loading, createVault, getVault, refreshVaults: fetchVaults }}>
            {children}
        </VaultContext.Provider>
    );
}

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error("useVault must be used within a VaultProvider");
    }
    return context;
};
