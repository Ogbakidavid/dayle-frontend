'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useUser } from './user-context';

const VaultContext = createContext({});

export function VaultProvider({ children }) {
    const { user } = useUser();
    const [vaults, setVaults] = useState([]);
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
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function createVault(data) {
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

export const useVault = () => useContext(VaultContext);
