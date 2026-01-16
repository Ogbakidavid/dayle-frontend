import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, label, error, required, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-sm border border-white/10 bg-transparent px-3 py-3 text-sm text-white shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus-visible:ring-red-500",
                    className
                )}
                ref={ref}
                required={required}
                {...props}
            />
            {error && (
                <p className="text-sm font-medium text-red-600 animate-slide-in">
                    {error}
                </p>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
