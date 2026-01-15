import { DisputeDetailView } from '@/components/disputes/DisputeDetailView';

export default function FreelancerDisputeDetailPage({ params }) {
    return <DisputeDetailView disputeId={params.disputeId} role="freelancer" />;
}
