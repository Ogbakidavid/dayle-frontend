import { cn } from "@/lib/utils";
import { Shield, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

export function StatusBadge({ status, className }) {
    const config = {
        secured: {
            label: "Secured",
            icon: Shield,
            className: "badge-secured",
        },
        verified: {
            label: "Verified",
            icon: CheckCircle2,
            className: "badge-verified",
        },
        pending: {
            label: "Pending",
            icon: Clock,
            className: "badge-pending",
        },
        active: {
            label: "Active",
            icon: Clock,
            className: "badge-active",
        },
        review: {
            label: "In Review",
            icon: AlertCircle,
            className: "badge-pending",
        },
        completed: {
            label: "Completed",
            icon: CheckCircle2,
            className: "badge-verified",
        },
        failed: {
            label: "Failed",
            icon: XCircle,
            className: "badge-failed",
        },
        cancelled: {
            label: "Cancelled",
            icon: XCircle,
            className: "badge-cancelled",
        },
    };

    const { label, icon: Icon, className: badgeClass } = config[status] || config.pending;

    return (
        <span className={cn("badge", badgeClass, className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}
