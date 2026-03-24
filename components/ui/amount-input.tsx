"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/store/user-context";

export interface AmountInputProps extends Omit<
  InputProps,
  "onChange" | "value"
> {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  label?: string;
}

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, value, onChange, label, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      if (value !== undefined && value !== "") {
        const num = typeof value === "string" ? parseFloat(value) : value;
        if (!isNaN(num)) {
          setDisplayValue(
            num.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9.]/g, "");
      if (val) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          setDisplayValue(
            num.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
          if (onChange) {
            onChange({ target: { value: val } });
          }
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = value ? value.toString() : "";
      setDisplayValue(val);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9.]/g, "");
      setDisplayValue(val);
      if (onChange) {
        onChange({ target: { value: val } });
      }
    };

    const { user } = useUser();
    const currencySymbol = user?.country === "Kenya" ? "KSh" : "₦";

    return (
      <div className="relative">
        {label && <Label className="block mb-2 text-white">{label}</Label>}
        <Input
          ref={ref}
          className={cn(
            "pl-12 tabular-nums h-12 text-lg font-semibold",
            className,
          )}
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="0.00"
          {...props}
        />
        <div className="absolute left-3 top-[38px] text-white font-bold">{currencySymbol}</div>
      </div>
    );
  },
);

AmountInput.displayName = "AmountInput";

export { AmountInput };
