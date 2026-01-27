export const APPROVAL_REJECTION_CODES = [
  {
    code: "REQ_MISSED",
    label: "Requirement missed",
    description: "One or more listed requirements were not met.",
  },
  {
    code: "QUALITY_GAP",
    label: "Quality gap",
    description: "Work quality does not meet the defined standard.",
  },
  {
    code: "EVIDENCE_INCOMPLETE",
    label: "Evidence incomplete",
    description: "Required proof or files are missing.",
  },
  {
    code: "REVISION_REQUIRED",
    label: "Revision required",
    description: "Deliverable needs a revision before approval.",
  },
];

export const MILESTONE_STATUS_LABELS = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  AWAITING_APPROVAL: "Awaiting approval",
  REVISION_REQUESTED: "Revision requested",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  DISPUTED: "Disputed",
};
