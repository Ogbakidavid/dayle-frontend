"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import { UserRole } from "@/lib/api-client";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={[UserRole.CLIENT]}>{children}</RoleGuard>;
}
