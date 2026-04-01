import * as React from "react";
import { cn } from "@/lib/utils";

interface DotLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "muted";
}

export function DotLoader({
  className,
  size = "md",
  color = "primary",
  ...props
}: DotLoaderProps) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    primary: "bg-emerald-600",
    white: "bg-white",
    muted: "bg-zinc-500",
  };

  const dotClass = cn(
    "rounded-full animate-bounce",
    sizeClasses[size],
    colorClasses[color],
  );

  return (
    <div
      className={cn("flex items-center justify-center space-x-1.5 h-full", className)}
      {...props}
    >
      <div className={dotClass} style={{ animationDelay: "-0.3s" }} />
      <div className={dotClass} style={{ animationDelay: "-0.15s" }} />
      <div className={dotClass} style={{ animationDelay: "0s" }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}