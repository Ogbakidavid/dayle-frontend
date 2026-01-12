import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, label, error, required, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                className={cn(
                    "input-base",
                    error && "input-error",
                    className
                )}
                ref={ref}
                required={required}
                {...props}
            />
            {error && (
                <p className="text-xs font-medium text-red-600 animate-slide-in">
                    {error}
                </p>
            )}
        </div>
    )
})
Input.displayName = "Input"

export { Input }
