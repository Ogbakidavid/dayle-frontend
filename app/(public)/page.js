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
    Sun, Moon, Plus, Minus, Menu, X
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
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="fixed top-3 md:top-6 inset-x-0 z-[100] max-w-7xl mx-auto px-3 md:px-6 font-sans"
            >
                <div className="backdrop-blur-2xl border transition-all rounded-2xl md:rounded-3xl h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-black/40 border-white/10 shadow-2xl">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-black stroke-[3px]" />
                        </div>
                        <span className="font-black tracking-tighter text-xl md:text-2xl uppercase text-white">Dayle</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10 text-sm font-black uppercase tracking-wide text-white">
                        <Link href="#protocol" className="hover:text-emerald-500 transition-colors">How it works</Link>
                        <Link href="#safety" className="hover:text-emerald-500 transition-colors">Security</Link>
                        <Link href="#faq" className="hover:text-emerald-500 transition-colors">FAQ</Link>
                        <Link href="#faq" className="hover:text-emerald-500 transition-colors">Documentation</Link>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-black uppercase tracking-wide px-5 text-white hover:text-white hover:bg-white/5">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/onboarding/role">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl px-6 h-10 text-sm uppercase tracking-wide transition-all">
                                Sign Up
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-2 backdrop-blur-2xl border rounded-2xl bg-black/40 border-white/10 shadow-2xl overflow-hidden">
                        <div className="flex flex-col p-4 space-y-3">
                            <Link href="#protocol" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-wide text-white hover:text-emerald-500 transition-colors py-2">
                                How it works
                            </Link>
                            <Link href="#safety" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-wide text-white hover:text-emerald-500 transition-colors py-2">
                                Security
                            </Link>
                            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-wide text-white hover:text-emerald-500 transition-colors py-2">
                                FAQ
                            </Link>
                            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-black uppercase tracking-wide text-white hover:text-emerald-500 transition-colors py-2">
                                Documentation
                            </Link>
                            <div className="border-t border-white/10 pt-3 mt-2 flex flex-col gap-2">
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full text-sm font-black uppercase tracking-wide text-white hover:text-white hover:bg-white/5">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/onboarding/role" className="w-full">
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl h-10 text-sm uppercase tracking-wide transition-all">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 lg:pt-48 pb-16 md:pb-24 lg:pb-32 px-4 md:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center relative z-10">

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-7 text-left"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full border text-xs md:text-sm font-black uppercase tracking-wide mb-6 md:mb-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                            <Activity className="w-3 h-3 md:w-4 md:h-4" /> Eliminating Counterparty Risk
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[90px] font-black tracking-tighter leading-[0.9] md:leading-[0.85] mb-6 md:mb-8 uppercase text-white">
                            Autonomous <br />
                            <span className="text-emerald-500 italic">Settlement.</span> <br />
                            Zero Friction.
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-xl mb-8 md:mb-12 font-bold leading-relaxed tracking-tight text-white uppercase">
                            Dayle replaces manual escrow with programmable vaults.
                            Funds are locked, milestones are verified, and payouts happen
                            at the speed of code.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6">
                            <Link href="/onboarding/role" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="lg" className="rounded-xl md:rounded-2xl px-8 md:px-12 h-14 md:h-20 font-black text-base md:text-xl w-full shadow-xl group transition-all bg-white text-black hover:bg-slate-200">
                                        <span className="hidden sm:inline">Start Your First Vault</span>
                                        <span className="sm:hidden">Get Started</span>
                                        <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href="#demo" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" className="rounded-xl md:rounded-2xl px-6 md:px-8 h-14 md:h-20 font-black text-sm md:text-lg w-full sm:w-auto uppercase tracking-tighter flex items-center justify-center gap-3 text-white hover:bg-white/5">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                                            <Play className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 fill-emerald-500" />
                                        </div>
                                        <span className="hidden sm:inline">Watch the Demo</span>
                                        <span className="sm:hidden">Demo</span>
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>
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
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white">How <span className="text-emerald-500"> Dayle </span> Protects You.</h2>
                        <p className="text-white font-bold uppercase tracking-wide text-sm">A three-step process to guaranteed payment.</p>
                    </motion.div>
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12"
                    >
                        {[
                            { step: "01", title: "Programmable Vault", desc: "Clients deposit the full project amount into a secure, isolated vault before work begins.", icon: Box },
                            { step: "02", title: "Milestone Verification", desc: "When you complete a task, the client (or an arbitrator) approves the specific milestone.", icon: ShieldCheck },
                            { step: "03", title: "Atomic Payout", desc: "The vault releases funds instantly to your account. No invoices, no delays.", icon: Zap }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="p-6 md:p-10 lg:p-12 border rounded-3xl md:rounded-[48px] relative group transition-all bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                            >
                                <div className="absolute -top-4 md:-top-6 left-6 md:left-12 w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl text-black shadow-lg">
                                    {item.step}
                                </div>
                                <div className="mb-6 md:mb-10 mt-4"><item.icon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" /></div>
                                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 md:mb-6 text-white">{item.title}</h4>
                                <p className="text-sm md:text-base lg:text-lg font-bold leading-relaxed text-white uppercase tracking-tight">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <Countries />

            {/* Feature Matrix */}
            <section className="py-32 px-6 border-t transition-colors border-white/5 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6 text-white">
                                Programmable <br /> Trust Infrastructure.
                            </h2>
                            <p className="font-bold text-xl leading-relaxed text-white uppercase tracking-tight">
                                Dayle abstracts away the complexity of financial legalities into a set of automated protocols.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-emerald-500 uppercase tracking-wide mb-2">Protocol Capabilities</div>
                            <div className="h-1 w-32 bg-emerald-500 ml-auto"></div>
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
                            { title: "Proof of Funds", desc: "Verify capital availability before you start. Eliminate clients who can't pay.", icon: SearchCheck },
                            { title: "Smart Escrow", desc: "Funds are legally ring-fenced and governed by high-level encryption.", icon: Lock },
                            { title: "Instant Rails", desc: "24/7 global payouts via integrated financial partners.", icon: RefreshCcw },
                            { title: "Dispute Hub", desc: "Built-in arbitration to ensure fair outcomes for every project.", icon: ShieldAlert }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="p-6 md:p-8 lg:p-10 border rounded-2xl md:rounded-3xl lg:rounded-[40px] transition-all group bg-[#0a0a0a] border-white/10 hover:border-emerald-500/50"
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-10 transition-all bg-white/[0.03] border-white/10 group-hover:bg-emerald-500/10">
                                    <f.icon className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                                </div>
                                <h4 className="text-lg md:text-xl font-black mb-3 md:mb-4 uppercase tracking-wide text-white">{f.title}</h4>
                                <p className="text-xs md:text-sm leading-relaxed font-bold text-white uppercase tracking-wide">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Security Section */}
            <section id="safety" className="py-16 md:py-24 lg:py-32 px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="max-w-7xl mx-auto border rounded-3xl md:rounded-[60px] p-6 md:p-12 lg:p-24 relative overflow-hidden transition-all bg-[#0a0a0a] border-white/10"
                >
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6 md:mb-8">Hardened <br />Security.</h2>
                            <p className="text-white text-xs md:text-sm font-bold uppercase tracking-wide leading-loose mb-8 md:mb-12">Your project capital is protected by bank-grade infrastructure and isolated vaults.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-white">
                                {['AES-256 Encryption', 'Biometric MFA', 'SOC-2 Compliant', 'Insured Vaults'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 md:w-4 md:h-4 text-black" /></div>
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-wide">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            {[
                                { title: "Atomic Settlement", icon: Cpu },
                                { title: "Zero-Trust Architecture", icon: ShieldCheck },
                                { title: "Immutable Audit Trails", icon: Terminal }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 + 0.5, duration: 0.5 }}
                                    className="bg-white/5 border border-white/10 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <item.icon className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 flex-shrink-0" />
                                        <span className="text-xs md:text-sm font-bold uppercase text-white tracking-wide">{item.title}</span>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="relative z-10 py-32 px-6 border-t transition-colors border-white/5 bg-[#050505]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white">Common Questions.</h2>
                        <p className="text-white font-bold uppercase tracking-wide text-sm">Everything you need to know about the protocol.</p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="border rounded-[32px] overflow-hidden transition-all bg-white/[0.02] border-white/10"
                            >
                                <button
                                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    className="w-full p-8 flex items-center justify-between text-left transition-colors hover:bg-white/[0.03]"
                                    type="button"
                                >
                                    <span className="text-lg md:text-xl font-bold uppercase tracking-tight text-white">
                                        {faq.q}
                                    </span>
                                    <div className="flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-white/5">
                                        {activeFaq === index ? <Minus className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </button>

                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                    <div className="p-8 pt-0 text-sm md:text-sm font-bold uppercase tracking-wide leading-loose text-white">
                                        {faq.a}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 md:py-24 lg:py-32 px-4 md:px-6 border-t transition-colors border-white/5 bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 lg:gap-20">
                    <div className="sm:col-span-2 space-y-6 md:space-y-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 md:w-7 md:h-7 text-black stroke-[3px]" />
                            </div>
                            <span className="font-black tracking-tighter uppercase text-2xl md:text-3xl text-white">Dayle</span>
                        </div>
                        <p className="text-white text-xs md:text-sm font-bold max-w-sm leading-relaxed uppercase tracking-wide">Infrastructure for the global workforce.</p>
                    </div>
                    <div>
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-wide mb-6 md:mb-10 text-white">Platform</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-white font-bold uppercase tracking-wide">
                            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Vaults</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Security</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-wide mb-6 md:mb-10 text-white">Contact</h4>
                        <ul className="space-y-3 md:space-y-4 text-xs md:text-sm text-white font-bold uppercase tracking-wide">
                            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Support</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Sales</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 md:mt-24 lg:mt-32 pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm font-bold text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">
                    <span>© 2026 Dayle Protocol.</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Systems Operational</span>
                </div>
            </footer>
        </div>
    );
}