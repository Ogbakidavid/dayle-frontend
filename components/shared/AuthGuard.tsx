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
        .then((internalUser) => {
          isRefreshingRef.current = false;
          if (!internalUser) {
            // Internal session check failed despite Privy auth
            // This might happen if backend sync is pending or failed
            console.warn(
              "Privy authenticated but internal session missing. Redirecting to login.",
            );
            if (!hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              router.push("/login");
            }
          }
        })
        .catch((error) => {
          isRefreshingRef.current = false;
          console.error("Error refreshing user:", error);
          // If we get a 401 or any auth error, redirect to login
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push("/login");
          }
        });
    }

    // 1. Country Selection Intercept: If user is authenticated but country is missing
    // 2. Post-KYC Intercept: If KYC is VERIFIED but payment account is not ready
      if (user) {
        // Redirection logic for onboarding
        const isOnboardingIdentity = pathname.startsWith('/onboarding/identity');
        const isOnboardingConfirmation = pathname.startsWith('/onboarding/identity-confirmation');

        // 1. Force identity setup if country is missing OR payment account is not ready
        if (!user.country || !user.paymentAccountReady) {
          if (!pathname.startsWith('/onboarding')) {
              console.log('[AuthGuard] Onboarding incomplete, redirecting to identity...');
              setRedirecting(true);
              router.push('/onboarding/identity');
              return;
          }
        }

        console.log("[AuthGuard] Checking user state:", {
          kycStatus: user.kycStatus,
          paymentAccountReady: user.paymentAccountReady,
          pathname,
        });

        // 2. Post-KYC Intercept: If KYC is VERIFIED but payment account is not ready
        // (This handles cases where full KYC happened but Partna isn't linked yet)
        if (
          user.kycStatus === KycStatus.VERIFIED &&
          !user.paymentAccountReady &&
          !isOnboardingConfirmation
        ) {
          console.log("[AuthGuard] KYC verified but account not ready, redirecting to confirmation...");
          setRedirecting(true);
          router.push("/onboarding/identity-confirmation");
          return;
        }
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

  // Show loading state while determining auth status or redirecting
  if (
    !privyReady ||
    (authenticated && userLoading) ||
    (authenticated && !user) ||
    redirecting
  ) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
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
