"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import * as jdenticon from "jdenticon";

export interface UserAvatarProps {
  identifier?: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  identifier,
  src,
  size = 36,
  className = "",
}: UserAvatarProps) {
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (iconRef.current && identifier && !src) {
      jdenticon.update(iconRef.current, identifier);
    }
  }, [identifier, size, src]);

  return (
    <div
      className={`relative inline-block overflow-hidden rounded-lg border border-gray-700 bg-zinc-900 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt="User Profile"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          unoptimized
        />
      ) : (
        <svg
          ref={iconRef}
          width={size}
          height={size}
          data-jdenticon-value={identifier}
          className="w-full h-full"
        />
      )}
    </div>
  );
}
