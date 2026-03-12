"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DayleLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function DayleLogo({ className, ...props }: DayleLogoProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", className)}
      {...props}
    >
      <path d="M5 4H7V20H5V4Z" fill="currentColor"/>
      <path d="M9 4H19V20H9V4Z" fill="currentColor"/>
    </svg>
  );
}
