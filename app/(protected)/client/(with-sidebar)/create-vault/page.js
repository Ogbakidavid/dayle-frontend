"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Check,
  Info,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";
import { api } from "@/lib/mock-api";

const variants = {
  enter: (direction) => ({
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
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(10px)",
  }),
};

export default function CreateVaultPage() {
  const router = useRouter();
  const [isDeploying, setIsDeploying] = useState(false);
  const [[page, direction], setPage] = useState([1, 0]);
  const step = page;

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  // State
  const [vaultPurpose, setVaultPurpose] = useState("");
  const [vaultTitle, setVaultTitle] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [freelancerName, setFreelancerName] = useState("");

  const [milestones, setMilestones] = useState([
    {
      title: "",
      amount: "",
      dueDate: "",
      deliverableType: "",
      aiVerificationEnabled: true,
      requirementItemsJson: [],
    },
  ]);

  const steps = [
    { id: 1, name: "Basics", icon: Info },
    { id: 2, name: "Milestones", icon: ListChecks },
    { id: 3, name: "Assign", icon: Users },
    { id: 4, name: "Review", icon: ShieldCheck },
  ];

  const budget = Number(budgetAmount) || 0;

  const getDeliverableLabel = (deliverableId) => {
    const list = VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables || [];
    return list.find((d) => d.id === deliverableId)?.label || deliverableId;
  };

  // Validation
  const isStep1Complete = vaultTitle.trim() !== "" && vaultPurpose !== "" && budget > 0;
  const isStep2Complete = milestones.length > 0 && milestones.every(m => m.title.trim() !== "" && m.amount !== "" && m.deliverableType !== "") && totalAmount <= budget;
  const isStep3Complete = freelancerEmail.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail);

  const canContinue = step === 1 ? isStep1Complete : step === 2 ? isStep2Complete : step === 3 ? isStep3Complete : true;

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
    setTotalAmount(updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
  };

  const handleDeploy = () => {
    // Create vault via API with idempotency to simulate safe money action
    const makeIdempotencyKey = () => `idem_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    (async () => {
      setIsDeploying(true);
      const idempotencyKey = makeIdempotencyKey();
      try {
        const payload = {
          title: vaultTitle,
          purpose: vaultPurpose,
          description: vaultDescription,
          totalAmount: totalAmount,
          milestones,
          freelancerEmail,
          freelancerName,
          idempotencyKey,
        };
        const newVault = await api.vaults.create(payload);
        router.push(`/checkout/${newVault.id}?idem=${idempotencyKey}`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeploying(false);
      }
    })();
  };

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 lg:py-20">

        {/* Header Section */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              <Lock className="w-3 h-3" /> Secure Escrow Vault
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              New <span className="text-emerald-500">Vault</span>
            </h1>
          </div>

          {/* Stepper (Desktop) */}
          <nav className="hidden md:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  step === s.id ? "bg-white text-black font-bold" : "text-white/40"
                )}
              >
                <s.icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">{s.name}</span>
              </div>
            ))}
          </nav>
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <main className="lg:col-span-8">
            <div className="relative min-h-[500px] bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
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
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">1. Select Project Type</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(VAULT_PURPOSE_MAPPING).map(([key, value]) => {
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
                                    : "bg-white/2 border-white/5 hover:border-white/20"
                                )}
                              >
                                <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "text-white/30")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-white" : "text-white/40")}>
                                  {value.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">2. Contract Identity</Label>
                          <Input
                            value={vaultTitle}
                            onChange={(e) => setVaultTitle(e.target.value)}
                            placeholder="PROJECT TITLE"
                            className="bg-white/3 border-white/5 h-14 text-lg font-bold placeholder:text-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">3. Total Allocation</Label>
                          <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:animate-pulse" />
                            <Input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-white/3 border-white/5 h-14 pl-12 text-xl font-mono focus:border-emerald-500/50 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">4. Brief Description</Label>
                          <Textarea
                            value={vaultDescription}
                            onChange={(e) => setVaultDescription(e.target.value)}
                            placeholder="Describe the overall scope..."
                            className="bg-white/3 border-white/5 min-h-[120px] focus:border-emerald-500/50 rounded-xl text-white/80"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MILESTONES */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Phases & Governance</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMilestones([...milestones, { title: "", amount: "", dueDate: "", deliverableType: "", aiVerificationEnabled: true, requirementItemsJson: [] }])}
                          className="text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400"
                        >
                          <Plus className="w-3 h-3 mr-2" /> Add Phase
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {milestones.map((m, i) => (
                          <div key={i} className="group relative bg-white/2 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <Input
                                  placeholder={`Phase 0${i + 1} Deliverable Name`}
                                  value={m.title}
                                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                                  className="bg-transparent border-0 border-b border-b-white/20 rounded-none px-0 pb-2 text-sm font-bold uppercase tracking-wider placeholder:text-white/20 h-auto focus-visible:ring-0 focus-visible:border-0 focus-visible:border-b focus-visible:border-b-emerald-500 transition-colors"
                                />
                              </div>
                              <button onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-black/40 rounded-xl p-3 border border-white/3">
                                <Label className="text-[12px] uppercase text-white/30 font-bold block mb-1">Release Amount</Label>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-3 h-3 text-emerald-500" />
                                  <input
                                    type="number"
                                    value={m.amount}
                                    onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                                    className="bg-transparent border-none text-[12px] font-mono focus:outline-none focus-visible:border-0 focus-visible:border-b focus-visible:border-b-emerald-500 focus-visible:ring-0 w-full"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-xl p-3 border border-white/3">
                                <Label className="text-[12px] uppercase text-white/30 font-bold block mb-1">Deadline</Label>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-blue-500" />
                                  <input
                                    type="date"
                                    value={m.dueDate}
                                    onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                                    className="bg-transparent border-none text-[12px] focus:outline-none w-full scheme-dark"
                                  />
                                </div>
                              </div>
                            </div>

                            <select
                              value={m.deliverableType}
                              onChange={(e) => updateMilestone(i, "deliverableType", e.target.value)}
                              className="w-full bg-black border border-white/5 text-[12px] p-3 rounded-xl focus:border-emerald-500/50 outline-none font-bold uppercase tracking-widest text-white/60"
                            >
                              <option value="">Select Deliverable Type</option>
                              {VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables.map((d) => (
                                <option key={d.id} value={d.id}>{d.label}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ASSIGN */}
                  {step === 3 && (
                    <div className="max-w-md mx-auto py-10 space-y-8">
                      <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                          <Users className="w-10 h-10 text-emerald-500 -rotate-12" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Assign Operator</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Identify the vault beneficiary</p>
                      </div>

                      <div className="space-y-4">
                        <Input
                          value={freelancerEmail}
                          onChange={(e) => setFreelancerEmail(e.target.value)}
                          placeholder="OPERATOR EMAIL"
                          className="bg-white/3 border-white/5 h-14 rounded-xl text-center font-bold tracking-widest"
                        />
                        <Input
                          value={freelancerName}
                          onChange={(e) => setFreelancerName(e.target.value)}
                          placeholder="FULL NAME (OPTIONAL)"
                          className="bg-white/3 border-white/5 h-14 rounded-xl text-center font-bold tracking-widest"
                        />
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-center">
                          <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                          <p className="text-[10px] text-blue-200/60 leading-relaxed uppercase font-bold">
                            Vault protocol will verify user identity upon acceptance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-tighter italic">Confirm Deployment</h2>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                        </div>
                      </div>

                      {/* Header Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
                          <Label className="text-[12px] font-bold uppercase text-white/30 tracking-widest block mb-1">Total Value</Label>
                          <p className="text-2xl font-black text-emerald-500 font-mono">${totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-5 bg-white/3 border border-white/5 rounded-2xl">
                          <Label className="text-[12px] font-bold uppercase text-white/30 tracking-widest block mb-1">Beneficiary</Label>
                          <p className="text-sm font-bold truncate text-white uppercase tracking-wider">{freelancerEmail}</p>
                        </div>
                      </div>

                      {/* Milestones Ledger */}
                      <div className="space-y-3">
                        <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Manifest ({milestones.length} Phases)</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {milestones.map((m, i) => (
                            <div key={i} className="bg-black/40 border border-white/3 p-4 rounded-xl flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono border border-white/5">
                                  0{i + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-black uppercase tracking-widest text-white">{m.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[12px] text-emerald-500/70 font-bold uppercase tracking-widest">{getDeliverableLabel(m.deliverableType)}</span>
                                    <span className="text-[12px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase">AI AUDIT ON</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-mono font-black text-white">${Number(m.amount).toLocaleString()}</p>
                                <p className="text-[12px] text-white/20 uppercase font-bold mt-1">{m.dueDate || "NO DATE"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Security Disclaimer */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl h-fit">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Escrow Verification Protocol</h4>
                          <p className="text-[10px] text-white/50 mt-1 leading-relaxed uppercase font-bold">
                            Funds are locked in a secure escrow vault. Release requires <span className="text-white">AI Deliverable Audit</span> and <span className="text-white">Manual Client Sign-off</span>.
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
                className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => paginate(1)}
                  disabled={!canContinue}
                  className={cn(
                    "h-12 px-10 rounded-xl font-black uppercase tracking-widest transition-all w-full sm:w-auto",
                    canContinue ? "bg-white text-black hover:bg-emerald-500 hover:text-white" : "bg-white/5 text-white/20"
                  )}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="h-12 px-12 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] w-full sm:w-auto disabled:opacity-50"
                >
                  {isDeploying ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">Initializing Vault</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 bg-black rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ) : "Deploy Vault"}
                </Button>
              )}
            </div>
          </main>

          {/* Sidebar Info */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-12">
            <div className="bg-white/2 border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 italic">Live Allocation</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black font-mono">${totalAmount}</span>
                  <span className="text-[10px] text-white/20 uppercase font-bold">of ${budget}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full", totalAmount > budget ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalAmount / budget) * 100 || 0, 100)}%` }}
                  />
                </div>
                {totalAmount > budget && (
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">Budget Overflow</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-white/20">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black">
            Secured by Dayle Escrow Protocol
          </span>
        </div>
      </div>
    </div>
  );
}
