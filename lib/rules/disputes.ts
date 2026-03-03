import { VaultStatus } from "@/lib/domain/enums";

export const DISPUTE_REASON_CODES = [
  // AI Verification Disputes (when AI audit fails/flags incorrectly)
  {
    code: "VERIFICATION_ERROR",
    label: "Verification Error",
    description: "Objective verification was applied incorrectly.",
    verificationResults: ["FAIL", "FLAGGED"],
    statuses: [VaultStatus.FUNDED], // Assuming FUNDED is the state where review happens
    requiresDeliverableRef: true,
  },
  {
    code: "REQUIREMENT_MISMATCH",
    label: "Requirement Mismatch",
    description: "Deliverable meets requirement but was flagged.",
    verificationResults: ["FAIL", "FLAGGED"],
    statuses: [VaultStatus.FUNDED],
    requiresDeliverableRef: true,
  },
  // Process & Security (any verification result)
  {
    code: "PROCESS_BREACH",
    label: "Process Breach",
    description: "System process was circumvented.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED, VaultStatus.DISPUTED],
    requiresDeliverableRef: false,
  },
  {
    code: "FRAUD",
    label: "Fraudulent Activity",
    description: "Evidence of fake data or bad faith.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED, VaultStatus.DISPUTED],
    requiresDeliverableRef: false,
  },
  {
    code: "SECURITY",
    label: "Security Concern",
    description: "Malicious code or security risk detected.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED, VaultStatus.DISPUTED],
    requiresDeliverableRef: false,
  },
  // Client Approval Disputes (when AI passed but client rejected)
  {
    code: "BAD_FAITH",
    label: "Bad Faith Rejection",
    description: "Client rejected valid work repeatedly/maliciously.",
    verificationResults: ["PASS"],
    statuses: [VaultStatus.FUNDED],
    requiresDeliverableRef: false,
  },
  {
    code: "SCOPE_CHANGE",
    label: "Scope Change",
    description: "Rejection due to requirements not in original scope.",
    verificationResults: ["PASS"],
    statuses: [VaultStatus.FUNDED],
    requiresDeliverableRef: false,
  },
];

export function getDisputeEligibility(vault: any, deliverableTitle?: string | null) {
  if (!vault) {
    return {
      eligible: false,
      reason: "Select a vault to open a case file.",
      allowedCodes: [],
    };
  }

  const status = vault.status;
  // Use vault-level verification if available, or fallback
  const verificationResult = vault.verification?.result || (vault.milestones?.[0]?.verification?.result);

  let allowedCodes = [];

  // Simplified logic: If FUNDED or DISPUTED, it's generally eligible for specific codes
  if (status === VaultStatus.FUNDED || status === VaultStatus.DISPUTED) {
    if (verificationResult === "FAIL" || verificationResult === "FLAGGED") {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "VERIFICATION_ERROR",
          "REQUIREMENT_MISMATCH",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    } else {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "BAD_FAITH",
          "SCOPE_CHANGE",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    }
  }

  if (allowedCodes.length === 0) {
    return {
      eligible: false,
      reason: "This vault status is not eligible for new case files.",
      allowedCodes: [],
    };
  }

  return {
    eligible: true,
    reason: "Eligible for case file submission.",
    allowedCodes,
  };
}
