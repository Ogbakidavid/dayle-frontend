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
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Pages that are ONLY for non-authenticated users
    const publicOnlyPages = ["/", "/login", "/signup"];
    const isPublicOnly = publicOnlyPages.includes(pathname);

    // If we are on a public-only page, let's allow rendering immediately to avoid spinner hangs.
    // Redirection will still happen if we determine they are authenticated later.
    if (isPublicOnly) {
      setShouldRender(true);
    }

    // If neither Privy nor Backend say we're logged in, we're definitely public
    if ((ready && !authenticated) || (!loading && !user)) {
      setShouldRender(true);
      return;
    }

    if (loading) return;

    if (user && isPublicOnly) {
      // User is authenticated and on a public-only page, redirect to their dashboard
      const dashboardPath = user.role === UserRole.CLIENT ? "/client" : "/freelancer";
      
      // Special case: if user has no role, take them to onboarding role selection
      if (!user.role || user.role === UserRole.NONE) {
        // If they are not already on the role selection page, send them there
        if (!pathname.startsWith("/onboarding/role")) {
          router.replace("/onboarding/role");
        } else {
            setShouldRender(true);
        }
      } else {
        router.replace(dashboardPath);
      }
    } else if (user && !isPublicOnly) {
      // User is authenticated but on a page allowed for everyone (like an invite page)
      setShouldRender(true);
    } else if (!loading && !user) {
      // Ensure we render if we're sure there's no user
      setShouldRender(true);
    }
  }, [user, loading, authenticated, ready, router, pathname]);

  // If we're on a public-only page and we KNOW they're authenticated, keep showing loader while redirecting
  const publicOnlyPages = ["/", "/login", "/signup"];
  const isPublicOnly = publicOnlyPages.includes(pathname);
  
  // A loader is only "stuck" if we're still waiting for a definitive auth state.
  // If we already know there's no backend user (!loading && !user), we should stop showing the loader
  // so the login page can handle the mismatch.
  const isStuckLoader = (loading || !shouldRender) && !(!loading && !user) && !(ready && !authenticated);

  if (isStuckLoader || (user && isPublicOnly)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <LogoLoader size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
