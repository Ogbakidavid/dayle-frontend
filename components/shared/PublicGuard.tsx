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

      const dashboardPath = user.role === UserRole.CLIENT ? "/client" : "/freelancer";
      
      if (!user.role || user.role === UserRole.NONE) {
        if (!pathname.startsWith("/onboarding/role")) {
          router.replace("/onboarding/role");
        }
      } else {
        router.replace(dashboardPath);
      }
    }
  }, [user, loading, pathname, router, ready, authenticated]);

  // --- SMART LOADING LOGIC ---
  const publicOnlyPages = ["/", "/login", "/signup"];
  const isPublicOnly = publicOnlyPages.includes(pathname);

  if (isPublicOnly) {
     const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
     // If we're coming from a logout or error, show the page IMMEDIATELY. No spinner.
     const isTransitioning = 
       urlParams.get("logout") === "success" || 
       urlParams.get("error") !== null ||
       urlParams.get("redirect") !== null;

     if (!isTransitioning) {
       // If we're still checking Privy, still checking Backend, 
       // or we're ALREADY sure we have a user (masking the redirect), show the loader.
       if (!ready || loading || (authenticated && user)) {
         return (
           <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
             <LogoLoader size="lg" />
           </div>
         );
       }
     }
  }

  return <>{children}</>;
}
