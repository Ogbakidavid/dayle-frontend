"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api-client";

interface RatesContextType {
  rates: Record<string, number>;
  loading: boolean;
  refreshRates: () => Promise<void>;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export function RatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Record<string, number>>({
    NGN: 0.00066, // Fallback initial
    KES: 0.0076,  // Fallback initial
    USD: 1,
  });
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      // Fetch for major local currencies we support
      const [ngnData, kesData] = await Promise.all([
        api.rates.getDisplayRate("NGN", 1000),
        api.rates.getDisplayRate("KES", 1000),
      ]);

      setRates({
        NGN: ngnData.rate,
        KES: kesData.rate,
        USD: 1,
      });
    } catch (err) {
      console.error("Failed to fetch global rates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <RatesContext.Provider value={{ rates, loading, refreshRates: fetchRates }}>
      {children}
    </RatesContext.Provider>
  );
}

export const useRates = () => {
  const context = useContext(RatesContext);
  if (context === undefined) {
    throw new Error("useRates must be used within a RatesProvider");
  }
  return context;
};
