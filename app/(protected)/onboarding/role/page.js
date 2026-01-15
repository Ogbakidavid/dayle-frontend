'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, Users, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { api, UserRole } from '@/lib/mock-api';

export default function RoleSelectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(null);

    async function handleSelect(role) {
        setLoading(role);
        try {
            await api.auth.updateProfile(role);
            router.push(`/onboarding/kyc?role=${role}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 font-['Poppins',_sans-serif]">

            {/* Background Grid Decoration */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <div className="relative z-10 w-full max-w-4xl">

                {/* Header Section */}
                <div className="text-center mb-16 space-y-6">
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Shield className="w-8 h-8 text-black stroke-[3px]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                        Identify Your <span className="text-emerald-500">Node.</span>
                    </h1>
                    <p className="text-white/40 text-xl font-bold max-w-xl mx-auto uppercase tracking-tight">
                        Choose how you will interact with the Cleard protocol to begin setup.
                    </p>
                </div>

                {/* Selection Cards */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Client Option */}
                    <div
                        onClick={() => !loading && handleSelect(UserRole.CLIENT)}
                        className={`group relative p-10 rounded-[40px] border transition-all cursor-pointer overflow-hidden ${loading === UserRole.CLIENT ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-[#0a0a0a] hover:border-emerald-500/50 hover:bg-[#0f0f0f]'
                            }`}
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                                <Users className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">I'm a Client</h3>
                            <p className="text-white/40 text-lg font-bold leading-relaxed mb-10 uppercase tracking-tight">
                                I want to hire talent, create secure payment vaults, and release funds only after work is verified.
                            </p>
                            <Button
                                variant="ghost"
                                className="p-0 text-emerald-500 font-black uppercase tracking-widest text-sm hover:bg-transparent group-hover:translate-x-2 transition-transform"
                            >
                                {loading === UserRole.CLIENT ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Setup Client Account <ArrowRight className="w-5 h-5" /></span>}
                            </Button>
                        </div>
                    </div>

                    {/* Freelancer Option */}
                    <div
                        onClick={() => !loading && handleSelect(UserRole.FREELANCER)}
                        className={`group relative p-10 rounded-[40px] border transition-all cursor-pointer overflow-hidden ${loading === UserRole.FREELANCER ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 bg-[#0a0a0a] hover:border-emerald-500/50 hover:bg-[#0f0f0f]'
                            }`}
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-8 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                                <Briefcase className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">I'm a Talent</h3>
                            <p className="text-white/40 text-lg font-bold leading-relaxed mb-10 uppercase tracking-tight">
                                I want to work with verified clients and receive guaranteed, milestone-based payouts for my projects.
                            </p>
                            <Button
                                variant="ghost"
                                className="p-0 text-emerald-500 font-black uppercase tracking-widest text-sm hover:bg-transparent group-hover:translate-x-2 transition-transform"
                            >
                                {loading === UserRole.FREELANCER ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Setup Talent Account <ArrowRight className="w-5 h-5" /></span>}
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Footer Metadata */}
                <div className="mt-20 flex flex-col items-center gap-4">
                    <div className="flex gap-8 text-[11px] font-black text-white/10 uppercase tracking-[0.3em]">
                        <span>Secure Selection</span>
                        <span>•</span>
                        <span>Identity Verification Next</span>
                    </div>
                </div>
            </div>
        </div>
    );
}