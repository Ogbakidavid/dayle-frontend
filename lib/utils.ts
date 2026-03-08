import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatCurrency(amount: string | number | bigint, decimals: number = 6) {
  if (!amount) return "0.00";
  try {
    const val = typeof amount === "string" ? amount : amount.toString();
    // Simple decimal placement for display if we don't want to pull in ethers
    // But since ethers is in package.json, we can use it if needed.
    // However, for simple display, we can just do:
    const num = Number(val) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (e) {
    return "0.00";
  }
}
