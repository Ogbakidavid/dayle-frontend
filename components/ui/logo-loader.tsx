"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DayleLogo } from "@/components/shared/DayleLogo";

interface LogoLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullPage?: boolean;
  message?: string;
}

export function LogoLoader({
  className,
  size = "md",
  fullPage = false,
  message,
}: LogoLoaderProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const currentSize = sizes[size];

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-8", className)}>
      <div className="relative flex items-center justify-center">
        {/* Hostinger-style Spinning Ring */}
        <div
          className="absolute animate-spin"
          style={{
            width: currentSize * 2.2,
            height: currentSize * 2.2,
            animationDuration: "1.5s",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              className="text-emerald-500/20"
            />
            <path
              d="M50 2 A 48 48 0 0 1 98 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-emerald-500"
            />
          </svg>
        </div>

        {/* Central Logo (SVG) */}
        <div 
          className="text-emerald-500"
          style={{ width: currentSize, height: currentSize }}
        >
          <DayleLogo className="w-full h-full" />
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 font-bold text-lg tracking-tight"
        >
          {message}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
          >
            ...
          </motion.span>
        </motion.div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[40px_40px]"></div>
        {content}
      </div>
    );
  }

  return content;
}
