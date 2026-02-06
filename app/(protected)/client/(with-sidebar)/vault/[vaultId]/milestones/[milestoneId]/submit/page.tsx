import { MilestoneSubmitView } from "@/components/milestones/MilestoneSubmitView";

export default async function ClientMilestoneSubmitPage({ params }) {
  const { vaultId, milestoneId } = await params;
  return (
    <MilestoneSubmitView
      vaultId={vaultId}
      milestoneId={milestoneId}
      role="client"
    />
  );
}
