"use client";

import { useEffect, useRef } from "react";
import * as jdenticon from "jdenticon";

export default function UserAvatar({ identifier, src, size = 36, className = "" }) {
  const iconRef = useRef(null);

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
        <img 
          src={src} 
          alt="User Profile" 
          className="w-full h-full object-cover"
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
