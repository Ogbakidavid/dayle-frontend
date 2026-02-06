import { CreateDisputeForm } from "@/components/disputes/CreateDisputeForm";

export default async function FreelancerCreateDisputePage({ searchParams }) {
    const { vaultId } = await searchParams;
    return <CreateDisputeForm role="freelancer" initialVaultId={vaultId} />;
}
