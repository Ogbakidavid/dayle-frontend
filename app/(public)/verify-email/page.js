'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const inputs = useRef([]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending) return;

        setIsResending(true);
        // Simulate API call
        setTimeout(() => {
            setIsResending(false);
            setResendCooldown(60); // 60 seconds cooldown
            // Optional: Show a success message or toast here
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            // Handle paste
            const pastedData = value.split('').slice(0, 6);
            const newOtp = [...otp];
            pastedData.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            setOtp(newOtp);
            if (index + pastedData.length < 6) {
                inputs.current[index + pastedData.length].focus();
            } else {
                inputs.current[5].focus();
            }
        } else {
            if (!/^\d*$/.test(value)) return;
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) inputs.current[index + 1].focus();
        }
        setError('');
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            // Success
            setLoading(false);
            router.push('/onboarding/role');
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
                        Verify <br />
                        <span className="text-emerald-500 italic">Identity.</span>
                    </h1>

                    <div className="space-y-8">
                        {[
                            { title: "Layer 1 Security", text: "Email verification ensures you own this communication channel." },
                            { title: "Fraud Prevention", text: "We verify every account to maintain a trusted ecosystem." },
                            { title: "Next: Role Selection", text: "After verification, you'll choose your workspace role." }
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

                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">Check your email</h2>
                        <p className="text-white mt-4 text-sm font-bold uppercase tracking-wide leading-relaxed">
                            We've sent a 6-digit code to your email. Enter it below to verify your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex gap-3 justify-between">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-14 h-16 bg-[#0a0a0a] border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:border-emerald-500/50 focus:bg-white/[0.08] focus:outline-none transition-all placeholder:text-gray-400"
                                />
                            ))}
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
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Verify Account <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>

                        <div className="text-center text-white/50 text-sm font-bold uppercase tracking-wide mt-6">
                            {resendCooldown > 0 ? (
                                <p>Resend available in <span className="text-emerald-500">{resendCooldown}s</span></p>
                            ) : (
                                <p>
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className="text-emerald-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-1"
                                    >
                                        {isResending ? (
                                            <span className="flex items-center gap-1 inline-flex">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Sending...
                                            </span>
                                        ) : (
                                            "Resend"
                                        )}
                                    </button>
                                </p>
                            )}
                        </div>
                    </form>
                </div>


            </div>
        </div>
    );
}
