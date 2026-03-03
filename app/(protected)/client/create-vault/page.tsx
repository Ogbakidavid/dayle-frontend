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
  const [deliverables, setDeliverables] = useState<
    { title: string; description: string; id: string }[]
  >([{ title: "", description: "", id: crypto.randomUUID() }]);

  const handleAddDeliverable = () => {
    if (deliverables.length < 10) {
      setDeliverables([
        ...deliverables,
        { title: "", description: "", id: crypto.randomUUID() },
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
    field: "title" | "description",
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

  const budget = Number(budgetAmount) || 0;

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
    budget > 0 &&
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
        type: vaultPurpose,
        description: vaultDescription,
        totalAmount: budget,
        idempotencyKey,
        deliverables: deliverables.map(({ title, description }) => ({
          title,
          description,
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
    <div className="min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-400 font-['Poppins',sans-serif]">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[95%] mx-auto px-6 py-12 lg:py-20">
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-[0.2em] mb-4">
              <Lock className="w-3 h-3" /> Secure project account
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              New <span className="text-emerald-500">project</span>
            </h1>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <Link href="/client">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white text-[10px] font-bold tracking-widest transition-all"
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
                      : "text-white/40",
                  )}
                >
                  <s.icon className="w-4 h-4" />
                  <span className="text-xs tracking-widest text-inherit">
                    {s.name}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8">
            <div className="relative min-h-[500px] bg-background border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
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
                        <Label className="text-[10px] tracking-[0.2em] text-white/40 font-bold">
                          1. Select project type
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                                      : "bg-white/2 border-white/5 hover:border-white/20",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "w-6 h-6 transition-transform group-hover:scale-110",
                                      isActive
                                        ? "text-emerald-500"
                                        : "text-white/30",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold tracking-widest",
                                      isActive ? "text-white" : "text-white/40",
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
                          <Label className="text-[10px] tracking-[0.2em] text-white/40 font-bold">
                            2. Project identity
                          </Label>
                          <Input
                            value={vaultTitle}
                            onChange={(e) => setVaultTitle(e.target.value)}
                            placeholder="Project title"
                            className="bg-muted! border-white/10! h-14 text-lg font-bold placeholder:text-gray-400 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] tracking-[0.2em] text-white/40 font-bold">
                            3. Total allocation
                          </Label>
                          <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:animate-pulse" />
                            <Input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-muted! border-white/10! h-14 pl-12 text-xl font-mono focus:border-emerald-500/50 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] tracking-[0.2em] text-white/40 font-bold">
                            4. Brief description
                          </Label>
                          <Textarea
                            value={vaultDescription}
                            onChange={(e) =>
                              setVaultDescription(e.target.value)
                            }
                            placeholder="Describe the overall scope..."
                            className="bg-muted! border-white/10! min-h-[120px] focus:border-emerald-500/50 rounded-xl text-white/80"
                          />
                        </div>

                        {/* DELIVERABLES CHECKLIST */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-[10px] tracking-[0.2em] text-emerald-500 font-bold">
                                Deliverables checklist (Required)
                              </Label>
                              <p className="text-[10px] text-white/40 font-bold tracking-widest leading-relaxed max-w-sm">
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
                              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] font-bold tracking-widest h-9 rounded-xl transition-all"
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
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}

                                <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-emerald-500 font-mono">
                                          {String(index + 1).padStart(2, "0")}
                                        </span>
                                      </div>
                                      <GripVertical className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" />
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
                                        className="bg-transparent! border-none! h-6 p-0 text-sm font-bold tracking-widest placeholder:text-white/10 focus:ring-0! rounded-none"
                                      />
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
                                        className="bg-transparent! border-white/5! min-h-[60px] p-3 text-xs text-white/40 focus:border-emerald-500/30 rounded-xl leading-relaxed transition-all"
                                      />
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
                        <h2 className="text-2xl font-bold italic tracking-tighter">
                          Assign freelancer
                        </h2>
                        <p className="text-white/40 text-xs font-bold tracking-widest">
                          Identify the project freelancer
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Input
                          value={freelancerEmail}
                          onChange={(e) => setFreelancerEmail(e.target.value)}
                          placeholder="Freelancer email"
                          className="bg-muted! border-white/10! h-14 rounded-xl text-center font-bold tracking-widest placeholder:text-gray-400"
                        />
                        <Input
                          value={freelancerName}
                          onChange={(e) => setFreelancerName(e.target.value)}
                          placeholder="Full name (optional)"
                          className="bg-muted! border-white/10! h-14 rounded-xl text-center font-bold tracking-widest placeholder:text-gray-400"
                        />
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-center">
                          <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                          <p className="text-[10px] text-blue-200/60 leading-relaxed font-bold">
                            Project system will verify user identity upon
                            acceptance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: REVIEW */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tighter italic">
                          Confirm project
                        </h2>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="text-emerald-500 text-[10px] font-bold tracking-widest">
                            System verified
                          </span>
                        </div>
                      </div>

                      {/* Header Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
                          <Label className="text-[12px] font-bold text-white/30 tracking-widest block mb-1">
                            Total value
                          </Label>
                          <p className="text-2xl font-bold text-emerald-500 font-mono">
                            ${budget.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
                          <Label className="text-[12px] font-bold text-white/30 tracking-widest block mb-1">
                            Beneficiary
                          </Label>
                          <p className="text-sm font-bold truncate text-white tracking-wider">
                            {freelancerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Single Deliverable Info */}
                      <div className="bg-black/40 border border-white/3 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono border border-white/5">
                            01
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-widest text-white">
                              {vaultTitle || "Untitled project"}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[12px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                Single release
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Final Security Disclaimer */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl h-fit">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-emerald-500 tracking-widest">
                            Escrow verification system
                          </h4>
                          <p className="text-[10px] text-white/50 mt-1 leading-relaxed font-bold">
                            Funds are locked in a secure project account.
                            Release requires{" "}
                            <span className="text-white">
                              Manual Client Sign-off
                            </span>
                            .
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
                className="text-white/40 hover:text-white text-[10px] font-bold tracking-widest w-full sm:w-auto transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => paginate(1)}
                  disabled={!canContinue}
                  className={cn(
                    "h-12 px-10 rounded-xl font-bold tracking-widest transition-all w-full sm:w-auto",
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
                  className="h-12 px-12 bg-emerald-500 text-black rounded-xl font-bold tracking-widest hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] w-full sm:w-auto disabled:opacity-50 transition-all"
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

          {/* Sidebar Info */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-12">
            <div className="bg-white/2 border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/40 mb-6 italic">
                Project configuration
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-white/20 font-bold">
                    Total value
                  </span>
                  <span className="text-2xl font-bold font-mono">
                    ${budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-white/20">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] tracking-[0.3em] font-bold">
            Secured by Dayle escrow system
          </span>
        </div>
      </div>
    </div>
  );
}
