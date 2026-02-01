"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, Zap, ArrowRight,
    CheckCircle2, Box, ShieldCheck,
    RefreshCcw, SearchCheck,
    Cpu, Terminal,
    ShieldAlert, Play,
    Activity, ArrowUpRight, Check,
    Sun, Moon, Plus, Minus, Menu, X,
    KeyRound,
    ListChecks,
    Layers,
    Network,
    FileText,
    Briefcase,
    Rocket,
    Blocks
} from 'lucide-react';

import Countries from "./components/Countries";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export default function LandingPage() {
    // State for FAQ toggles and mobile menu
    const [activeFaq, setActiveFaq] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



    const faqs = [
        {
            q: "How does the 'Autonomous Vault' actually work?",
            a: "When a contract is initiated, funds are transferred into a secure escrow vault. These funds are locked and can only be released when pre-defined milestone conditions are met or if both parties agree to a refund."
        },
        {
            q: "What happens if a client refuses to approve a milestone?",
            a: "Dayle includes a built-in Dispute Hub. If a milestone is contested, an independent arbitrator reviews the submitted work against the project scope to ensure a fair resolution."
        },
        {
            q: "Are there any hidden fees for international transfers?",
            a: "No. We use integrated financial rails to provide real-time mid-market exchange rates. You see exactly what you’ll receive before the vault is even funded."
        },
        {
            q: "Is my data and capital insured?",
            a: "Yes. All project capital held in Dayle vaults is covered by our secondary insurance layer, and our infrastructure is SOC-2 Type II compliant with AES-256 encryption."
        }
    ];

    return (
        <div className="min-h-screen transition-colors duration-500 selection:bg-emerald-500/30 antialiased font-['Poppins',_sans-serif] bg-[#050505] text-white">

            {/* Background Sophistication */}
            <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Navigation */}
            <motion.nav
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="fixed top-3 md:top-6 inset-x-0 z-[100] max-w-7xl mx-auto px-3 md:px-6 font-sans"
            >
                <div className="relative">
                    {/* subtle glow */}
                    <div className="absolute inset-0 rounded-2xl md:rounded-3xl blur-2xl bg-emerald-500/10 pointer-events-none" />

                    <div className="relative backdrop-blur-2xl border transition-all rounded-2xl md:rounded-3xl h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-black/45 border-white/10 shadow-2xl">
                        {/* Brand */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 md:w-6 md:h-6 text-black stroke-[3px]" />
                            </div>
                            <span className="font-black tracking-tighter text-xl md:text-2xl uppercase text-white">
                                Dayle
                            </span>
                        </div>
                        {/* Buttons */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-xs sm:text-sm font-black uppercase tracking-wide px-3 sm:px-4 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-xl"
                                >
                                    Sign In
                                </Button>
                            </Link>

                            <Link href="/onboarding/role">
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm uppercase tracking-wide transition-all">
                                    Create a Vault
                                </Button>
                            </Link>
                        </div>

                    </div>
                </div>
            </motion.nav>


            {/* Hero Section */}
            <section className="relative pt-26 md:pt-24 lg:pt-32 pb-16 md:pb-24 lg:pb-32 px-4 md:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center relative z-10">

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-7 lg:text-left md:text-center text-center "
                    >
                        {/* Small signal badge */}
                        <motion.div
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] md:text-xs font-black uppercase tracking-[0.24em] mb-7 md:mb-9 text-white/70"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Vault-based milestone settlement
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[88px] font-black tracking-tight leading-[0.95] md:leading-[0.9] mb-6 md:mb-8 text-white"
                        >
                            Lock funds.
                            <br />
                            Approve work.
                            <br />
                            <span className="text-emerald-500 italic">Release with certainty.</span>
                        </motion.h1>

                        {/* Subcopy */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-xl mb-8 md:mb-12 font-semibold leading-relaxed tracking-tight text-white/70"
                        >
                            Dayle replaces manual escrow with a vault workflow. Funds are locked upfront, milestones are
                            verified with proof, and releases happen only when conditions are met.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6"
                        >
                            <Link href="/onboarding/role" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Button
                                        size="lg"
                                        className="rounded-2xl px-8 md:px-12 h-14 md:h-20 font-black text-base md:text-xl w-full shadow-xl group transition-all bg-white text-black hover:bg-slate-200"
                                    >
                                        <span className="hidden sm:inline">Create a Vault</span>
                                        <span className="sm:hidden">Create Vault</span>
                                        <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </Link>

                            <Link href="#demo" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                                    <Button
                                        variant="ghost"
                                        className="rounded-2xl px-6 md:px-8 h-14 md:h-20 font-black text-sm md:text-lg w-full sm:w-auto uppercase tracking-tight flex items-center justify-center gap-3 text-white hover:bg-white/5 border border-white/10"
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-emerald-500/15 border border-emerald-500/20">
                                            <Play className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 fill-emerald-500" />
                                        </div>
                                        <span className="hidden sm:inline">Watch the Demo</span>
                                        <span className="sm:hidden">Demo</span>
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Small credibility line */}
                        <motion.p
                            variants={fadeInUp}
                            className="mt-5 text-xs md:text-sm font-semibold text-white/40"
                        >
                            Funds only move after milestone approval.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="absolute -inset-10 blur-[120px] rounded-full transition-colors bg-emerald-500/10"></div>

                        <div className="relative space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="border p-8 rounded-[32px] transform -rotate-2 hover:rotate-0 transition-all duration-500 bg-[#0a0a0a] border-white/10 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-black text-emerald-500 uppercase tracking-wide">Milestone 01</span>
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-xl font-bold uppercase mb-2 text-white">Project Architecture</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-white text-sm uppercase font-black tracking-wide">Status: Released</p>
                                    <p className="text-xl font-black text-white">$4,500.00</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1.05 }}
                                transition={{ duration: 0.6, delay: 1, type: "spring" }}
                                className="bg-emerald-500 p-10 rounded-[40px] transform translate-x-4 z-20 shadow-lg shadow-emerald-500/20"
                            >
                                <div className="flex justify-between items-start mb-6 text-black">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                                            <span className="text-sm font-black opacity-60 uppercase tracking-wide">In Progress</span>
                                        </div>
                                        <h4 className="text-3xl font-black uppercase leading-none">Beta Deployment</h4>
                                    </div>
                                    <div className="bg-black/10 p-3 rounded-2xl"><Lock className="w-8 h-8" /></div>
                                </div>
                                <div className="bg-black/10 h-2 w-full rounded-full mb-6 overflow-hidden">
                                    <div className="bg-black h-full w-2/3"></div>
                                </div>
                                <div className="flex justify-between items-center text-black">
                                    <span className="text-sm font-black opacity-60 uppercase tracking-wide">Vault Balance</span>
                                    <span className="text-4xl font-black tracking-tighter">$12,000.00</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="border p-8 rounded-[32px] transform rotate-2 transition-all bg-[#0a0a0a] border-white/5 opacity-40 hover:opacity-100 shadow-2xl"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-black text-white uppercase tracking-wide">Milestone 03</span>
                                    <Box className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-bold uppercase mb-2 text-white">Final Handover</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-white text-sm uppercase font-black tracking-wide">Pending</p>
                                    <p className="text-white text-xl font-black">$8,500.00</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Protocol Logic Flow */}
            <section id="protocol" className="py-32 px-6 border-t transition-colors border-white/5 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white">
                            How <span className="text-emerald-500"> Dayle </span> Protects You.
                        </h2>
                        <p className="text-white/70 font-semibold uppercase tracking-wide text-sm">
                            A three-step workflow that creates payment certainty.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12"
                    >
                        {[
                            {
                                step: "01",
                                title: "Pre-Funded Vault",
                                desc: "The client locks the project budget upfront before work begins.",
                                icon: Box
                            },
                            {
                                step: "02",
                                title: "Proof + Review",
                                desc: "Work is submitted with proof. AI assists review by summarizing and flagging gaps — final approval stays with the client.",
                                icon: ShieldCheck
                            },
                            {
                                step: "03",
                                title: "Controlled Release",
                                desc: "Once approved, funds are released from the vault to the contractor’s payout method.",
                                icon: Zap
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="p-6 md:p-10 lg:p-12 border rounded-3xl md:rounded-[48px] relative group transition-all bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                            >
                                <div className="absolute -top-4 md:-top-6 left-6 md:left-12 w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl text-black shadow-lg">
                                    {item.step}
                                </div>

                                <div className="mb-6 md:mb-10 mt-4">
                                    <item.icon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
                                </div>

                                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 md:mb-6 text-white">
                                    {item.title}
                                </h4>

                                <p className="text-sm md:text-base lg:text-lg font-semibold leading-relaxed text-white/80">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* AI Layer */}
            <section id="ai" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/5 bg-[#060606]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                    >
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.28em] text-white/70">
                                    AI-assisted verification
                                </span>
                            </div>

                            <h2 className="mt-5 text-2xl md:text-4xl font-black tracking-tight text-white">
                                AI supports milestone verification.
                            </h2>

                            <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                                Dayle uses AI to assist milestone verification and reduce manual back-and-forth.
                                Final approval remains with the client.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                                Human approval required
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* Who It's For */}
            <section id="who" className="py-24 md:py-32 px-4 md:px-6 border-t border-white/5 bg-[#060606]">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 md:mb-16"
                    >
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.28em] text-white/70">
                                    Fit
                                </span>
                            </div>

                            <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
                                Built for teams <span className='text-emerald-500'> that pay by outcome.</span>
                            </h2>

                            <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                                Dayle is designed for buyers who need predictable releases, clear approvals, and reduced payment
                                risk across cross-border contractor work.
                            </p>
                        </div>

                        {/* Right-side micro-proof */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 self-start lg:self-end">
                            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                                Best for
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white/70">
                                Milestone-based projects
                            </div>
                        </div>
                    </motion.div>

                    {/* Cards */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-60px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
                    >
                        {[
                            {
                                title: "Agencies & Studios",
                                icon: Briefcase,
                                bullets: ["Lock budgets upfront", "Release per milestone", "Reduce payment disputes"],
                                line: "Run client work without invoice chasing or trust gaps.",
                            },
                            {
                                title: "Startups & Founders",
                                icon: Rocket,
                                bullets: ["Pre-fund deliverables", "Approve with proof", "Keep finances predictable"],
                                line: "Pay global contractors with confidence and control.",
                            },
                            {
                                title: "Platforms (API)",
                                icon: Blocks,
                                bullets: ["Embed vault logic", "Program milestone releases", "Audit trail by default"],
                                line: "Offer settlement controls inside your marketplace or workflow.",
                            },
                        ].map((c, i) => (
                            <motion.div
                                key={c.title}
                                variants={fadeInUp}
                                className="group relative rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden hover:bg-white/[0.03] hover:border-white/20 transition-all"
                            >
                                {/* subtle top accent */}
                                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="p-6 md:p-8">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="w-12 h-12 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                                            <c.icon className="w-6 h-6 text-emerald-400" />
                                        </div>

                                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                                            0{i + 1}
                                        </div>
                                    </div>

                                    <h3 className="mt-6 text-xl md:text-2xl font-black tracking-tight text-white">
                                        {c.title}
                                    </h3>

                                    <p className="mt-3 text-sm md:text-base font-semibold text-white/60 leading-relaxed">
                                        {c.line}
                                    </p>

                                    <div className="mt-6 space-y-2.5">
                                        {c.bullets.map((b) => (
                                            <div key={b} className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[12px] md:text-[13px] font-semibold text-white/70">
                                                    {b}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-white/45">
                                            Typical use: milestone projects
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-white/35 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>



            <Countries />
            {/* Feature Matrix */}
            <section className="py-24 md:py-32 px-4 md:px-6 border-t border-white/5 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-20"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-5 text-white">
                                Programmable <br /><span className='text-emerald-500'> Trust Infrastructure.</span>
                            </h2>
                            <p className="text-white/70 text-sm md:text-base font-medium leading-relaxed">
                                Dayle turns contractor payments into a deterministic workflow — lock funds, verify work, approve milestones, release.
                            </p>
                        </div>

                        <div className="md:text-right">
                            <div className="text-xs font-black text-emerald-500 uppercase tracking-wide mb-2">
                                Core Capabilities
                            </div>
                            <div className="h-[2px] w-28 bg-emerald-500 md:ml-auto opacity-80"></div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {[
                            {
                                title: "Pre-Funded Vault",
                                desc: "Lock funds upfront so work starts with payment certainty.",
                                icon: Layers
                            },
                            {
                                title: "Milestone Controls",
                                desc: "Release capital only after objective proof and client approval.",
                                icon: ListChecks
                            },
                            {
                                title: "Partner Rails",
                                desc: "Payouts via integrated partners — expanding corridor coverage over time.",
                                icon: Network
                            },
                            {
                                title: "Dispute Workflow",
                                desc: "Structured resolution flow for contested milestones (review → decision → release).",
                                icon: Shield
                            }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group p-6 md:p-8 border rounded-2xl md:rounded-3xl bg-[#0a0a0a] border-white/10 hover:border-emerald-500/40 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                                        <f.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        Capability
                                    </div>
                                </div>

                                <h4 className="text-white font-black uppercase tracking-wide text-lg md:text-xl mb-3">
                                    {f.title}
                                </h4>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>


            {/* Security Section */}
            <section id="safety" className="py-20 md:py-28 px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-7xl mx-auto border rounded-3xl md:rounded-[56px] p-6 md:p-12 lg:p-20 bg-[#0b0b0b] border-white/10"
                >
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left */}
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
                                Security,<br /><span className='text-emerald-500'>Engineered.</span>
                            </h2>

                            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-xl mb-10">
                                Dayle is built with isolated vaults, strict approval controls, and audit-ready logging —
                                ensuring funds only move when work is verified.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { label: "Encrypted data at rest & in transit", icon: Lock },
                                    { label: "Modern authentication & MFA support", icon: KeyRound },
                                    { label: "Role-based access control", icon: Shield },
                                    { label: "Audit-ready system events", icon: ListChecks }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 text-white/90"
                                    >
                                        <item.icon className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-semibold tracking-wide">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-8 text-white/40 text-xs font-medium max-w-lg">
                                Compliance certifications (e.g. SOC 2) are planned as Dayle moves from beta to production scale.
                            </p>
                        </div>

                        {/* Right */}
                        <div className="space-y-4">
                            {[
                                {
                                    title: "Milestone-Locked Settlement",
                                    icon: Layers,
                                    desc: "Funds remain isolated until predefined approval conditions are met."
                                },
                                {
                                    title: "Zero-Trust Principles",
                                    icon: Network,
                                    desc: "Every action is explicitly authorized — no implicit trust."
                                },
                                {
                                    title: "Tamper-Evident Audit Logs",
                                    icon: FileText,
                                    desc: "All actions are recorded for traceability and review."
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="group border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <item.icon className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm uppercase tracking-wide">
                                                    {item.title}
                                                </h4>
                                                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-emerald-500 transition-colors shrink-0" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>


            {/* FAQ Section */}
            <section id="faq" className="py-24 md:py-32 px-4 md:px-6 border-t border-white/5 bg-[#050505]">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mb-12 md:mb-16"
                    >
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                                    FAQ
                                </div>
                                <h2 className="mt-3 text-3xl md:text-5xl font-black tracking-tight text-white">
                                    Common <span className='text-emerald-500'>questions.</span>
                                </h2>
                                <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                                    Everything you need to know about how Dayle’s vault workflow works — funding, approvals,
                                    releases, and disputes.
                                </p>
                            </div>

                            {/* Optional: small trust line */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 self-start md:self-end">
                                <div className="text-[11px] font-semibold text-white/60">
                                    Built for B2B payments and contractor settlements.
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="divide-y divide-white/10 rounded-3xl border border-white/10 overflow-hidden bg-white/[0.02]">
                        {faqs.map((faq, index) => {
                            const open = activeFaq === index;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05, duration: 0.35 }}
                                    className="group"
                                >
                                    <button
                                        onClick={() => setActiveFaq(open ? null : index)}
                                        className="w-full px-6 md:px-8 py-6 flex items-center justify-between gap-6 text-left hover:bg-white/[0.03] transition-colors"
                                        type="button"
                                    >
                                        <span className="text-base md:text-lg font-semibold text-white tracking-tight">
                                            {faq.q}
                                        </span>

                                        <div className="flex-shrink-0 w-9 h-9 rounded-full border border-white/10 bg-black/20 flex items-center justify-center">
                                            {open ? (
                                                <Minus className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Plus className="w-4 h-4 text-emerald-400" />
                                            )}
                                        </div>
                                    </button>

                                    <div
                                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            }`}
                                    >
                                        <div className="overflow-hidden">
                                            <div className="px-6 md:px-8 pb-6 text-sm md:text-base text-white/65 leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="py-16 md:py-24 lg:py-32 px-4 md:px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 lg:gap-20">
                    {/* Brand */}
                    <div className="sm:col-span-2 space-y-6 md:space-y-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 md:w-7 md:h-7 text-black stroke-[3px]" />
                            </div>
                            <span className="font-black tracking-tighter uppercase text-2xl md:text-3xl text-white">
                                Dayle
                            </span>
                        </div>

                        <p className="text-white/70 text-xs md:text-sm font-semibold max-w-md leading-relaxed">
                            Vault-based milestone settlement for cross-border contractor payments.
                            Lock funds upfront. Release only when work is approved.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-wide mb-6 md:mb-10 text-white">
                            Product
                        </h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-white/70 font-semibold">
                            <li>
                                <Link href="#protocol" className="hover:text-emerald-400 transition-colors">
                                    How it works
                                </Link>
                            </li>
                            <li>
                                <Link href="#coverage" className="hover:text-emerald-400 transition-colors">
                                    Coverage
                                </Link>
                            </li>
                            <li>
                                <Link href="#faq" className="hover:text-emerald-400 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-wide mb-6 md:mb-10 text-white">
                            Contact
                        </h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-white/70 font-semibold">
                            <li>
                                <Link href="/support" className="hover:text-emerald-400 transition-colors">
                                    Support
                                </Link>
                            </li>
                            {/* <li>
                                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                                    Sales
                                </Link>
                            </li> */}
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-16 md:mt-24 lg:mt-32 pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm font-semibold text-white/50">
                    <span>© 2026 Dayle.</span>

                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}