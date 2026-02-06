"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SupportForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        description: "",
        priority: "low",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Randomized outcome for demonstration
        if (Math.random() > 0.05) {
            setStatus("success");
        } else {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-12 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-3xl"
            >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Message Sent</h3>
                <p className="text-white/60 max-w-sm mb-8 font-medium">
                    Our team has received your request. We follow up on all inquiries within 24 business hours.
                </p>
                <Button
                    onClick={() => setStatus("idle")}
                    variant="outline"
                    className="rounded-xl border-white/10 text-white hover:bg-white/5 uppercase tracking-widest font-bold px-8"
                >
                    Send another
                </Button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">Name</Label>
                    <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 transition-all h-12"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 transition-all h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">Subject</Label>
                    <Select
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        required
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 transition-all h-12 w-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-white/10 text-white">
                            <SelectItem value="payments">Payments & Payouts</SelectItem>
                            <SelectItem value="account">Account Access</SelectItem>
                            <SelectItem value="security">Security Concern</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="other">Other Inquiry</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority" className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">Priority</Label>
                    <Select
                        defaultValue="low"
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 transition-all h-12 w-full">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-white/10 text-white">
                            <SelectItem value="low">Low - General Question</SelectItem>
                            <SelectItem value="medium">Medium - Functional Issue</SelectItem>
                            <SelectItem value="high">High - Payment Problem</SelectItem>
                            <SelectItem value="urgent">Urgent - Security/Down</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Please describe your issue in detail..."
                    required
                    className="bg-white/5 border-white/10 rounded-xl focus:border-emerald-500/50 transition-all min-h-[120px] resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <AnimatePresence mode="wait">
                {status === "error" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-semibold"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        Something went wrong. Please try again.
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest h-14 rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Transmitting...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Request
                    </>
                )}
            </Button>
        </form>
    );
}
