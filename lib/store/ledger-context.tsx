"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import { TransactionStatus } from "@/lib/domain/enums";
import { useUser } from "./user-context";

export interface LedgerBalance {
  available: number;
  pending: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: TransactionStatus;
  description: string;
}

interface LedgerContextType {
  balance: LedgerBalance;
  transactions: Transaction[];
  loading: boolean;
  refreshLedger: () => Promise<void>;
  withdraw: (amount: number) => Promise<Transaction>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [balance, setBalance] = useState<LedgerBalance>({
    available: 0,
    pending: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLedgerData();
    }
  }, [user]);

  async function fetchLedgerData() {
    setLoading(true);
    try {
      const [balanceData, transactionsData] = await Promise.all([
        api.ledger.getBalance(),
        api.ledger.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (err: any) {
      // Silently handle auth errors (user not logged in)
      if (err.statusCode !== 401) {
        console.error("Ledger fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  async function withdraw(amount: number): Promise<Transaction> {
    const idempotencyKey = crypto.randomUUID();
    try {
      const tx = await api.ledger.withdraw(amount, { idempotencyKey });

      // RECONCILIATION TRUTH MODEL:
      // API already moved funds from available -> pending
      // Update local state to reflect this
      setBalance((prev) => ({
        available: prev.available - Math.abs(tx.amount),
        pending: prev.pending + Math.abs(tx.amount),
      }));

      const normalized: Transaction = {
        id: tx.id,
        date: tx.createdAt || new Date().toISOString(),
        type: tx.type || "withdraw",
        amount: tx.amount,
        status: (tx.status as TransactionStatus) || TransactionStatus.PENDING,
        description: "Withdrawal to Bank",
      };

      setTransactions((prev) => [normalized, ...prev]);

      // Poll for transaction confirmation (in real system, this would be a webhook/SSE)
      const pollInterval = setInterval(async () => {
        try {
          const updatedTransactions = await api.ledger.getTransactions();
          const updatedTx = updatedTransactions.find(
            (t: any) => t.id === tx.id,
          );

          if (updatedTx && updatedTx.status === TransactionStatus.CONFIRMED) {
            // Transaction confirmed - update local state
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === tx.id
                  ? { ...t, status: TransactionStatus.CONFIRMED }
                  : t,
              ),
            );
            // Decrement pending (funds already removed from available)
            setBalance((prev) => ({
              ...prev,
              pending: Math.max(0, prev.pending - Math.abs(tx.amount)),
            }));
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Failed to poll transaction status:", err);
        }
      }, 1000); // Poll every second

      // Clear interval after 10 seconds to prevent infinite polling
      setTimeout(() => clearInterval(pollInterval), 10000);

      return normalized;
    } catch (err) {
      console.error("Withdraw failed", err);
      throw err;
    }
  }

  return (
    <LedgerContext.Provider
      value={{
        balance,
        transactions,
        loading,
        refreshLedger: fetchLedgerData,
        withdraw,
      }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within a LedgerProvider");
  }
  return context;
};
