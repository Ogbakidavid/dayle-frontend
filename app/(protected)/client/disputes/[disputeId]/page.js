import { DisputeDetailView } from "@/components/disputes/DisputeDetailView";

export default async function ClientDisputeDetailPage({ params }) {
  const { disputeId } = await params;
  return <DisputeDetailView disputeId={disputeId} role="client" />;
}
