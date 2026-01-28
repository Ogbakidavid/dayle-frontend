'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/mock-api';
import { useUser } from './user-context';

const WalletContext = createContext({});

export function WalletProvider({ children }) {
    const { user } = useUser();
    const [balance, setBalance] = useState({ available: 0, pending: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWalletData();
        }
    }, [user]);

    async function fetchWalletData() {
        setLoading(true);
        try {
            const [balanceData, transactionsData] = await Promise.all([
                api.wallet.getBalance(),
                api.wallet.getTransactions()
            ]);
            setBalance(balanceData);
            setTransactions(transactionsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function withdraw(amount) {
        const idempotencyKey = `wd_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        try {
            const tx = await api.wallet.withdraw(amount, { idempotencyKey });

            // Update local state based on API response
            setBalance(prev => ({
                ...prev,
                available: (prev.available || 0) + (tx.amount || 0)
            }));

            const normalized = {
                id: tx.id,
                date: tx.createdAt || new Date().toISOString(),
                type: tx.type || 'withdraw',
                amount: tx.amount || -amount,
                status: tx.status || 'pending',
                description: 'Withdrawal to Bank'
            };

            setTransactions(prev => [normalized, ...prev]);
            return normalized;
        } catch (err) {
            console.error('Withdraw failed', err);
            throw err;
        }
    }

    return (
        <WalletContext.Provider value={{ balance, transactions, loading, refreshWallet: fetchWalletData, withdraw }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
