"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Shield,
    CreditCard,
    User,
    Lock,
    HelpCircle,
    Activity,
    ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SupportForm from "@/components/shared/SupportForm";

const categories = [
    {
        title: "Payments & Payouts",
        desc: "Vault release issues, payout delays, and fees.",
        icon: CreditCard,
        color: "emerald",
    },
    {
        title: "Account & Profile",
        desc: "Login issues, 2FA, and identity verification.",
        icon: User,
        color: "blue",
    },
    {
        title: "Security",
        desc: "Suspected fraud, privacy, and vault protection.",
        icon: Lock,
        color: "purple",
    },
    {
        title: "General Help",
        desc: "How-to guides and platform navigation.",
        icon: HelpCircle,
        color: "orange",
    },
];


export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-['Poppins',_sans-serif]">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-4 md:px-6">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-emerald-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-black stroke-[3px]" />
                        </div>
                        <span className="font-black tracking-tighter text-lg md:text-xl uppercase hidden sm:inline">
                            Dayle
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">
                                Systems Operational
                            </span>
                        </div>
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-black uppercase tracking-wide px-4 rounded-xl hover:bg-white/5 text-white/70 hover:text-white">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 blur-[120px] -z-10 rounded-full" />

                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
                            How can we <span className="text-emerald-500">help?</span>
                        </h1>
                        <p className="mt-4 text-white/50 text-sm md:text-lg font-medium max-w-2xl mx-auto">
                            Find solutions to common issues or reach out to our dedicated support team.
                        </p>
                    </motion.div>

                </div>
            </section>

            {/* Category Grid */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group p-6 rounded-[32px] bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-emerald-500 group-hover:border-emerald-600`}>
                                    <cat.icon className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold uppercase mb-2 group-hover:text-emerald-500 transition-colors">
                                    {cat.title}
                                </h3>
                                <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                                    {cat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Contact Section */}
            <section className="py-24 px-4 md:px-6 relative">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                                Can't find an <br /> <span className="text-emerald-500">answer?</span>
                            </h2>
                            <p className="mt-6 text-white/50 text-sm md:text-base leading-relaxed font-medium">
                                Our support engineers are ready to assist you with complex vault issues and technical questions.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                                <Activity className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase">Quick Turnaround</h4>
                                    <p className="text-white/40 text-xs mt-1">Average response time: &lt; 24 hours</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                                <Shield className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase">Secured Tickets</h4>
                                    <p className="text-white/40 text-xs mt-1">Encrypted communication channel</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-[40px] p-6 md:p-10 shadow-2xl relative"
                    >
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                        <SupportForm />
                    </motion.div>
                </div>
            </section>

            {/* Footer CTA */}
            <footer className="py-20 border-t border-white/5 text-center">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-white/40 hover:text-white transition-colors uppercase font-black tracking-widest text-[10px]">
                        <ArrowLeft className="w-4 h-4" /> Back to Dayle
                    </Button>
                </Link>
            </footer>
        </div>
    );
}
