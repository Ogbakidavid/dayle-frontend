import * as React from "react";
import { CreateDisputeForm } from "@/components/disputes/CreateDisputeForm";

interface FreelancerCreateDisputePageProps {
  searchParams: Promise<{ vaultId?: string }>;
}

export default async function FreelancerCreateDisputePage({
  searchParams,
}: FreelancerCreateDisputePageProps) {
  const { vaultId } = await searchParams;
  return <CreateDisputeForm role="freelancer" initialVaultId={vaultId} />;
}
