import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, CheckCircle } from 'lucide-react';

export function EvidencePanel({ milestone, evidence }) {
    if (!milestone) {
        return (
            <Card className="bg-[#111111] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Evidence Panel</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/60">
                    Select a milestone to view structured clarifications and file comments.
                </CardContent>
            </Card>
        );
    }

    const clarifications = evidence?.clarifications || [];
    const fileComments = evidence?.fileComments || [];

    return (
        <Card className="bg-[#111111] border-white/10">
            <CardHeader>
                <div className="space-y-1">
                    <CardTitle className="text-white">Evidence Panel</CardTitle>
                    <p className="text-xs font-bold uppercase tracking-wide text-white">
                        {milestone.title}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        Structured Clarifications
                    </div>
                    {clarifications.length === 0 ? (
                        <p className="text-sm text-white">No clarifications logged for this milestone.</p>
                    ) : (
                        <div className="space-y-3">
                            {clarifications.map((item) => (
                                <div key={item.id} className="rounded-lg border border-white/5 p-4 bg-black/30">
                                    <p className="text-sm text-white font-semibold">{item.question}</p>
                                    <p className="text-sm text-white/60 mt-2">{item.answer}</p>
                                    <div className="mt-3 text-sm font-bold uppercase tracking-wide text-white/30">
                                        {item.askedBy} to {item.answeredBy} · {new Date(item.answeredAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/60">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        File Comments
                    </div>
                    {fileComments.length === 0 ? (
                        <p className="text-sm text-white">No file comments for this milestone yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {fileComments.map((item) => (
                                <div key={item.id} className="rounded-lg border border-white/5 p-4 bg-black/30">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-white">{item.fileName}</p>
                                        <span className="text-sm font-bold uppercase tracking-wide text-emerald-400">
                                            {item.requirementId}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/60 mt-2">{item.comment}</p>
                                    <div className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/30">
                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                        {item.author} · {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
