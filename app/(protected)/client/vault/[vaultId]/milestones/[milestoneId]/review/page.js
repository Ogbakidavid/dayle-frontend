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
    // Mock rejection logic
    console.log("Rejected milestone", { reason: selectedReason, feedback });
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
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[10px]"
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
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
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

          <div className="space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white">Action</CardTitle>
                <CardDescription>
                  Approve to release funds or request changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-white uppercase tracking-wider">
                      Decision Rationale
                    </Label>
                    <Select
                      onValueChange={(val) => {
                        setSelectedReason(val);
                        setError("");
                      }}
                    >
                      <SelectTrigger className="w-full bg-[#111111] border-white/10 text-white h-11">
                        <SelectValue placeholder="Reason for changes (Required for Rejection)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-gray-800 text-white">
                        {APPROVAL_REJECTION_CODES.map((reason) => (
                          <SelectItem
                            key={reason.code}
                            value={reason.code}
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                          >
                            <div className="flex flex-col py-1">
                              <span className="font-bold">{reason.label}</span>
                              <span className="text-xs text-white/50">
                                {reason.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {error && (
                      <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-white uppercase tracking-wider">
                      Additional Context
                    </Label>
                    <Textarea
                      placeholder="Add comments on what needs to be improved..."
                      className="bg-black/30 border-white/10 text-white min-h-[120px]"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:text-red-400"
                    onClick={handleReject}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
