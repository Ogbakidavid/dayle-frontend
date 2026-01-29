import { MilestoneStatus } from "@/lib/domain/enums";

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
  [MilestoneStatus.PENDING]: "Pending",
  [MilestoneStatus.SUBMITTED]: "Submitted",
  [MilestoneStatus.AWAITING_APPROVAL]: "Awaiting approval",
  [MilestoneStatus.REVISION_REQUESTED]: "Revision requested",
  [MilestoneStatus.VERIFIED]: "Verified",
  [MilestoneStatus.REJECTED]: "Rejected",
  [MilestoneStatus.DISPUTED]: "Disputed",
};
