'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ArrowLeft, Lock, Fingerprint } from 'lucide-react';
import { api, UserRole } from '@/lib/mock-api';
import { useUser } from '@/lib/store/user-context';
import { cn } from '@/lib/utils';

export default function Verify2FAPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const { login: contextLogin } = useUser();

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [pendingCredentials, setPendingCredentials] = useState(null);
    const inputRefs = useRef([]);

    useEffect(() => {
        const creds = api.auth.getPending2FA();
        if (!creds) {
            router.replace('/login');
            return;
        }
        setPendingCredentials(creds);
        setInitializing(false);
    }, [router]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value.substring(element.value.length - 1);
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    async function handleVerify(e) {
        if (e) e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6 || !pendingCredentials) return;

        setLoading(true);
        setError('');

        try {
            await api.security.verify2FAOnLogin(pendingCredentials.email, code);
            const user = await contextLogin(pendingCredentials.email, pendingCredentials.password);
            api.auth.clearPending2FA();

            const routes = { [UserRole.CLIENT]: '/client', [UserRole.FREELANCER]: '/freelancer' };
            router.push(returnTo || routes[user.role] || '/onboarding/role');
        } catch (err) {
            setError(err.message || 'Invalid code. Please try again.');
            setLoading(false);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        }
    }

    if (initializing) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">

            {/* Ambient Lighting */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-900/20 blur-[160px] rounded-full opacity-50" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 shadow-2xl">
                        <Fingerprint className="w-8 h-8 text-emerald-500 stroke-[1.5]" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Authentication Required
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Enter the 6-digit code from your app for <br />
                        <span className="text-emerald-400/90 font-medium">{pendingCredentials?.email}</span>
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl">
                    <form onSubmit={handleVerify} className="space-y-8">
                        <div className="flex justify-between gap-2.5">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    className={cn(
                                        "w-full h-14 bg-zinc-950/50 border border-zinc-800 rounded-xl text-center text-xl font-bold text-white transition-all duration-200",
                                        "focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none",
                                        data && "border-emerald-500/30 bg-zinc-900",
                                        error && "border-red-500/50 ring-4 ring-red-500/10"
                                    )}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-500/5 border border-red-500/20 py-3 px-4 rounded-xl">
                                <p className="text-xs text-center font-medium text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                disabled={loading || otp.some(v => v === "")}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-[0_1px_20px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify and Continue"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => {
                                    api.auth.clearPending2FA();
                                    router.push('/login');
                                }}
                                className="w-full py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </button>
                        </div>
                    </form>
                </div>

                {/* Trust Footer */}
                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="h-px w-12 bg-zinc-800" />
                    <div className="flex items-center gap-2 text-zinc-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                            Secure Verification Protocol
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}