"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPROVAL_REJECTION_CODES } from "@/lib/rules/milestones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useVault } from "@/lib/store/vault-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function ClientReviewPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const milestoneId = params.milestoneId as string;
  const { vaults, loading, refreshVaults } = useVault();

  const [selectedReason, setSelectedReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vault = (vaults || []).find((v: any) => v.id === vaultId);
  const milestone = vault?.milestones?.find((m: any) => m.id === milestoneId);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const idempotencyKey = `release_${milestoneId}_${Date.now()}`;
      // For approvals, we usually want to release funds directly
      await api.vaults.releaseMilestone(vaultId, milestoneId, {
        idempotencyKey,
      });

      await refreshVaults();
      toast.success("Milestone approved and funds released");
      router.push(`/client/vault/${vaultId}`);
    } catch (err: any) {
      console.error("Approval failed:", err);
      toast.error(err.message || "Failed to approve milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewAction = async (
    outcome: "APPROVE" | "REQUEST_CHANGES" | "REJECT",
  ) => {
    if (outcome !== "APPROVE" && !selectedReason) {
      toast.error(
        `Please select a reason for ${outcome === "REJECT" ? "rejection" : "requesting changes"}.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await api.milestones.review(milestoneId, {
        outcome,
        reasonCodes: [selectedReason],
        notes: feedback,
      });

      await refreshVaults();
      toast.success(
        outcome === "REJECT" ? "Milestone rejected" : "Revision requested",
      );
      router.push(`/client/vault/${vaultId}`);
    } catch (err: any) {
      console.error("Review action failed:", err);
      toast.error(err.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <Link
            href={`/client/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6 font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {loading
                ? "Loading..."
                : `Review: ${milestone?.title || "Milestone"}`}
            </h1>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[10px]"
            >
              Action Required
            </Badge>
          </div>
          <p className="text-gray-400 mt-2 font-medium">
            Review the submission from the freelancer before making a decision.
          </p>
        </header>

        {loading || !milestone ? (
          <div className="py-20 text-center text-white/50 uppercase font-black tracking-widest">
            Securing Review Context...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="bg-[#0D0D0E] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-white font-bold uppercase tracking-wide">
                      Submitted Deliverables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-white/50 uppercase font-bold tracking-widest">
                        No file uploads in this demo view. Check evidence panel
                        for links.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/2 border border-white/5">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                        Freelancer Notes
                      </p>
                      <p className="text-sm text-gray-400 italic">
                        {milestone.submission?.notes ||
                          "No notes provided with this submission."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Sidebar */}
              <div>
                <Card className="bg-muted border-white/10 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white text-sm font-bold uppercase tracking-wide">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Approve */}
                    <Button
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs h-12 transition-all"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isSubmitting
                        ? "Processing..."
                        : "Approve & Release Payment"}
                    </Button>

                    <div className="relative flex items-center py-2">
                      <div className="grow border-t border-white/10"></div>
                      <span className="shrink-0 mx-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                        OR
                      </span>
                      <div className="grow border-t border-white/10"></div>
                    </div>

                    {/* Request Changes */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2 block">
                        Request Revisions
                      </Label>
                      <Select
                        onValueChange={(val) => {
                          if (val) {
                            setSelectedReason(val);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all font-bold">
                          <SelectValue placeholder="Request Changes..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141416] border-white/10 text-white z-100">
                          {APPROVAL_REJECTION_CODES.filter(
                            (c) =>
                              c.code === "REVISION_REQUIRED" ||
                              c.code === "QUALITY_GAP",
                          ).map((code) => (
                            <SelectItem
                              key={code.code}
                              value={code.code}
                              className="focus:bg-white/10 focus:text-white"
                            >
                              <div className="flex flex-col py-1">
                                <span className="font-bold text-xs uppercase">
                                  {code.label}
                                </span>
                                <span className="text-[10px] text-white/50 uppercase tracking-tight">
                                  {code.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedReason && (
                        <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                          <Textarea
                            placeholder="Add specific feedback notes..."
                            className="bg-muted! border-white/10! text-white! text-sm font-medium"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            className="w-full border-amber-500/50 text-amber-500 font-bold uppercase tracking-widest text-[10px] h-10 hover:bg-amber-500/10 transition-all"
                            onClick={() =>
                              handleReviewAction("REQUEST_CHANGES")
                            }
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Submitting..." : "Confirm Request"}
                          </Button>
                        </div>
                      )}

                      <p className="text-[9px] text-white/40 pt-1 font-bold uppercase tracking-widest">
                        Sends milestone back to "Revision Requested".
                      </p>
                    </div>

                    {/* Reject */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <Label className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-2 block">
                        Reject Submission
                      </Label>
                      <Select
                        onValueChange={(val) => {
                          if (val) {
                            setSelectedReason(val);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-bold">
                          <SelectValue placeholder="Reject Work..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141416] border-white/10 text-white z-100">
                          {APPROVAL_REJECTION_CODES.filter(
                            (c) => c.code !== "REVISION_REQUIRED",
                          ).map((code) => (
                            <SelectItem
                              key={code.code}
                              value={code.code}
                              className="focus:bg-white/10 focus:text-white"
                            >
                              <div className="flex flex-col py-1">
                                <span className="font-bold text-xs uppercase">
                                  {code.label}
                                </span>
                                <span className="text-[10px] text-white/50 uppercase tracking-tight">
                                  {code.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 mt-2 font-bold uppercase tracking-widest text-[10px] h-10 transition-all"
                        disabled={!selectedReason || isSubmitting}
                        onClick={() => handleReviewAction("REJECT")}
                      >
                        Confirm Rejection
                      </Button>
                      <p className="text-[9px] text-white/40 mt-2 font-bold uppercase tracking-widest">
                        Marks as "Rejected". Does NOT start a dispute.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
