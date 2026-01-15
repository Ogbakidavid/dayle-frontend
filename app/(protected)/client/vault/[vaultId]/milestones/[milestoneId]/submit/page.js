import { MilestoneSubmitView } from '@/components/milestones/MilestoneSubmitView';

export default function ClientMilestoneSubmitPage({ params }) {
    return (
        <MilestoneSubmitView
            vaultId={params.vaultId}
            milestoneId={params.milestoneId}
            role="client"
        />
    );
}
