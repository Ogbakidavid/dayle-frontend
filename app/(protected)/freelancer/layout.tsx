"use client";

import RoleGuard from "@/components/shared/RoleGuard";
import { UserRole } from "@/lib/api-client";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={[UserRole.FREELANCER]}>{children}</RoleGuard>;
}
