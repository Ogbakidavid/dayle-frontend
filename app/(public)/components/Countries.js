"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Landmark, Smartphone, Search } from 'lucide-react';

const SettlementMatrix = () => {
    const [activeRegion, setActiveRegion] = useState('All');

    const nodes = [
        { id: 'ng', country: "Nigeria", code: "NGN", flag: "🇳🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "48%", y: "58%" },
        { id: 'ke', country: "Kenya", code: "KES", flag: "🇰🇪", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "54%", y: "62%" },
        { id: 'gh', country: "Ghana", code: "GHS", flag: "🇬🇭", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "46%", y: "60%" },
        { id: 'ug', country: "Uganda", code: "UGX", flag: "🇺🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "53%", y: "60%" },
        { id: 'tz', country: "Tanzania", code: "TZS", flag: "🇹🇿", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "54%", y: "65%" },
        { id: 'mw', country: "Malawi", code: "MWK", flag: "🇲🇼", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "55%", y: "68%" },
        { id: 'bj', country: "Benin", code: "XOF", flag: "🇧🇯", chs: ["Mobile Money"], region: "Africa", x: "47%", y: "59%" },
        { id: 'ci', country: "Côte d'Ivoire", code: "XOF", flag: "🇨🇮", chs: ["Mobile Money"], region: "Africa", x: "45%", y: "61%" },
        { id: 'br', country: "Brazil", code: "BRL", flag: "🇧🇷", chs: ["Mobile (PIX)"], region: "Americas", x: "32%", y: "72%" },
        { id: 'in', country: "India", code: "INR", flag: "🇮🇳", chs: ["Bank Transfer", "Mobile (UPI)"], region: "Asia", x: "68%", y: "50%" },
    ];

    const regions = ['All', 'Africa', 'Americas', 'Asia'];
    const filteredNodes = activeRegion === 'All'
        ? nodes
        : nodes.filter(n => n.region === activeRegion);

    return (
        <section id="coverage" className="py-32 px-6 bg-[#030303] relative overflow-hidden">
            {/* Ambient Background - Subtle "Fintech" Glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="h-px w-8 bg-emerald-500" />
                            <span className="text-xs font-bold tracking-[0.4em] text-emerald-500 uppercase">Settlement Infrastructure</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase">
                            Global Liquidity <br />
                            <span className="text-white/20 italic">Local Precision.</span>
                        </h2>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-3 gap-8 mt-12">
                            {[
                                { label: "Supported Countries", value: "10+", sub: "Emerging Markets" },
                                { label: "Global Regions", value: "3", sub: "Africa, Asia, Americas" },
                                { label: "Payout Methods", value: "12+", sub: "Bank & Mobile Money" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{stat.label}</span>
                                    <span className="text-[9px] text-white/30 font-medium uppercase tracking-tighter mt-0.5">{stat.sub}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Region Filter - The "Senior" UX touch */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md self-start md:self-end">
                        {regions.map((reg) => (
                            <button
                                key={reg}
                                onClick={() => setActiveRegion(reg)}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-widest ${activeRegion === reg ? 'bg-emerald-500 text-black' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                {reg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid with AnimatePresence for smooth filtering */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredNodes.map((node) => (
                            <SettlementCard key={node.country} node={node} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

const SettlementCard = ({ node }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="group relative p-8 rounded-[24px] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden"
        >
            {/* The "Spotlight" background effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.15)_0%,transparent_70%)]" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        {/* Replace with actual SVG Flags or specialized icons */}
                        <span className="text-2xl">{node.flag}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-emerald-500 tracking-tighter">{node.code}</div>
                        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{node.region}</div>
                    </div>
                </div>

                <h4 className="text-2xl font-bold text-white mb-6 tracking-tight group-hover:translate-x-1 transition-transform">{node.country}</h4>

                <div className="flex flex-wrap gap-2">
                    {node.chs.map((ch) => (
                        <div key={ch} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] font-bold text-white/60 uppercase">
                            {ch.includes('Mobile') ? <Smartphone size={12} className="text-emerald-500" /> : <Landmark size={12} className="text-emerald-500" />}
                            {ch}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SettlementMatrix;