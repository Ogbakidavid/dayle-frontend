'use client';

import * as React from 'react';
import { Shield } from 'lucide-react';

export default function PublicLoading() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
            {/* Background Sophistication (matching Login/Signup) */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-white/3 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                    <Shield className="w-8 h-8 text-emerald-500 stroke-[2.5px] relative z-10" />
                </div>

                <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/3 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
}
