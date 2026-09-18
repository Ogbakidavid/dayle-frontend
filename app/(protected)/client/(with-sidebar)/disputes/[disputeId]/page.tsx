import * as React from "react";
import { DisputeDetailView } from "@/components/disputes/DisputeDetailView";

interface ClientDisputeDetailPageProps {
  params: Promise<{ disputeId: string }>;
}

export default async function ClientDisputeDetailPage({
  params,
}: ClientDisputeDetailPageProps) {
  const { disputeId } = await params;
  return <DisputeDetailView disputeId={disputeId} role="client" />;
}
