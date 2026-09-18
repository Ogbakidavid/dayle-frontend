"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/lib/store/user-context";

export default function VerifyEmailGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (user && !user.emailVerified) {
      // Don't redirect if already on verification page
      if (
        pathname === "/verify-email" ||
        pathname.startsWith("/verify-email")
      ) {
        return;
      }

      const role = user.role;
      const target =
        role && role !== "NONE"
          ? `/verify-email?role=${role}`
          : "/verify-email";
      router.push(target);
    }
  }, [user, loading, router, pathname]);

  // Optionally show loading state or nothing while checking
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in and NOT verified, we rendered null (and effect redirects).
  // But to avoid flash, we can render null here,
  // UNLESS we are on the verify page, in which case we render children.
  if (user && !user.emailVerified) {
    if (pathname === "/verify-email" || pathname.startsWith("/verify-email")) {
      return <>{children}</>;
    }
    return null;
  }

  return <>{children}</>;
}
