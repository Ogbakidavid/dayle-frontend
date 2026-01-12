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
        // Mock withdrawal logic
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update local state to reflect withdrawal
        setBalance(prev => ({
            ...prev,
            available: prev.available - amount
        }));

        const newTx = {
            id: `tx_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'withdraw',
            amount: amount,
            status: 'completed',
            description: 'Withdrawal to Bank'
        };

        setTransactions(prev => [newTx, ...prev]);
        return newTx;
    }

    return (
        <WalletContext.Provider value={{ balance, transactions, loading, refreshWallet: fetchWalletData, withdraw }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
