import { cn } from "@/lib/utils";
import { Shield, CheckCircle2, Clock, AlertCircle, XCircle, Pause, FileText, Eye, Activity } from "lucide-react";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    // Normalize to uppercase for matching
    const normalizedStatus = status?.toUpperCase();

    // ... (rest of the config)
    const config: Record<string, { label: string; icon: any; className: string }> = {
        // Vault Statuses
        DRAFT: {
            label: "Draft",
            icon: FileText,
            className: "badge-pending",
        },
        INVITED: {
            label: "Invited",
            icon: Clock,
            className: "badge-pending",
        },
        FUNDED_UNASSIGNED: {
            label: "Funded",
            icon: Shield,
            className: "badge-secured",
        },
        FUNDED_ASSIGNED: {
            label: "Funded & Assigned",
            icon: Shield,
            className: "badge-secured",
        },
        ACTIVE: {
            label: "Active",
            icon: Activity,
            className: "badge-active",
        },
        IN_REVIEW: {
            label: "In Review",
            icon: Eye,
            className: "badge-pending",
        },
        COMPLETED: {
            label: "Completed",
            icon: CheckCircle2,
            className: "badge-verified",
        },
        CANCELLED: {
            label: "Cancelled",
            icon: XCircle,
            className: "badge-cancelled",
        },
        PAUSED: {
            label: "Paused",
            icon: Pause,
            className: "badge-pending",
        },

        // Milestone Statuses
        PENDING: {
            label: "Pending",
            icon: Clock,
            className: "badge-pending",
        },
        SUBMITTED: {
            label: "Submitted",
            icon: CheckCircle2,
            className: "badge-active",
        },
        AWAITING_APPROVAL: {
            label: "Awaiting Approval",
            icon: Eye,
            className: "badge-pending",
        },
        VERIFIED: {
            label: "Verified",
            icon: CheckCircle2,
            className: "badge-verified",
        },
        REJECTED: {
            label: "Rejected",
            icon: XCircle,
            className: "badge-failed",
        },
        REVISION_REQUESTED: {
            label: "Revision Requested",
            icon: AlertCircle,
            className: "badge-pending",
        },
        DISPUTED: {
            label: "Disputed",
            icon: AlertCircle,
            className: "badge-failed",
        },

        // Legacy fallbacks (lowercase)
        SECURED: {
            label: "Secured",
            icon: Shield,
            className: "badge-secured",
        },
        FAILED: {
            label: "Failed",
            icon: XCircle,
            className: "badge-failed",
        },
        REVIEW: {
            label: "In Review",
            icon: Eye,
            className: "badge-pending",
        },
    };

    const defaultStatus = {
        label: "Pending",
        icon: Clock,
        className: "badge-pending",
    };

    const statusConfig = config[normalizedStatus] || config.PENDING || defaultStatus;
    // We cast this because we know defaultStatus matches the shape and ensures existence
    const { label, icon: Icon, className: badgeClass } = statusConfig as typeof defaultStatus;

    return (
        <span className={cn("badge", badgeClass, className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}
