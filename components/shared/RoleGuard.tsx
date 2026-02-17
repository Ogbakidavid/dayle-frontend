"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { UserRole } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectPath?: string;
}

/**
 * RoleGuard restricts access to specific user roles.
 * It also handles the "NONE" role by redirecting to onboarding.
 */
export default function RoleGuard({
  children,
  allowedRoles,
  redirectPath,
}: RoleGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // AuthGuard should handle this, but as a fallback:
      router.push("/login");
      return;
    }

    // Handle initial state / onboarding
    if (user.role === UserRole.NONE) {
      router.push("/onboarding/role");
      return;
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        // Default smart redirection
        if (user.role === UserRole.CLIENT) {
          router.push("/client");
        } else if (user.role === UserRole.FREELANCER) {
          router.push("/freelancer");
        } else {
          router.push("/");
        }
      }
    }
  }, [user, loading, allowedRoles, redirectPath, router]);

  if (loading || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">
          Verifying Permissions
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
