import { DisputeDetailView } from '@/components/disputes/DisputeDetailView';

export default function ClientDisputeDetailPage({ params }) {
    return <DisputeDetailView disputeId={params.disputeId} role="client" />;
}
