"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, File as FileIcon, X } from "lucide-react";
import { DotLoader } from "@/components/ui/dot-loader";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";

export default function SubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const vaultId = params.vaultId as string;
  const milestoneId = params.milestoneId as string;

  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.milestones.submit(milestoneId, {
        files: files.map((f) => ({ name: f.name, size: f.size })), // Mock file upload
        comments: comment,
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

  return (
    <div className="min-h-screen text-gray-400 selection:bg-emerald-500/30 pb-20 font-['Poppins',sans-serif]">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <header className="pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-white/40 hover:text-white transition-all mb-8 font-black uppercase tracking-[0.2em] bg-white/2 border border-white/5 py-2 px-4 rounded-xl cursor-pointer group shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Vault
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
            Submit Work
          </h1>
          <p className="text-[10px] md:text-xs text-white/40 font-black uppercase tracking-[0.2em]">
            Upload deliverables and provide comments for the client.
          </p>
        </header>

        <Card className="bg-[#0D0D0E] border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/2 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <CardContent className="pt-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4 block italic">
                  Upload Deliverables
                </Label>
                <div className="border-2 border-dashed border-white/5 rounded-2xl p-10 hover:bg-white/2 hover:border-emerald-500/20 transition-all text-center cursor-pointer relative group shadow-inner">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <div className="relative z-0">
                    <div className="w-16 h-16 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all">
                      <Upload className="w-8 h-8 text-white/20 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">
                      Drop files here or click to upload
                    </p>
                    <p className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-widest italic">
                      Supported: PDF, ZIP, PNG, JPG (Max 50MB)
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    {files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 group hover:border-white/10 transition-all animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                            <FileIcon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                              {file.name}
                            </p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="comment"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2 block italic"
                >
                  Developer Notes (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Add any notes about your submission..."
                  className="bg-black/30 border-white/5 text-white min-h-[160px] rounded-2xl p-6 focus:ring-emerald-500/30 focus:border-emerald-500/30 placeholder:text-white/10 font-bold text-xs leading-relaxed transition-all shadow-inner"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => router.back()}
                  className="h-12 px-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-10 bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-[0.15em] text-xs rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <DotLoader size="sm" className="mr-2" />
                      Encrypting & Submitting...
                    </>
                  ) : (
                    "Finalize Submission"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
