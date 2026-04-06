"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
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
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Define pages that are ONLY for non-authenticated users
    const publicOnlyPages = ["/", "/login", "/signup"];
    const isPublicOnly = publicOnlyPages.includes(pathname);

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
    } else {
      // User is not authenticated, or on a shared public page (like support)
      setShouldRender(true);
    }
  }, [user, loading, router, pathname]);

  if (loading || !shouldRender) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <LogoLoader size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
