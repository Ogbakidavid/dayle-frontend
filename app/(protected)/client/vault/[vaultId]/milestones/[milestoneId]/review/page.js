"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { APPROVAL_REJECTION_CODES } from "@/lib/rules/milestones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ClientReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { vaultId, milestoneId } = params;
  const [feedback, setFeedback] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [error, setError] = useState("");

  const handleApprove = () => {
    // Mock approval logic
    console.log("Approved milestone");
    router.push(`/client/vault/${vaultId}`);
  };

  const handleReject = () => {
    if (!selectedReason) {
      setError("Please select a reason for requesting changes.");
      return;
    }
    setError("");
    // structured Milestone_Review record
    const reviewRecord = {
      vaultId,
      milestoneId,
      reviewerRole: "CLIENT",
      action: "REVISION_REQUESTED", // or REJECTED depending on severity, usually revision first
      reasonCode: selectedReason,
      comments: feedback,
      timestamp: new Date().toISOString(),
      metadata: {
        attempt: 1, // mock
      },
    };

    console.log("Submitting Milestone Review Record:", reviewRecord);

    // In real app: await submitReview(reviewRecord);
    router.push(`/client/vault/${vaultId}`);
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <Link
            href={`/client/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Review Submission</h1>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-wide text-sm"
            >
              Action Required
            </Badge>
          </div>
          <p className="text-slate-500 mt-2">
            Freelancer has submitted work for approval.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white">
                  Submitted Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-sm text-white font-medium">
                          backend_v1.zip
                        </p>
                        <p className="text-xs text-slate-500">
                          12.5 MB · Uploaded 2 hours ago
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-sm text-white font-medium">
                          api_docs.pdf
                        </p>
                        <p className="text-xs text-slate-500">
                          2.1 MB · Uploaded 2 hours ago
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-slate-400 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Freelancer Notes
                  </p>
                  <p className="text-sm text-slate-300 italic">
                    "Here is the first draft of the API. I've included the
                    swagger docs as requested. Let me know if you need any
                    changes."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div>
            <Card className="bg-[#111111] border-white/10 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Approve */}
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12"
                  onClick={handleApprove}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Release Payment
                </Button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-bold uppercase tracking-wide">
                    Or
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Request Changes */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/70 uppercase tracking-wide">
                    Request Revisions
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        setSelectedReason(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/50">
                      <SelectValue placeholder="Request Changes..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141416] border-white/10 text-white">
                      {APPROVAL_REJECTION_CODES.filter(
                        (c) =>
                          c.code === "REVISION_REQUIRED" ||
                          c.code === "QUALITY_GAP"
                      ).map((code) => (
                        <SelectItem
                          key={code.code}
                          value={code.code}
                          className="focus:bg-white/10 focus:text-white"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">{code.label}</span>
                            <span className="text-xs text-white/50">
                              {code.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedReason && (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        placeholder="Add specific feedback notes..."
                        className="bg-black/30 border-white/10 text-white text-sm"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="w-full border-amber-500/50 text-amber-500"
                        onClick={handleReject}
                      >
                        Confirm Request
                      </Button>
                    </div>
                  )}

                  <p className="text-[10px] text-white/40 pt-1">
                    Sends milestone back to "Revision Requested".
                  </p>
                </div>

                {/* Reject */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <Label className="text-xs font-bold text-red-500/70 uppercase tracking-wide">
                    Reject Submission
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      if (val) {
                        setSelectedReason(val);
                        // If rejecting, we might want to force feedback, but for now just select
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/30">
                      <SelectValue placeholder="Reject Work..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141416] border-white/10 text-white">
                      {APPROVAL_REJECTION_CODES.filter(
                        (c) => c.code !== "REVISION_REQUIRED"
                      ).map((code) => (
                        <SelectItem
                          key={code.code}
                          value={code.code}
                          className="focus:bg-white/10 focus:text-white"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold">{code.label}</span>
                            <span className="text-xs text-white/50">
                              {code.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-white/40">
                    Marks as "Rejected". Does NOT start a dispute.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
