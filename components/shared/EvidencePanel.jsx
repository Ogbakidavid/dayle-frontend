import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, CheckCircle2, Info } from "lucide-react";

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function formatDate(date) {
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

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Icon className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-normal text-white">{title}</p>
                    {subtitle ? (
                        <p className="mt-0.5 text-xs text-white/50 font-bold uppercase tracking-normal">{subtitle}</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MetaPill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/60">
            {children}
        </span>
    );
}

function EmptyState({ title, description }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                    <Info className="h-4 w-4 text-white/60" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-normal text-white">{title}</p>
                    <p className="mt-1 text-sm text-white/55 font-bold uppercase tracking-normal">{description}</p>
                </div>
            </div>
        </div>
    );
}

function EvidenceItem({ topLeft, topRight, title, body, metaLeft, metaRight }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 transition-colors hover:border-white/15 hover:bg-white/[0.03]">
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

                    {(metaLeft || metaRight) ? (
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

export function EvidencePanel({ milestone, evidence }) {
    const clarifications = useMemo(() => evidence?.clarifications || [], [evidence]);
    const fileComments = useMemo(() => evidence?.fileComments || [], [evidence]);

    if (!milestone) {
        return (
            <Card className="border-white/10 bg-[#0B0B0C]">
                <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">Evidence</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <EmptyState
                        title="Select a milestone"
                        description="Choose a milestone to view structured clarifications and file comments tied to it."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-white/10 bg-[#0B0B0C]">
            <CardHeader className="border-b border-white/5">
                <div className="space-y-1">
                    <CardTitle className="text-white text-lg font-bold uppercase tracking-normal">Evidence</CardTitle>
                    <p className="text-sm text-white/60 font-bold uppercase tracking-normal mb-3">{milestone.title}</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-8 p-5">
                {/* Clarifications */}
                <section className="space-y-4">
                    <SectionHeader
                        icon={MessageSquare}
                        title="Structured clarifications"
                        subtitle="Q&A trail linked to this milestone."
                    />

                    {clarifications.length === 0 ? (
                        <EmptyState
                            title="No clarifications yet"
                            description="When parties ask and answer milestone questions, they’ll show up here."
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
                                    title={item.question}
                                    body={item.answer}
                                    metaLeft={`${item.askedBy} → ${item.answeredBy}`}
                                    metaRight={formatDate(item.answeredAt)}
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
                                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-white/70">
                                            {item.fileName}
                                        </span>
                                    }
                                    topRight={
                                        item.requirementId ? (
                                            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                {item.requirementId}
                                            </span>
                                        ) : null
                                    }
                                    body={item.comment}
                                    metaLeft={
                                        <span className="inline-flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                                            {item.author}
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
