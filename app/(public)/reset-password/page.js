'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            setLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row selection:bg-emerald-500/30 font-['Poppins',_sans-serif]">

            {/* LEFT SIDE: Branding & Features */}
            <div className="hidden md:flex md:w-[45%] bg-[#080808] relative justify-center p-20 border-r border-white/5 overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                {/* Ambient Glow */}
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>

                <div className="relative z-10 w-full max-w-lg">
                    <Link href="/" className="flex items-center gap-4 mb-20 group">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-emerald-500/20 text-black">
                            <Shield className="w-7 h-7 stroke-[3px]" />
                        </div>
                        <span className="font-black tracking-tighter text-white text-3xl uppercase">CLEARD</span>
                    </Link>

                    <h1 className="text-6xl lg:text-7xl font-black text-white leading-[0.95] uppercase tracking-tighter mb-12">
                        Secure <br />
                        <span className="text-emerald-500 italic">Access.</span>
                    </h1>

                    <div className="space-y-8">
                        {[
                            { title: "Encryption", text: "Your new credentials are encrypted end-to-end." },
                            { title: "Verification", text: "We've verified your secure reset token." },
                            { title: "Instant Access", text: "Login immediately after resetting your password." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-5 group">
                                <div className="mt-1">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 transition-transform group-hover:scale-110" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black uppercase text-sm tracking-wide mb-1">{item.title}</h4>
                                    <p className="text-white font-bold text-lg leading-snug">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-[#050505] relative overflow-hidden">
                {/* Subtle Form Background Detail */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-[440px] relative z-10">

                    {!submitted ? (
                        <>
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">Reset Password</h2>
                                <p className="text-white mt-4 text-sm font-bold uppercase tracking-wide leading-relaxed">Create a strong new password for your account.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-sm font-black uppercase tracking-wide text-white ml-1">New Password</Label>
                                    <div className="relative group">
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            placeholder="••••••••"
                                            required
                                            className="!bg-[#0a0a0a] border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] autofill:text-fill-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" className="text-sm font-black uppercase tracking-wide text-white ml-1">Confirm New Password</Label>
                                    <div className="relative group">
                                        <PasswordInput
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            required
                                            className="!bg-[#0a0a0a] border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] autofill:text-fill-white"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 text-red-400 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm font-bold uppercase tracking-wide leading-relaxed">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-wide transition-all shadow-xl active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Upating...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Reset Password <ArrowRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="bg-[#111111] border border-white/10 p-8 rounded-3xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="w-8 h-8 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Password Reset!</h3>
                                <p className="text-white/70 text-sm font-bold uppercase tracking-wide mt-2 leading-relaxed">
                                    Your password has been successfully updated. You can now login with your new credentials.
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full h-14 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-xl"
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
