"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "@/lib/store/user-context";
import { DotLoader } from "@/components/ui/dot-loader";

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

  useEffect(() => {
    if (!privyReady || userLoading) return;

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
  }, [
    authenticated,
    privyReady,
    user,
    userLoading,
    router,
    pathname,
    refreshUser,
  ]);

  // Show loading state while determining auth status
  if (
    !privyReady ||
    (authenticated && userLoading) ||
    (authenticated && !user)
  ) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />
          <DotLoader size="lg" className="relative z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-emerald-600 tracking-[0.2em] animate-pulse">
            Authenticating
          </p>
          <p className="text-[10px] font-medium text-slate-600 tracking-wider">
            Establishing secure session
          </p>
        </div>
      </div>
    );
  }

  // If unauthenticated, effect will redirect, so we render nothing to avoid flash
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
