import { cn } from "@/lib/utils";
import { Shield, CheckCircle2, Clock, AlertCircle, XCircle, Pause, FileText, Eye, Activity } from "lucide-react";

export function StatusBadge({ status, className }) {
    // Normalize to uppercase for matching
    const normalizedStatus = status?.toUpperCase();
    
    const config = {
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

    const { label, icon: Icon, className: badgeClass } = config[normalizedStatus] || config.PENDING;

    return (
        <span className={cn("badge", badgeClass, className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}
