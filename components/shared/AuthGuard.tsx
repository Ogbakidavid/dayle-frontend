"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import { LogoLoader } from "@/components/ui/logo-loader";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard ensures that the user is authenticated with both Privy
 * and the internal backend session before allowing access to protected routes.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authenticated, ready: privyReady } = usePrivy();
  const { user, loading: userLoading, refreshUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Track if we're already attempting to refresh or redirect to prevent loops
  const isRefreshingRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!privyReady || userLoading) return;

    // Reset redirecting state if we've reached a stable protected route
    if (redirecting) {
      setRedirecting(false);
    }

    if (!authenticated) {
      // Not logged in with Privy, redirect to login
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?redirect=${returnUrl}`);
      }
      return;
    }

    // Authenticated with Privy, but check if we have internal user session
    if (!user && !isRefreshingRef.current && !hasRedirectedRef.current) {
      isRefreshingRef.current = true;
      refreshUser()
        .then(async (internalUser) => {
          isRefreshingRef.current = false;
          if (!internalUser) {
            // Internal session check failed despite Privy auth
            // This usually means backend session is gone or account mismatch.
            // We should logout of Privy to clear the inconsistent state.
            console.warn(
              "Privy authenticated but internal session missing. Clearing inconsistent state.",
            );
            
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              // Redirect to login - the login page will handle clearing Privy if needed
              // or allow them to re-authenticate properly.
              router.push("/login?error=session_mismatch");
            }
          }
        })
        .catch((error) => {
          isRefreshingRef.current = false;
          console.error("Error refreshing user:", error);
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push("/login");
          }
        });
    }

    // 1. Country Selection Intercept: If user is authenticated but country is missing
    // 2. Post-KYC Intercept: If KYC is VERIFIED but payment account is not ready
      if (user) {
        // Tier 0 Access: Allow users to see the dashboard immediately.
        // We no longer force a redirect to onboarding even for country selection,
        // fulfilling the "landing in their dashboard" requirement.
        // Country-specific UI defaults to NGN/Nigeria if not set.

        console.log("[AuthGuard] User state:", {
          kycStatus: user.kycStatus,
          paymentAccountReady: user.paymentAccountReady,
          country: user.country,
          pathname,
        });
      }
  }, [
    authenticated,
    privyReady,
    user,
    userLoading,
    router,
    pathname,
    refreshUser,
  ]);

  // Show loading state while determining auth status or first-time redirecting
  if (
    !privyReady ||
    (authenticated && userLoading) ||
    (authenticated && !user && !hasRedirectedRef.current) ||
    redirecting
  ) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center space-y-4">
        <LogoLoader size="lg" />
      </div>
    );
  }

  // If unauthenticated, effect will redirect, so we render nothing to avoid flash
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
