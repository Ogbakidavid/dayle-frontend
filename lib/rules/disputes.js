import { MilestoneStatus } from "@/lib/domain/enums";

export const DISPUTE_REASON_CODES = [
  // AI Verification Disputes (when AI audit fails/flags incorrectly)
  {
    code: "VERIFICATION_ERROR",
    label: "Verification Error",
    description: "Objective verification was applied incorrectly.",
    verificationResults: ["FAIL", "FLAGGED"],
    statuses: [MilestoneStatus.REJECTED],
    requiresRequirementRef: true,
  },
  {
    code: "REQUIREMENT_MISMATCH",
    label: "Requirement Mismatch",
    description: "Deliverable meets requirement but was flagged.",
    verificationResults: ["FAIL", "FLAGGED"],
    statuses: [MilestoneStatus.REJECTED],
    requiresRequirementRef: true,
  },
  // Process & Security (any verification result)
  {
    code: "PROCESS_BREACH",
    label: "Process Breach",
    description: "System process was circumvented.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [MilestoneStatus.VERIFIED, MilestoneStatus.REJECTED],
    requiresRequirementRef: false,
  },
  {
    code: "FRAUD",
    label: "Fraudulent Activity",
    description: "Evidence of fake data or bad faith.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [MilestoneStatus.VERIFIED, MilestoneStatus.REJECTED],
    requiresRequirementRef: false,
  },
  {
    code: "SECURITY",
    label: "Security Concern",
    description: "Malicious code or security risk detected.",
    verificationResults: ["PASS", "FAIL", "FLAGGED", "HUMAN_REVIEW"],
    statuses: [MilestoneStatus.VERIFIED, MilestoneStatus.REJECTED],
    requiresRequirementRef: false,
  },
  // Client Approval Disputes (when AI passed but client rejected)
  {
    code: "BAD_FAITH",
    label: "Bad Faith Rejection",
    description: "Client rejected valid work repeatedly/maliciously.",
    verificationResults: ["PASS"],
    statuses: [MilestoneStatus.REJECTED],
    requiresRequirementRef: false,
  },
  {
    code: "SCOPE_CHANGE",
    label: "Scope Change",
    description: "Rejection due to requirements not in original scope.",
    verificationResults: ["PASS"],
    statuses: [MilestoneStatus.REJECTED],
    requiresRequirementRef: false,
  },
];

export function getDisputeEligibility(milestone, requirementId) {
  if (!milestone) {
    return {
      eligible: false,
      reason: "Select a milestone to open a case file.",
      allowedCodes: [],
    };
  }

  const status = milestone.status;
  const verificationResult = milestone.verification?.result;

  let allowedCodes = [];

  // Logic based on verification result + status combination
  if (verificationResult === "FAIL" || verificationResult === "FLAGGED") {
    // AI audit failed/flagged - freelancer can dispute verification
    if (status === MilestoneStatus.REJECTED) {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "VERIFICATION_ERROR",
          "REQUIREMENT_MISMATCH",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    }
  } else if (verificationResult === "PASS") {
    // AI audit passed - disputes are about client approval
    if (status === MilestoneStatus.REJECTED) {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "BAD_FAITH",
          "SCOPE_CHANGE",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    } else if (status === MilestoneStatus.VERIFIED) {
      // Client approved but disputing after the fact (rare)
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["FRAUD", "SECURITY", "PROCESS_BREACH"].includes(rc.code)
      );
    } else if (status === MilestoneStatus.AWAITING_APPROVAL && milestone.exceededSla) {
      // Client is taking too long to approve
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["BAD_FAITH", "PROCESS_BREACH"].includes(rc.code)
      );
    }
  } else {
    // No verification result yet or HUMAN_REVIEW - limited disputes
    if (status === MilestoneStatus.REJECTED || status === MilestoneStatus.VERIFIED) {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["FRAUD", "SECURITY", "PROCESS_BREACH"].includes(rc.code)
      );
    }
  }

  if (allowedCodes.length === 0) {
    return {
      eligible: false,
      reason: "This milestone status is not eligible for new case files.",
      allowedCodes: [],
    };
  }

  return {
    eligible: true,
    reason: "Eligible for case file submission.",
    allowedCodes,
  };
}
