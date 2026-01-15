"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ChevronRight,
  Upload,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EvidencePanel } from "@/components/shared/EvidencePanel";

export default function FreelancerVaultDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId;

  // Mock Data (Consistent with Client view)
  const mockVault = {
    id: vaultId,
    title: "E-Commerce Platform Development",
    totalAmount: 15000,
    paidAmount: 5000,
    status: "active",
    clientEmail: "client@example.com",
    freelancerEmail: "freelancer@example.com",
    createdAt: "2025-09-15T10:00:00Z",
    milestones: [
      {
        id: "m1",
        title: "UI Design & Prototyping",
        amount: 5000,
        status: "approved",
        type: "standard",
      },
      {
        id: "m2",
        title: "Backend API Development",
        amount: 5000,
        status: "awaiting_approval",
        type: "approval",
      },
      {
        id: "m3",
        title: "Frontend Integration",
        amount: 5000,
        status: "pending",
        type: "standard",
      },
    ],
    disputeEligibility: {
      canOpenDispute: true,
      reason: "Payment release delayed beyond 48 hours after approval",
    },
  };

  const activeMilestone = mockVault.milestones.find((m) => m.id === "m2");
  const evidenceMock = {
    clarifications: [
      {
        id: 1,
        question: "Does the API need GraphQL?",
        answer: "No, REST is fine.",
        askedBy: "Freelancer",
        answeredBy: "Client",
        answeredAt: "2025-10-10T14:30:00Z",
      },
    ],
    fileComments: [
      {
        id: 1,
        fileName: "api_spec.pdf",
        requirementId: "REQ-002",
        comment: "Auth endpoints missing 2FA flow.",
        author: "Client",
        createdAt: "2025-10-11T09:15:00Z",
      },
    ],
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-8">
          <Link
            href="/freelancer/vaults"
            className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vaults
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {mockVault.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-widest text-[10px]"
                >
                  {mockVault.status}
                </Badge>
              </div>
              <p className="text-slate-500 font-medium">
                Vault ID:{" "}
                <span className="text-slate-400 font-mono">{vaultId}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">
                Potential Earnings
              </p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ${mockVault.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-500 font-medium mt-1">
                ${mockVault.paidAmount.toLocaleString()} Received
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: MILESTONES */}
          <div className="lg:col-span-2 space-y-6">
            {/* Milestone List */}
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Project Milestones</CardTitle>
                <CardDescription>
                  Submit work and track approvals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockVault.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {milestone.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <span>${milestone.amount.toLocaleString()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span
                              className={cn(
                                milestone.status === "approved"
                                  ? "text-emerald-500"
                                  : milestone.status === "awaiting_approval"
                                  ? "text-amber-500"
                                  : "text-slate-500"
                              )}
                            >
                              {milestone.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {milestone.status === "pending" && (
                        <Link
                          href={`/freelancer/vault/${vaultId}/milestones/${milestone.id}/submit`}
                        >
                          <Button
                            size="sm"
                            className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                          >
                            Submit Work
                            <Upload className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                      {milestone.status === "awaiting_approval" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-amber-500/20 text-amber-500 bg-amber-500/5"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Pending Review
                        </Button>
                      )}
                      {milestone.status === "approved" && (
                        <Link
                          href={`/freelancer/vault/${vaultId}/milestones/${milestone.id}/verification`}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-500 hover:text-emerald-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Evidence Panel */}
            <EvidencePanel
              milestone={activeMilestone}
              evidence={evidenceMock}
            />
          </div>

          {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
          <div className="space-y-6">
            {/* Verification Summary */}
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Requirements Met</span>
                    <span className="text-emerald-500 font-bold">12/12</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Code Quality Score</span>
                    <span className="text-emerald-500 font-bold">A+</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Link
                    href={`/freelancer/vault/${vaultId}/milestones/${activeMilestone?.id}/verification`}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-white/10 bg-transparent hover:bg-white/5 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Dispute CTA */}
            {mockVault.disputeEligibility.canOpenDispute && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1">
                      Issue Reported
                    </h4>
                    <p className="text-sm text-red-200/60 mb-4">
                      {mockVault.disputeEligibility.reason}
                    </p>
                    <Button
                      size="sm"
                      className="bg-red-500 text-white hover:bg-red-600 border-none w-full shadow-red-500/20 shadow-lg"
                    >
                      Raise Dispute
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#0D0D0E] border border-white/5 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                Resources
              </h4>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white h-auto py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="truncate">View Project Requirements</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white h-auto py-3"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="truncate">Payment Schedule</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
