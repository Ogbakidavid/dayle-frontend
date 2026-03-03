"use client";

import * as React from "react";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

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
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/3">
          <span className="text-sm font-semibold text-white/80">{step}</span>
        </div>
        <div className="space-y-0.5">
          <div className="text-base font-semibold text-white">{title}</div>
          {subtitle ? (
            <div className="text-sm text-white/50">{subtitle}</div>
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
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          : "border-red-500/20 bg-red-500/10 text-red-200",
      )}
    >
      {eligible ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
      )}
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-sm text-white/70">{description}</div>
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
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedVaultId, setSelectedVaultId] = useState(initialVaultId || "");
  const [selectedDeliverableTitle, setSelectedDeliverableTitle] = useState("");
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [description, setDescription] = useState("");

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
    (!requiresDeliverableRef || Boolean(selectedDeliverableTitle)) &&
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

    setIsSubmitting(true);

    try {
      await api.disputes.create({
        vaultId: selectedVaultId,
        deliverableTitle: selectedDeliverableTitle || undefined,
        reasonCode: selectedReasonCode,
        description,
      });

      console.log("Submitted dispute", {
        selectedVaultId,
        selectedDeliverableTitle,
        selectedReasonCode,
        description,
        files,
      });

      router.push(`/${role}/disputes`);
      router.refresh();
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
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
          className="text-white/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2 text-xs text-white/40">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              step1Complete ? "bg-emerald-400" : "bg-white/20",
            )}
          />
          <span>Step 1</span>
          <span className="mx-1">•</span>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              step2Ready ? "bg-emerald-400" : "bg-white/20",
            )}
          />
          <span>Step 2</span>
        </div>
      </div>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          Open a dispute
        </h1>
        <p className="text-sm leading-relaxed text-white/60">
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
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1 */}
        <Card className="border-white/10 bg-[#0B0B0C]">
          <CardHeader className="space-y-3 mb-4">
            <StepHeader
              step="1"
              title="Select scope"
              subtitle="Pick the vault this dispute applies to."
              right={
                selectedVault ? (
                  <div className="rounded-lg border border-white/10 bg-white/3 px-3 py-1 text-xs text-white/60">
                    {selectedVault.id}
                  </div>
                ) : null
              }
            />
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-1">
              {/* Vault */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Vault</Label>
                <Select
                  value={selectedVaultId}
                  onValueChange={(val) => {
                    setSelectedVaultId(val);
                    resetDownstream();
                  }}
                >
                  <SelectTrigger className="h-11 w-full border-white/10 bg-black/40 text-white hover:border-white/20 focus:ring-2 focus:ring-amber-500/30">
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
                      border-white/10 bg-[#141416] text-white
                    "
                  >
                    {availableVaults.map((vault) => (
                      <SelectItem
                        key={vault.id}
                        value={vault.id}
                        className="focus:bg-white/10 focus:text-white"
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="truncate">{vault.title}</span>
                          <span className="shrink-0 text-[11px] text-white/40">
                            {vault.id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/40">
                  This determines the dispute jurisdiction and parties.
                </p>
              </div>
            </div>

            {/* Quick vault context */}
            {selectedVault ? (
              <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="text-sm font-semibold text-white">
                      {selectedVault.title}
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-white/50">
                      <div>
                        Status:{" "}
                        <span className="text-white/70 font-bold">
                          {selectedVault.status}
                        </span>
                      </div>
                      <div>
                        Type:{" "}
                        <span className="text-white/70 font-bold">
                          Single release
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                    <Gavel className="h-4 w-4 text-amber-400" />
                    Dispute scope locked
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Step 2 */}
        {step1Complete ? (
          <Card className="border-white/10 bg-[#0B0B0C]">
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

              {/* Requirement (conditional: depends on selected reason code) */}
              {eligibility?.eligible &&
              selectedReasonCode &&
              requiresDeliverableRef ? (
                <div className="space-y-2 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in">
                  <Label className="text-sm font-medium text-white">
                    Related requirement <span className="text-red-400">*</span>
                  </Label>

                  <Select
                    value={selectedDeliverableTitle}
                    onValueChange={setSelectedDeliverableTitle}
                  >
                    <SelectTrigger className="h-11 w-full border-white/10 bg-black/40 text-white hover:border-white/20 focus:ring-2 focus:ring-amber-500/30">
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
                        border-white/10 bg-[#141416] text-white
                      "
                    >
                      {(selectedVault?.deliverables || []).map(
                        (deliverable: any) => (
                          <SelectItem
                            key={deliverable.id}
                            value={deliverable.title}
                            className="focus:bg-white/10 focus:text-white"
                          >
                            <div className="flex flex-col items-start py-1">
                              <span className="text-sm font-medium">
                                {deliverable.title}
                              </span>
                              {deliverable.description && (
                                <span className="text-xs text-white/40">
                                  {deliverable.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-white/40">
                    This dispute type must specifically reference which
                    verification requirement was handled incorrectly.
                  </p>
                </div>
              ) : null}

              {/* Reason codes */}
              {eligibility?.eligible ? (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <Label className="text-sm font-medium text-white">
                      Reason code *
                    </Label>
                    <div className="text-xs text-white/40">
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
                            "group relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all",
                            active
                              ? "border-amber-500/50 bg-amber-500/10"
                              : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/4",
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
                                <div className="text-sm font-semibold text-white">
                                  {code.label}
                                </div>
                                {code.requiresDeliverableRef && (
                                  <span className="text-[10px] font-bold tracking-wide text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Needs proof
                                  </span>
                                )}
                              </div>
                              <div
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[11px]",
                                  active
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                                    : "border-white/10 bg-white/3 text-white/50",
                                )}
                              >
                                {code.code}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-white/60">
                              {code.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Requirement Dropdown MOVED before this block in DOM order logic, but visually we want it potentially after.
                  Actually, user flow usually is: Pick Code -> If Code needs Req -> Pick Req.
                  So we should place the Requirement block AFTER the Reason Code block.
              */}

              {/* Summary + files */}
              {eligibility?.eligible && selectedReasonCode ? (
                <div className="space-y-6 border-t border-white/10 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between gap-3">
                      <Label className="text-sm font-medium text-white">
                        Description{" "}
                        <span className="text-xs font-normal text-white/40">
                          (optional)
                        </span>
                      </Label>
                      <div className="text-xs text-white/40">
                        {description.length}/600
                      </div>
                    </div>

                    <Textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value.slice(0, 600))
                      }
                      placeholder="State facts. Timeline. What you delivered vs what was agreed. Avoid emotions."
                      className="min-h-[140px] resize-none border-white/10 bg-black/40 text-white hover:border-white/20 focus:ring-2 focus:ring-amber-500/30"
                    />
                    <p className="text-xs text-white/40">
                      Good disputes read like a report: facts, dates, evidence.
                      No drama.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-sm font-medium text-white">
                        Supporting evidence
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs text-white/60 hover:text-white hover:bg-white/5"
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
                        "cursor-pointer rounded-xl border border-dashed p-6 transition-all",
                        isDragging
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-white/15 bg-white/2 hover:bg-white/4 hover:border-white/25",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                          <Upload className="h-5 w-5 text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">
                            Drag and drop files here
                          </div>
                          <div className="mt-1 text-sm text-white/50">
                            PDF, PNG, JPG • up to {MAX_FILE_MB}MB each
                          </div>
                        </div>
                      </div>
                    </div>

                    {fileError ? (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                        {fileError}
                      </div>
                    ) : null}

                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}_${file.size}_${file.lastModified}_${index}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3 hover:border-white/20"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/3">
                                <FileText className="h-4 w-4 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-white/85">
                                  {file.name}
                                </div>
                                <div className="text-xs text-white/45">
                                  {formatBytes(file.size)}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-white/50 hover:text-red-300 hover:bg-red-500/10"
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
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs text-white/45">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Submitting a dispute means you&apos;re asserting the information
              is accurate. Poor evidence and vague claims will get denied.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
            <Button
              type="button"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/5 w-full sm:w-auto"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-11 bg-amber-500 px-8 font-bold text-black hover:bg-amber-400 disabled:opacity-60 w-full sm:w-auto"
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
