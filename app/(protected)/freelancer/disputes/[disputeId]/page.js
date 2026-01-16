import { DisputeDetailView } from "@/components/disputes/DisputeDetailView";

export default async function FreelancerDisputeDetailPage({ params }) {
  const { disputeId } = await params;
  return <DisputeDetailView disputeId={disputeId} role="freelancer" />;
}
