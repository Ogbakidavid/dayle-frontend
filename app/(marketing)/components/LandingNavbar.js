"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingNavbar() {
    return (
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
    );
}
