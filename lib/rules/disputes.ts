import { VaultStatus } from "@/lib/domain/enums";

export const DISPUTE_REASON_CODES = [
  {
    code: "INTEGRITY_VIOLATION",
    label: "Integrity & Security",
    description: "Evidence of fake data, malicious code, or gross misrepresentation of work.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED, VaultStatus.DISPUTED],
    requiresDeliverableRef: false,
  },
  {
    code: "SCOPE_DISPUTE",
    label: "Scope & Requirements",
    description: "Disagreement over whether the delivered work matches the agreed contract or scope.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED],
    requiresDeliverableRef: true,
  },
  {
    code: "COOPERATION_ISSUE",
    label: "Bad Faith & Cooperation",
    description: "The other party is unresponsive, ghosting, or maliciously withholding release/work.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [VaultStatus.FUNDED, VaultStatus.DISPUTED],
    requiresDeliverableRef: false,
  },
  {
    code: "TECHNICAL_ERROR",
    label: "Protocol & Technical Error",
    description: "The automated verification or protocol handler failed to process the work correctly.",
    verificationResults: ["FAIL", "FLAGGED"],
    statuses: [VaultStatus.FUNDED],
    requiresDeliverableRef: true,
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
  // Use vault-level verification if available
  const verificationResult = vault.verification?.result;

  let allowedCodes = [];

  const eligibleStatuses = [
    VaultStatus.FUNDED,
    VaultStatus.DISPUTED,
    "RELEASE_REQUESTED",
    "CHANGES_REQUESTED",
    "RELEASING"
  ] as string[];

  // Simplified logic: If in an active/funded state, it's generally eligible for specific codes
  if (eligibleStatuses.includes(status)) {
    if (verificationResult === "FAIL" || verificationResult === "FLAGGED") {
      // System flagged it? Allow quality/integrity or technical error disputes
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["INTEGRITY_VIOLATION", "SCOPE_DISPUTE", "TECHNICAL_ERROR", "COOPERATION_ISSUE"].includes(rc.code)
      );
    } else {
      // Normal/Passed? Allow scope, cooperation, or integrity disputes
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["INTEGRITY_VIOLATION", "SCOPE_DISPUTE", "COOPERATION_ISSUE"].includes(rc.code)
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
