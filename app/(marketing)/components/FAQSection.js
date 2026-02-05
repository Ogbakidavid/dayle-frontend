"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export default function FAQSection({ faqs }) {
    const [activeFaq, setActiveFaq] = useState(null);

    return (
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
                                Everything you need to know about how Dayle's vault workflow works — funding, approvals,
                                releases, and disputes.
                            </p>
                        </div>

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
    );
}
