import { vaults } from './vaults';
import { evidenceByMilestone } from './evidence';
import { disputes } from './disputes';
import { ledgerEntries } from './ledger';

export { vaults, evidenceByMilestone, disputes, ledgerEntries };

export function getVaultById(vaultId) {
    return vaults.find((vault) => vault.id === vaultId);
}

export function getMilestoneById(vaultId, milestoneId) {
    const vault = getVaultById(vaultId);
    if (!vault) return null;
    return vault.milestones.find((milestone) => milestone.id === milestoneId) || null;
}

export function getEvidenceForMilestone(milestoneId) {
    return evidenceByMilestone[milestoneId] || { clarifications: [], fileComments: [] };
}

export function getDisputesForVault(vaultId) {
    return disputes.filter((dispute) => dispute.vaultId === vaultId);
}

export function getDisputeById(disputeId) {
    return disputes.find((dispute) => dispute.id === disputeId);
}

export function getLedgerEntries() {
    return ledgerEntries;
}
