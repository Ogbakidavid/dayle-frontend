"use client";

import VerifyEmailGuard from "@/components/auth/VerifyEmailGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VerifyEmailGuard>{children}</VerifyEmailGuard>;
}
