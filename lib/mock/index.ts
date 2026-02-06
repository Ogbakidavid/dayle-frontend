import { vaults } from './vaults';
import { evidence } from './evidence';
import { disputes } from './disputes';
import { ledgerEntries } from './ledger';

export { vaults, evidence, disputes, ledgerEntries };

export function getVaultById(vaultId: string) {
    return vaults.find((vault) => vault.id === vaultId);
}

export function getMilestoneById(vaultId: string, milestoneId: string) {
    const vault = getVaultById(vaultId);
    if (!vault) return null;
    return vault.milestones.find((milestone) => milestone.id === milestoneId) || null;
}

export function getEvidenceForMilestone(milestoneId: string) {
    return evidence.filter((e) => e.milestoneId === milestoneId);
}

export function getDisputesForVault(vaultId: string) {
    return disputes.filter((dispute) => dispute.vaultId === vaultId);
}

export function getDisputeById(disputeId: string) {
    return disputes.find((dispute) => dispute.id === disputeId);
}

export function getLedgerEntries() {
    return ledgerEntries;
}

