"use client";

import * as React from "react";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormPersistence } from "@/lib/hooks/use-form-persistence";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LogoLoader } from "@/components/ui/logo-loader";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gavel,
  Upload,
  X,
  ShieldCheck,
  Shapes,
  FileSearch,
  History,
} from "lucide-react";
import { getDisputeEligibility } from "@/lib/rules/disputes";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import type { Vault } from "@/lib/store/vault-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg"];

function formatBytes(bytes: number) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export interface CreateDisputeFormProps {
  role: "client" | "freelancer";
  initialVaultId?: string;
}

export function CreateDisputeForm({ role, initialVaultId }: CreateDisputeFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData, clearPersistence] = useFormPersistence("create_dispute_form", {
    selectedVaultId: initialVaultId || "",
    selectedDeliverableTitle: "",
    selectedReasonCode: "",
    description: "",
  });

  const { selectedVaultId, selectedDeliverableTitle, selectedReasonCode, description } = formData;

  const setSelectedVaultId = (val: string) => setFormData(prev => ({ ...prev, selectedVaultId: val }));
  const setSelectedDeliverableTitle = (val: string) => setFormData(prev => ({ ...prev, selectedDeliverableTitle: val }));
  const setSelectedReasonCode = (val: string) => setFormData(prev => ({ ...prev, selectedReasonCode: val }));
  const setDescription = (val: string) => setFormData(prev => ({ ...prev, description: val }));

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [availableVaults, setAvailableVaults] = useState<Vault[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const v = await api.vaults.list();
        setAvailableVaults(v);
        // Artificial delay for premium feel & data settling
        setTimeout(() => setIsPageLoading(false), 1200);
      } catch (e) {
        console.error("Failed to load vaults", e);
        setIsPageLoading(false);
      }
    }
    load();
  }, []);

  const selectedVault = useMemo(() => availableVaults.find((v) => v.id === selectedVaultId) || null, [selectedVaultId, availableVaults]);
  const eligibility = useMemo(() => getDisputeEligibility(selectedVault, selectedDeliverableTitle), [selectedVault, selectedDeliverableTitle]);
  const requiresDeliverableRef = useMemo(() => {
    if (!selectedReasonCode || !eligibility?.allowedCodes) return false;
    const codeDef = eligibility.allowedCodes.find((c) => c.code === selectedReasonCode);
    return Boolean(codeDef?.requiresDeliverableRef);
  }, [selectedReasonCode, eligibility]);

  const validateAndAddFiles = useCallback((incoming: File[]) => {
    setFileError("");
    const next: File[] = [];
    for (const f of incoming) {
      if (!ACCEPTED_MIME.includes(f.type)) {
        setFileError("Keep it standard: PDF, PNG, or JPG only.");
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setFileError(`File is too heavy. Max ${MAX_FILE_MB}MB.`);
        continue;
      }
      next.push(f);
    }
    if (next.length) {
      setFiles((prev) => [...prev, ...next]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaultId || !eligibility?.eligible || !selectedReasonCode || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const uploadedEvidence = await Promise.all(
        files.map(async (file) => {
          const { url, key } = await api.uploads.getPresignedUrl({
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            purpose: "EVIDENCE",
          });
          const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
          if (!res.ok) throw new Error("Upload failed");
          return { filename: file.name, key, size: file.size, type: file.type };
        })
      );

      await api.disputes.create({
        vaultId: selectedVaultId,
        deliverableTitle: selectedDeliverableTitle || undefined,
        disputeType: selectedReasonCode as any,
        reasonCode: selectedReasonCode,
        description,
        evidence: uploadedEvidence,
      });

      clearPersistence();
      router.push(`/${role}/disputes`);
      router.refresh();
    } catch (err) {
      setFormError("We couldn't submit your case. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Done = Boolean(selectedVaultId);
  const isEligible = Boolean(eligibility?.eligible);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-emerald-950 rounded-4xl p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <Shapes className="w-full h-full text-white" strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white/60 hover:text-white hover:bg-white/10 mb-4 h-8 px-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Start Resolution</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Report an <span className="text-emerald-400">Issue.</span>
          </h1>
          <p className="text-sm md:text-base text-emerald-100/80 font-medium max-w-lg">
            Let's resolve this fairly. First, you'll enter mutual negotiation. If you can't agree, our expert arbiters will step in.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {isPageLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-4xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
            <LogoLoader size="lg" />
          </div>
        ) : (
          <>
            {/* Step 1: Project Scope */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">1</div>
                 <h2 className="text-xl font-bold text-slate-900">Select Project</h2>
              </div>
              
              <Card className="border-slate-200 rounded-4xl shadow-sm overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Vault</Label>
                    <Select value={selectedVaultId} onValueChange={setSelectedVaultId}>
                      <SelectTrigger className="h-14 border-slate-100 bg-slate-50/50 rounded-2xl text-base font-bold text-slate-900">
                        <SelectValue placeholder="Choose the affected project..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100">
                        {availableVaults.map((v) => (
                          <SelectItem key={v.id} value={v.id} className="rounded-xl py-3 font-bold">
                            {v.title} <span className="text-slate-400 ml-2 font-medium">#{v.id.slice(0, 8)}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedVault && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <Gavel className="w-6 h-6 text-emerald-600" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-emerald-900">Vault Details</p>
                          <p className="text-xs text-emerald-900/60 font-medium">
                            Standard Escrow • {selectedVault.balance ? `${selectedVault.balance} USD balance` : 'No funds yet'}
                          </p>
                       </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Step 2: Details & Evidence */}
            <AnimatePresence>
              {isStep1Done && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">2</div>
                     <h2 className="text-xl font-bold text-slate-900">Case Details</h2>
                  </div>

                  <Card className="border-slate-200 rounded-4xl shadow-sm overflow-hidden">
                    <CardContent className="p-8 space-y-8">
                      {/* Eligibility Alert */}
                      {!isEligible ? (
                        <div className="p-6 rounded-3xl bg-red-50 border border-red-100 flex items-start gap-4 text-red-900">
                           <AlertCircle className="w-6 h-6 shrink-0" />
                           <div className="space-y-1">
                              <p className="font-bold">Cannot Open Dispute</p>
                              <p className="text-sm opacity-70 font-medium">{eligibility?.reason || "This vault isn't eligible."}</p>
                           </div>
                        </div>
                      ) : (
                        <>
                          {/* Reason Selection */}
                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">What went wrong?</Label>
                            <div className="grid gap-3">
                              {eligibility?.allowedCodes?.map((code) => (
                                <label key={code.code} className={cn(
                                  "flex items-center gap-4 p-5 rounded-3xl border transition-all cursor-pointer",
                                  selectedReasonCode === code.code ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/5" : "bg-white border-slate-100 hover:border-slate-200"
                                )}>
                                  <input type="radio" className="hidden" value={code.code} checked={selectedReasonCode === code.code} onChange={(e) => setSelectedReasonCode(e.target.value)} />
                                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", selectedReasonCode === code.code ? "border-emerald-500" : "border-slate-200")}>
                                    {selectedReasonCode === code.code && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-black text-slate-900">{code.label}</p>
                                    <p className="text-xs text-slate-500 font-medium">{code.description}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-4">
                             <div className="flex justify-between items-end">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Describe the Issue</Label>
                                <span className="text-[10px] text-slate-400 font-bold">{description.length}/600</span>
                             </div>
                             <Textarea 
                               value={description}
                               onChange={(e) => setDescription(e.target.value.slice(0, 600))}
                               placeholder="Facts, dates, and clear expectations. Avoid technical jargon or emotions."
                               className="min-h-[160px] rounded-3xl border-slate-100 bg-slate-50/50 p-6 font-bold text-slate-900 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-base"
                             />
                          </div>

                          {/* Evidence Upload */}
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attach Evidence</Label>
                             <div 
                               onClick={() => inputRef.current?.click()}
                               onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                               onDragLeave={() => setIsDragging(false)}
                               onDrop={(e) => { e.preventDefault(); setIsDragging(false); validateAndAddFiles(Array.from(e.dataTransfer.files)); }}
                               className={cn(
                                 "border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer",
                                 isDragging ? "bg-emerald-50 border-emerald-500" : "bg-slate-50/30 border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                               )}
                             >
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                                   <Upload className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="font-bold text-slate-900">Drop files here or click to upload</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">PDF, PNG, JPG • Max 10MB each</p>
                             </div>
                             <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => validateAndAddFiles(Array.from(e.target.files || []))} />

                             {files.length > 0 && (
                               <div className="space-y-2 pt-4">
                                 {files.map((f, i) => (
                                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                      <div className="flex items-center gap-3">
                                         <FileText className="w-5 h-5 text-emerald-500" />
                                         <div>
                                            <p className="text-sm font-bold text-slate-900">{f.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{formatBytes(f.size)}</p>
                                         </div>
                                      </div>
                                      <Button onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)) }} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg">
                                         <X className="w-4 h-4" />
                                      </Button>
                                   </motion.div>
                                 ))}
                               </div>
                             )}
                             {fileError && <p className="text-xs text-red-500 font-bold ml-2">{fileError}</p>}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Submit Area */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 px-4">
                     <div className="flex items-center gap-4 text-slate-400 flex-1">
                        <History className="w-5 h-5" />
                        <p className="text-sm font-medium leading-relaxed">
                          Cases are usually reviewed within **24-48 hours**. Once submitted, this action cannot be undone.
                        </p>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:text-slate-900" onClick={() => router.back()}>Cancel</Button>
                        <Button 
                          type="submit" 
                          disabled={!selectedReasonCode || !description.trim() || isSubmitting}
                          className="h-14 px-10 rounded-2xl bg-emerald-600 text-white font-black uppercase text-sm tracking-wider shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 flex-1 md:flex-none"
                        >
                          {isSubmitting ? "Submitting Case..." : "Open Dispute"}
                        </Button>
                     </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </form>

      {/* Trust Signpost */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-12 flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">Your funds are safe.</h4>
            <p className="text-xs text-slate-500 font-medium max-w-xs">
              While a dispute is active, the vault balance remains locked in escrow. No one can move the funds until a resolution is reached.
            </p>
          </div>
      </motion.div>
    </div>
  );
}
