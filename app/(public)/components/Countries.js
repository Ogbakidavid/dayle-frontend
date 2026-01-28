// "use client";

// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// const countries = [
//     { id: 'ng', country: "Nigeria", code: "NGN", flag: "🇳🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "48%", y: "58%" },
//     { id: 'ke', country: "Kenya", code: "KES", flag: "🇰🇪", chs: ["M-Pesa", "Bank Transfer"], region: "Africa", x: "54%", y: "62%" },
//     { id: 'gh', country: "Ghana", code: "GHS", flag: "🇬🇭", chs: ["Mobile Money", "Bank"], region: "Africa", x: "46%", y: "60%" },
//     { id: 'ug', country: "Uganda", code: "UGX", flag: "🇺🇬", chs: ["Mobile Money"], region: "Africa", x: "53%", y: "60%" },
//     { id: 'tz', country: "Tanzania", code: "TZS", flag: "🇹🇿", chs: ["Bank", "Mobile"], region: "Africa", x: "54%", y: "65%" },
//     { id: 'br', country: "Brazil", code: "BRL", flag: "🇧🇷", chs: ["PIX Instant", "Bank"], region: "Americas", x: "32%", y: "72%" },
//     { id: 'in', country: "India", code: "INR", flag: "🇮🇳", chs: ["UPI", "IMPS Bank"], region: "Asia", x: "68%", y: "50%" },
//     { id: 'ci', country: "Côte d'Ivoire", code: "XOF", flag: "🇨🇮", chs: ["Orange Money", "MTN"], region: "Africa", x: "45%", y: "61%" },
// ];

// const PremiumSettlementMatrix = () => {
//     const [activeCountry, setActiveCountry] = useState(countries[0]);

//     return (
//         <section className="py-24 px-6 bg-[#050505] relative overflow-hidden min-h-screen flex items-center">
//             {/* Background Ambient Glow */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

//             <div className="max-w-7xl mx-auto w-full relative z-10">
//                 <div className="flex flex-col lg:flex-row gap-16 items-center">

//                     {/* LEFT: The Interactive Map */}
//                     <div className="w-full lg:w-3/5 relative">
//                         <div className="absolute -top-10 left-0">
//                             <span className="text-emerald-500 font-mono text-xs tracking-widest uppercase mb-2 block">Network Status: Operational</span>
//                             <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Global <span className="text-emerald-500">Nodes</span></h2>
//                         </div>

//                         {/* Stylized SVG Map */}
//                         <svg viewBox="0 0 1000 500" className="w-full h-auto opacity-20 grayscale invert">
//                             <path fill="currentColor" d="M150,150 L850,150 L850,450 L150,450 Z" className="opacity-0" />
//                             {/* Note: In a real app, use a proper World Map SVG Path here */}
//                             <image href="https://upload.wikimedia.org/wikipedia/commons/c/c4/Earth_dotted_map.svg" width="1000" height="500" />
//                         </svg>

//                         {/* Interactive Pins */}
//                         {countries.map((node) => (
//                             <button
//                                 key={node.id}
//                                 onClick={() => setActiveCountry(node)}
//                                 className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 group"
//                                 style={{ left: node.x, top: node.y }}
//                             >
//                                 <div className={`relative flex items-center justify-center`}>
//                                     <div className={`absolute w-8 h-8 rounded-full animate-ping ${activeCountry.id === node.id ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
//                                     <div className={`w-3 h-3 rounded-full border-2 transition-colors ${activeCountry.id === node.id ? 'bg-emerald-500 border-white' : 'bg-white/20 border-transparent group-hover:bg-emerald-400'}`} />
//                                 </div>

//                                 {/* Tooltip on Hover */}
//                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
//                                     <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded">
//                                         {node.country}
//                                     </div>
//                                 </div>
//                             </button>
//                         ))}
//                     </div>

//                     {/* RIGHT: Detail Card */}
//                     <div className="w-full lg:w-2/5">
//                         <AnimatePresence mode="wait">
//                             <motion.div
//                                 key={activeCountry.id}
//                                 initial={{ opacity: 0, x: 20 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 exit={{ opacity: 0, x: -20 }}
//                                 transition={{ duration: 0.4, ease: "circOut" }}
//                                 className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
//                             >
//                                 {/* Decoration */}
//                                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />

//                                 <div className="flex items-center gap-4 mb-8">
//                                     <span className="text-6xl">{activeCountry.flag}</span>
//                                     <div>
//                                         <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{activeCountry.country}</h3>
//                                         <p className="text-emerald-500 font-mono tracking-[0.3em] text-sm mt-2">{activeCountry.code} SETTLEMENT</p>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-6">
//                                     <div>
//                                         <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-3">Available Channels</p>
//                                         <div className="flex flex-wrap gap-2">
//                                             {activeCountry.chs.map((ch, i) => (
//                                                 <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider">
//                                                     {ch}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     <div className="pt-6 border-t border-white/5 flex justify-between items-end">
//                                         <div>
//                                             <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-1">Region</p>
//                                             <p className="text-white font-bold">{activeCountry.region}</p>
//                                         </div>
//                                         <div className="text-right">
//                                             <p className="text-white/40 text-[10px] uppercase tracking-widest font-black mb-1">Liquidity</p>
//                                             <p className="text-emerald-500 font-bold italic">Instant</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Call to Action Inside Card */}
//                                 <button className="w-full mt-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">
//                                     Initialize Payout
//                                 </button>
//                             </motion.div>
//                         </AnimatePresence>

//                         {/* Quick Selector (Mobile friendly list) */}
//                         <div className="mt-8 grid grid-cols-4 gap-2">
//                             {countries.map((node) => (
//                                 <button
//                                     key={node.id}
//                                     onClick={() => setActiveCountry(node)}
//                                     className={`py-2 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-tighter ${activeCountry.id === node.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-white/5 text-white/40 hover:border-white/20'}`}
//                                 >
//                                     {node.id}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default PremiumSettlementMatrix;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Landmark, Smartphone, Search } from 'lucide-react';

const SettlementMatrix = () => {
    const [activeRegion, setActiveRegion] = useState('All');

    const nodes = [
        { id: 'ng', country: "Nigeria", code: "NGN", flag: "🇳🇬", chs: ["Bank Transfer", "Mobile Money"], region: "Africa", x: "48%", y: "58%" },
        { id: 'ke', country: "Kenya", code: "KES", flag: "🇰🇪", chs: ["M-Pesa", "Bank Transfer"], region: "Africa", x: "54%", y: "62%" },
        { id: 'gh', country: "Ghana", code: "GHS", flag: "🇬🇭", chs: ["Mobile Money", "Bank"], region: "Africa", x: "46%", y: "60%" },
        { id: 'ug', country: "Uganda", code: "UGX", flag: "🇺🇬", chs: ["Mobile Money"], region: "Africa", x: "53%", y: "60%" },
        { id: 'tz', country: "Tanzania", code: "TZS", flag: "🇹🇿", chs: ["Bank", "Mobile"], region: "Africa", x: "54%", y: "65%" },
        { id: 'br', country: "Brazil", code: "BRL", flag: "🇧🇷", chs: ["PIX Instant", "Bank"], region: "Americas", x: "32%", y: "72%" },
        { id: 'in', country: "India", code: "INR", flag: "🇮🇳", chs: ["UPI", "IMPS Bank"], region: "Asia", x: "68%", y: "50%" },
        { id: 'ci', country: "Côte d'Ivoire", code: "XOF", flag: "🇨🇮", chs: ["Orange Money", "MTN"], region: "Africa", x: "45%", y: "61%" },
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
                    </div>

                    {/* Region Filter - The "Senior" UX touch */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
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