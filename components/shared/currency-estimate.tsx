"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/store/user-context";

interface CurrencyEstimateProps {
  usdAmount: number;
  manualLocalAmount?: number;
  currency?: "NGN" | "KES" | string;
  className?: string;
  showNote?: boolean;
  prefix?: string;
  align?: "left" | "center" | "right";
}

/**
 * Displays amounts in LOCAL CURRENCY as primary.
 * Fetches live display rates from Dayle backend with 60s auto-refresh.
 *
 * Output: ₦300,100
 */
export function CurrencyEstimate({
  usdAmount,
  manualLocalAmount,
  currency: manualCurrency,
  className,
  showNote = false,
  prefix = "",
  align = "left",
}: CurrencyEstimateProps) {
  const { user } = useUser();
  const [rate, setRate] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency =
    manualCurrency || (user?.country === "Kenya" ? "KES" : "NGN");
  const currencySymbol =
    currency === "NGN" ? "₦" : currency === "KES" ? "KSh" : "";

  const fetchRate = useCallback(async () => {
    if (!currency || manualLocalAmount != null) return;
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
    const handler = setTimeout(() => {
      fetchRate();
    }, 300);
    return () => clearTimeout(handler);
  }, [usdAmount, fetchRate]);

  const formatLocal = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // If we have a zero amount, show local currency zero directly (no rate needed)
  if (usdAmount === 0) {
    return (
      <span
        className={cn(
          "inline-flex flex-col gap-0.5",
          align === "right"
            ? "items-end text-right"
            : align === "center"
              ? "items-center text-center"
              : "items-start",
          className,
        )}
      >
        <span className="font-semibold tracking-tight">
          {prefix}
          {currencySymbol}0
        </span>
      </span>
    );
  }

  // Before rate loads, still show local currency symbol as fallback
  if (manualLocalAmount == null && (error || !rate)) {
    return (
      <span
        className={cn(
          "inline-flex flex-col gap-0.5",
          align === "right"
            ? "items-end text-right"
            : align === "center"
              ? "items-center text-center"
              : "items-start",
          className,
        )}
      >
        <span className="font-semibold tracking-tight">
          {prefix}
          {currencySymbol}—
        </span>
      </span>
    );
  }

  // Convert: Local = USD / (USDC-per-local-unit rate)
  const localValue =
    manualLocalAmount != null ? manualLocalAmount : usdAmount / (rate || 1);

  return (
    <span
      className={cn(
        "inline-flex flex-col gap-0.5",
        align === "right"
          ? "items-end text-right"
          : align === "center"
            ? "items-center text-center"
            : "items-start",
        className,
      )}
    >
      {/* PRIMARY: Local currency */}
      <span className="font-semibold tracking-tight">
        {prefix}
        {formatLocal(localValue)}
      </span>
      {isStale && (
        <span className="flex items-center gap-1.5 text-slate-600 text-xs font-normal">
          <span title="Rate may be outdated">
            <Clock className="size-3 text-amber-500" />
          </span>
        </span>
      )}
    </span>
  );
}
