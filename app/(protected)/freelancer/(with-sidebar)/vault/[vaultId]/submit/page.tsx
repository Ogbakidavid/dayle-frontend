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

interface DeliverableStatus {
  deliverableId: string;
  deliverableTitle: string;
  included: boolean;
  notes: string;
  files: File[];
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
              included: false,
              notes: "",
              files: [],
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

    setIsSubmitting(true);
    try {
      await api.vaults.submit(vaultId, {
        comments: overallNotes,
        deliverableStatus: deliverableStatuses.map((d) => ({
          deliverableId: d.deliverableId,
          included: d.included,
          notes: d.notes,
          files: d.files.map((f) => ({ name: f.name, size: f.size })), // Mock file upload
        })),
        idempotencyKey: crypto.randomUUID(),
      });
      toast.success("Work submitted successfully");
      router.replace(`/freelancer/vault/${vaultId}`);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit work");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vault) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0E]">
        <DotLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-slate-900 hover:text-white transition-all mb-8 font-bold tracking-[0.2em] bg-white/2 border border-white/5 py-2 px-4 rounded-xl cursor-pointer group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to project
          </button>
          <h1 className="text-3xl md:text-5xl font-bold text-white  tracking-tighter leading-none mb-3">
            Submit work
          </h1>
          <p className="text-[10px] md:text-xs text-slate-900 font-bold tracking-[0.2em]">
            Detailed delivery checklist for your client.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <Label className="text-[12px] font-bold tracking-[0.2em] text-emerald-500 block  mb-2">
              Mark which deliverables are included in this submission
            </Label>

            <div className="grid grid-cols-1 gap-6">
              {deliverableStatuses.map((item, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "bg-[#0D0D0E] border transition-all duration-300 overflow-hidden",
                    item.included
                      ? "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                      : "border-white/5 opacity-60",
                  )}
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => toggleDeliverable(idx)}
                      className={cn(
                        "p-6 flex items-center gap-4 cursor-pointer transition-colors",
                        item.included ? "bg-emerald-500/5" : "hover:bg-white/2",
                      )}
                    >
                      {item.included ? (
                        <CheckSquare className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <Square className="w-6 h-6 text-white/10" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-bold tracking-widest ",
                          item.included ? "text-white" : "text-white/20",
                        )}
                      >
                        {item.deliverableTitle}
                      </span>
                    </div>

                    {item.included && (
                      <div className="p-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold tracking-widest text-slate-900">
                            Notes about this deliverable (optional)
                          </Label>
                          <Textarea
                            placeholder="Briefly describe what's included for this specific goal..."
                            className="bg-black/30 border-white/5 text-white min-h-[100px] rounded-xl p-4 focus:ring-emerald-500/30 focus:border-emerald-500/30 placeholder:text-white/10 font-bold text-xs"
                            value={item.notes}
                            onChange={(e) =>
                              updateDeliverableNotes(idx, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold tracking-widest text-slate-900">
                            Deliverable files (optional)
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative border-2 border-dashed border-white/5 rounded-xl p-6 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all text-center cursor-pointer group">
                              <input
                                type="file"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleFileChange(idx, e)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-[9px] font-bold text-slate-900 tracking-widest">
                                  Attach assets
                                </p>
                              </div>
                            </div>

                            {item.files.map((file, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Paperclip className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <p className="text-[10px] font-bold text-white truncate">
                                    {file.name}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(idx, fIdx);
                                  }}
                                  className="text-white/20 hover:text-red-500 p-1"
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

          <Card className="bg-[#0A0A0B] border-white/5 shadow-2xl relative overflow-hidden">
            <CardContent className="p-8 space-y-4">
              <Label className="text-[10px] font-bold tracking-[0.2em] text-white/60 block ">
                General notes about this submission
              </Label>
              <Textarea
                placeholder="Overall summary of the work provided in this update..."
                className="bg-black/30 border-white/5 text-white min-h-[140px] rounded-2xl p-6 focus:ring-emerald-500/30 focus:border-emerald-500/30 placeholder:text-white/10 font-bold text-xs leading-relaxed"
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 opacity-40">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] font-bold tracking-widest ">
                Secured delivery system active
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none h-14 px-8 text-[10px] font-bold tracking-widest text-slate-900 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-14 px-12 bg-emerald-500 text-black hover:bg-emerald-400 font-bold tracking-[0.15em] text-xs rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <DotLoader size="sm" />
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
