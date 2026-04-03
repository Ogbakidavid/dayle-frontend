"use client";

import * as React from "react";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormPersistence } from "@/lib/hooks/use-form-persistence";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Gavel,
  Upload,
  X,
  Info,
} from "lucide-react";

import { getDisputeEligibility } from "@/lib/rules/disputes";
import { api } from "@/lib/api-client";
import { useUser } from "@/lib/store/user-context";
import { KycStatus } from "@/lib/domain/enums";
import type { Vault } from "@/lib/store/vault-context";

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg"];

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatBytes(bytes: number) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

interface StepHeaderProps {
  step: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

function StepHeader({ step, title, subtitle, right }: StepHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-600">{step}</span>
        </div>
        <div className="space-y-0.5">
          <div className="text-base font-bold text-slate-900">{title}</div>
          {subtitle ? (
            <div className="text-sm font-bold text-slate-500">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {right ? <div className="pt-0.5">{right}</div> : null}
    </div>
  );
}

interface StatusBannerProps {
  eligible: boolean;
  title: string;
  description: string;
}

function StatusBanner({ eligible, title, description }: StatusBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4",
        eligible
          ? "border-emerald-100 bg-emerald-50 text-emerald-900"
          : "border-red-100 bg-red-50 text-red-900",
      )}
    >
      {eligible ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="min-w-0">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-sm font-bold opacity-70">{description}</div>
      </div>
    </div>
  );
}

export interface CreateDisputeFormProps {
  role: "client" | "freelancer";
  initialVaultId?: string;
}

export function CreateDisputeForm({
  role,
  initialVaultId,
}: CreateDisputeFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  // State with Persistence
  const [formData, setFormData, clearPersistence] = useFormPersistence("create_dispute_form", {
    selectedVaultId: initialVaultId || "",
    selectedDeliverableTitle: "",
    selectedReasonCode: "",
    description: "",
  });

  const {
    selectedVaultId,
    selectedDeliverableTitle,
    selectedReasonCode,
    description
  } = formData;

  const setSelectedVaultId = (val: string) => setFormData(prev => ({ ...prev, selectedVaultId: val }));
  const setSelectedDeliverableTitle = (val: string) => setFormData(prev => ({ ...prev, selectedDeliverableTitle: val }));
  const setSelectedReasonCode = (val: string) => setFormData(prev => ({ ...prev, selectedReasonCode: val }));
  const setDescription = (val: string) => setFormData(prev => ({ ...prev, description: val }));

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [availableVaults, setAvailableVaults] = useState<Vault[]>([]);

  // Fetch vaults
  useEffect(() => {
    async function load() {
      try {
        const v = await api.vaults.list();
        setAvailableVaults(v);
      } catch (e) {
        console.error("Failed to load vaults", e);
      }
    }
    load();
  }, []);

  const selectedVault = useMemo(() => {
    return availableVaults.find((v) => v.id === selectedVaultId) || null;
  }, [selectedVaultId, availableVaults]);

  const eligibility = useMemo(() => {
    return getDisputeEligibility(selectedVault, selectedDeliverableTitle);
  }, [selectedVault, selectedDeliverableTitle]);

  const selectedDeliverable = useMemo(() => {
    return (
      (selectedVault?.deliverables || []).find(
        (d: any) => d.title === selectedDeliverableTitle,
      ) || null
    );
  }, [selectedVault, selectedDeliverableTitle]);

  // Determine if the *current* selection requires a requirement reference
  const requiresDeliverableRef = useMemo(() => {
    if (!selectedReasonCode || !eligibility?.allowedCodes) return false;
    const codeDef = eligibility.allowedCodes.find(
      (c) => c.code === selectedReasonCode,
    );
    return Boolean(codeDef?.requiresDeliverableRef);
  }, [selectedReasonCode, eligibility]);

  const step1Complete = Boolean(selectedVaultId && selectedVault);
  const step2Ready = step1Complete && eligibility?.eligible;

  const canSubmit =
    Boolean(selectedVault) &&
    Boolean(eligibility?.eligible) &&
    Boolean(selectedReasonCode) &&
    Boolean(description.trim()) &&
    (!requiresDeliverableRef || Boolean(selectedDeliverableTitle)) &&
    user?.kycStatus === KycStatus.VERIFIED &&
    !isSubmitting;

  const resetDownstream = useCallback(() => {
    setSelectedDeliverableTitle("");
    setSelectedReasonCode("");
    setDescription("");
    setFiles([]);
    setFileError("");
    setFormError("");
  }, []);

  const resetReasonAndBelow = useCallback(() => {
    setSelectedDeliverableTitle("");
    setSelectedReasonCode("");
    setDescription("");
    setFiles([]);
    setFileError("");
    setFormError("");
  }, []);

  const validateAndAddFiles = useCallback((incoming: File[]) => {
    setFileError("");

    const next: File[] = [];
    for (const f of incoming) {
      if (!ACCEPTED_MIME.includes(f.type)) {
        setFileError("Unsupported file type. Please upload PDF, PNG, or JPG.");
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setFileError(
          `File too large. Max allowed is ${MAX_FILE_MB}MB per file.`,
        );
        continue;
      }
      next.push(f);
    }

    if (next.length) {
      setFiles((prev) => {
        const seen = new Set(
          prev.map((x) => `${x.name}_${x.size}_${x.lastModified}`),
        );
        const deduped = next.filter((x) => {
          const key = `${x.name}_${x.size}_${x.lastModified}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return [...prev, ...deduped];
      });
    }
  }, []);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    validateAndAddFiles(list);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const list = Array.from(e.dataTransfer.files || []);
    validateAndAddFiles(list);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedVaultId) return setFormError("Select a vault.");
    if (!eligibility?.eligible)
      return setFormError("This vault is not eligible for dispute.");
    if (!selectedReasonCode) return setFormError("Select a reason code.");
    if (requiresDeliverableRef && !selectedDeliverableTitle)
      return setFormError("This dispute type requires a linked deliverable.");
    if (!description.trim())
      return setFormError("Please provide a detailed description of the issue.");

    setIsSubmitting(true);

    try {
      // 1. Upload evidence to S3
      const uploadedEvidence = await Promise.all(
        files.map(async (file) => {
          // a. Request presigned URL
          const { url, key } = await api.uploads.getPresignedUrl({
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            purpose: "EVIDENCE",
          });

          // b. PUT file to S3
          const uploadResponse = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          return {
            filename: file.name,
            key: key,
            size: file.size,
            type: file.type || "application/octet-stream",
          };
        }),
      );

      // 2. Submit dispute with S3 keys
      const payload = {
        vaultId: selectedVaultId,
        deliverableTitle: selectedDeliverableTitle || undefined,
        disputeType: selectedReasonCode as any,
        reasonCode: selectedReasonCode,
        description,
        evidence: uploadedEvidence,
      };

      console.log("DEBUG: Sending dispute payload:", payload);

      await api.disputes.create(payload);

      clearPersistence();
      router.push(`/${role}/disputes`);
      router.refresh();
    } catch (err) {
      console.error("Dispute submission failed:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 md:px-4 pb-10 pt-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              step1Complete ? "bg-emerald-500" : "bg-slate-200",
            )}
          />
          <span>Step 1</span>
          <span className="mx-1">•</span>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              step2Ready ? "bg-emerald-500" : "bg-slate-200",
            )}
          />
          <span>Step 2</span>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          Open a dispute
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 font-bold">
          Disputes are scoped to a specific vault and a reason code. Choose
          carefully. Weak or vague disputes get rejected.
        </p>
      </header>

      {formError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
            <div>{formError}</div>
          </div>
        </div>
      ) : null}      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1 */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-3 mb-4">
            <StepHeader
              step="1"
              title="Select scope"
              subtitle="Pick the vault this dispute applies to."
              right={
                selectedVault ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                    {selectedVault.id.slice(0, 8)}...
                  </div>
                ) : null
              }
            />
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-1">
              {/* Vault */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Vault</Label>
                <Select
                  value={selectedVaultId}
                  onValueChange={(val) => {
                    setSelectedVaultId(val);
                    resetDownstream();
                  }}
                >
                  <SelectTrigger className="h-10 sm:h-11 w-full border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 font-bold text-xs sm:text-sm">
                    <SelectValue placeholder="Select a vault...">
                      {selectedVault ? (
                        <span className="block w-full truncate">
                          {selectedVault.title}
                        </span>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent
                    className="
                      w-(--radix-select-trigger-width)
                      border-slate-200 bg-white text-slate-900
                    "
                  >
                    {availableVaults.map((vault) => (
                      <SelectItem
                        key={vault.id}
                        value={vault.id}
                        className="focus:bg-slate-50 focus:text-slate-900 font-bold"
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="truncate">{vault.title}</span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {vault.id.slice(0, 8)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 font-bold">
                  This determines the dispute jurisdiction and parties.
                </p>
              </div>
            </div>

            {/* Quick vault context */}
            {selectedVault ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="text-sm font-bold text-slate-900">
                      {selectedVault.title}
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-500 font-bold">
                      <div>
                        Status:{" "}
                        <span className="text-slate-900">
                          {selectedVault.status}
                        </span>
                      </div>
                      <div>
                        Type:{" "}
                        <span className="text-slate-900">
                          Single release
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-xs">
                    <Gavel className="h-4 w-4 text-amber-500" />
                    Dispute scope locked
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Step 2 */}
        {step1Complete ? (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-3">
              <StepHeader
                step="2"
                title="Details & evidence"
                subtitle="Pick a reason code and attach supporting proof."
              />
            </CardHeader>

            <CardContent className="space-y-6 mt-4">
              <StatusBanner
                eligible={Boolean(eligibility?.eligible)}
                title={
                  eligibility?.eligible
                    ? "Eligible for dispute"
                    : "Not eligible"
                }
                description={
                  eligibility?.reason || "Eligibility could not be determined."
                }
              />

              {user?.kycStatus !== KycStatus.VERIFIED && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-900">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div className="space-y-1">
                      <p className="font-bold">Tier 2 Verification Required</p>
                      <p className="text-amber-700/80 leading-relaxed font-bold">
                        To maintain project security, you must complete full identity 
                        verification (Tier 2) before initiating a dispute.
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-amber-600 font-bold hover:text-amber-700"
                        onClick={() => router.push('/onboarding/kyc')}
                      >
                        Complete Verification
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirement (conditional: depends on selected reason code) */}
              {eligibility?.eligible &&
              selectedReasonCode &&
              requiresDeliverableRef ? (
                <div className="space-y-2 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in">
                  <Label className="text-sm font-bold text-slate-700">
                    Related requirement <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={selectedDeliverableTitle}
                    onValueChange={setSelectedDeliverableTitle}
                  >
                    <SelectTrigger className="h-11 w-full border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/20 font-bold">
                      <SelectValue placeholder="Select deliverable...">
                        {selectedDeliverable ? (
                          <span className="block w-full truncate">
                            {selectedDeliverable.title}
                          </span>
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent
                      className="
                        w-(--radix-select-trigger-width)
                        border-slate-200 bg-white text-slate-900
                      "
                    >
                      {(selectedVault?.deliverables || []).map(
                        (deliverable: any) => (
                          <SelectItem
                            key={deliverable.id}
                            value={deliverable.title}
                            className="focus:bg-slate-50 focus:text-slate-900 font-bold"
                          >
                            <div className="flex flex-col items-start py-1">
                              <span className="text-sm font-bold">
                                {deliverable.title}
                              </span>
                              {deliverable.description && (
                                <span className="text-[11px] text-slate-500 font-bold">
                                  {deliverable.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-slate-500 font-bold">
                    This dispute type must specifically reference which
                    verification requirement was handled incorrectly.
                  </p>
                </div>
              ) : null}

              {/* Reason codes */}
              {eligibility?.eligible ? (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <Label className="text-sm font-bold text-slate-700">
                      Reason code *
                    </Label>
                    <div className="text-xs text-slate-400 font-bold">
                      Choose one. Make it defensible.
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {(eligibility?.allowedCodes || []).map((code) => {
                      const active = selectedReasonCode === code.code;

                      return (
                        <label
                          key={code.code}
                          className={cn(
                            "group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all",
                            active
                              ? "border-amber-500 bg-amber-50/50"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          <input
                            type="radio"
                            name="reasonCode"
                            value={code.code}
                            checked={active}
                            onChange={(e) => {
                              setSelectedReasonCode(e.target.value);
                              // If switching to a type that doesn't need requirements, clear the selection
                              if (!code.requiresRequirementRef) {
                                setSelectedDeliverableTitle("");
                              }
                            }}
                            className="mt-1 h-4 w-4 accent-amber-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm sm:text-[15px] font-bold text-slate-900">
                                  {code.label}
                                </div>
                                {code.requiresDeliverableRef && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Needs proof
                                  </span>
                                )}
                              </div>
                              <div
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                                  active
                                    ? "border-amber-200 bg-amber-100 text-amber-700"
                                    : "border-slate-200 bg-slate-50 text-slate-400",
                                )}
                              >
                                {code.code}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-slate-500 font-bold leading-relaxed">
                              {code.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Summary + files */}
              {eligibility?.eligible && selectedReasonCode ? (
                <div className="space-y-6 border-t border-slate-100 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between gap-3">
                      <Label className="text-sm font-bold text-slate-700">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <div className="text-xs text-slate-400 font-bold">
                        {description.length}/600
                      </div>
                    </div>

                    <Textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value.slice(0, 600))
                      }
                      placeholder="State facts. Timeline. What you delivered vs what was agreed. Avoid emotions."
                      className="min-h-[140px] resize-none border-slate-200 bg-white text-slate-900 hover:border-slate-300 focus:ring-2 focus:ring-emerald-500/10 font-bold"
                    />
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold">
                      Good disputes read like a report: facts, dates, evidence.
                      No drama.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm font-bold text-slate-700">
                        Supporting evidence
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => inputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Add files
                      </Button>
                    </div>

                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                      className="hidden"
                      onChange={onPickFiles}
                    />

                    <div
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={onDrop}
                      onClick={() => inputRef.current?.click()}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 border-dashed p-4 sm:p-6 transition-all",
                        isDragging
                          ? "border-emerald-500/50 bg-emerald-50"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs">
                          <Upload className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900">
                            Drag and drop files here
                          </div>
                          <div className="mt-1 text-xs text-slate-400 font-bold">
                            PDF, PNG, JPG • up to {MAX_FILE_MB}MB each
                          </div>
                        </div>
                      </div>
                    </div>

                    {fileError ? (
                      <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
                        {fileError}
                      </div>
                    ) : null}

                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}_${file.size}_${file.lastModified}_${index}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 shadow-xs"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                                <FileText className="h-4 w-4 text-emerald-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-slate-900">
                                  {file.name}
                                </div>
                                <div className="text-xs text-slate-400 font-bold">
                                  {formatBytes(file.size)}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {/* Footer actions */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-start gap-2 text-xs text-slate-500 font-bold max-w-md">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="leading-relaxed">
              Submitting a dispute means you&apos;re asserting the information
              is accurate. Poor evidence and vague claims will get denied.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 w-full sm:w-auto font-bold h-11"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-11 bg-amber-500 px-8 font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-60 w-full sm:w-auto shadow-sm rounded-xl"
              disabled={!canSubmit}
            >
              {isSubmitting ? "Submitting…" : "Submit dispute"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
