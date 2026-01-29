'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/mock-api';
import { TransactionStatus } from "@/lib/domain/enums";
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

            // RECONCILIATION TRUTH MODEL:
            // API already moved funds from available -> pending
            // Update local state to reflect this
            setBalance(prev => ({
                available: prev.available - Math.abs(tx.amount),
                pending: prev.pending + Math.abs(tx.amount)
            }));

            const normalized = {
                id: tx.id,
                date: tx.createdAt || new Date().toISOString(),
                type: tx.type || 'withdraw',
                amount: tx.amount,
                status: tx.status || TransactionStatus.PENDING,
                description: 'Withdrawal to Bank'
            };

            setTransactions(prev => [normalized, ...prev]);

            // Poll for transaction confirmation (in real system, this would be a webhook/SSE)
            const pollInterval = setInterval(async () => {
                try {
                    const updatedTransactions = await api.wallet.getTransactions();
                    const updatedTx = updatedTransactions.find(t => t.id === tx.id);
                    
                    if (updatedTx && updatedTx.status === TransactionStatus.COMPLETED) {
                        // Transaction confirmed - update local state
                        setTransactions(prev => 
                            prev.map(t => t.id === tx.id ? { ...t, status: TransactionStatus.COMPLETED } : t)
                        );
                        // Decrement pending (funds already removed from available)
                        setBalance(prev => ({
                            ...prev,
                            pending: Math.max(0, prev.pending - Math.abs(tx.amount))
                        }));
                        clearInterval(pollInterval);
                    }
                } catch (err) {
                    console.error('Failed to poll transaction status:', err);
                }
            }, 1000); // Poll every second

            // Clear interval after 10 seconds to prevent infinite polling
            setTimeout(() => clearInterval(pollInterval), 10000);

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
