export const DISPUTE_REASON_CODES = [
  // Compliance - Fail
  {
    code: "VERIFICATION_ERROR",
    label: "Verification Error",
    description: "Objective verification was applied incorrectly.",
    types: ["COMPLIANCE"],
    statuses: ["REJECTED"],
    requiresRequirementRef: true,
  },
  {
    code: "REQUIREMENT_MISMATCH",
    label: "Requirement Mismatch",
    description: "Deliverable meets requirement but was flagged.",
    types: ["COMPLIANCE"],
    statuses: ["REJECTED"],
    requiresRequirementRef: true,
  },
  // Compliance - Pass (Restricted)
  {
    code: "PROCESS_BREACH",
    label: "Process Breach",
    description: "System process was circumvented.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["VERIFIED", "REJECTED"],
    requiresRequirementRef: false,
  },
  // General / Fraud
  {
    code: "FRAUD",
    label: "Fraudulent Activity",
    description: "Evidence of fake data or bad faith.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["VERIFIED", "REJECTED"],
    requiresRequirementRef: false,
  },
  {
    code: "SECURITY",
    label: "Security Concern",
    description: "Malicious code or security risk detected.",
    types: ["COMPLIANCE", "APPROVAL"],
    statuses: ["VERIFIED", "REJECTED"],
    requiresRequirementRef: false,
  },
  // Approval
  {
    code: "BAD_FAITH",
    label: "Bad Faith Rejection",
    description: "Client rejected valid work repeatedly/maliciously.",
    types: ["APPROVAL"],
    statuses: ["REJECTED"],
    requiresRequirementRef: false,
  },
  {
    code: "SCOPE_CHANGE",
    label: "Scope Change",
    description: "Rejection due to requirements not in original scope.",
    types: ["APPROVAL"],
    statuses: ["REJECTED"],
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

  const isCompliance = milestone.type === "COMPLIANCE";
  const isApproval = milestone.type === "APPROVAL";
  const status = milestone.status; // Already uppercase now

  // Determine Allowed Codes based on Canonical Rules
  // COMPLIANCE+VERIFIED => [FRAUD, SECURITY, PROCESS_BREACH]
  // COMPLIANCE+REJECTED => [VERIFICATION_ERROR, REQUIREMENT_MISMATCH, FRAUD, SECURITY, PROCESS_BREACH]
  // APPROVAL+REJECTED => [BAD_FAITH, SCOPE_CHANGE, FRAUD, SECURITY, PROCESS_BREACH]

  let allowedCodes = [];

  if (isCompliance) {
    if (status === "VERIFIED") {
      // COMPLIANCE + PASS
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["FRAUD", "SECURITY", "PROCESS_BREACH"].includes(rc.code)
      );
    } else if (status === "REJECTED") {
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
    if (status === "REJECTED") {
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        [
          "BAD_FAITH",
          "SCOPE_CHANGE",
          "FRAUD",
          "SECURITY",
          "PROCESS_BREACH",
        ].includes(rc.code)
      );
    } else if (status === "AWAITING_APPROVAL" && milestone.exceededSla) {
      // Late approval case
      allowedCodes = DISPUTE_REASON_CODES.filter((rc) =>
        ["BAD_FAITH", "PROCESS_BREACH"].includes(rc.code)
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
