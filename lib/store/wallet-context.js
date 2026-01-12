'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/mock-api';
import { useUser } from './user-context';

const WalletContext = createContext({});

export function WalletProvider({ children }) {
    const { user } = useUser();
    const [balance, setBalance] = useState({ available: 0, pending: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBalance();
        }
    }, [user]);

    async function fetchBalance() {
        setLoading(true);
        try {
            const data = await api.wallet.getBalance();
            setBalance(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <WalletContext.Provider value={{ balance, loading, refreshWallet: fetchBalance }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
