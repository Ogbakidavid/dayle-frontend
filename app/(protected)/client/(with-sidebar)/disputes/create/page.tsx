import * as React from "react";
import { CreateDisputeForm } from "@/components/disputes/CreateDisputeForm";

interface ClientCreateDisputePageProps {
  searchParams: Promise<{ vaultId?: string }>;
}

export default async function ClientCreateDisputePage({
  searchParams,
}: ClientCreateDisputePageProps) {
  const { vaultId } = await searchParams;
  return <CreateDisputeForm role="client" initialVaultId={vaultId} />;
}
