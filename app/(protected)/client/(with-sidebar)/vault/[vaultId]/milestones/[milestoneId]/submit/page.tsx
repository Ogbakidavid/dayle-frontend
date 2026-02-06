import * as React from "react";
import { MilestoneSubmitView } from "@/components/milestones/MilestoneSubmitView";

interface ClientMilestoneSubmitPageProps {
  params: Promise<{ vaultId: string; milestoneId: string }>;
}

export default async function ClientMilestoneSubmitPage({
  params,
}: ClientMilestoneSubmitPageProps) {
  const { vaultId, milestoneId } = await params;
  return (
    <MilestoneSubmitView
      vaultId={vaultId}
      milestoneId={milestoneId}
      role="client"
    />
  );
}
