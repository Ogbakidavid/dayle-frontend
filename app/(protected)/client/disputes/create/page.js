import { CreateDisputeForm } from "@/components/disputes/CreateDisputeForm";

export default async function ClientCreateDisputePage({ searchParams }) {
    const { vaultId } = await searchParams;
    return <CreateDisputeForm role="client" initialVaultId={vaultId} />;
}
