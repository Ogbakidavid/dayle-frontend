'use client';

import { useState } from "react";
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
    Target,
    Zap,
    Users,
    ArrowRight,
    ArrowLeft,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateVaultPage() {
    const [step, setStep] = useState(1);
    const [milestones, setMilestones] = useState([
        { title: "", requirements: "", amount: "" },
    ]);

    const steps = [
        { id: 1, name: "Core Parameters", icon: Target },
        { id: 2, name: "Execution Path", icon: ListChecks },
        { id: 3, name: "Talent Assignment", icon: Users },
        { id: 4, name: "Review & Deploy", icon: ShieldCheck },
    ];

    const addMilestone = () => {
        setMilestones([...milestones, { title: "", requirements: "", amount: "" }]);
    };

    const removeMilestone = (index) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#050505] p-6 lg:p-12 font-['Poppins',_sans-serif]">
            <div className="max-w-4xl mx-auto">

                {/* PROGRESS TRACKER */}
                <div className="flex items-center justify-between mb-16 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
                    {steps.map((s, i) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                step === s.id ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" :
                                    step > s.id ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" :
                                        "bg-[#080808] border-white/10 text-slate-600"
                            )}>
                                {step > s.id ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] absolute -bottom-8 whitespace-nowrap",
                                step === s.id ? "text-white" : "text-slate-600"
                            )}>
                                {s.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* FORM CONTAINER */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative">

                    {/* STEP 1: CORE PARAMETERS */}
                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Identity & Scope</h2>
                                <p className="text-slate-500 text-base font-medium">Define the high-level identity of this financial vault.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-emerald-500/70 ml-1">Contract Title</Label>
                                    <Input
                                        placeholder="e.g. Q1 Infrastructure Expansion"
                                        className="!bg-[#0a0a0a] border-white/10 h-20 rounded-2xl px-8 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-xl placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] autofill:text-fill-white"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-emerald-500/70 ml-1">Technical Summary</Label>
                                    <Textarea
                                        placeholder="Describe the objective of this vault..."
                                        className="!bg-[#0a0a0a] border-white/10 rounded-2xl p-8 text-white min-h-[200px] focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all text-lg placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MILESTONES */}
                    {step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Execution Roadmap</h2>
                                <p className="text-slate-500 text-base font-medium">Break down the capital release triggers.</p>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                {milestones.map((m, i) => (
                                    <div key={i} className="p-8 bg-black/40 border border-white/5 rounded-[32px] space-y-6 relative group hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10">Node 0{i + 1}</span>
                                            {milestones.length > 1 && (
                                                <button onClick={() => removeMilestone(i)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Title</Label>
                                                <Input
                                                    placeholder="Milestone Title"
                                                    className="!bg-[#0a0a0a] border-white/10 h-16 rounded-xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-slate-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Value</Label>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">$</span>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="!bg-[#0a0a0a] border-white/10 h-16 rounded-xl pl-10 px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg font-mono placeholder:text-slate-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Verification Logic</Label>
                                            <Textarea
                                                placeholder="Verification requirements..."
                                                className="!bg-[#0a0a0a] border-white/10 rounded-xl p-6 text-white min-h-[100px] focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all text-base placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                onClick={addMilestone}
                                className="w-full h-20 rounded-[24px] border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-500 font-black uppercase tracking-widest text-xs gap-3 transition-all"
                            >
                                <Plus className="w-5 h-5" /> Append Protocol Node
                            </Button>
                        </div>
                    )}

                    {/* STEP 3: TALENT */}
                    {step === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3 text-center py-10">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                                    <Users className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Assign Counterparty</h2>
                                <p className="text-slate-500 text-lg font-medium max-w-md mx-auto mt-4">Enter the email of the service provider who will fulfill the milestones.</p>
                            </div>

                            <div className="max-w-xl mx-auto pb-10">
                                <Input
                                    placeholder="talent@workspace.com"
                                    className="!bg-[#0a0a0a] border-white/10 h-24 rounded-[32px] px-8 text-center text-2xl !text-white focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center py-6">
                            <div className="w-32 h-32 bg-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(16,185,129,0.4)] animate-pulse">
                                <Lock className="w-16 h-16 text-black stroke-[3px]" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Ready for Deployment</h2>
                                <p className="text-slate-500 text-lg font-medium">Review the protocol parameters before locking capital.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-left mt-16 max-w-2xl mx-auto">
                                <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Total Capital</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">$1,500.00</p>
                                </div>
                                <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/10 transition-colors">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Milestone Nodes</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">{milestones.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NAVIGATION BUTTONS */}
                    <div className="flex items-center justify-between mt-16 pt-12 border-t border-white/5">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className={cn("text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs h-14 px-6 rounded-xl hover:bg-white/5", step === 1 && "invisible")}
                        >
                            <ArrowLeft className="w-5 h-5 mr-3" /> Back
                        </Button>

                        {step < 4 ? (
                            <Button
                                onClick={() => setStep(s => Math.min(4, s + 1))}
                                className="bg-white text-black hover:bg-emerald-500 hover:text-black transition-all px-10 h-16 rounded-2xl font-black uppercase tracking-widest text-sm group shadow-lg shadow-white/5"
                            >
                                Continue <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                className="bg-emerald-500 text-black hover:bg-emerald-400 px-12 h-20 rounded-2xl font-black uppercase tracking-widest text-base shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all transform hover:-translate-y-1"
                            >
                                Fund & Deploy Vault
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}