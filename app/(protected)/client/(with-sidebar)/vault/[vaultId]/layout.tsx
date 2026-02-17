"use client";

import ProjectGuard from "@/components/shared/ProjectGuard";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectGuard>{children}</ProjectGuard>;
}
