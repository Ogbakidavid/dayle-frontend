"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import {
  Shield,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Box,
  ShieldCheck,
  RefreshCcw,
  Play,
  Check,
  Plus,
  Minus,
  KeyRound,
  ListChecks,
  Layers,
  Network,
  FileText,
  Briefcase,
  Rocket,
  Blocks,
  ArrowUpRight,
} from "lucide-react";

import Countries from "./components/Countries";
import { DayleLogo } from "@/components/shared/DayleLogo";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" } as any,
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

interface FAQItem {
  q: string;
  a: string;
}

export default function LandingPage() {
  // State for FAQ toggles and mobile menu
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqs: FAQItem[] = [
    {
      q: "How does the 'Settlement' actually work?",
      a: "When a contract is initiated, funds are locked into a secure vault. These funds are held until pre-defined project deliverables are met or if both parties agree to a return.",
    },
    {
      q: "What happens if a client refuses to approve the work?",
      a: "Dayle includes a built-in Resolution Hub. If the payment release is contested, an independent reviewer evaluates the submitted work against the project scope to ensure a fair outcome.",
    },
    {
      q: "Are there any hidden fees for international transfers?",
      a: "No. We use integrated financial rails to provide real-time mid-market exchange rates. You see exactly what you’ll receive before the project is even funded.",
    },
    {
      q: "Is my data and capital insured?",
      a: "Yes. All project capital held in Dayle accounts is covered by our secondary insurance layer, and our infrastructure is SOC-2 Type II compliant with AES-256 encryption.",
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-emerald-500/30 antialiased font-primary bg-white text-slate-900">
      {/* Background Sophistication */}
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="fixed top-3 md:top-6 inset-x-0 z-100 max-w-7xl mx-auto px-3 md:px-6 font-sans"
      >
        <div className="relative">
          {/* subtle glow */}
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl blur-2xl bg-emerald-500/10 pointer-events-none" />

          <div className="relative backdrop-blur-2xl border transition-all rounded-2xl md:rounded-3xl h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 border-slate-200 shadow-sm">
            {/* Brand */}
            <div className="flex items-center gap-0">
              <DayleLogo className="w-10 h-10 text-emerald-500 transition-transform group-hover:scale-110" />
              <span className="font-bold tracking-tighter text-xl md:text-[22px] text-slate-900">
                Dayle
              </span>
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm sm:text-sm font-bold px-3 sm:px-4 text-slate-900 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Sign in
                </Button>
              </Link>

              <Link href="/onboarding/role">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-sm transition-all">
                  Start a project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-24 lg:pt-32 pb-16 md:pb-24 md:mt-10 lg:mt-0 lg:pb-32 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Small signal badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-slate-200 bg-slate-50 text-[11px] md:text-sm font-bold  mb-7 md:mb-9 text-slate-900"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Structured settlement layer
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[88px] font-bold tracking-tight leading-[1.05] md:leading-[1.09] mb-6 md:mb-8 text-slate-900"
            >
              Work starts when <br />
              funds are <span className="italic">locked.</span>
              <br />
              <span className="text-emerald-600 ">Funds move when work is done.</span>
            </motion.h1>

            {/* Subcopy */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-xl mb-8 md:mb-12 font-semibold leading-relaxed tracking-tight text-slate-900"
            >
              Dayle is the settlement layer for project-based work. Funds are
              locked upfront, deliverables are defined clearly, and releases
              happen in minutes—not days.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6 w-full sm:w-auto"
            >
              <Link href="/onboarding/role" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    size="lg"
                    className="rounded-2xl px-6 sm:px-12 h-14 font-bold text-sm sm:text-base md:text-xl w-full shadow-xl group transition-all bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <span className="hidden xs:inline">Start a project</span>
                    <span className="xs:hidden">Start</span>
                    <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="#demo" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    variant="ghost"
                    className="rounded-2xl px-4 sm:px-8 h-14 md:h-20 font-bold text-xs sm:text-sm md:text-lg w-full sm:w-auto tracking-tight flex items-center justify-center gap-3 text-slate-900 hover:bg-white/5 border border-white/10"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-emerald-50/15 border border-emerald-50/20">
                      <Play className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 fill-emerald-500" />
                    </div>
                    <span className="hidden sm:inline">Watch the demo</span>
                    <span className="sm:hidden">Demo</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Small credibility line */}
            <motion.p
              variants={fadeInUp}
              className="mt-5 text-sm md:text-sm font-semibold text-slate-900"
            >
              Funds only move after project approval.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="hidden lg:block lg:col-span-5 relative"
          >
            <div className="hidden lg:absolute -inset-10 blur-[120px] rounded-full transition-colors bg-emerald-500/10"></div>

            <div className="relative space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="border p-8 rounded-[32px] transform -rotate-2 hover:rotate-0 transition-all duration-500 bg-background border-white/10 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-emerald-500 ">
                    Completed
                  </span>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-900">
                  E-commerce platform
                </h4>
                <div className="flex justify-between items-end">
                  <p className="text-slate-900 text-sm font-bold ">
                    Status: Released
                  </p>
                  <p className="text-xl font-bold text-slate-900">$4,500.00</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1.05 }}
                transition={{ duration: 0.6, delay: 1, type: "spring" }}
                className="bg-emerald-500 p-10 rounded-[40px] transform translate-x-4 z-20 shadow-lg shadow-emerald-500/20"
              >
                <div className="flex justify-between items-start mb-6 text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                      <span className="text-sm font-bold opacity-60  text-white">
                        In progress
                      </span>
                    </div>
                    <h4 className="text-3xl font-bold leading-none text-white">
                      Mobile app design
                    </h4>
                  </div>
                  <div className="bg-black/10 p-3 rounded-2xl">
                    <DayleLogo className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="bg-black/10 h-2 w-full rounded-full mb-6 overflow-hidden">
                  <div className="bg-black h-full w-2/3"></div>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="text-sm font-bold opacity-60  text-white">
                    Account balance
                  </span>
                  <span className="text-4xl font-bold tracking-tighter text-white">
                    $12,000.00
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="border p-8 rounded-[32px] transform rotate-2 transition-all bg-background border-white/5 opacity-40 hover:opacity-100 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-900 ">
                    Funded
                  </span>
                  <Box className="w-6 h-6 text-slate-900" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-900">
                  Brand identity
                </h4>
                <div className="flex justify-between items-end">
                  <p className="text-slate-900 text-sm font-bold ">Pending</p>
                  <p className="text-slate-900 text-xl font-bold">$8,500.00</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Protocol Logic Flow */}
      <section
        id="protocol"
        className="py-32 px-6 border-t transition-colors border-slate-100 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
              How <span className="text-emerald-500"> Dayle </span> protects
              you.
            </h2>
            <p className="text-slate-900/80 font-semibold  text-sm">
              A four-step workflow that creates payment certainty.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14"
          >
            {[
              {
                step: "01",
                title: "Define the work",
                desc: "A client creates a vault for a project. Before any money moves, they must define what 'done' looks like by creating a deliverables checklist (1-10 items).",
                icon: ListChecks,
              },
              {
                step: "02",
                title: "Lock Funds",
                desc: "The client funds the vault. The fund is held in the settlement vault. Work starts only when funds are locked.",
                icon: Lock,
              },
              {
                step: "03",
                title: "Deliver the Work",
                desc: "The freelancer submits work against the checklist. Each submission creates an immutable record with files and notes attached.",
                icon: Rocket,
              },
              {
                step: "04",
                title: "Review & Settle",
                desc: "The client reviews the submission. If satisfied, they release funds. Freelancer withdraws and funds arrive in their bank account in minutes.",
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="p-6 md:p-10 lg:p-12 border rounded-3xl md:rounded-[48px] relative group transition-all bg-white border-slate-200 hover:bg-slate-100 shadow-sm hover:shadow-md"
              >
                <div className="absolute -top-4 md:-top-6 left-6 md:left-12 w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-lg">
                  {item.step}
                </div>

                <div className="mb-6 md:mb-10 mt-4">
                  <item.icon className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
                </div>

                <h4 className="text-xl md:text-2xl font-bold tracking-tighter mb-4 md:mb-6 text-slate-900">
                  {item.title}
                </h4>

                <p className="text-sm md:text-base lg:text-lg font-semibold leading-relaxed text-slate-900/80">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Clear Expectations Section */}
      <section
        id="clarity"
        className="py-20 md:py-24 px-4 md:px-6 border-t border-slate-100 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] md:text-sm font-bold text-emerald-700">
                Clear expectations
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 max-w-4xl">
              Every project starts with a{" "}
              <span className="text-emerald-500">deliverables checklist.</span>{" "}
              You define what &quot;done&quot; looks like before work begins.
            </h2>

            <p className="mt-6 text-slate-600 text-sm md:text-base max-w-2xl">
              No ambiguity. No back-and-forth about what was promised. Just a
              clear list that both sides agree to before the first line of code
              or design file.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who It's For */}
      {/* <section
        id="who"
        className="py-24 md:py-32 px-4 md:px-6 border-t border-slate-100 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          Header
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 md:mb-16"
          >
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] md:text-sm font-bold  text-slate-900">
                  Fit
                </span>
              </div>

              <h2 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                Built for teams{" "}
                <span className="text-emerald-500"> that pay by outcome.</span>
              </h2>

              <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                Dayle is designed for buyers who need predictable releases,
                clear approvals, and reduced payment risk across cross-border
                contractor work.
              </p>
            </div>

            Right-side micro-proof
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 self-start lg:self-end">
              <div className="text-[11px] font-bold  text-slate-900">
                Best for
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Outcome-based projects
              </div>
            </div>
          </motion.div>

          Cards
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
                bullets: [
                  "Lock budgets upfront",
                  "Release after verification",
                  "Reduce payment disputes",
                ],
                line: "Run client work without invoice chasing or trust gaps.",
              },
              {
                title: "Startups & Founders",
                icon: Rocket,
                bullets: [
                  "Pre-fund deliverables",
                  "Approve with proof",
                  "Keep finances predictable",
                ],
                line: "Pay global contractors with confidence and control.",
              },
              {
                title: "Platforms (API)",
                icon: Blocks,
                bullets: [
                  "Embed settlement logic",
                  "Automated payouts",
                  "Audit trail by default",
                ],
                line: "Offer settlement controls inside your marketplace or workflow.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                variants={fadeInUp}
                className="group relative rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden hover:bg-white hover:border-emerald-500/20 transition-all shadow-sm hover:shadow-md"
              >
                subtle top accent
                <div className="absolute inset-x-0 top-0 h-[2px] bg-linear-to-r from-transparent via-emerald-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center">
                      <c.icon className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className=" font-bold  text-white/35">0{i + 1}</div>
                  </div>

                  <h3 className="mt-6 text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    {c.title}
                  </h3>

                  <p className="mt-3 text-sm md:text-base font-semibold text-slate-900 leading-relaxed">
                    {c.line}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {c.bullets.map((b, bulletIdx) => (
                      <div
                        key={`${c.title}-bullet-${bulletIdx}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[12px] md:text-[13px] font-semibold text-slate-900">
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/45">
                      Typical use: outcome projects
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/35 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      <Countries />

      {/* Troubleshooting Section */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[48px] bg-white border border-slate-200 p-8 md:p-16 lg:p-24 relative z-10"
          >
            <div className="flex flex-col xl:flex-row items-start gap-12 lg:gap-24">
              <div className="flex-1 max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/10 bg-red-50 mb-6 font-bold text-red-600 text-[11px] md:text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Protection Layer
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
                  What Happens When <br />
                  <span className="text-red-500 italic">Things Go Wrong</span>
                </h2>
                <div className="space-y-10">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">A</div>
                      Client requests changes
                    </h4>
                    <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                      Communicate refinements offline (no built-in chat). Once ready, the freelancer submits a new collection of work for review.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">B</div>
                      Disagreement about scope
                    </h4>
                    <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                      Either party can open a dispute. A human mediator reviews the deliverables checklist and submission timeline to make an evidence-based decision.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:w-[400px] shrink-0">
                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-200 space-y-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dispute Grounds</div>
                  {[
                    "Integrity & Security",
                    "Scope & Requirements",
                    "Bad Faith & Cooperation",
                    "Protocol & Technical Error"
                  ].map((ground) => (
                    <div key={ground} className="flex items-center gap-3 py-2 border-b border-slate-200 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-sm font-bold text-slate-700">{ground}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Feature Matrix */}
      <section className="py-24 md:py-32 px-4 md:px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 md:mb-20"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-5 text-slate-900">
                Settlement that works <br />
                <span className="text-emerald-500"> the way you expect.</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                Dayle turns contractor payments into a deterministic workflow —
                lock funds, verify work, approve deliverables, payout.
              </p>
            </div>

            <div className="md:text-right">
              <div className="text-sm font-bold text-emerald-500  mb-2">
                Core capabilities
              </div>
              <div className="h-[2px] w-28 bg-emerald-500 md:ml-auto opacity-80"></div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              {
                title: "Secured Funding",
                desc: "Lock funds upfront so work starts with payment certainty.",
                icon: Layers,
              },
              {
                title: "Settlement Controls",
                desc: "Release capital only after objective proof and client approval.",
                icon: ListChecks,
              },
              {
                title: "Partner Rails",
                desc: "Payouts via integrated partners — expanding corridor coverage over time.",
                icon: Network,
              },
              {
                title: "Dispute Workflow",
                desc: "Structured resolution flow for contested deliverables (review → decision → release).",
                icon: Shield,
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                className="group p-6 md:p-8 border rounded-2xl md:rounded-3xl bg-white border-slate-200 hover:border-emerald-500/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white/3 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                    <f.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                  </div>
                  <div className=" font-bold st text-slate-900">Capability</div>
                </div>

                <h4 className="text-slate-900 font-bold  text-lg md:text-xl mb-3">
                  {f.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="safety" className="py-20 md:py-28 px-4 md:px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto border rounded-3xl md:rounded-[56px] p-6 md:p-12 lg:p-20 bg-slate-50 border-slate-200 shadow-sm"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                Security,
                <br />
                <span className="text-emerald-500">engineered.</span>
              </h2>

              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-xl mb-10">
                Dayle is built with isolated project accounts, strict approval
                controls, and audit-ready logging — ensuring funds only move
                when work is verified.
              </p>

              <div className="space-y-4">
                {[
                  { label: "Encrypted data at rest & in transit", icon: Lock },
                  {
                    label: "Modern authentication & MFA support",
                    icon: KeyRound,
                  },
                  { label: "Role-based access control", icon: Shield },
                  { label: "Audit-ready system events", icon: ListChecks },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 text-slate-900"
                  >
                    <item.icon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold ">{item.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-slate-900 text-sm font-medium max-w-lg">
                Compliance certifications (e.g. SOC 2) are planned as Dayle
                moves from beta to production scale.
              </p>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {[
                {
                  title: "Vault-Locked Settlement",
                  icon: Layers,
                  desc: "Funds remain isolated until predefined approval conditions are met.",
                },
                {
                  title: "Zero-Trust Principles",
                  icon: Network,
                  desc: "Every action is explicitly authorized — no implicit trust.",
                },
                {
                  title: "Tamper-Evident Audit Logs",
                  icon: FileText,
                  desc: "All actions are recorded for traceability and review.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="group border border-slate-200 bg-white rounded-2xl p-6 hover:border-emerald-500/40 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <item.icon className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                      <div>
                        <h4 className="text-slate-900 font-bold text-sm ">
                          {item.title}
                        </h4>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-24 md:py-32 px-4 md:px-6 border-t border-slate-100 bg-white"
      >
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
                <div className="text-[11px] font-bold  text-slate-600">FAQ</div>
                <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Common <span className="text-emerald-600">questions.</span>
                </h2>
                <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                  Everything you need to know about how Dayle’s settlement workflow
                  works — funding, approvals, payouts, and disputes.
                </p>
              </div>

              {/* Optional: small trust line */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 self-start md:self-end">
                <div className="text-[11px] font-semibold text-slate-600">
                  Built for B2B payments and contractor settlements.
                </div>
              </div>
            </div>
          </motion.div>

          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
            {faqs.map((faq, index) => {
              const open = activeFaq === index;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  className="group"
                >
                  <button
                    onClick={() => setActiveFaq(open ? null : index)}
                    className="w-full px-6 md:px-8 py-6 flex items-center justify-between gap-6 text-left hover:bg-white transition-colors"
                    type="button"
                  >
                    <span className="text-base md:text-lg font-semibold text-slate-900 tracking-tight">
                      {faq.q}
                    </span>

                    <div className="shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center">
                      {open ? (
                        <Minus className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Plus className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 md:px-8 pb-6 text-sm md:text-base text-slate-600 leading-relaxed">
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
      <footer className="py-16 md:py-24 lg:py-32 px-4 md:px-6 border-t border-slate-100 bg-white text-slate-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16 lg:gap-20">
          {/* Brand */}
          <div className="sm:col-span-2 space-y-6 md:space-y-10">
            <div className="flex items-center gap-1">
              <DayleLogo className="w-10 h-10 text-emerald-500 transition-transform group-hover:scale-110" />
              <span className="font-bold tracking-tighter text-xl md:text-[22px] text-slate-900">
                Dayle
              </span>
            </div>

            <p className="text-slate-600 text-sm md:text-sm font-semibold max-w-md leading-relaxed">
              Vault-based settlement for cross-border contractor payments. Lock
              funds upfront. Release only when work is approved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm md:text-sm font-bold  mb-6 md:mb-10 text-slate-900">
              Product
            </h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-sm text-slate-600 font-semibold">
              <li>
                <Link
                  href="#protocol"
                  className="hover:text-emerald-600 transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="#coverage"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Coverage
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="hover:text-emerald-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm md:text-sm font-bold  mb-6 md:mb-10 text-slate-900">
              Contact
            </h4>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-sm text-slate-600 font-semibold">
              <li>
                <Link
                  href="/support"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 md:mt-24 lg:mt-32 pt-8 md:pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm md:text-sm font-semibold text-slate-600">
          <span>© 2026 Dayle.</span>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-slate-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
