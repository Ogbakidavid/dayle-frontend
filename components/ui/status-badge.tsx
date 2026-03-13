import { cn } from "@/lib/utils";
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Pause,
  FileText,
  Eye,
  Activity,
  LucideIcon,
} from "lucide-react";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Normalize to uppercase for matching
  const normalizedStatus = status?.toUpperCase();

  const config: Record<string, StatusConfig> = {
    // Vault Statuses
    DRAFT: {
      label: "Draft",
      icon: FileText,
      className: "badge-neutral",
    },
    INVITED: {
      label: "Invited",
      icon: Clock,
      className: "badge-warning",
    },
    FUNDED_UNASSIGNED: {
      label: "Funded",
      icon: Shield,
      className: "badge-success",
    },
    FUNDED_ASSIGNED: {
      label: "Funded & assigned",
      icon: Shield,
      className: "badge-success",
    },
    ACTIVE: {
      label: "Active",
      icon: Activity,
      className: "badge-info",
    },
    IN_REVIEW: {
      label: "In Review",
      icon: Eye,
      className: "badge-warning",
    },
    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      className: "badge-success",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      className: "badge-neutral",
    },
    PAUSED: {
      label: "Paused",
      icon: Pause,
      className: "badge-neutral",
    },

    // Deliverable Statuses
    PENDING: {
      label: "Pending",
      icon: Clock,
      className: "badge-warning",
    },
    SUBMITTED: {
      label: "Submitted",
      icon: CheckCircle2,
      className: "badge-info",
    },
    AWAITING_APPROVAL: {
      label: "Awaiting approval",
      icon: Eye,
      className: "badge-warning",
    },
    VERIFIED: {
      label: "Verified",
      icon: CheckCircle2,
      className: "badge-success",
    },
    REJECTED: {
      label: "Rejected",
      icon: XCircle,
      className: "badge-error",
    },
    REVISION_REQUESTED: {
      label: "Revision requested",
      icon: AlertCircle,
      className: "badge-warning",
    },
    DISPUTED: {
      label: "Disputed",
      icon: AlertCircle,
      className: "badge-error",
    },

    // Legacy fallbacks (lowercase)
    SECURED: {
      label: "Secured",
      icon: Shield,
      className: "badge-success",
    },
    FAILED: {
      label: "Failed",
      icon: XCircle,
      className: "badge-error",
    },
    REVIEW: {
      label: "In Review",
      icon: Eye,
      className: "badge-warning",
    },
  };

  const {
    label,
    icon: Icon,
    className: badgeClass,
  } = config[normalizedStatus] || config.PENDING;

  return (
    <span className={cn("badge", badgeClass, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
