// "use client";
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Globe, Landmark, Smartphone, Search } from 'lucide-react';

// const SettlementMatrix = () => {
//     const [activeRegion, setActiveRegion] = useState('All');

//     const nodes = [
//         { id: 'ng', country: "Nigeria", code: "NGN", flag: "🇳🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "48%", y: "58%" },
//         { id: 'ke', country: "Kenya", code: "KES", flag: "🇰🇪", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "54%", y: "62%" },
//         { id: 'gh', country: "Ghana", code: "GHS", flag: "🇬🇭", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "46%", y: "60%" },
//         { id: 'ug', country: "Uganda", code: "UGX", flag: "🇺🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "53%", y: "60%" },
//         { id: 'tz', country: "Tanzania", code: "TZS", flag: "🇹🇿", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "54%", y: "65%" },
//         { id: 'mw', country: "Malawi", code: "MWK", flag: "🇲🇼", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "55%", y: "68%" },
//         { id: 'bj', country: "Benin", code: "XOF", flag: "🇧🇯", chs: ["Mobile Money"], region: "Africa", x: "47%", y: "59%" },
//         { id: 'ci', country: "Côte d'Ivoire", code: "XOF", flag: "🇨🇮", chs: ["Mobile Money"], region: "Africa", x: "45%", y: "61%" },
//         { id: 'br', country: "Brazil", code: "BRL", flag: "🇧🇷", chs: ["Mobile (PIX)"], region: "Americas", x: "32%", y: "72%" },
//         { id: 'in', country: "India", code: "INR", flag: "🇮🇳", chs: ["Bank Transfer", "Mobile (UPI)"], region: "Asia", x: "68%", y: "50%" },
//     ];

//     const regions = ['All', 'Africa', 'Americas', 'Asia'];
//     const filteredNodes = activeRegion === 'All'
//         ? nodes
//         : nodes.filter(n => n.region === activeRegion);

//     return (
//         <section id="coverage" className="py-32 px-6 relative overflow-hidden">
//             {/* Ambient Background - Subtle "Fintech" Glow */}
//             <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none" />

//             <div className="max-w-7xl mx-auto relative z-10">
//                 {/* Header Section */}
//                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
//                     <div className="max-w-2xl">
//                         <motion.div
//                             initial={{ opacity: 0, x: -20 }}
//                             whileInView={{ opacity: 1, x: 0 }}
//                             className="flex items-center gap-3 mb-6"
//                         >
//                             <div className="h-px w-8 bg-emerald-500" />
//                             <span className="text-xs font-bold tracking-[0.4em] text-emerald-500 uppercase">Settlement Infrastructure</span>
//                         </motion.div>
//                         <h2 className="text-5xl md:text-6xl font-black text-white leading-none tracking-tighter uppercase">
//                             Global Liquidity <br />
//                             <span className="text-white/20 italic">Local Precision.</span>
//                         </h2>

//                         {/* Statistics Grid */}
//                         <div className="grid grid-cols-3 gap-8 mt-12">
//                             {[
//                                 { label: "Supported Countries", value: "10+", sub: "Emerging Markets" },
//                                 { label: "Global Regions", value: "3", sub: "Africa, Asia, Americas" },
//                                 { label: "Payout Methods", value: "12+", sub: "Bank & Mobile Money" }
//                             ].map((stat, i) => (
//                                 <motion.div
//                                     key={stat.label}
//                                     initial={{ opacity: 0, y: 20 }}
//                                     whileInView={{ opacity: 1, y: 0 }}
//                                     transition={{ delay: i * 0.1 }}
//                                     className="flex flex-col"
//                                 >
//                                     <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
//                                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{stat.label}</span>
//                                     <span className="text-[9px] text-white/30 font-medium uppercase tracking-tighter mt-0.5">{stat.sub}</span>
//                                 </motion.div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Region Filter - The "Senior" UX touch */}
//                     <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md self-start md:self-end">
//                         {regions.map((reg) => (
//                             <button
//                                 key={reg}
//                                 onClick={() => setActiveRegion(reg)}
//                                 className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 uppercase tracking-widest ${activeRegion === reg ? 'bg-emerald-500 text-black' : 'text-white/40 hover:text-white'
//                                     }`}
//                             >
//                                 {reg}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Grid with AnimatePresence for smooth filtering */}
//                 <motion.div
//                     layout
//                     className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
//                 >
//                     <AnimatePresence mode='popLayout'>
//                         {filteredNodes.map((node) => (
//                             <SettlementCard key={node.country} node={node} />
//                         ))}
//                     </AnimatePresence>
//                 </motion.div>
//             </div>
//         </section>
//     );
// };

// const SettlementCard = ({ node }) => {
//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//             whileHover={{ y: -5 }}
//             className="group relative p-8 rounded-[24px] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden"
//         >
//             {/* The "Spotlight" background effect */}
//             <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.15)_0%,transparent_70%)]" />

//             <div className="relative z-10">
//                 <div className="flex justify-between items-center mb-12">
//                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
//                         {/* Replace with actual SVG Flags or specialized icons */}
//                         <span className="text-2xl">{node.flag}</span>
//                     </div>
//                     <div className="text-right">
//                         <div className="text-xs font-black text-emerald-500 tracking-tighter">{node.code}</div>
//                         <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{node.region}</div>
//                     </div>
//                 </div>

//                 <h4 className="text-2xl font-bold text-white mb-6 tracking-tight group-hover:translate-x-1 transition-transform">{node.country}</h4>

//                 <div className="flex flex-wrap gap-2">
//                     {node.chs.map((ch) => (
//                         <div key={ch} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-[10px] font-bold text-white/60 uppercase">
//                             {ch.includes('Mobile') ? <Smartphone size={12} className="text-emerald-500" /> : <Landmark size={12} className="text-emerald-500" />}
//                             {ch}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </motion.div>
//     );
// };

// export default SettlementMatrix;


"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Landmark, Smartphone } from "lucide-react";

const DATA = [
    { id: "ng", country: "Nigeria", code: "NGN", flag: "🇳🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "ke", country: "Kenya", code: "KES", flag: "🇰🇪", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "gh", country: "Ghana", code: "GHS", flag: "🇬🇭", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "ug", country: "Uganda", code: "UGX", flag: "🇺🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "tz", country: "Tanzania", code: "TZS", flag: "🇹🇿", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "mw", country: "Malawi", code: "MWK", flag: "🇲🇼", chs: ["Bank Transfer", "Mobile Money"], region: "Africa" },
    { id: "bj", country: "Benin", code: "XOF", flag: "🇧🇯", chs: ["Mobile Money"], region: "Africa" },
    { id: "ci", country: "Côte d'Ivoire", code: "XOF", flag: "🇨🇮", chs: ["Mobile Money"], region: "Africa" },
    { id: "br", country: "Brazil", code: "BRL", flag: "🇧🇷", chs: ["Mobile (PIX)"], region: "Americas" },
    { id: "in", country: "India", code: "INR", flag: "🇮🇳", chs: ["Bank Transfer", "Mobile (UPI)"], region: "Asia" },
];

const REGION_ORDER = ["Africa", "Asia", "Americas"];

export default function CoverageByRegion() {
    const grouped = useMemo(() => {
        const m = new Map();
        for (const r of REGION_ORDER) m.set(r, []);
        for (const n of DATA) {
            if (!m.has(n.region)) m.set(n.region, []);
            m.get(n.region).push(n);
        }
        // sort countries inside each region
        for (const [k, arr] of m.entries()) {
            arr.sort((a, b) => a.country.localeCompare(b.country));
            m.set(k, arr);
        }
        return m;
    }, []);

    const [openRegion, setOpenRegion] = useState(REGION_ORDER[0]);
    const [activeCountryId, setActiveCountryId] = useState(DATA[0]?.id);

    const activeCountry = useMemo(
        () => DATA.find((x) => x.id === activeCountryId) || null,
        [activeCountryId]
    );

    const stats = useMemo(() => {
        const countries = DATA.length;
        const regions = new Set(DATA.map((n) => n.region)).size;
        const methods = new Set(DATA.flatMap((n) => n.chs)).size;
        return { countries, regions, methods };
    }, []);

    return (
        <section id="coverage" className="py-24 md:py-32 px-4 md:px-6 bg-[#050505] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
                    <div className="max-w-3xl">
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                            Coverage
                        </div>
                        <h2 className="mt-3 text-4xl md:text-6xl font-black text-white tracking-tight leading-[0.95]">
                            Corridors by region.
                            <span className="text-emerald-500 italic"> Clear and verifiable.</span>
                        </h2>
                        <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">
                            Browse corridor coverage by region. Select a country to view currency and payout methods.
                        </p>

                        <div className="mt-7 flex gap-8">
                            <MiniStat label="Countries" value={stats.countries} />
                            <MiniStat label="Regions" value={stats.regions} />
                            <MiniStat label="Methods" value={stats.methods} />
                        </div>
                    </div>

                    {/* Right-side note (optional but keeps you honest) */}
                    <div className="lg:text-right text-white/45 text-sm max-w-md">
                        Coverage expands corridor-by-corridor as partner rails come online.
                    </div>
                </div>

                {/* Main */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left: Regions + country lists */}
                    <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#070707] overflow-hidden">
                        {Array.from(grouped.entries()).map(([region, countries]) => (
                            <RegionAccordion
                                key={region}
                                region={region}
                                countries={countries}
                                open={openRegion === region}
                                onToggle={() => setOpenRegion(openRegion === region ? "" : region)}
                                activeCountryId={activeCountryId}
                                onSelectCountry={(id) => setActiveCountryId(id)}
                            />
                        ))}
                    </div>

                    {/* Right: Details panel */}
                    <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#070707] p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            {activeCountry ? (
                                <motion.div
                                    key={activeCountry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center">
                                                <span className="text-2xl">{activeCountry.flag}</span>
                                            </div>
                                            <div>
                                                <div className="text-white font-black tracking-tight text-xl">
                                                    {activeCountry.country}
                                                </div>
                                                <div className="text-[11px] text-white/45 font-semibold uppercase tracking-widest">
                                                    {activeCountry.region} • {activeCountry.code}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                                            Payout methods
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {activeCountry.chs.map((m) => (
                                                <MethodChip key={m} label={m} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-3">
                                        <DetailTile label="Currency" value={activeCountry.code} />
                                        <DetailTile label="Region" value={activeCountry.region} />
                                    </div>

                                    <div className="mt-8 text-white/45 text-sm leading-relaxed">
                                        This corridor is represented as a payout endpoint. Availability depends on partner rails and local settlement constraints.
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white/60"
                                >
                                    Select a country to view corridor details.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RegionAccordion({
    region,
    countries,
    open,
    onToggle,
    activeCountryId,
    onSelectCountry,
}) {
    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-5 md:px-8 md:py-6 text-left hover:bg-white/[0.02] transition-colors"
            >
                <div>
                    <div className="text-white font-black tracking-tight text-xl">{region}</div>
                    <div className="text-[11px] text-white/45 font-semibold uppercase tracking-widest mt-1">
                        {countries.length} countries
                    </div>
                </div>

                <ChevronDown
                    className={`w-5 h-5 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 md:px-6 pb-6">
                            <div className="grid sm:grid-cols-2 gap-2">
                                {countries.map((c) => {
                                    const active = c.id === activeCountryId;
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => onSelectCountry(c.id)}
                                            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${active
                                                ? "bg-white text-black border-white"
                                                : "bg-black/20 border-white/10 text-white/75 hover:border-white/20 hover:bg-white/[0.03]"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{c.flag}</span>
                                                <div className="text-sm font-bold tracking-tight">{c.country}</div>
                                            </div>
                                            <div className={`text-[11px] font-black uppercase tracking-widest ${active ? "text-black/60" : "text-white/35"}`}>
                                                {c.code}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#070707] px-4 py-3">
            <div className="text-white text-2xl font-black tracking-tight">{value}</div>
            <div className="text-[10px] text-white/45 font-bold uppercase tracking-widest mt-1">
                {label}
            </div>
        </div>
    );
}

function DetailTile({ label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="text-[10px] text-white/45 font-bold uppercase tracking-widest">{label}</div>
            <div className="mt-1 text-white font-black tracking-tight">{value}</div>
        </div>
    );
}

function MethodChip({ label }) {
    const s = label.toLowerCase();
    const isMobile = s.includes("mobile") || s.includes("pix") || s.includes("upi");
    const Icon = isMobile ? Smartphone : Landmark;

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
            <Icon className="w-3.5 h-3.5 text-emerald-400/90" />
            <span className="text-[11px] font-semibold text-white/70">{label}</span>
        </div>
    );
}
