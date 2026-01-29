'use client';

import { useState } from 'react';
import { api } from '@/lib/mock-api';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvidencePanel } from '@/components/shared/EvidencePanel';
import { getEvidenceForMilestone, getMilestoneById, getVaultById } from '@/lib/mock';
import { MILESTONE_STATUS_LABELS } from '@/lib/rules/milestones';
import { Calendar, FileText, UploadCloud, ChevronLeft } from 'lucide-react';

export function MilestoneSubmitView({ vaultId, milestoneId, role }) {
    const vault = getVaultById(vaultId);
    const milestone = getMilestoneById(vaultId, milestoneId);
    const evidence = milestone ? getEvidenceForMilestone(milestone.id) : null;
    
    // State for submission
    const [notes, setNotes] = useState(milestone?.submission?.notes || '');
    const [files, setFiles] = useState(milestone?.submission?.files || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!vault || !milestone) {
        return <div className="text-white/70">Milestone not found.</div>;
    }

    const handleUpload = () => {
        // Mock upload action
        const newFile = {
            name: `mock_deliverable_${Date.now()}.zip`,
            size: `${(Math.random() * 10 + 1).toFixed(1)}MB`,
            tag: 'Deliverable',
            url: 'https://example.com/mock-file'
        };
        setFiles([...files, newFile]);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.milestones.submit(milestoneId, {
                notes,
                filesJson: files
            });
            // Reload to show updated status
            window.location.reload();
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit milestone: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = role === 'freelancer' && (files.length > 0 || notes.length > 5);
    const isSubmitted = milestone.status === 'SUBMITTED' || milestone.status === 'VERIFIED' || milestone.status === 'AWAITING_APPROVAL';

    return (
        <div className="space-y-8">
            <Link href={`/${role}/vault/${vaultId}`} className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
                Back to vault
            </Link>

            <header className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-400">Milestone Submission</div>
                <h1 className="text-3xl font-bold text-white">{milestone.title}</h1>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-white">
                    <span>Status: {MILESTONE_STATUS_LABELS[milestone.status] || milestone.status}</span>
                    <span>Due: {milestone.dueDate}</span>
                    <span>Vault: {vault.title}</span>
                </div>
            </header>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
                <div className="space-y-6">
                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Submission Package</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border border-dashed border-white/10 bg-black/40 p-6 text-center">
                                <UploadCloud className="w-8 h-8 text-emerald-500 mx-auto" />
                                <p className="mt-3 text-sm text-white/60">
                                    Upload deliverables tied to milestone requirements.
                                </p>
                                {role === 'freelancer' && !isSubmitted && (
                                    <Button 
                                        variant="outline" 
                                        className="mt-4 border-white/10 text-white/70 hover:text-white"
                                        onClick={handleUpload}
                                    >
                                        Upload Files (Mock)
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-white">Current files</p>
                                {files.length ? (
                                    files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between border border-white/5 bg-black/40 rounded-lg px-4 py-3">
                                            <div>
                                                <p className="text-sm text-white font-semibold">{file.name}</p>
                                                <p className="text-xs text-white">{file.size} · {file.tag}</p>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-white hover:text-white">
                                                View
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-white">No files uploaded yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Requirement Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(milestone.requirementItemsJson || []).map((req) => (
                                <div key={req.reqId} className="flex items-start gap-3 border border-white/5 bg-black/40 rounded-lg p-4">
                                    <FileText className="w-4 h-4 text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-white font-semibold">{req.reqId} · {req.label}</p>
                                        <p className="text-xs text-white">{req.required ? 'Mandatory' : 'Optional'}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111111] border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Submission Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white">
                                <Calendar className="w-4 h-4" />
                                Submitted {milestone.submission?.submittedAt ? new Date(milestone.submission.submittedAt).toLocaleDateString() : 'Not submitted'}
                            </div>
                            
                            {role === 'freelancer' && !isSubmitted ? (
                                <textarea
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white h-32"
                                    placeholder="Provide a structured summary..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            ) : (
                                <p className="text-sm text-white/60">
                                    {milestone.submission?.notes || notes || 'No notes provided.'}
                                </p>
                            )}

                            {role === 'freelancer' ? (
                                !isSubmitted ? (
                                    <Button 
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
                                        disabled={!canSubmit || isSubmitting}
                                        onClick={handleSubmit}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                                    </Button>
                                ) : (
                                    <Button disabled className="w-full border-white/10 text-white/70">
                                        Submitted
                                    </Button>
                                )
                            ) : (
                                <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white">
                                    Submission Received
                                </Button>
                            )}
                            <p className="text-xs text-white">
                                Submissions are reviewed against milestone requirements. No free-text disputes are accepted.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <EvidencePanel milestone={milestone} evidence={evidence} />
            </div>
        </div>
    );
}
