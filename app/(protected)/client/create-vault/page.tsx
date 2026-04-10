"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  ListChecks,
  Users,
  ArrowRight,
  ArrowLeft,
  Info,
  DollarSign,
  AlertCircle,
  Calendar,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants, Reorder } from "framer-motion";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { useVault } from "@/lib/store/vault-context";
import { SUPPORTED_TOKENS, CONTRACTS } from "@/lib/contracts";
import { SubmissionType } from "@/lib/domain/enums";
import { LogoLoader } from "@/components/ui/logo-loader";
import { DayleLogo } from "@/components/shared/DayleLogo";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { useUser } from "@/lib/store/user-context";
import { useRates } from "@/lib/store/rates-context"
import { useFormPersistence } from "@/lib/hooks/use-form-persistence";


const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(10px)",
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(10px)",
  }),
};

export default function CreateVaultPage() {
  const router = useRouter();
  const { createVault } = useVault();
  const [isDeploying, setIsDeploying] = useState(false);
  const [direction, setDirection] = useState(0);
  const [editingFlags, setEditingFlags] = useState<Record<string, boolean>>({});

  // State with Persistence
  const [formData, setFormData, clearPersistence] = useFormPersistence("create_vault_form", {
    vaultPurpose: "",
    vaultTitle: "",
    vaultDescription: "",
    budgetAmount: "",
    freelancerEmail: "",
    freelancerName: "",
    deliverables: [{ title: "", description: "", id: crypto.randomUUID(), submissionType: SubmissionType.FILE }],
    step: 1,
  });

  const {
    vaultPurpose,
    vaultTitle,
    vaultDescription,
    budgetAmount,
    freelancerEmail,
    freelancerName,
    deliverables,
    step
  } = formData;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setFormData(prev => ({ ...prev, step: prev.step + newDirection }));
  };

  const setVaultPurpose = (val: string) => setFormData(prev => ({ ...prev, vaultPurpose: val }));
  const setVaultTitle = (val: string) => setFormData(prev => ({ ...prev, vaultTitle: val }));
  const setVaultDescription = (val: string) => setFormData(prev => ({ ...prev, vaultDescription: val }));
  const setBudgetAmount = (val: string) => setFormData(prev => ({ ...prev, budgetAmount: val }));
  const setFreelancerEmail = (val: string) => setFormData(prev => ({ ...prev, freelancerEmail: val }));
  const setFreelancerName = (val: string) => setFormData(prev => ({ ...prev, freelancerName: val }));
  
  const handleAddDeliverable = () => {
    if (deliverables.length < 10) {
      const newId = crypto.randomUUID();
      setFormData(prev => ({
        ...prev,
        deliverables: [
          ...prev.deliverables,
          { title: "", description: "", id: newId, submissionType: SubmissionType.FILE },
        ]
      }));
      setEditingFlags(prev => ({ ...prev, [newId]: true }));
    }
  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setFormData(prev => ({
        ...prev,
        deliverables: prev.deliverables.filter((d) => d.id !== id)
      }));
    }
  };

  const updateDeliverable = (
    id: string,
    field: "title" | "description" | "submissionType",
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    }));
  };



  const steps = [
    { id: 1, name: "Basics", icon: Info },
    { id: 2, name: "Assign", icon: Users },
    { id: 3, name: "Review", icon: ShieldCheck },
  ];

  const { user } = useUser();
  const { rates } = useRates();
  const currencySymbol = (user?.country === "Kenya" || user?.country === "KE") ? "KSh" : "₦";
  const currencyCode = (user?.country === "Kenya" || user?.country === "KE") ? "KES" : "NGN";

  const budget = Number(budgetAmount) || 0;
  
  // Calculate USD equivalent for backend/fees
  const rate = rates[currencyCode] || (currencyCode === "KES" ? 0.0076 : 0.00066); 
  const budgetUSD = budget * rate;

  const fees = {
    settlementPercent:
      budgetUSD <= 500 ? 5 : budgetUSD <= 2000 ? 4 : budgetUSD <= 10000 ? 3 : 2.5,
    processingPercent: 0.5,
  };
  const depositFeeUSD = (budgetUSD * fees.processingPercent) / 100;
  const settlementFeeUSD = (budgetUSD * fees.settlementPercent) / 100;
  const freelancerReceives = budgetUSD - settlementFeeUSD;
  const totalClientPays = budgetUSD + depositFeeUSD;

  // const getDeliverableLabel = (deliverableId: string) => {
  //   const purposeData = (VAULT_PURPOSE_MAPPING as any)[vaultPurpose];
  //   const list = purposeData?.deliverables || [];
  //   return (
  //     list.find((d: any) => d.id === deliverableId)?.label || deliverableId
  //   );
  // };

  // Validation
  const isStep1Complete =
    vaultTitle.trim() !== "" &&
    vaultPurpose !== "" &&
    budgetUSD > 0 &&
    deliverables.every((d) => d.title.trim() !== "");
  const isStep2Complete =
    freelancerEmail.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail);

  const canContinue =
    step === 1 ? isStep1Complete : step === 2 ? isStep2Complete : true;
  const localTotal = budget * (1 + fees.processingPercent / 100);

  const getDeliverableLabel = (deliverableId: string) => {
    const purposeData = (VAULT_PURPOSE_MAPPING as any)[vaultPurpose];
    const list = purposeData?.deliverables || [];
    return list.find((d: any) => d.id === deliverableId)?.title || "Deliverable";
  };

  const handleDeploy = async () => {
    // Create vault via API with idempotency to prevent duplicate creations
    const makeIdempotencyKey = () => crypto.randomUUID();

    setIsDeploying(true);
    const idempotencyKey = makeIdempotencyKey();
    try {
      // 1. Call backend DB creation. The backend will now automatically
      // initialize the secure vault account behind the scenes.
      const payload = {
        title: vaultTitle,
        type: vaultPurpose.toUpperCase(),
        description: vaultDescription,
        totalAmount: budgetUSD,      // Store clean budget in USD for smart contract
        localAmount: localTotal,      // Store fee-inclusive local total for client display
        localCurrency: currencyCode,
        // Defaulting to digital dollar for Fiat abstraction under the hood
        tokenAddress: CONTRACTS.usdcToken,
        tokenSymbol: "USDC",
        tokenDecimals: 6, // digital dollar uses 6 decimals
        chainId: 11142220, // Celo Sepolia
        idempotencyKey,
        deliverables: deliverables.map(({ title, description, submissionType }) => ({
          title,
          description,
          submissionType,
        })),
      };


      const newVault = await createVault(payload);

      // 2. Send invitation to freelancer if email provided
      if (freelancerEmail) {
        try {
          await api.invites.create({
            vaultId: newVault.id,
            email: freelancerEmail.trim(),
          });
        } catch (inviteErr) {
          console.error("Failed to send freelancer invite:", inviteErr);
        }
      }

      // 3. Redirect to checkout for the Fiat Onramp flow
      clearPersistence();
      router.push(`/checkout/${newVault.id}?idem=${idempotencyKey}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!user?.paymentAccountReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-2xl">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900 ">
            Verification Required
          </h1>
          <p className="text-slate-600 font-bold  leading-relaxed px-4">
            To maintain a secure environment, we require all clients to complete 
            basic verification (Tier 1) before creating project vaults.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button
            onClick={() => router.push("/onboarding/identity?returnTo=" + encodeURIComponent(window.location.pathname))}
            className="flex-1 h-14 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest"
          >
            Verify Now
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/client")}
            className="flex-1 h-14 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50"
          >
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {isDeploying && <LogoLoader fullPage={true} size="lg" />}
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-16">
        {/* Header Section */}
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 leading-tight">
              Create New Project
            </h1>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wide">
              Secure project settlement!
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Stepper (Desktop) */}
            <nav className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-full shadow-sm border border-slate-200">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all",
                    step === s.id
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-500",
                  )}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{s.name}</span>
                </div>
              ))}
            </nav>

            <Link href="/client" className="w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Interface */}
        <div className="w-full">
          <main className="w-full">
            <div className="relative min-h-[400px] sm:min-h-[500px] bg-white border border-slate-200 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-sm overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* STEP 1: BASICS */}
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in">
                      {/* 1. Category */}
                      <div className="space-y-3">
                        <Label className="text-sm md:text-base text-slate-900 font-bold">
                          1. Select project category
                        </Label>
                        <div className="p-2 bg-slate-50/50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {Object.entries(VAULT_PURPOSE_MAPPING).map(
                            ([key, value]) => {
                              const Icon = value.icon;
                              const isActive = vaultPurpose === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => setVaultPurpose(key)}
                                  className={cn(
                                    "flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border-2 transition-all duration-300 relative",
                                    isActive
                                      ? "bg-emerald-50/80 border-emerald-500 shadow-sm"
                                      : "bg-white border-transparent hover:border-slate-200 shadow-sm",
                                  )}
                                >
                                  {isActive && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  )}
                                  <Icon
                                    className={cn(
                                      "w-6 h-6 transition-transform",
                                      isActive ? "text-emerald-600 scale-110" : "text-slate-600"
                                    )}
                                  />
                                  <span className={cn("text-xs sm:text-sm font-bold text-center", isActive ? "text-emerald-700" : "text-slate-700")}>
                                    {isActive ? `< >\n${value.label}` : value.label}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* 2. Project identity */}
                        <div className="space-y-2">
                          <Label className="text-sm md:text-base text-slate-900 font-bold">
                            2. Project identity
                          </Label>
                          <Input
                            value={vaultTitle}
                            onChange={(e) => setVaultTitle(e.target.value)}
                            placeholder="Project title"
                            className="bg-slate-50 border-slate-200 h-14 text-base text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                          />
                        </div>

                        {/* 3. Total allocation */}
                        <div className="space-y-2">
                          <Label className="text-sm md:text-base text-slate-900 font-bold">
                            3. Total allocation ({currencyCode})
                          </Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                              {currencySymbol}
                            </div>
                            <Input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-slate-50 border-slate-200 h-14 pl-10 text-base text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                            />
                            {budget > 0 && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                ~${budgetUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-start sm:items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mt-2 text-amber-700 text-[10px] sm:text-xs font-bold leading-relaxed">
                            <Info className="w-4 h-4 shrink-0 sm:mt-0 mt-0.5" />
                            <span>
                              Talent Limit Rate: Max {currencyCode === "NGN" ? "50,000 NGN" : "5,000 KES"} per task. Larger amounts may fail during funding.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Brief description */}
                      <div className="space-y-2">
                        <Label className="text-sm md:text-base text-slate-900 font-bold">
                          4. Brief description
                        </Label>
                        <Textarea
                          value={vaultDescription}
                          onChange={(e) => setVaultDescription(e.target.value)}
                          placeholder="Describe the overall scope..."
                          className="bg-slate-50 border-slate-200 min-h-[100px] p-4 text-base text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl resize-none"
                        />
                      </div>

                      {/* 5. Deliverables checklist */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <Label className="text-sm md:text-base text-slate-900 font-bold flex items-center gap-2">
                              5. Deliverables checklist <span className="text-emerald-500 font-semibold">(Required)</span>
                            </Label>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
                              Add the specific items the freelancers will deliver. This prevents disputes by making expectations clear.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddDeliverable}
                            disabled={deliverables.length >= 10}
                            variant="outline"
                            className="bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold rounded-full transition-all shrink-0 h-10 px-4"
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Deliverable
                          </Button>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={deliverables}
                          onReorder={(newOrder) => setFormData(prev => ({ ...prev, deliverables: newOrder }))}
                          className="space-y-4"
                        >
                            {deliverables.map((deliverable, index) => {
                              const isEditing = editingFlags[deliverable.id] ?? true;
                              return (
                                <Reorder.Item
                                  key={deliverable.id}
                                  value={deliverable}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className={cn(
                                    "group relative bg-white border hover:border-emerald-500/30 p-4 sm:p-5 rounded-2xl transition-all shadow-sm",
                                    isEditing ? "border-emerald-200" : "border-slate-200"
                                  )}
                                >
                                  <div className="flex flex-col lg:flex-row items-start gap-4 w-full">
                                    <div className="flex items-center gap-2 pt-2 text-slate-500 font-bold w-full lg:w-auto shrink-0">
                                      {isEditing ? (
                                        <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600" />
                                      ) : null}
                                      <span>{index + 1}.</span>
                                    </div>
                                    <div className="flex-1 w-full space-y-3">
                                      <div className={cn(
                                        "border rounded-xl transition-all overflow-hidden",
                                        isEditing 
                                          ? "border-emerald-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20" 
                                          : "border-slate-200 bg-slate-50 opacity-90"
                                      )}>
                                        <Input
                                          value={deliverable.title}
                                          onChange={(e) => updateDeliverable(deliverable.id, "title", e.target.value)}
                                          maxLength={100}
                                          readOnly={!isEditing}
                                          placeholder="Deliverable Title (e.g. Frontend UI Components)"
                                          className={cn(
                                            "bg-transparent border-0 border-b border-slate-100 h-12 font-bold placeholder:text-slate-400 focus:ring-0 rounded-none shadow-none",
                                            isEditing ? "text-slate-900" : "text-slate-700 pointer-events-none"
                                          )}
                                        />
                                        <div className="flex items-end gap-2 p-2 bg-slate-50">
                                          <Textarea
                                            value={deliverable.description}
                                            onChange={(e) => updateDeliverable(deliverable.id, "description", e.target.value)}
                                            maxLength={500}
                                            readOnly={!isEditing}
                                            placeholder="Brief description of requirements... (Optional)"
                                            className={cn(
                                              "bg-transparent border-none min-h-[44px] h-[44px] py-3 text-sm font-medium placeholder:text-slate-400 focus:ring-0 shadow-none resize-none flex-1",
                                              isEditing ? "text-slate-900" : "text-slate-600 pointer-events-none"
                                            )}
                                          />
                                          <div className="flex items-center gap-2 shrink-0">
                                            {isEditing && (
                                              <Button
                                                type="button"
                                                onClick={() => handleRemoveDeliverable(deliverable.id)}
                                                variant="ghost"
                                                size="sm"
                                                disabled={deliverables.length === 1}
                                                className="text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 rounded-lg shadow-sm h-10 px-3 font-bold text-xs"
                                              >
                                                <Trash2 className="w-3.5 h-3.5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">REMOVE</span>
                                              </Button>
                                            )}
                                            <Button
                                              type="button"
                                              onClick={() => setEditingFlags(prev => ({ ...prev, [deliverable.id]: !isEditing }))}
                                              variant={isEditing ? "default" : "ghost"}
                                              size="sm"
                                              className={cn(
                                                "rounded-lg shadow-sm h-10 px-4 font-bold text-xs transition-all",
                                                isEditing 
                                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                  : "text-slate-500 hover:text-slate-700 bg-white border border-slate-200"
                                              )}
                                            >
                                              {isEditing ? "SAVE" : "EDIT"}
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      {isEditing && (
                                        <div className="space-y-1 px-1">
                                          {deliverable.title.length > 0 && deliverable.title.length < 10 && (
                                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" /> Too vague. Use at least 10 characters for the title to protect yourself.
                                            </p>
                                          )}
                                          {deliverable.description.length > 0 && deliverable.description.length < 20 && (
                                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" /> Short description detected. Detailed requirements help prevent disputes.
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {[
                                          { id: SubmissionType.FILE, label: "FILE UPLOAD" },
                                          { id: SubmissionType.LINK, label: "LINK URL" },
                                          { id: SubmissionType.BOTH, label: "BOTH OPTIONS" }
                                        ].map((opt) => (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            disabled={!isEditing}
                                            onClick={() => updateDeliverable(deliverable.id, "submissionType", opt.id)}
                                            className={cn(
                                              "px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide transition-all border outline-none",
                                              deliverable.submissionType === opt.id
                                                ? (isEditing ? "bg-emerald-600 border-emerald-600 text-white" : "bg-slate-700 border-slate-700 text-white opacity-80")
                                                : "bg-slate-50 border-slate-200 text-slate-500",
                                              isEditing && deliverable.submissionType !== opt.id && "hover:bg-slate-100 hover:text-slate-900 pointer-events-auto",
                                              !isEditing && "pointer-events-none opacity-60"
                                            )}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </Reorder.Item>
                              );
                            })}
                        </Reorder.Group>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ASSIGN */}
                  {step === 2 && (
                    <div className="max-w-md mx-auto py-10 space-y-8 animate-in fade-in">
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                          <Users className="w-10 h-10 text-emerald-600 -rotate-12" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900">
                          Assign freelancer
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">
                          Identify the project freelancer
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Input
                          value={freelancerEmail}
                          onChange={(e) => setFreelancerEmail(e.target.value)}
                          placeholder="Freelancer email"
                          className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-xl text-center font-bold placeholder:text-slate-400 text-base focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                        <Input
                          value={freelancerName}
                          onChange={(e) => setFreelancerName(e.target.value)}
                          placeholder="Full name (optional)"
                          className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-xl text-center font-bold placeholder:text-slate-400 text-base focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-center">
                          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                          <p className="text-blue-800 text-sm leading-relaxed font-semibold">
                            Project system will verify user identity upon acceptance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: REVIEW */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Invoice Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900">
                            Project Summary
                          </h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">
                            Review your project before funding
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-emerald-700 text-xs font-bold tracking-wide uppercase">
                            Ready
                          </span>
                        </div>
                      </div>

                      {/* Project Identity Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <ListChecks className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold text-base tracking-tight">
                              {vaultTitle || "Untitled project"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                                {vaultPurpose || "Project"}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold uppercase tracking-wider shadow-sm">
                                Single release
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <CurrencyEstimate 
                            usdAmount={budgetUSD} 
                            className="text-slate-900 text-xl sm:text-2xl font-bold"
                            showNote={false}
                          />
                        </div>
                      </div>

                      {/* Fee Breakdown — Invoice Table */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Table Header */}
                        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                          </div>
                        </div>

                        {/* Line Items */}
                        <div className="divide-y divide-slate-100 bg-white">
                          <div className="px-6 py-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-slate-900">Project Budget</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Held in secure vault until release</p>
                            </div>
                            <CurrencyEstimate usdAmount={budgetUSD} className="text-slate-900 text-sm font-bold" showNote={false} />
                          </div>

                          <div className="px-6 py-4 flex justify-between items-center bg-blue-50/50">
                            <div>
                              <p className="text-sm font-bold text-blue-600">Deposit Processing Fee</p>
                              <p className="text-[11px] text-blue-400 mt-0.5">0.5% — collected at funding</p>
                            </div>
                            <CurrencyEstimate usdAmount={depositFeeUSD} prefix="+" className="text-blue-600 text-sm font-bold" showNote={false} />
                          </div>

                          <div className="px-6 py-4 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-bold text-slate-900">Settlement Fee</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{fees.settlementPercent}% — deducted at release</p>
                            </div>
                            <CurrencyEstimate usdAmount={settlementFeeUSD} prefix="-" className="text-slate-900 text-sm font-bold" showNote={false} />
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t-2 border-slate-200 bg-slate-50">
                          <div className="px-6 py-4 flex justify-between items-center">
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">You pay today</p>
                            <CurrencyEstimate usdAmount={totalClientPays} className="text-emerald-600 text-xl font-bold" />
                          </div>
                          <div className="px-4 sm:px-6 pb-4 flex justify-between items-center">
                            <p className="text-xs text-slate-500 font-medium">Freelancer receives at release</p>
                            <CurrencyEstimate usdAmount={freelancerReceives} className="text-emerald-600 text-sm font-bold" showNote={false} />
                          </div>
                        </div>
                      </div>

                      {/* Beneficiary Card */}
                      <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Beneficiary</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{freelancerEmail || "Not assigned"}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-100 w-fit">
                          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                          <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified on accept</span>
                        </div>
                      </div>

                      {/* Security Banner */}
                      <div className="relative bg-linear-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 flex gap-4 overflow-hidden">
                        <div className="relative p-2.5 bg-white rounded-xl h-fit border border-emerald-100 shadow-sm">
                          <Lock className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="relative">
                          <h4 className="text-sm font-bold text-slate-900">
                            Protected by Dayle Settlement
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Funds are locked in a secure vault. Release requires
                            {" "}<span className="text-emerald-600 font-semibold">manual client sign-off</span>. 
                            Disputes are resolved through our mediation process.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => paginate(-1)}
                disabled={step === 1 || isDeploying}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 shadow-sm border border-slate-200 font-bold h-12 px-6 rounded-xl w-full sm:w-auto transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => paginate(1)}
                  disabled={!canContinue}
                  className={cn(
                    "h-12 px-10 rounded-xl font-bold transition-all w-full sm:w-auto",
                    canContinue
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                      : "bg-slate-100 text-slate-400 border border-slate-200",
                  )}
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="h-12 px-12 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md w-full sm:w-auto disabled:opacity-50 transition-all"
                >
                  {isDeploying ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">
                        Initializing project
                      </span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-1 h-1 bg-white rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    "Start project"
                  )}
                </Button>
              )}
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-slate-400">
          <DayleLogo className="w-4 h-4 opacity-50" />
          <span className="text-sm tracking-wide font-bold">
            Secured by Dayle settlement protocol
          </span>
        </div>
      </div>
    </div>
  );
}
