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
    Target,
    Users,
    ArrowRight,
    ArrowLeft,
    Check,
    DollarSign,
    FileText,
    Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateVaultPage() {
    const [step, setStep] = useState(1);
    const [milestones, setMilestones] = useState([
        { title: "", requirements: "", amount: "" },
    ]);

    const steps = [
        { id: 1, name: "Basics", icon: Hash },
        { id: 2, name: "Milestones", icon: ListChecks },
        { id: 3, name: "Assign", icon: Users },
        { id: 4, name: "Review", icon: ShieldCheck },
    ];

    const addMilestone = () => {
        setMilestones([...milestones, { title: "", requirements: "", amount: "" }]);
    };

    const removeMilestone = (index) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-[calc(100vh-80px)]bg-[#0A0A0A] font-sans">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-semibold text-white mb-3">Create New Vault</h1>
                    <p className="text-gray-400 text-sm">Secure capital release with milestone-based execution</p>
                </div>

                {/* Minimal Progress Tracker */}
                <div className="flex items-center justify-between mb-16 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
                    {steps.map((s, i) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                            <button
                                onClick={() => setStep(s.id)}
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                                    step === s.id ? "bg-white border-white text-black shadow-lg" :
                                        step > s.id ? "bg-emerald-500 border-emerald-500 text-white" :
                                            "bg-black border-gray-800 text-gray-500 hover:border-gray-600"
                                )}
                            >
                                {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                            </button>
                            <span className={cn(
                                "text-xs font-medium absolute -bottom-8 whitespace-nowrap",
                                step === s.id ? "text-white" : "text-gray-500"
                            )}>
                                {s.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-[#0A0A0A] rounded-sm p-6 md:p-8 border border-gray-900">

                    {/* STEP 1: CORE PARAMETERS */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Vault Details</h2>
                                <p className="text-gray-400 text-sm">Define the purpose and scope of this vault</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-300">Vault Title</Label>
                                    <Input
                                        placeholder="Q1 Infrastructure Expansion"
                                        className="bg-transparent border-white/10 h-12 rounded-none px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-300">Description</Label>
                                    <Textarea
                                        placeholder="Describe the objective, deliverables, and success criteria..."
                                        className="bg-transparent border-white/10 rounded-none p-4 text-white min-h-[120px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-gray-400 text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Keep it concise. You can add detailed specifications later.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MILESTONES */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Payment Milestones</h2>
                                <p className="text-gray-400 text-sm">Define release triggers and amounts</p>
                            </div>

                            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                                {milestones.map((m, i) => (
                                    <div key={i} className="p-6 bg-black/40 border border-gray-800 rounded-xl space-y-4 hover:border-gray-700 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <span className="text-emerald-500 text-sm font-medium">{i + 1}</span>
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-300">Milestone {i + 1}</h3>
                                            </div>
                                            {milestones.length > 1 && (
                                                <button
                                                    onClick={() => removeMilestone(i)}
                                                    className="text-gray-500 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium text-gray-400">Title</Label>
                                                <Input
                                                    placeholder="e.g., Initial Setup Complete"
                                                    className="bg-transparent border-white/10 h-10 rounded-none px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-gray-400 text-sm"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-gray-400">Amount</Label>
                                                    <div className="relative">
                                                        {/* <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /> */}
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="bg-transparent border-white/10 h-10 rounded-none pl-9 pr-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-white placeholder:text-gray-400 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-gray-400">Due Date</Label>
                                                    <Input
                                                        type="date"
                                                        className="bg-transparent border-white/10 h-10 rounded-none px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white text-sm [color-scheme:dark] placeholder:text-gray-400"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium text-gray-400">Verification Requirements</Label>
                                                <Textarea
                                                    placeholder="What needs to be delivered or verified..."
                                                    className="bg-transparent border-white/10 rounded-none p-3 text-white min-h-[80px] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-gray-400 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={addMilestone}
                                className="w-full h-12 rounded-sm border-dashed border-gray-700 hover:border-emerald-500 bg-emerald-500 text-black font-medium transition-all"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Milestone
                            </Button>
                        </div>
                    )}

                    {/* STEP 3: TALENT */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white">Assign Counterparty</h2>
                                <p className="text-gray-400 text-sm">Who will receive payments upon milestone completion</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-300">Recipient Email</Label>
                                    <Input
                                        placeholder="contractor@example.com"
                                        className="bg-transparent border-white/10 h-12 rounded-none px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white placeholder:text-gray-400"
                                    />
                                </div>


                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="space-y-2 text-center">
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-sm flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                    <Lock className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-semibold text-white">Review & Deploy</h2>
                                <p className="text-gray-400 text-sm">Confirm details before locking funds</p>
                            </div>

                            <div className="space-y-4 bg-black/40 rounded-sm p-6 border border-gray-800">
                                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                                    <span className="text-sm text-gray-400">Total Capital</span>
                                    <span className="text-xl font-semibold text-white">$1,500.00</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                                    <span className="text-sm text-gray-400">Milestones</span>
                                    <span className="text-xl font-semibold text-white">{milestones.length}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-400">Escrow Fee</span>
                                    <span className="text-xl font-semibold text-emerald-500">1.5%</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-black/30 rounded-sm border border-gray-800">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FileText className="w-3 h-3 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 font-medium">Terms & Conditions</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            By deploying, you agree to the escrow terms. Funds will be locked until milestones are verified.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-900">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            className={cn(
                                "text-gray-400 hover:text-white font-medium h-11 px-5 rounded-sm hover:bg-white/5 transition-all",
                                step === 1 && "invisible"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>

                        {step < 4 ? (
                            <Button
                                onClick={() => setStep(s => Math.min(4, s + 1))}
                                className="bg-white text-black hover:bg-gray-200 px-8 h-11 rounded-sm font-medium transition-all"
                            >
                                Continue <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Link href="/checkout/new-vault-id">
                                <Button
                                    className="bg-emerald-500 text-black hover:bg-emerald-400 px-10 h-12 rounded-sm font-medium shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    Deploy Vault
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">
                        Funds are held in secure escrow. All transactions are recorded on-chain.
                    </p>
                </div>
            </div>
        </div>
    );
}