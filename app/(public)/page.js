"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Shield, Lock, Zap, ArrowRight,
    CheckCircle2, Box, ShieldCheck,
    RefreshCcw, SearchCheck,
    Cpu, Terminal,
    ShieldAlert, Play,
    Activity, ArrowUpRight, Check,
    Sun, Moon, Plus, Minus
} from 'lucide-react';

export default function LandingPage() {
    // State for FAQ toggles
    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        {
            q: "How does the 'Autonomous Vault' actually work?",
            a: "When a contract is initiated, funds are transferred into a non-custodial smart vault. These funds are locked and can only be released when pre-defined milestone conditions are met or if both parties agree to a refund."
        },
        {
            q: "What happens if a client refuses to approve a milestone?",
            a: "Cleard includes a built-in Dispute Hub. If a milestone is contested, an independent arbitrator reviews the submitted work against the project scope to ensure a fair resolution."
        },
        {
            q: "Are there any hidden fees for international transfers?",
            a: "No. We use integrated financial rails to provide real-time mid-market exchange rates. You see exactly what you’ll receive before the vault is even funded."
        },
        {
            q: "Is my data and capital insured?",
            a: "Yes. All project capital held in Cleard vaults is covered by our secondary insurance layer, and our infrastructure is SOC-2 Type II compliant with AES-256 encryption."
        }
    ];

    return (
        <div className="min-h-screen transition-colors duration-500 selection:bg-emerald-500/30 antialiased font-['Poppins',_sans-serif] bg-[#050505] text-slate-200">

            {/* Background Sophistication */}
            <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* Navigation */}
            <nav className="fixed top-6 inset-x-0 z-[100] max-w-7xl mx-auto px-6 font-sans">
                <div className="backdrop-blur-2xl border transition-all rounded-3xl h-16 flex items-center justify-between px-8 bg-black/40 border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-black stroke-[3px]" />
                        </div>
                        <span className="font-black tracking-tighter text-2xl uppercase text-white">CLEARD</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-wider text-slate-400">
                        <Link href="#protocol" className="hover:text-emerald-500 transition-colors">How it works</Link>
                        <Link href="#safety" className="hover:text-emerald-500 transition-colors">Security</Link>
                        <Link href="#faq" className="hover:text-emerald-500 transition-colors">FAQ</Link>
                        <Link href="#faq" className="hover:text-emerald-500 transition-colors">Documentation</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest px-5 text-slate-400 hover:text-white hover:bg-white/5">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-black rounded-xl px-6 h-10 text-xs uppercase tracking-widest transition-all">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center relative z-10">

                    <div className="lg:col-span-7 text-left">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-black uppercase tracking-widest mb-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                            <Activity className="w-4 h-4" /> Eliminating Counterparty Risk
                        </div>

                        <h1 className="text-6xl md:text-[90px] font-black tracking-tighter leading-[0.85] mb-8 uppercase text-white">
                            Autonomous <br />
                            <span className="text-emerald-500 italic">Settlement.</span> <br />
                            Zero Friction.
                        </h1>

                        <p className="text-lg md:text-2xl max-w-xl mb-12 font-medium leading-relaxed tracking-tight text-slate-400">
                            Cleard replaces manual escrow with programmable vaults.
                            Funds are locked, milestones are verified, and payouts happen
                            at the speed of code.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="rounded-2xl px-12 h-20 font-black text-xl w-full shadow-xl group transition-all bg-white text-black hover:bg-slate-200">
                                    Start Your First Vault <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="ghost" className="rounded-2xl px-8 h-20 font-black text-lg w-full sm:w-auto uppercase tracking-tighter flex items-center gap-3 text-white hover:bg-white/5">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20">
                                    <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                                </div>
                                Watch the Demo
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-5 relative">
                        <div className="absolute -inset-10 blur-[120px] rounded-full transition-colors bg-emerald-500/10"></div>

                        <div className="relative space-y-4">
                            <div className="border p-8 rounded-[32px] transform -rotate-2 hover:rotate-0 transition-all duration-500 bg-[#0a0a0a] border-white/10 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Milestone 01</span>
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-xl font-bold uppercase mb-2 text-white">Project Architecture</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-slate-500 text-sm uppercase font-black">Status: Released</p>
                                    <p className="text-xl font-black text-white">$4,500.00</p>
                                </div>
                            </div>

                            <div className="bg-emerald-500 p-10 rounded-[40px] transform translate-x-4 scale-105 z-20 shadow-lg shadow-emerald-500/20">
                                <div className="flex justify-between items-start mb-6 text-black">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                                            <span className="text-xs font-black opacity-60 uppercase tracking-widest">In Progress</span>
                                        </div>
                                        <h4 className="text-3xl font-black uppercase leading-none">Beta Deployment</h4>
                                    </div>
                                    <div className="bg-black/10 p-3 rounded-2xl"><Lock className="w-8 h-8" /></div>
                                </div>
                                <div className="bg-black/10 h-2 w-full rounded-full mb-6 overflow-hidden">
                                    <div className="bg-black h-full w-2/3"></div>
                                </div>
                                <div className="flex justify-between items-center text-black">
                                    <span className="text-sm font-black opacity-60 uppercase tracking-widest">Vault Balance</span>
                                    <span className="text-4xl font-black tracking-tighter">$12,000.00</span>
                                </div>
                            </div>

                            <div className="border p-8 rounded-[32px] transform rotate-2 transition-all bg-[#0a0a0a] border-white/5 opacity-40 hover:opacity-100 shadow-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Milestone 03</span>
                                    <Box className="w-6 h-6 text-slate-400" />
                                </div>
                                <h4 className="text-xl font-bold uppercase mb-2 text-slate-400">Final Handover</h4>
                                <div className="flex justify-between items-end">
                                    <p className="text-slate-400 text-sm uppercase font-black">Pending</p>
                                    <p className="text-slate-400 text-xl font-black">$8,500.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Protocol Logic Flow */}
            <section id="protocol" className="py-32 px-6 border-t transition-colors border-white/5 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">How Cleard Protects You.</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">A three-step process to guaranteed payment.</p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Programmable Vault", desc: "Clients deposit the full project amount into a secure, isolated vault before work begins.", icon: Box },
                            { step: "02", title: "Milestone Verification", desc: "When you complete a task, the client (or an arbitrator) approves the specific milestone.", icon: ShieldCheck },
                            { step: "03", title: "Atomic Payout", desc: "The vault releases funds instantly to your account. No invoices, no delays.", icon: Zap }
                        ].map((item, i) => (
                            <div key={i} className="p-12 border rounded-[48px] relative group transition-all bg-white/[0.02] border-white/5 hover:bg-white/[0.04]">
                                <div className="absolute -top-6 left-12 w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl text-black shadow-lg">
                                    {item.step}
                                </div>
                                <div className="mb-10 mt-4"><item.icon className="w-12 h-12 text-emerald-500" /></div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-6 text-white">{item.title}</h4>
                                <p className="text-lg font-medium leading-relaxed text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Matrix */}
            <section className="py-32 px-6 border-t transition-colors border-white/5 bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6 text-white">
                                Programmable <br /> Trust Infrastructure.
                            </h2>
                            <p className="font-medium text-xl leading-relaxed text-slate-500">
                                Cleard abstracts away the complexity of financial legalities into a set of automated protocols.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">Protocol Capabilities</div>
                            <div className="h-1 w-32 bg-emerald-500 ml-auto"></div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Proof of Funds", desc: "Verify capital availability before you start. Eliminate clients who can't pay.", icon: SearchCheck },
                            { title: "Smart Escrow", desc: "Funds are legally ring-fenced and governed by high-level encryption.", icon: Lock },
                            { title: "Instant Rails", desc: "24/7 global payouts via integrated financial partners.", icon: RefreshCcw },
                            { title: "Dispute Hub", desc: "Built-in arbitration to ensure fair outcomes for every project.", icon: ShieldAlert }
                        ].map((f, i) => (
                            <div key={i} className="p-10 border rounded-[40px] transition-all group bg-[#0a0a0a] border-white/10 hover:border-emerald-500/50">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-all bg-white/[0.03] border-white/10 group-hover:bg-emerald-500/10">
                                    <f.icon className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h4 className="text-xl font-black mb-4 uppercase tracking-tighter text-white">{f.title}</h4>
                                <p className="text-base leading-relaxed font-medium text-slate-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="safety" className="py-32 px-6">
                <div className="max-w-7xl mx-auto border rounded-[60px] p-12 md:p-24 relative overflow-hidden transition-all bg-[#0a0a0a] border-white/10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-8">Hardened <br />Security.</h2>
                            <p className="text-slate-400 text-xl mb-12 font-medium">Your project capital is protected by bank-grade infrastructure and isolated vaults.</p>
                            <div className="grid grid-cols-2 gap-6 text-white">
                                {['AES-256 Encryption', 'Biometric MFA', 'SOC-2 Compliant', 'Insured Vaults'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-black" /></div>
                                        <span className="text-xs font-black uppercase tracking-widest">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Atomic Settlement", icon: Cpu },
                                { title: "Zero-Trust Architecture", icon: ShieldCheck },
                                { title: "Immutable Audit Trails", icon: Terminal }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <item.icon className="w-8 h-8 text-emerald-500" />
                                        <span className="text-base font-bold uppercase text-white tracking-widest">{item.title}</span>
                                    </div>
                                    <ArrowUpRight className="w-6 h-6 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="relative z-10 py-32 px-6 border-t transition-colors border-white/5 bg-[#050505]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">Common Questions.</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Everything you need to know about the protocol.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
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
                                    <div className="p-8 pt-0 text-base md:text-lg leading-relaxed text-slate-400">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-32 px-6 border-t transition-colors border-white/5 bg-black">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
                    <div className="col-span-2 space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-7 h-7 text-black stroke-[3px]" />
                            </div>
                            <span className="font-black tracking-tighter uppercase text-3xl text-white">CLEARD</span>
                        </div>
                        <p className="text-slate-500 text-xl font-medium max-w-sm leading-relaxed uppercase tracking-tighter">Infrastructure for the global workforce.</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-10 text-slate-300">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-black uppercase tracking-wider">
                            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Vaults</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Security</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-10 text-slate-300">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-500 font-black uppercase tracking-wider">
                            <li><Link href="#" className="hover:text-emerald-500 transition-colors">Support</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Sales</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs font-black text-slate-600 uppercase tracking-widest">
                    <span>© 2026 Cleard Protocol.</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Systems Operational</span>
                </div>
            </footer>
        </div>
    );
}