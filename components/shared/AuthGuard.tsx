"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "@/lib/store/user-context";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (!privyReady || userLoading) return;

    if (!authenticated) {
      // Not logged in with Privy, redirect to login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    // Authenticated with Privy, but check if we have internal user session
    if (!user) {
      refreshUser().then((internalUser) => {
        if (!internalUser) {
          // Internal session check failed despite Privy auth
          // This might happen if backend sync is pending or failed
          console.warn(
            "Privy authenticated but internal session missing. Redirecting to login.",
          );
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
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse">
            Authenticating
          </p>
          <p className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
            Establishing Secure Session
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
