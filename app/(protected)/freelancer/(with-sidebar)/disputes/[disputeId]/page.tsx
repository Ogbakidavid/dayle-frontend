import * as React from "react";
import { DisputeDetailView } from "@/components/disputes/DisputeDetailView";

interface FreelancerDisputeDetailPageProps {
  params: Promise<{ disputeId: string }>;
}

export default async function FreelancerDisputeDetailPage({
  params,
}: FreelancerDisputeDetailPageProps) {
  const { disputeId } = await params;
  return <DisputeDetailView disputeId={disputeId} role="freelancer" />;
}
