"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-context";

interface CurrencyEstimateProps {
  usdAmount: number;
  currency?: "NGN" | "KES" | string;
  className?: string;
  showNote?: boolean;
  prefix?: string;
}

/**
 * Displays amounts in LOCAL CURRENCY as primary, with USD as secondary note.
 * Fetches live display rates from Dayle backend with 60s auto-refresh.
 * 
 * Output: ₦300,100 (primary)
 *         ≈ $200.00 (secondary)
 */
export function CurrencyEstimate({
  usdAmount,
  currency: manualCurrency,
  className,
  showNote = true,
  prefix = "",
}: CurrencyEstimateProps) {
  const { user } = useUser();
  const [rate, setRate] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = manualCurrency || (user?.country === "Kenya" ? "KES" : "NGN");
  const currencySymbol = currency === "NGN" ? "₦" : currency === "KES" ? "KSh" : "";

  const fetchRate = useCallback(async () => {
    if (!currency) return;
    // Use a small reference amount for rate fetch when usdAmount is 0
    const fetchAmount = Math.abs(usdAmount) || 100;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.rates.getDisplayRate(currency, fetchAmount);
      setRate(data.rate);
      setIsStale(data.isStale);
    } catch (err: any) {
      setError(err.message || "Failed to fetch rate");
    } finally {
      setLoading(false);
    }
  }, [currency, usdAmount]);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 60000);
    return () => clearInterval(interval);
  }, [currency]);

  useEffect(() => {
    const handler = setTimeout(() => { fetchRate(); }, 300);
    return () => clearTimeout(handler);
  }, [usdAmount, fetchRate]);

  const formatLocal = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  // If we have a zero amount, show local currency zero directly (no rate needed)
  if (usdAmount === 0) {
    return (
      <span className={cn("inline-flex flex-col gap-0.5", className)}>
        <span className="font-semibold tracking-tight">
          {prefix}{currencySymbol}0
        </span>
      </span>
    );
  }

  // Before rate loads, still show local currency symbol as fallback
  if (error || !rate) {
    return (
      <span className={cn("inline-flex flex-col gap-0.5", className)}>
        <span className="font-semibold tracking-tight">{prefix}{currencySymbol}—</span>
        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-normal">
          <span>≈ {prefix}{formatUSD(usdAmount)}</span>
        </span>
      </span>
    );
  }

  // Convert: Local = USD / (USDC-per-local-unit rate)
  const localAmount = usdAmount / rate;

  return (
    <span className={cn("inline-flex flex-col gap-0.5", className)}>
      {/* PRIMARY: Local currency */}
      <span className="font-semibold tracking-tight">
        {prefix}{formatLocal(localAmount)}
      </span>
      {/* SECONDARY: USD equivalent */}
      <span className="flex items-center gap-1.5 text-slate-500 text-xs font-normal">
        <span className={cn(loading && "opacity-50 transition-opacity")}>
          ≈ {prefix}{formatUSD(usdAmount)}
        </span>
        {isStale && (
          <span title="Rate may be outdated">
            <Clock className="size-3 text-amber-500" />
          </span>
        )}
      </span>
      {showNote && (
        <span className="text-[10px] text-slate-400/80 leading-none mt-0.5" title={isStale ? "Rate may be outdated" : "Estimated at current rate"}>
          Estimated at current rate
        </span>
      )}
    </span>
  );
}
