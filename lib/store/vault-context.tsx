"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api-client";
import { useUser } from "./user-context";
import { useSocket } from "../contexts/socket-context";

export interface Vault {
  id: string;
  title: string;
  description?: string;
  status: string;
  amount?: string | number;
  totalAmount?: string | number;
  submission?: any;
  clientId: string;
  freelancerId?: string;
  client?: any;
  freelancer?: any;
  partnaRampReference?: string;
  partnaAccountNumber?: string;
  partnaAccountName?: string;
  partnaBankName?: string;
  partnaExpiryDate?: string;
  partnaExpectedAmount?: number | string;
  [key: string]: any;
}

  interface VaultContextType {
  vaults: Vault[];
  loading: boolean;
  createVault: (data: any) => Promise<Vault>;
  refreshVaults: (options?: { isBackground?: boolean }) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const { socket } = useSocket();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVaults();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, userLoading]);

  // Real-time updates via WebSockets
  useEffect(() => {
    if (!socket) return;

    const handleVaultUpdate = (data: any) => {
      console.log("Real-time vault update received:", data);
      fetchVaults({ isBackground: true });
    };

    const handleNotification = (data: any) => {
      if (data.type === 'vault' || data.type === 'payment') {
        fetchVaults({ isBackground: true });
      }
    };

    socket.on("vault_updated", handleVaultUpdate);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("vault_updated", handleVaultUpdate);
      socket.off("notification", handleNotification);
    };
  }, [socket]);

  async function fetchVaults(options?: { isBackground?: boolean }) {
    const isBackground = options?.isBackground ?? false;
    
    if (!isBackground) {
      setLoading(true);
    }
    
    try {
      const data = await api.vaults.list();
      setVaults(data);
    } catch (err: any) {
      if (err.statusCode !== 401) {
        console.error("Vault fetch error:", err);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }

  async function createVault(data: any): Promise<Vault> {
    const newVault = await api.vaults.create(data);
    setVaults((prev) => [...prev, newVault]);
    return newVault;
  }

  return (
    <VaultContext.Provider
      value={{ vaults, loading, createVault, refreshVaults: fetchVaults }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};
