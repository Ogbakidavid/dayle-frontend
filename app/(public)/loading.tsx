'use client';

import * as React from 'react';
import { LogoLoader } from '@/components/ui/logo-loader';

export default function PublicLoading() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
            {/* Background Sophistication (matching Login/Signup) */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <LogoLoader size="lg" />
            </div>
        </div>
    );
}
