import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  Info,
  ShieldCheck,
  AlertCircle,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export interface EvidencePayload {
  question?: string;
  answer?: string;
  askedBy?: string;
  askedByUserId?: string;
  answeredBy?: string;
  answeredByUserId?: string;
  fileName?: string;
  comment?: string;
  author?: string;
  authorId?: string;
  requirementRef?: string;
}

export interface EvidenceItemData {
  id: string;
  type: "CLARIFICATION_REQUEST" | "FILE_COMMENT";
  payloadJson?: EvidencePayload;
  createdAt: string | Date;
}

export interface MilestoneVerification {
  result?: "FAIL" | "FLAGGED" | "PASS";
}

export interface VaultData {
  title: string;
  verification?: MilestoneVerification;
}

export interface EvidencePanelProps {
  vault?: VaultData | null;
  evidence?: EvidenceItemData[];
}

function cx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(date: string | Date) {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/3">
          <Icon className="h-4 w-4 text-emerald-300" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-normal text-white">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-white/50 font-bold uppercase tracking-normal">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[11px] font-medium text-white/60">
      {children}
    </span>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30">
          <Info className="h-4 w-4 text-white/60" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-normal text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-white/55 font-bold uppercase tracking-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface EvidenceItemProps {
  topLeft: React.ReactNode;
  topRight?: React.ReactNode;
  title?: string;
  body?: string;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
}

function EvidenceItem({
  topLeft,
  topRight,
  title,
  body,
  metaLeft,
  metaRight,
}: EvidenceItemProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-white/15 hover:bg-white/3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {topLeft}
            {topRight ? <div className="ml-auto">{topRight}</div> : null}
          </div>
          {title ? (
            <p className="mt-2 text-[15px] font-bold uppercase tracking-normal leading-snug text-white">
              {title}
            </p>
          ) : null}
          {body ? (
            <p className="mt-2 text-sm leading-relaxed text-white/60 font-bold uppercase tracking-normal">
              {body}
            </p>
          ) : null}

          {metaLeft || metaRight ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {metaLeft ? <MetaPill>{metaLeft}</MetaPill> : null}
              {metaRight ? <MetaPill>{metaRight}</MetaPill> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EvidencePanel({ vault, evidence }: EvidencePanelProps) {
  const clarifications = useMemo(
    () =>
      (Array.isArray(evidence) ? evidence : []).filter(
        (e) => e.type === "CLARIFICATION_REQUEST",
      ),
    [evidence],
  );

  const fileComments = useMemo(
    () =>
      (Array.isArray(evidence) ? evidence : []).filter(
        (e) => e.type === "FILE_COMMENT",
      ),
    [evidence],
  );

  if (!vault) {
    return (
      <Card className="border-white/10 bg-[#0B0B0C]">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">
            Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <EmptyState
            title="Select a vault"
            description="Choose a vault to view structured clarifications and file comments tied to it."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[#0B0B0C]">
      <CardHeader className="border-b border-white/5">
        <div className="space-y-1">
          <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">
            Evidence
          </CardTitle>
          <p className="text-sm text-white/60 font-bold uppercase tracking-normal mb-3">
            {vault.title}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 p-5">
        {/* AI Audit Result */}
        <div
          className={cx(
            "rounded-2xl border p-4 flex items-start gap-4 transition-all",
            vault.verification?.result === "FAIL"
              ? "bg-red-500/10 border-red-500/20"
              : vault.verification?.result === "FLAGGED"
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20",
          )}
        >
          <div
            className={cx(
              "mt-1 flex h-10 w-10 items-center justify-center rounded-xl border",
              vault.verification?.result === "FAIL"
                ? "bg-red-500/20 border-red-500/30"
                : vault.verification?.result === "FLAGGED"
                  ? "bg-amber-500/20 border-amber-500/30"
                  : "bg-emerald-500/20 border-emerald-500/30",
            )}
          >
            {vault.verification?.result === "FAIL" ? (
              <AlertCircle className="h-5 w-5 text-red-400" />
            ) : vault.verification?.result === "FLAGGED" ? (
              <AlertCircle className="h-5 w-5 text-amber-400" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1">
                <Cpu className="h-3 w-3" /> AI Verification Engine
              </span>
              <span
                className={cx(
                  "ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  vault.verification?.result === "FAIL"
                    ? "bg-red-500 text-white"
                    : vault.verification?.result === "FLAGGED"
                      ? "bg-amber-500 text-black"
                      : "bg-emerald-500 text-black",
                )}
              >
                {vault.verification?.result || "PASS"}
              </span>
            </div>
            <p className="text-sm font-bold text-white mb-1">
              {vault.verification?.result === "FAIL"
                ? "Compliance Check Failed"
                : vault.verification?.result === "FLAGGED"
                  ? "Manual Review Recommended"
                  : "Automated Compliance Passed"}
            </p>
            <p className="text-xs text-white/60 leading-relaxed font-bold uppercase tracking-normal">
              {vault.verification?.result === "FAIL"
                ? "Critical discrepancies found in submitted deliverables vs contract requirements."
                : vault.verification?.result === "FLAGGED"
                  ? "Metadata anomalies detected. Verification requires human oversight."
                  : "Deliverables verified against contract metadata. No anomalies detected in secure verification proof."}
            </p>
          </div>
        </div>

        {/* Clarifications */}
        <section className="space-y-4">
          <SectionHeader
            icon={MessageSquare}
            title="Structured clarifications"
            subtitle="Q&A trail linked to this vault."
          />

          {clarifications.length === 0 ? (
            <EmptyState
              title="No clarifications yet"
              description="When parties ask and answer vault questions, they’ll show up here."
            />
          ) : (
            <div className="space-y-3">
              {clarifications.map((item) => (
                <EvidenceItem
                  key={item.id}
                  topLeft={
                    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                      Clarification
                    </span>
                  }
                  title={item.payloadJson?.question}
                  body={item.payloadJson?.answer}
                  metaLeft={`${item.payloadJson?.askedByUserId || item.payloadJson?.askedBy} → ${item.payloadJson?.answeredByUserId || item.payloadJson?.answeredBy}`}
                  metaRight={formatDate(item.createdAt)}
                />
              ))}
            </div>
          )}
        </section>

        {/* File Comments */}
        <section className="space-y-4">
          <SectionHeader
            icon={FileText}
            title="File comments"
            subtitle="Notes linked to uploaded files and requirements."
          />

          {fileComments.length === 0 ? (
            <EmptyState
              title="No file comments yet"
              description="Once reviewers leave notes on specific files, they’ll appear here."
            />
          ) : (
            <div className="space-y-3">
              {fileComments.map((item) => (
                <EvidenceItem
                  key={item.id}
                  topLeft={
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                      {item.payloadJson?.fileName}
                    </span>
                  }
                  topRight={
                    item.payloadJson?.requirementRef ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                        {item.payloadJson?.requirementRef}
                      </span>
                    ) : null
                  }
                  body={item.payloadJson?.comment}
                  metaLeft={
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      {item.payloadJson?.authorId || item.payloadJson?.author}
                    </span>
                  }
                  metaRight={formatDate(item.createdAt)}
                />
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
