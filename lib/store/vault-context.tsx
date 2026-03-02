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

export interface Vault {
  id: string;
  title: string;
  description?: string;
  status: string;
  amount?: string | number;
  totalAmount?: string | number;
  submission?: any;
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
  const { user, loading: userLoading } = useUser();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("VaultProvider useEffect triggered:", {
      user: !!user,
      userLoading,
    });
    if (user) {
      fetchVaults();
    } else if (!userLoading) {
      // User finished loading but is null/unauthenticated, stop the vault spinner
      console.log("VaultProvider: User is null, stopping spinner");
      setLoading(false);
    }
  }, [user, userLoading]);

  async function fetchVaults() {
    console.log("VaultProvider fetchVaults called, setting loading=true");
    setLoading(true);
    try {
      const data = await api.vaults.list();
      console.log("VaultProvider fetched data:", data);
      setVaults(data);
    } catch (err: any) {
      // Silently handle auth errors (user not logged in)
      if (err.statusCode !== 401) {
        console.error("Vault fetch error:", err);
      }
    } finally {
      console.log("VaultProvider finally block, setting loading=false");
      setLoading(false);
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
