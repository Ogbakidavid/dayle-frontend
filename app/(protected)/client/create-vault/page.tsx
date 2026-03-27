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
import { DayleLogo } from "@/components/shared/DayleLogo";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { useUser } from "@/lib/store/user-context";
import { useRates } from "@/lib/store/rates-context"


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
  const [[page, direction], setPage] = useState([1, 0]);
  const step = page;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // State
  const [vaultPurpose, setVaultPurpose] = useState<string>("");
  const [vaultTitle, setVaultTitle] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [freelancerName, setFreelancerName] = useState("");
  // Default to stable currency
  const [deliverables, setDeliverables] = useState<
    { title: string; description: string; id: string; submissionType: SubmissionType }[]
  >([{ title: "", description: "", id: crypto.randomUUID(), submissionType: SubmissionType.FILE }]);


  const handleAddDeliverable = () => {
    if (deliverables.length < 10) {
      setDeliverables([
        ...deliverables,
        { title: "", description: "", id: crypto.randomUUID(), submissionType: SubmissionType.FILE },
      ]);
    }

  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((d) => d.id !== id));
    }
  };

  const updateDeliverable = (
    id: string,
    field: "title" | "description" | "submissionType",
    value: string,
  ) => {
    setDeliverables(
      deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };



  const steps = [
    { id: 1, name: "Basics", icon: Info },
    { id: 2, name: "Assign", icon: Users },
    { id: 3, name: "Review", icon: ShieldCheck },
  ];

  const { user } = useUser();
  const { rates } = useRates();
  const currencySymbol = user?.country === "Kenya" ? "KSh" : "₦";
  const currencyCode = user?.country === "Kenya" ? "KES" : "NGN";

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

  const getDeliverableLabel = (deliverableId: string) => {
    const purposeData = (VAULT_PURPOSE_MAPPING as any)[vaultPurpose];
    const list = purposeData?.deliverables || [];
    return (
      list.find((d: any) => d.id === deliverableId)?.label || deliverableId
    );
  };

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
        totalAmount: budgetUSD,
        localAmount: budget,
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
      router.push(`/checkout/${newVault.id}?idem=${idempotencyKey}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-400 font-primary">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-20">
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-0 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500  font-bold tracking-[0.2em] mb-4">
              Secure project settlement
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter ">
              New <span className="text-emerald-500">project</span>
            </h1>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <Link href="/client">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-900 hover:text-emerald-500 text-sm font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to dashboard
              </Button>
            </Link>

            {/* Stepper (Desktop) */}
            <nav className="hidden md:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                    step === s.id
                      ? "bg-white text-black font-bold"
                      : "text-slate-900",
                  )}
                >
                  <s.icon className="w-4 h-4" />
                  <span className="text-sm st text-inherit">{s.name}</span>
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Interface */}
        <div className="max-w-3xl mx-auto">
          <main className="w-full">
            <div className="relative min-h-[400px] sm:min-h-[500px] bg-background border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* STEP 1: BASICS */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-sm md:text-sm r text-slate-900 font-bold">
                          1. Select project type
                        </Label>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(VAULT_PURPOSE_MAPPING).map(
                            ([key, value]) => {
                              const Icon = value.icon;
                              const isActive = vaultPurpose === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => setVaultPurpose(key)}
                                  className={cn(
                                    "group relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                                    isActive
                                      ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                                      : "bg-white/2 border-slate-900/5 hover:border-slate-900/20",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "w-6 h-6 transition-transform group-hover:scale-110",
                                      isActive
                                        ? "text-emerald-500"
                                        : "text-slate-900",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "text-sm md:text-sm font-bold st",
                                      isActive
                                        ? "text-slate-900"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {value.label}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm md:text-sm r text-slate-900 font-bold">
                            2. Project identity
                          </Label>
                          <Input
                            value={vaultTitle}
                            onChange={(e) => setVaultTitle(e.target.value)}
                            placeholder="Project title"
                            className="bg-muted! border-white/10! h-14 text-lg text-slate-900 font-medium placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm md:text-sm r text-slate-900 font-bold">
                            4. Total allocation ({currencyCode})
                          </Label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold group-focus-within:animate-pulse">
                              {currencySymbol}
                            </div>
                            <Input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-muted! border-white/10! h-14 pl-14 text-xl  text-slate-900 font-medium focus:border-emerald-500/50 rounded-xl"
                            />
                          </div>
                          {budget > 0 && (
                            <div className="mt-2 px-1 flex items-center gap-2">
                              <span className="text-slate-500 text-xs font-bold">Estimated:</span>
                              <div className="bg-slate-100 rounded-md px-2 py-0.5 text-slate-900 text-xs font-bold">
                                ${budgetUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm md:text-sm r text-slate-900 font-bold">
                            5. Brief description
                          </Label>
                          <Textarea
                            value={vaultDescription}
                            onChange={(e) =>
                              setVaultDescription(e.target.value)
                            }
                            placeholder="Describe the overall scope..."
                            className="bg-muted! border-white/10! min-h-[120px] focus:border-emerald-500/50 rounded-xl text-slate-900 placeholder:text-slate-600 font-medium"
                          />
                        </div>

                        {/* DELIVERABLES CHECKLIST */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex flex-col items-start md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm md:text-sm r text-emerald-500 font-bold">
                                Deliverables checklist (Required)
                              </Label>
                              <p className="text-sm text-slate-900 font-bold r leading-relaxed max-w-sm">
                                Add the specific items the freelancer will
                                deliver. This prevents disputes by making
                                expectations clear.
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={handleAddDeliverable}
                              disabled={deliverables.length >= 10}
                              variant="outline"
                              size="sm"
                              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white  font-bold st h-9 rounded-xl transition-all"
                            >
                              <Plus className="w-3 h-3 mr-2" /> Add Deliverable
                            </Button>
                          </div>

                          <Reorder.Group
                            axis="y"
                            values={deliverables}
                            onReorder={setDeliverables}
                            className="space-y-4"
                          >
                            {deliverables.map((deliverable, index) => (
                              <Reorder.Item
                                key={deliverable.id}
                                value={deliverable}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="group relative bg-white/3 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all cursor-grab active:cursor-grabbing"
                              >
                                {deliverables.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveDeliverable(deliverable.id)
                                    }
                                    className="absolute -top-2 -right-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 shadow-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}

                                <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <span className=" font-bold text-emerald-500 ">
                                          {String(index + 1).padStart(2, "0")}
                                        </span>
                                      </div>
                                      <GripVertical className="w-3 h-3 text-slate-900 group-hover:text-slate-900/30 transition-colors" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <Input
                                        value={deliverable.title}
                                        onChange={(e) =>
                                          updateDeliverable(
                                            deliverable.id,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                        maxLength={100}
                                        placeholder="Deliverable Title (e.g. Frontend UI Components)"
                                        className="bg-transparent! border-none! h-8 p-2 text-slate-900 text-sm font-medium st placeholder:text-slate-600/40 focus:ring-0! rounded-none"
                                      />
                                      {deliverable.title.length > 0 && deliverable.title.length < 5 && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1 px-2 animate-in fade-in slide-in-from-top-1">
                                          <AlertCircle className="w-3 h-3" />
                                          Add more detail — this helps protect you if a dispute arises.
                                        </p>
                                      )}
                                      <Textarea
                                        value={deliverable.description}
                                        onChange={(e) =>
                                          updateDeliverable(
                                            deliverable.id,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        maxLength={500}
                                        placeholder="Brief description of requirements... (Optional)"
                                        className="bg-transparent! border-white/5! min-h-[60px] p-3 text-sm text-slate-900 focus:border-emerald-500/30 rounded-xl leading-relaxed transition-all placeholder:text-slate-600/40"
                                      />
                                      {deliverable.description.length > 0 && deliverable.description.length < 20 && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1 px-2 animate-in fade-in slide-in-from-top-1">
                                          <AlertCircle className="w-3 h-3" />
                                          Add more detail — this helps protect you if a dispute arises.
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { id: SubmissionType.FILE, label: "File Upload" },
                                          { id: SubmissionType.LINK, label: "Link/URL" },
                                          { id: SubmissionType.BOTH, label: "Both" }
                                        ].map((opt) => (
                                          <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => updateDeliverable(deliverable.id, "submissionType", opt.id)}
                                            className={cn(
                                              "px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border",
                                              deliverable.submissionType === opt.id
                                                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                                                : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                                            )}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ASSIGN */}
                  {step === 2 && (
                    <div className="max-w-md mx-auto py-10 space-y-8">
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                          <Users className="w-10 h-10 text-emerald-500 -rotate-12" />
                        </div>
                        <h2 className="text-2xl font-bold  tracking-tighter">
                          Assign freelancer
                        </h2>
                        <p className="text-slate-900 text-sm font-bold st">
                          Identify the project freelancer
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Input
                          value={freelancerEmail}
                          onChange={(e) => setFreelancerEmail(e.target.value)}
                          placeholder="Freelancer email"
                          className="bg-muted! border-white/10! text-slate-900 h-14 rounded-xl text-center font-bold st placeholder:text-slate-600"
                        />
                        <Input
                          value={freelancerName}
                          onChange={(e) => setFreelancerName(e.target.value)}
                          placeholder="Full name (optional)"
                          className="bg-muted! border-white/10! text-slate-900 h-14 rounded-xl text-center font-bold st placeholder:text-slate-600"
                        />
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-center">
                          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                          <p className=" text-slate-600 leading-relaxed font-bold">
                            Project system will verify user identity upon
                            acceptance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: REVIEW */}
                  {step === 3 && (
                    <div className="space-y-6">
                      {/* Invoice Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tighter text-slate-900">
                            Project Summary
                          </h2>
                          <p className="text-sm text-slate-500 font-medium mt-1">
                            Review your project before funding
                          </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-emerald-600 text-xs font-bold tracking-wide uppercase">
                            Ready
                          </span>
                        </div>
                      </div>

                      {/* Project Identity Card */}
                      <div className="bg-slate-900 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <ListChecks className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-base tracking-tight">
                              {vaultTitle || "Untitled project"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold uppercase tracking-wider">
                                {vaultPurpose || "Project"}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-bold uppercase tracking-wider">
                                Single release
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <CurrencyEstimate 
                            usdAmount={budgetUSD} 
                            className="text-white text-2xl font-bold"
                            showNote={false}
                          />
                        </div>
                      </div>

                      {/* Fee Breakdown — Invoice Table */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Description</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Amount</span>
                          </div>
                        </div>

                        {/* Line Items */}
                        <div className="divide-y divide-slate-100">
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
                              <p className="text-[11px] text-slate-600 mt-0.5">{fees.settlementPercent}% — deducted at release</p>
                            </div>
                            <CurrencyEstimate usdAmount={settlementFeeUSD} prefix="-" className="text-slate-900 text-sm font-bold" showNote={false} />
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t-2 border-slate-900 bg-slate-50">
                          <div className="px-6 py-4 flex justify-between items-center">
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">You pay today</p>
                            <CurrencyEstimate usdAmount={totalClientPays} className="text-emerald-600 text-xl font-bold" />
                          </div>
                          <div className="px-6 pb-4 flex justify-between items-center">
                            <p className="text-xs text-slate-500 font-medium">Freelancer receives at release</p>
                            <CurrencyEstimate usdAmount={freelancerReceives} className="text-emerald-600 text-sm font-bold" showNote={false} />
                          </div>
                        </div>
                      </div>

                      {/* Beneficiary Card */}
                      <div className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">Beneficiary</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{freelancerEmail}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified on accept</span>
                        </div>
                      </div>

                      {/* Security Banner */}
                      <div className="relative bg-gradient-linear-r from-slate-900 to-slate-800 rounded-2xl p-5 flex gap-4 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="relative p-2.5 bg-emerald-500/20 rounded-xl h-fit border border-emerald-500/20">
                          <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="relative">
                          <h4 className="text-sm font-bold text-slate-900">
                            Protected by Dayle Settlement
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Funds are locked in a secure vault. Release requires
                            {" "}<span className="text-emerald-400 font-semibold">manual client sign-off</span>. 
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
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => paginate(-1)}
                disabled={step === 1 || isDeploying}
                className="text-slate-900 hover:text-white  font-bold st w-full sm:w-auto transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => paginate(1)}
                  disabled={!canContinue}
                  className={cn(
                    "h-12 px-10 rounded-xl font-bold st transition-all w-full sm:w-auto",
                    canContinue
                      ? "bg-white text-black hover:bg-emerald-500 hover:text-white"
                      : "bg-white/5 text-white/20",
                  )}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="h-12 px-12 bg-emerald-500 text-black rounded-xl font-bold st hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] w-full sm:w-auto disabled:opacity-50 transition-all"
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
                            className="w-1 h-1 bg-black rounded-full"
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
        <div className="mt-12 flex items-center justify-center gap-3 text-slate-900">
          <DayleLogo className="w-4 h-4" />
          <span className="text-sm tracking-[0.3em] font-bold">
            Secured by Dayle settlement protocol
          </span>
        </div>
      </div>
    </div>
  );
}
