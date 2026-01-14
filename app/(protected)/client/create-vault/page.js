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
  
  const isStep2Complete = milestones.every(m => 
    m.title.trim() !== "" && m.amount !== "" && m.deliverableType !== ""
  );

  const canContinue = step === 1 ? isStep1Complete : step === 2 ? isStep2Complete : true;

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
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">Create New Vault</h1>
          <p className="text-gray-400 text-sm">Define objective conditions for capital release</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                step === s.id ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : 
                step > s.id ? "bg-emerald-500 text-white border-emerald-500" : "bg-black border-gray-800 text-gray-500"
              )}>
                {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={cn("text-[10px] uppercase tracking-widest font-medium", step === s.id ? "text-white" : "text-gray-600")}>
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
                          vaultPurpose === key ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" : "border-gray-800 bg-black text-gray-500 hover:border-gray-700"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{value.label}</span>
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
                <h2 className="text-lg font-medium text-white italic underline decoration-emerald-500/50 underline-offset-8">
                  {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label} Milestones
                </h2>
              </div>

              {milestones.map((m, i) => (
                <div key={i} className="bg-black border border-gray-800 p-6 rounded-lg space-y-4 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Phase 0{i + 1}</span>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)}>
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
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
                      <Label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Deliverable Type (AI Auditable)</Label>
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
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Automated Verification Protocol</p>
                        </div>
                        <ul className="space-y-1">
                          {m.auditRules.map((r, idx) => (
                            <li key={idx} className="text-[11px] text-gray-400 flex items-center gap-2">
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
                className="w-full border-dashed border-gray-800 text-gray-400 hover:text-white hover:bg-white/5 h-12"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Next Milestone
              </Button>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-between mt-12 pt-6 border-t border-gray-900">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="text-gray-500 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canContinue}
                className={cn(
                    "px-8 h-11 transition-all",
                    canContinue ? "bg-white text-black hover:bg-emerald-500 hover:text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"
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
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-tighter font-medium">Secured by Skentral Escrow Protocol</span>
        </div>
      </div>
    </div>
  );
}