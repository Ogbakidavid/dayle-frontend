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

    // 2. If we're not loading, have a user, and are on a public-only page, REDIRECT them.
    if (!loading && user && isPublicOnly) {
      // Safety: Don't redirect if the URL specifically says we just logged out
      // or if we are in a 'session_mismatch' state handled by the LoginPage itself.
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("logout") === "success" || urlParams.get("error") === "session_mismatch") {
        return;
      }

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
