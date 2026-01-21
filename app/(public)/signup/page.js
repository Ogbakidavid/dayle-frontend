'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/mock-api';
import { ArrowRight, CheckCircle2, Loader2, Shield, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useUser } from '@/lib/store/user-context';

export default function SignupPage() {
    const router = useRouter();
    const { signup: contextSignup } = useUser();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await contextSignup(email, password);

            if (returnTo) {
                router.push(returnTo);
                return;
            }

            router.push('/verify-email');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row selection:bg-emerald-500/30 font-['Poppins',_sans-serif]">

            {/* LEFT SIDE: Branding & Features (Visual Anchor) */}
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
                        <span className="font-black tracking-tighter text-white text-3xl uppercase">Dayle</span>
                    </Link>

                    <h1 className="text-6xl lg:text-7xl font-black text-white leading-[0.95] uppercase tracking-tighter mb-12">
                        Secure <br />
                        <span className="text-emerald-500 italic">Payments.</span>
                    </h1>

                    <div className="space-y-8">
                        {[
                            { title: "Capital Security", text: "Funds are held in isolated, insured vaults." },
                            { title: "Automated Payouts", text: "Milestone-based fund release upon completion." },
                            { title: "Verified Solvency", text: "Verified proof-of-funds for every project." }
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

            {/* RIGHT SIDE: Form (The Action) */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-24 bg-[#050505] relative overflow-hidden">
                {/* Subtle Form Background Detail */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-[440px] relative z-10">
                    <div className="mb-10">
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">Create Account</h2>
                        <p className="text-white mt-4 text-sm font-bold uppercase tracking-wide leading-relaxed">Start securing your professional engagements today.</p>
                    </div>

                    <div className="space-y-6">
                        <Button
                            variant="outline"
                            className="w-full h-14 bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                            onClick={() => console.log("Google Signup")}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5"></span>
                            </div>
                            <div className="relative flex justify-center text-sm uppercase tracking-wide">
                                <span className="bg-[#050505] px-4 text-white font-black">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-black uppercase tracking-wide text-white ml-1">Email Address</Label>
                                <div className="relative group">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        required
                                        className="!bg-[#0a0a0a] border-white/10 h-14 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                                    />
                                    <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-black uppercase tracking-wide text-white ml-1">Password</Label>
                                <div className="relative group">
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        className="!bg-[#0a0a0a] border-white/10 h-14 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-black uppercase tracking-wide text-white ml-1">Confirm Password</Label>
                                <div className="relative group">
                                    <PasswordInput
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        required
                                        className="!bg-[#0a0a0a] border-white/10 h-14 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-gray-400 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
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
                                className="w-full h-14 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-wide transition-all shadow-xl active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </div>

                    <p className="mt-12 text-center text-white text-sm font-bold uppercase tracking-wide">
                        Already have an account?{' '}
                        <Link
                            href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
                            className="text-white hover:text-emerald-500 font-black transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-emerald-500/50"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>


            </div>
        </div>
    );
}
