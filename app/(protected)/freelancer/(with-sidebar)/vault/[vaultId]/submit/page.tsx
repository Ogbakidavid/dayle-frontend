"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  File as FileIcon,
  X,
  CheckSquare,
  Square,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { DotLoader } from "@/components/ui/dot-loader";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SubmissionType } from "@/lib/domain/enums";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DeliverableStatus {
  deliverableId: string;
  deliverableTitle: string;
  submissionType: SubmissionType;
  included: boolean;
  notes: string;
  files: File[];
  link: string;
}


export default function SubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;

  const [vault, setVault] = useState<any>(null);
  const [deliverableStatuses, setDeliverableStatuses] = useState<
    DeliverableStatus[]
  >([]);
  const [overallNotes, setOverallNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadVault() {
      try {
        const data = await api.vaults.getById(vaultId);
        setVault(data);
        if (data.deliverables) {
          setDeliverableStatuses(
            data.deliverables.map((d: any) => ({
              deliverableId: d.id,
              deliverableTitle: d.title,
              submissionType: d.submissionType as SubmissionType,
              included: false,
              notes: "",
              files: [],
              link: "",
            })),
          );
        }

      } catch (err) {
        console.error("Failed to load vault:", err);
        toast.error("Failed to load vault details");
      }
    }
    loadVault();
  }, [vaultId]);

  const toggleDeliverable = (index: number) => {
    setDeliverableStatuses((prev) =>
      prev.map((d, i) => (i === index ? { ...d, included: !d.included } : d)),
    );
  };

  const updateDeliverableNotes = (index: number, notes: string) => {
    setDeliverableStatuses((prev) =>
      prev.map((d, i) => (i === index ? { ...d, notes } : d)),
    );
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDeliverableStatuses((prev) =>
        prev.map((d, i) =>
          i === index ? { ...d, files: [...d.files, ...newFiles] } : d,
        ),
      );
    }
  };

  const updateDeliverableLink = (index: number, link: string) => {
    setDeliverableStatuses((prev) =>
      prev.map((d, i) => (i === index ? { ...d, link } : d)),
    );
  };

  const removeFile = (delIndex: number, fileIndex: number) => {

    setDeliverableStatuses((prev) =>
      prev.map((d, i) =>
        i === delIndex
          ? { ...d, files: d.files.filter((_, fIdx) => fIdx !== fileIndex) }
          : d,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const includedDeliverables = deliverableStatuses.filter((d) => d.included);
    if (includedDeliverables.length === 0) {
      toast.error("Please select at least one deliverable to include");
      return;
    }

    if (!overallNotes.trim()) {
      toast.error("Please provide general notes about this submission");
      return;
    }

    // Validation for mandatory attachments and per-deliverable notes
    for (const d of includedDeliverables) {
      const needsFile = d.submissionType === SubmissionType.FILE || d.submissionType === SubmissionType.BOTH;
      const needsLink = d.submissionType === SubmissionType.LINK || d.submissionType === SubmissionType.BOTH;

      if (needsFile && d.files.length === 0) {
        toast.error(`File attachment is mandatory for: ${d.deliverableTitle}`);
        return;
      }
      if (needsLink && !d.link.trim()) {
        toast.error(`A link/URL is mandatory for: ${d.deliverableTitle}`);
        return;
      }
      if (!d.notes.trim()) {
        toast.error(`Notes are mandatory for: ${d.deliverableTitle}`);
        return;
      }
    }


    setIsSubmitting(true);
    try {
      // 1. Upload all files to S3
      const updatedDeliverableStatus = await Promise.all(
        deliverableStatuses.map(async (d) => {
          if (!d.included || d.files.length === 0) {
            return {
              deliverableId: d.deliverableId,
              included: d.included,
              notes: d.notes,
              files: [],
              link: d.link,
            };
          }

          // Upload each file and get its key
          const uploadedFiles = await Promise.all(
            d.files.map(async (file) => {
              // a. Request presigned URL
              const { url, key } = await api.uploads.getPresignedUrl({
                fileName: file.name,
                fileType: file.type || 'application/octet-stream',
                fileSize: file.size,
                purpose: 'deliverable',
              });

              // b. PUT file to S3
              const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                  'Content-Type': file.type || 'application/octet-stream',
                },
              });

              if (!uploadResponse.ok) {
                throw new Error(`Failed to upload ${file.name}`);
              }

              return {
                filename: file.name,
                url: url.split('?')[0], // Base S3 URL (though we use keys for downloads)
                key: key,
                size: file.size,
                type: file.type,
              };
            })
          );

          return {
            deliverableId: d.deliverableId,
            included: d.included,
            notes: d.notes,
            files: uploadedFiles,
            link: d.link,
          };
        })
      );

      // 2. Submit to backend with S3 keys
      await api.vaults.submit(vaultId, {
        comments: overallNotes,
        deliverableStatus: updatedDeliverableStatus,
        idempotencyKey: crypto.randomUUID(),
      });

      toast.success("Work submitted successfully");
      router.replace(`/freelancer/vault/${vaultId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit work");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DotLoader size="lg" />
      </div>
    );
  }


  return (
    <div className="min-h-screen text-slate-600 selection:bg-emerald-500/30 pb-20 font-primary">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-all mb-8 font-bold tracking-tight bg-white border border-slate-200 py-2.5 px-5 rounded-xl cursor-pointer group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to project
          </button>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tighter leading-none mb-3">
            Submit work
          </h1>
          <p className="md:text-lg text-slate-600 font-medium">
            Detailed delivery checklist for your client.
          </p>
        </header>


        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <Label className="text-sm font-bold text-emerald-600 block mb-2 uppercase tracking-wider">
              Mark which deliverables are included in this submission
            </Label>

            <div className="grid grid-cols-1 gap-6">
              {deliverableStatuses.map((item, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "bg-white border transition-all duration-300 overflow-hidden shadow-sm",
                    item.included
                      ? "border-emerald-500/30 ring-1 ring-emerald-500/10 bg-emerald-50/30"
                      : "border-slate-200",
                  )}
                >
                  <CardContent className="p-0">

                    <div
                      onClick={() => toggleDeliverable(idx)}
                      className={cn(
                        "p-6 flex items-center gap-4 cursor-pointer transition-colors",
                        item.included ? "bg-emerald-50/50" : "hover:bg-slate-50",
                      )}
                    >
                      {item.included ? (
                        <CheckSquare className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Square className="w-6 h-6 text-slate-200" />
                      )}
                      <span
                        className={cn(
                          "text-base font-bold tracking-tight transition-colors",
                          item.included ? "text-slate-900" : "text-slate-600",
                        )}
                      >
                        {item.deliverableTitle}
                      </span>
                      <div className="ml-auto flex gap-2">
                        {item.submissionType === SubmissionType.FILE && (
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">File Required</Badge>
                        )}
                        {item.submissionType === SubmissionType.LINK && (
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">Link Required</Badge>
                        )}
                        {item.submissionType === SubmissionType.BOTH && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-100">File & Link Required</Badge>
                        )}
                      </div>
                    </div>



                    {item.included && (
                      <div className="p-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Notes about this deliverable (required)
                          </Label>
                          <Textarea
                            placeholder="Briefly describe what's included for this specific goal..."
                            className="bg-slate-50 border-slate-200 text-slate-900 min-h-[100px] rounded-xl p-4 focus:ring-emerald-500/20 focus:border-emerald-500/30 placeholder:text-slate-300 font-medium text-sm transition-all"
                            value={item.notes}
                            onChange={(e) =>
                              updateDeliverableNotes(idx, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>


                        <div className="space-y-3">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Deliverable assets ({
                              item.submissionType === SubmissionType.FILE ? "File" : 
                              item.submissionType === SubmissionType.LINK ? "Link" : 
                              "File and Link"
                            })
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* File Dropzone if needed */}
                            {(item.submissionType === SubmissionType.FILE || item.submissionType === SubmissionType.BOTH) && (
                              <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 hover:bg-emerald-50/50 hover:border-emerald-500/20 transition-all text-center cursor-pointer group">
                                <input
                                  type="file"
                                  multiple
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  onChange={(e) => handleFileChange(idx, e)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                  <p className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                                    Attach assets
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Link/URL Input if needed */}
                            {(item.submissionType === SubmissionType.LINK || item.submissionType === SubmissionType.BOTH) && (
                              <div className="relative border border-slate-200 rounded-xl p-4 bg-white hover:border-emerald-500/20 transition-all group">
                                <div className="flex items-center gap-3">
                                  <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                  <Input
                                    placeholder="Enter submission URL/link (e.g. GitHub, Dropbox, Vercel)"
                                    className="bg-transparent! border-none! h-8 p-0 text-slate-900 text-sm font-medium focus:ring-0! shadow-none"
                                    value={item.link}
                                    onChange={(e) => updateDeliverableLink(idx, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            )}

                            {item.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group shadow-sm"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Paperclip className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <p className="text-sm font-bold text-slate-700 truncate">
                                    {file.name}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx, fIdx);
                                  }}
                                  className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <Label className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                General notes about this submission (required)
              </Label>
              <Textarea
                placeholder="Overall summary of the work provided in this update..."
                className="bg-slate-50 border-slate-200 text-slate-900 min-h-[140px] rounded-2xl p-6 focus:ring-emerald-500/20 focus:border-emerald-500/30 placeholder:text-slate-600 font-medium text-sm leading-relaxed transition-all"
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
              />
            </CardContent>
          </Card>


          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-xs font-bold tracking-tight">
                Secured delivery system active
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none h-14 px-8 font-bold text-slate-600 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-14 px-12 bg-emerald-600 text-white hover:bg-emerald-500 font-bold tracking-tight text-sm rounded-2xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <DotLoader size="sm" color="white" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Finalize delivery"
                )}
              </Button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
