"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { usePrivy } from "@privy-io/react-auth";
import { UserRole } from "@/lib/api-client";
import { LogoLoader } from "@/components/ui/logo-loader";

interface PublicGuardProps {
  children: React.ReactNode;
}

/**
 * PublicGuard prevents authenticated users from accessing public pages 
 * like landing, login, and signup, redirecting them to their dashboard instead.
 */
export default function PublicGuard({ children }: PublicGuardProps) {
  const { user, loading } = useUser();
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Define public-only routes
    const publicOnlyPages = ["/", "/login", "/signup"];
    const isPublicOnly = publicOnlyPages.includes(pathname);

    // 2. Only redirect if FULLY authenticated on both sides (Privy + Backend)
    if (!loading && ready && authenticated && user && isPublicOnly) {
      // Safety: Don't redirect if the URL specifically says we just logged out
      // or if we are in a 'session_mismatch' state.
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("logout") === "success" || 
        urlParams.get("error") === "session_mismatch" ||
        urlParams.get("error") === "refresh_failed"
      ) {
        return;
      }

      console.log("[PublicGuard] Fully authenticated, redirecting to dashboard...");
      const dashboardPath = user.role === UserRole.CLIENT ? "/client" : "/freelancer";
      
      // Handle missing roles
      if (!user.role || user.role === UserRole.NONE) {
        if (!pathname.startsWith("/onboarding/role")) {
          router.replace("/onboarding/role");
        }
      } else {
        router.replace(dashboardPath);
      }
    }
  }, [user, loading, pathname, router, ready, authenticated]);

  // We NEVER return a full-screen loader here anymore.
  // This ensures the Login/Signup pages are always accessible.
  // Redirection happens in the background if a session is detected.
  return <>{children}</>;
}
