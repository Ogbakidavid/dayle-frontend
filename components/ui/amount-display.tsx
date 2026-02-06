import { cn } from "@/lib/utils";

export function AmountDisplay({ amount, size = "medium", currency = "USD", className }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    });

    const sizes = {
        small: "text-base font-medium tabular-nums text-white/60",
        medium: "text-xl font-semibold tabular-nums text-white/80",
        large: "text-3xl font-bold tabular-nums text-white",
    };

    return (
        <span className={cn(sizes[size], className)}>
            {formatter.format(amount || 0)}
        </span>
    );
}
