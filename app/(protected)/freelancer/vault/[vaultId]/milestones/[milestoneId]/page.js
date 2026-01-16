"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  Clock,
  DollarSign,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EvidenceChannel } from "@/components/milestones/EvidenceChannel";

export default function FreelancerMilestoneDetailPage() {
  const params = useParams();
  const { vaultId, milestoneId } = params;

  const mockMilestone = {
    id: milestoneId,
    title: "Backend API Development",
    description:
      "Implement RESTful API endpoints for user authentication, product catalog, and cart management using Node.js and Express.",
    amount: 5000,
    status: "pending", // Demo state: ready to submit
    dueDate: "2025-10-15",
    deliverables: [
      "Source code repository link",
      "API Documentation (Swagger/OpenAPI)",
      "Unit Test Coverage Report (>80%)",
    ],
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="pt-8">
          <Link
            href={`/freelancer/vault/${vaultId}`}
            className="inline-flex items-center text-sm text-slate-500 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vault
          </Link>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {mockMilestone.title}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-slate-500/10 text-slate-400 border-slate-500/20 uppercase tracking-wide text-sm"
                >
                  In Progress
                </Badge>
              </div>
              <p className="text-slate-500 text-lg">
                {mockMilestone.description}
              </p>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                Milestone Value
              </p>
              <p className="text-3xl font-bold text-white tracking-tight">
                ${mockMilestone.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white">
                  Required Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockMilestone.deliverables.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Ready to submit?
                  </h3>
                  <p className="text-sm text-slate-400">
                    Ensure all deliverables are ready. Once submitted, the
                    client will review your work.
                  </p>
                </div>
                <Link
                  href={`/freelancer/vault/${vaultId}/milestones/${milestoneId}/submit`}
                >
                  <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold">
                    Submit Work
                    <Upload className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0D0D0E] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">
                    Due Date
                  </p>
                  <div className="flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>
                      {new Date(mockMilestone.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Work in Progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Channel */}
            <div className="h-[600px]">
              <EvidenceChannel
                vaultId={vaultId}
                milestoneId={milestoneId}
                role="freelancer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
