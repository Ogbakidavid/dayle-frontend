'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function InteractiveCard({
    cardNumber = '',
    cardHolder = '',
    expiry = '',
    cvc = '',
    cardType = '',
}) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Auto-flip when focusing/typing CVC
    useEffect(() => {
        if (cvc.length > 0) {
            setIsFlipped(true);
        } else if (cvc.length === 0 && isFlipped) {
            // Optional: delay flipping back or only flip back on blur (handled by parent usually, but here simple logic)
            const timer = setTimeout(() => setIsFlipped(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [cvc, isFlipped]);


    // Determine Card Type (Simple Check)
    const getCardType = (number) => {
        if (number.startsWith('4')) return 'VISA';
        if (number.startsWith('5')) return 'Mastercard';
        return 'Card';
    };

    return (
        <div className="perspective-1000 w-full max-w-[360px] h-[220px] mx-auto relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-700"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-sm overflow-hidden shadow-2xl glass-card-front bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/10">
                    {/* Background Texture/Design */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16" />
                    </div>

                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start">
                            {/* Chip */}
                            <div className="w-12 h-9 rounded-sm bg-gradient-to-br from-yellow-200 to-yellow-500 border border-yellow-600/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] bg-cover" />
                                <div className="w-8 h-px bg-black/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                <div className="w-px h-6 bg-black/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>

                            {/* Card Brand Logo */}
                            <div className="h-8 flex items-center">
                                {cardType === 'visa' && (
                                    <svg className="h-full w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.8 2H30.2L27.8 17H16.4L18.8 2Z" fill="#2566AF" fillOpacity="0.3" />
                                        <path d="M36.2 2H47.6L45.2 17H33.8L36.2 2Z" fill="#2566AF" fillOpacity="0.3" />
                                        <path d="M10.4 17L6.2 36H17.6L21.8 17H10.4Z" fill="#FFFFFF" />
                                        <text x="2" y="34" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="white" fontStyle="italic">VISA</text>
                                    </svg>
                                )}
                                {cardType === 'mastercard' && (
                                    <svg className="h-full w-auto" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="10" fill="#EB001B" fillOpacity="0.9" />
                                        <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.9" />
                                    </svg>
                                )}
                                {!['visa', 'mastercard'].includes(cardType) && (
                                    <span className="text-white font-bold tracking-widest italic opacity-80 uppercase">
                                        {cardType || 'CARD'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <motion.p
                                    className="text-2xl text-white tracking-[0.15em] drop-shadow-md min-h-[32px]"
                                    key={cardNumber}
                                    initial={{ opacity: 0.5, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {cardNumber || '•••• •••• •••• ••••'}
                                </motion.p>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-400 uppercase tracking-wider block">Card Holder</span>
                                    <p className="text-sm text-white font-medium uppercase tracking-widest truncate max-w-[200px]">
                                        {cardHolder || 'YOUR NAME'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-gray-400 uppercase tracking-wider block text-right">Expires</span>
                                    <p className="text-sm text-white font-medium tracking-widest">
                                        {expiry || 'MM/YY'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden rounded-sm overflow-hidden shadow-2xl bg-gradient-to-bl from-gray-900 via-gray-800 to-black border border-white/10"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                    {/* Magnetic Strip */}
                    <div className="w-full h-12 bg-black mt-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
                    </div>

                    <div className="mt-6 px-6">
                        <div className="space-y-1">
                            <div className="flex items-center justify-end">
                                <span className="text-sm text-gray-400 mr-2 uppercase">Security Code</span>
                            </div>
                            <div className="h-10 bg-white flex items-center justify-end px-3 rounded-sm">
                                <span className="text-black font-bold tracking-widest text-lg">
                                    {cvc || '•••'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center opacity-50">
                            <div className="w-16 h-10 border border-white/20 rounded-sm flex items-center justify-center">
                                <div className="w-10 h-6 bg-white/10 rounded-full blur-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
