'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const AmountInput = React.forwardRef(({ className, value, onChange, label, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
        if (value !== undefined && value !== "") {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                setDisplayValue(num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleBlur = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, "");
        if (val) {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                setDisplayValue(num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                if (onChange) {
                    onChange({ target: { value: val } });
                }
            }
        }
    };

    const handleFocus = (e) => {
        const val = value ? value.toString() : "";
        setDisplayValue(val);
    };

    const handleChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, "");
        setDisplayValue(val);
        if (onChange) {
            onChange({ target: { value: val } });
        }
    };

    return (
        <div className="relative">
            <Input
                ref={ref}
                label={label}
                className={cn("pl-8 tabular-nums h-12 text-lg font-semibold", className)}
                value={displayValue}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="0.00"
                {...props}
            />
            <div className="absolute left-3 top-[38px] text-white/40 font-black">$</div>
        </div>
    );
});

AmountInput.displayName = "AmountInput";

export { AmountInput };
