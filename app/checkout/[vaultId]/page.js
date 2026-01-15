'use client';

import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Lock, ShieldCheck, CreditCard, Building2, ChevronRight
} from "lucide-react";

export default function CheckoutSelectionPage() {
    const router = useRouter();
    const params = useParams();
    const amount = 1522.50; // Mock amount

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans antialiased">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* LEFT SIDEBAR (25%) */}
                <section className="w-full lg:w-[25%] bg-[#080808] p-10 border-r border-white/5 flex flex-col justify-between">
                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Lock className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-white font-bold tracking-tighter text-lg uppercase">Cleard</span>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase text-white/20 tracking-[0.2em]">Payable Amount</p>
                                <h1 className="text-5xl font-bold text-white tracking-tighter">${amount.toLocaleString()}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-black uppercase tracking-widest mb-2">
                            <ShieldCheck className="w-4 h-4" /> Vault Escrow Active
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed font-bold">Funds are held in a secure multi-sig vault until milestone approval.</p>
                    </div>
                </section>

                {/* RIGHT CONTENT AREA */}
                <main className="flex-1 p-8 lg:p-20 flex items-center justify-center">
                    <div className="max-w-md w-full">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Payment Method</h2>
                                <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Select how you want to fund this project</p>
                            </div>
                            <div className="grid gap-4">
                                <MethodBtn
                                    icon={<CreditCard />}
                                    title="Card Payment"
                                    desc="Visa, Mastercard, Amex"
                                    onClick={() => router.push(`/checkout/${params.vaultId}/card`)}
                                />
                                <MethodBtn
                                    icon={<Building2 />}
                                    title="Bank Transfer"
                                    desc="Wire, ACH, SWIFT"
                                    onClick={() => router.push(`/checkout/${params.vaultId}/bank`)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- COMPONENTS ---

function MethodBtn({ icon, title, desc, onClick }) {
    return (
        <button onClick={onClick} className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center gap-6 group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-left">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-all">{icon}</div>
            <div className="flex-1">
                <p className="text-white font-bold text-lg">{title}</p>
                <p className="text-sm text-white/40 font-bold">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
    );
}