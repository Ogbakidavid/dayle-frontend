'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, Loader2, CheckCircle2, Lock, User } from 'lucide-react';
import { api, UserRole } from '@/lib/mock-api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const user = await api.auth.login(email, password);
      if (user.role === UserRole.CLIENT) router.push('/client');
      else if (user.role === UserRole.FREELANCER) router.push('/freelancer');
      else router.push('/onboarding/role');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row selection:bg-emerald-500/30 font-['Poppins',_sans-serif]">

      {/* LEFT SIDE: Branding & Features (Visual Anchor) */}
      <div className="hidden md:flex md:w-[45%] bg-[#080808] relative items-center justify-center p-20 border-r border-white/5 overflow-hidden">
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
                  <h4 className="text-white font-black uppercase text-sm tracking-widest mb-1">{item.title}</h4>
                  <p className="text-slate-500 font-medium text-lg leading-snug">{item.text}</p>
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
          <div className="mb-12">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">Sign In</h2>
            <p className="text-slate-500 mt-4 text-lg font-medium leading-relaxed">Access your secure financial workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="!bg-[#0a0a0a] border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] autofill:text-fill-white"
                />
                <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Password</Label>
                <Link href="#" className="text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="!bg-[#0a0a0a] border-white/10 h-16 rounded-2xl px-6 focus:border-emerald-500/50 focus:!bg-white/[0.08] focus:ring-0 transition-all !text-white text-lg placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#0a0a0a_inset] autofill:text-fill-white"
                />
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 pointer-events-none group-focus-within:text-emerald-500/50 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-white text-black hover:bg-emerald-500 hover:text-black rounded-2xl font-black text-base uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-12 text-center text-slate-500 text-base font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white hover:text-emerald-500 font-black transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-emerald-500/50">
              Create account
            </Link>
          </p>
        </div>

        {/* Technical Metadata Footer */}
        <div className="absolute bottom-10 left-10 md:left-auto md:right-10 flex items-center gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">Status</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}