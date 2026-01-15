'use client';

import { useState } from "react";
import Link from 'next/link';
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
  Hash,
  Sparkles,
  Code,
  Palette,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -----------------------------
   PURPOSE-DRIVEN DELIVERABLES
--------------------------------*/
const VAULT_PURPOSE_MAPPING = {
  development: {
    label: "Development",
    icon: Code,
    deliverables: [
      { id: "github_repo", label: "GitHub Repository", rules: ["Repository exists", "Commit after vault date", "Source code detected"] },
      { id: "api_endpoint", label: "Live API Endpoint", rules: ["URL reachable", "Returns 200 OK", "JSON schema valid"] }
    ]
  },
  design: {
    label: "Design",
    icon: Palette,
    deliverables: [
      { id: "figma_link", label: "Figma File", rules: ["Link is valid", "Access granted", "Last modified after vault date"] },
      { id: "asset_pack", label: "Design Assets (ZIP)", rules: ["File uploaded", "Minimum size 5MB", "PDF/SVG/PNG detected"] }
    ]
  },
  content_ai: {
    label: "Content & AI",
    icon: Sparkles,
    deliverables: [
      { id: "doc_submission", label: "Technical Document", rules: ["Word count > 500", "No plagiarism detected", "English language"] },
      { id: "ai_dataset", label: "JSON Dataset", rules: ["Valid JSON format", "Minimum entries detected"] }
    ]
  }
};

export default function CreateVaultPage() {
  const [step, setStep] = useState(1);

  // Step 1 State
  const [vaultPurpose, setVaultPurpose] = useState("");
  const [vaultTitle, setVaultTitle] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  // Step 3 State
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [freelancerName, setFreelancerName] = useState("");

  // Step 2 State
  const [milestones, setMilestones] = useState([
    { title: "", amount: "", dueDate: "", deliverableType: "", auditRules: [] }
  ]);

  const steps = [
    { id: 1, name: "Basics", icon: Hash },
    { id: 2, name: "Milestones", icon: ListChecks },
    { id: 3, name: "Assign", icon: Users },
    { id: 4, name: "Review", icon: ShieldCheck },
  ];

  /* -----------------------------
     VALIDATION LOGIC
  --------------------------------*/
  const isStep1Complete = vaultTitle.trim() !== "" && vaultPurpose !== "" && vaultDescription.trim() !== "";

  const isStep2Complete = milestones.length > 0 && milestones.every(m =>
    m.title.trim() !== "" && m.amount !== "" && m.deliverableType !== ""
  );

  const isStep3Complete = freelancerEmail.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail);

  const canContinue =
    step === 1 ? isStep1Complete :
      step === 2 ? isStep2Complete :
        step === 3 ? isStep3Complete :
          true;

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", amount: "", dueDate: "", deliverableType: "", auditRules: [] }]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);

    // Update total amount
    const total = updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    setTotalAmount(total);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">Create New Vault</h1>
          <p className="text-white/70 text-base">Define objective conditions for capital release</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                step === s.id ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" :
                  step > s.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-black border-gray-800 text-white/50"
              )}>
                {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={cn("text-xs uppercase tracking-widest font-medium", step === s.id ? "text-white" : "text-white/40")}>
                {s.name}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-[#0D0D0D] border border-gray-900 rounded-lg p-8 shadow-xl">

          {/* STEP 1: BASICS / PURPOSE */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-200">What work are you securing payment for? *</Label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(VAULT_PURPOSE_MAPPING).map(([key, value]) => {
                    const Icon = value.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setVaultPurpose(key)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 border rounded-md transition-all",
                          vaultPurpose === key ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" : "border-gray-800 bg-black text-white/50 hover:border-gray-700"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{value.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-200">Vault Title *</Label>
                  <Input
                    value={vaultTitle}
                    onChange={(e) => setVaultTitle(e.target.value)}
                    placeholder="e.g., Q1 Mobile App Sprint"
                    className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-200">Brief Description *</Label>
                  <Textarea
                    value={vaultDescription}
                    onChange={(e) => setVaultDescription(e.target.value)}
                    placeholder="Describe the overall scope and deliverables..."
                    className="bg-black border-gray-800 min-h-[120px] focus:border-emerald-500 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PURPOSE-DRIVEN MILESTONES */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-white underline decoration-emerald-500/50 underline-offset-8">
                  {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label} Milestones
                </h2>
              </div>

              {milestones.map((m, i) => (
                <div key={i} className="bg-black border border-gray-800 p-6 rounded-lg space-y-4 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-500 font-bold uppercase tracking-tighter">Phase 0{i + 1}</span>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)}>
                        <Trash2 className="w-4 h-4 text-white/40 hover:text-red-500 transition-colors" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      placeholder="What is being delivered?"
                      value={m.title}
                      onChange={e => updateMilestone(i, "title", e.target.value)}
                      className="bg-[#0A0A0A] border-gray-800 text-white h-11"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">$</span>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={m.amount}
                          onChange={e => updateMilestone(i, "amount", e.target.value)}
                          className="bg-[#0A0A0A] border-gray-800 text-white pl-7 h-11"
                        />
                      </div>
                      <Input
                        type="date"
                        value={m.dueDate}
                        onChange={e => updateMilestone(i, "dueDate", e.target.value)}
                        className="bg-[#0A0A0A] border-gray-800 text-white h-11 [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/70 uppercase font-bold tracking-widest">Deliverable Type (AI Auditable)</Label>
                      <select
                        value={m.deliverableType}
                        onChange={e => {
                          const deliverables = VAULT_PURPOSE_MAPPING[vaultPurpose].deliverables;
                          const selected = deliverables.find(d => d.id === e.target.value);
                          updateMilestone(i, "deliverableType", selected?.id || "");
                          updateMilestone(i, "auditRules", selected?.rules || []);
                        }}
                        className="w-full bg-[#0A0A0A] border border-gray-800 text-white p-3 text-sm rounded-md focus:border-emerald-500 outline-none"
                      >
                        <option value="">Choose deliverable for {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label}</option>
                        {VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables.map(d => (
                          <option key={d.id} value={d.id}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    {m.auditRules.length > 0 && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Automated Verification Protocol</p>
                        </div>
                        <ul className="space-y-1">
                          {m.auditRules.map((r, idx) => (
                            <li key={idx} className="text-xs text-white/70 flex items-center gap-2">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addMilestone}
                className="w-full border-dashed border-gray-800 text-white/70 hover:text-white hover:bg-white/5 h-12 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Next Milestone
              </Button>
            </div>
          )}

          {/* STEP 3: ASSIGN FREELANCER */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-medium text-white">Who is this vault for?</h2>
                <p className="text-white/70 text-sm mt-1">Assign a freelancer to this vault to begin the collaboration.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-200">Freelancer Email Address *</Label>
                  <Input
                    type="email"
                    value={freelancerEmail}
                    onChange={(e) => setFreelancerEmail(e.target.value)}
                    placeholder="freelancer@example.com"
                    className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white"
                  />
                  <p className="text-xs text-white/50">If they don't have an account, they'll be invited to join Cleard.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-200">Freelancer Name (Optional)</Label>
                  <Input
                    value={freelancerName}
                    onChange={(e) => setFreelancerName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex gap-4">
                  <div className="p-2 bg-emerald-500/20 rounded-md h-fit">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Secure Invitation</h4>
                    <p className="text-sm text-white/70 mt-1 leading-relaxed">
                      Upon deployment, the freelancer will receive a secure invitation link to view the vault conditions and accept the assignment. Capital remains locked until conditions are met.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DEPLOY */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-medium text-white">Review Vault Setup</h2>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider">Ready to Deploy</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Basic Info Summary */}
                <div className="bg-black border border-gray-800 p-6 rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">Vault Title</h3>
                      <p className="text-lg text-white font-medium mt-1">{vaultTitle}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">Total Value</h3>
                      <p className="text-2xl text-emerald-500 font-bold mt-1">${totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white/50 uppercase tracking-widest">Purpose</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const Icon = VAULT_PURPOSE_MAPPING[vaultPurpose]?.icon || Hash;
                        return <Icon className="w-4 h-4 text-emerald-500" />;
                      })()}
                      <span className="text-sm text-white">{VAULT_PURPOSE_MAPPING[vaultPurpose]?.label}</span>
                    </div>
                  </div>
                </div>

                {/* Freelancer Summary */}
                <div className="bg-black border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white/70" />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase font-bold tracking-widest">Assigned Freelancer</p>
                      <p className="text-sm text-white font-medium">{freelancerName || "Unnamed Freelancer"}</p>
                      <p className="text-sm text-white/70">{freelancerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Milestones Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm text-white/50 uppercase font-bold tracking-widest ml-1">Milestones ({milestones.length})</h3>
                  {milestones.map((m, i) => (
                    <div key={i} className="bg-black border border-gray-800 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-sm text-white/70 font-mono">
                          0{i + 1}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{m.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-sm text-white/70 capitalize">{m.deliverableType.replace("_", " ")} Verification</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white font-mono font-bold">${Number(m.amount).toLocaleString()}</p>
                        <p className="text-sm text-white/70 mt-1">{m.dueDate || "No due date"}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Audit & Release Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-4">
                  <div className="p-2 bg-amber-500/20 rounded-md h-fit">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Escrow Protocol & AI Audit</h4>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                      By deploying this vault, you agree that capital release is <span className="text-white font-medium">automated via AI audit</span>. Milestones unlock sequentially (01 → 02 → 03). You cannot manually release funds, but you maintain the right to view evidence and raise disputes if automated checks pass incorrectly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-900">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canContinue}
                className={cn(
                  "px-8 h-11 transition-all text-sm",
                  canContinue ? "bg-white text-black hover:bg-emerald-500 hover:text-white" : "bg-gray-800 text-white/40 cursor-not-allowed"
                )}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Link href="/checkout/new-vault-id">
                <Button className="bg-emerald-500 text-black px-10 h-11 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20">
                  Deploy Vault
                </Button>
              </Link>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/30">
          <Lock className="w-3 h-3" />
          <span className="text-sm uppercase tracking-tighter font-medium">Secured by Cleard Escrow Protocol</span>
        </div>
      </div>
    </div>
  );
}