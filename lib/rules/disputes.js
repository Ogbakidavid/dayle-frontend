export const DISPUTE_REASON_CODES = [
  // Compliance - Fail
  {
    code: "VERIFICATION_ERROR",
    label: "Verification Error",
    description: "Objective verification was applied incorrectly.",
    types: ["COMPLIANCE"],
    statuses: ["failed", "rejected"],
    requiresRequirementRef: true,
  },
  {
    code: "REQUIREMENT_MISMATCH",
    label: "Requirement Mismatch",
    description: "Deliverable meets requirement but was flagged.",
    types: ["COMPLIANCE"],
    statuses: ["failed", "rejected"],
    requiresRequirementRef: true,
  },
  // Compliance - Pass (Restricted)
  {
    code: "PROCESS_BREACH",
    label: "Process Breach",
    description: "System process was circumvented.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["passed", "verified", "approved"],
    requiresRequirementRef: false,
  },
  // General / Fraud
  {
    code: "FRAUD",
    label: "Fraudulent Activity",
    description: "Evidence of fake data or bad faith.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["passed", "failed", "rejected", "verified", "approved"],
    requiresRequirementRef: false,
  },
  {
    code: "SECURITY",
    label: "Security Concern",
    description: "Malicious code or security risk detected.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["passed", "failed", "rejected", "verified", "approved"],
    requiresRequirementRef: false,
  },
  // Approval
  {
    code: "BAD_FAITH",
    label: "Bad Faith Rejection",
    description: "Client rejected valid work repeatedly/maliciously.",
    types: ["APPROVAL"],
    statuses: ["rejected"],
    requiresRequirementRef: false,
  },
  {
    code: "SCOPE_CHANGE",
    label: "Scope Change",
    description: "Rejection due to requirements not in original scope.",
    types: ["APPROVAL"],
    statuses: ["rejected"],
    requiresRequirementRef: false,
  },
];

export function getDisputeEligibility(milestone, requirementId) {
  if (!milestone) {
    return {
      eligible: false,
      reason: "Select a milestone to open a dispute.",
      allowedCodes: [],
    };
  }

  const isCompliance =
    milestone.type === "COMPLIANCE" || milestone.type === "COMPLIANCE_AI";
  const isApproval =
    milestone.type === "APPROVAL" || milestone.type === "APPROVAL_HUMAN";
  const status = milestone.status.toLowerCase();

  // 1. Determine Allowed Codes based on Matrix based on Product Rules
  // COMPLIANCE+PASS => [FRAUD, SECURITY, PROCESS_BREACH]
  // COMPLIANCE+FAIL => [VERIFICATION_ERROR, REQUIREMENT_MISMATCH, FRAUD, SECURITY, PROCESS_BREACH]
  // APPROVAL => [BAD_FAITH, SCOPE_CHANGE, FRAUD, SECURITY, PROCESS_BREACH]

  let allowedCodes = [];
  // Note: requiresRequirementSelection is now largely determined by the *selected code*, but we can return a hint.
  // The UI should drive visibility based on the selected code's `requiresRequirementRef` prop.

  if (isCompliance) {
    if (status === "passed" || status === "verified") {
      // COMPLIANCE + PASS
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["FRAUD", "SECURITY", "PROCESS_BREACH"].includes(rc.code)
      );
    } else if (status === "failed" || status === "rejected") {
      // COMPLIANCE + FAIL
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
  } else if (isApproval) {
    // APPROVAL
    if (status === "rejected") {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "BAD_FAITH",
          "SCOPE_CHANGE",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    } else if (status === "awaiting_approval" && milestone.exceededSla) {
      // Late approval case
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["BAD_FAITH", "PROCESS_BREACH"].includes(rc.code)
      );
    }
  }

  if (allowedCodes.length === 0) {
    return {
      eligible: false,
      reason: "This milestone status is not eligible for new disputes.",
      allowedCodes: [],
    };
  }

  return {
    eligible: true,
    reason: "Eligible for dispute submission.",
    allowedCodes,
  };
}
