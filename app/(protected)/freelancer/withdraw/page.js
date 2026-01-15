'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Lock, Building2, Copy, Globe, Fingerprint,
    CheckCircle2, XCircle, Clock, AlertCircle, RefreshCcw,
    Shield, Zap, Check, CreditCard, Landmark, ArrowRight,
    ArrowUpRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FreelancerWithdrawPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get parameters from URL
    const amount = parseFloat(searchParams.get('amount') || '0');

    // Flow states: method_selection → card/initiation → verification → review → processing → success/failure
    const [step, setStep] = useState('method_selection');
    const [selectedMethod, setSelectedMethod] = useState(null); // 'bank' or 'card'
    const [isProcessing, setIsProcessing] = useState(false);

    // Card Details State
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "", name: "", type: "" });
    const [cardErrors, setCardErrors] = useState({});

    // Initiation State
    const [selectedCountry, setSelectedCountry] = useState('NGA');
    const [selectedCurrency, setSelectedCurrency] = useState('NGN');

    const countries = [
        { code: 'NGA', name: 'Nigeria', currencies: ['NGN', 'USD'] },
        { code: 'GHA', name: 'Ghana', currencies: ['GHS', 'USD'] },
        { code: 'KEN', name: 'Kenya', currencies: ['KES'] },
        { code: 'ZAF', name: 'South Africa', currencies: ['ZAR'] },
    ];
    const currentCountryObj = countries.find(c => c.code === selectedCountry);

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '' // Resolved later
    });
    const [isResolving, setIsResolving] = useState(false);

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    // --- Card Logic ---
    const detectCardType = (number) => {
        const clean = number.replace(/\D/g, '');
        if (clean.match(/^4/)) return 'visa';
        if (clean.match(/^5[1-5]/)) return 'mastercard';
        return '';
    };

    const validateCardNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length < 13 || cleaned.length > 19) return false;
        let sum = 0; let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);
            if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
            sum += digit; isEven = !isEven;
        }
        return sum % 10 === 0;
    };

    const handleCardInputChange = (field, value) => {
        let formattedValue = value;
        if (field === "number") {
            const cleaned = value.replace(/\D/g, "");
            const type = detectCardType(cleaned);
            setCardDetails(prev => ({ ...prev, number: cleaned.replace(/(\d{4})/g, "$1 ").trim().slice(0, 19), type }));
            return;
        } else if (field === "expiry") {
            const cleaned = value.replace(/\D/g, "");
            formattedValue = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
        } else if (field === "cvc") {
            formattedValue = value.replace(/\D/g, "").slice(0, 4);
        }
        setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    };

    const handleCardSubmit = () => {
        const cleanNum = cardDetails.number.replace(/\D/g, "");
        const newErrors = {};

        if (!validateCardNumber(cleanNum)) newErrors.number = "Invalid card number";
        if (!cardDetails.name.trim()) newErrors.name = "Required";
        if (!cardDetails.expiry || cardDetails.expiry.length < 5) newErrors.expiry = "Invalid date";
        if (!cardDetails.cvc || cardDetails.cvc.length < 3) newErrors.cvc = "Invalid CVC";

        if (Object.keys(newErrors).length > 0) {
            setCardErrors(newErrors);
            return;
        }

        setCardErrors({});
        setStep('review');
    };

    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        setTransactionId(`WDL-${Date.now()}`);
    }, []);

    const [processingStatus, setProcessingStatus] = useState('pending'); // pending, processing, sent, completed

    // --- Verification Logic ---
    const handleResolveAccount = () => {
        if (!bankDetails.accountNumber || !bankDetails.bankName) return;
        setIsResolving(true);
        // Simulate account resolution
        setTimeout(() => {
            setBankDetails(prev => ({ ...prev, accountName: 'DEMILADE A. SKENOS' }));
            setIsResolving(false);
            setShowOtp(true);
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    const handleVerifyOtp = () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setOtpError('Enter complete 6-digit code');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep('review');
        }, 1500);
    };

    // --- Review Logic ---
    const handleConfirmWithdrawal = () => {
        setStep('processing');
    };

    // --- Status Logic ---
    useEffect(() => {
        if (step === 'processing') {
            const statusFlow = [
                { status: 'pending', delay: 2000 },
                { status: 'processing', delay: 3000 },
                { status: 'sent', delay: 2500 }
            ];

            let currentIndex = 0;
            const updateStatus = () => {
                if (currentIndex < statusFlow.length) {
                    setTimeout(() => {
                        setProcessingStatus(statusFlow[currentIndex].status);
                        currentIndex++;
                        if (currentIndex < statusFlow.length) {
                            updateStatus();
                        } else {
                            // 90% Success Rate simulation
                            setTimeout(() => {
                                const isSuccess = Math.random() > 0.1;
                                if (isSuccess) {
                                    setProcessingStatus('completed');
                                    setTimeout(() => setStep('success'), 1000);
                                } else {
                                    setStep('failure');
                                }
                            }, 2000);
                        }
                    }, statusFlow[currentIndex].delay);
                }
            };
            updateStatus();
        }
    }, [step]);

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans antialiased overflow-hidden">
            <AnimatePresence>
                {isProcessing && <ProcessingOverlay />}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* LEFT SIDEBAR - Summary */}
                <aside className="w-full lg:w-[350px] bg-[#080808] p-10 border-r border-white/5 flex flex-col justify-between">
                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform" onClick={() => router.push('/freelancer/wallet')}>
                                <Lock className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-white font-bold tracking-tighter text-lg uppercase">Cleard</span>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase text-white/40 tracking-[0.2em]">Settlement Amount</p>
                                <h1 className="text-5xl font-bold text-white tracking-tighter sm:text-6xl">
                                    <span className="text-emerald-500 font-medium text-2xl mr-1">$</span>
                                    {amount.toLocaleString()}
                                </h1>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/5">
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/40">
                                    <span>Destination</span>
                                    <span className="text-white">{selectedCountry} / {selectedCurrency}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/40">
                                    <span>Rate</span>
                                    <span className="text-white">1.00 USD = 1.00 {selectedCurrency}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/40">
                                    <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-500" /> Network</span>
                                    <span className="text-emerald-500">Partna Rails</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/40">
                                    <span>Reference</span>
                                    <span className="text-white/60 font-mono">{transactionId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-black uppercase tracking-[0.2em] mb-2">
                            <Shield className="w-3.5 h-3.5" /> SECURE SETTLEMENT
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed font-bold uppercase tracking-wide">
                            Funds are moved through high-speed bank-settlement rails.
                        </p>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 p-6 lg:p-20 relative overflow-y-auto">
                    <div className="max-w-4xl mx-auto w-full">
                        {/* Back Link */}
                        {(step === 'initiation' || step === 'card') && (
                            <button
                                onClick={() => setStep('method_selection')}
                                className="flex items-center gap-2 text-white/50 hover:text-emerald-500 transition-all text-sm font-black uppercase tracking-widest mb-12 group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Back to Selection
                            </button>
                        )}
                        {step === 'verification' && (
                            <button
                                onClick={() => setStep(selectedMethod === 'bank' ? 'initiation' : 'card')}
                                className="flex items-center gap-2 text-white/50 hover:text-emerald-500 transition-all text-sm font-black uppercase tracking-widest mb-12 group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Change Details
                            </button>
                        )}

                        <AnimatePresence mode="wait">
                            {/* 0. METHOD SELECTION STEP */}
                            {step === 'method_selection' && (
                                <motion.div
                                    key="selection"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="max-w-md mx-auto w-full space-y-10"
                                >
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Withdrawal Method</h2>
                                        <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Select how you want to receive your funds</p>
                                    </div>
                                    <div className="grid gap-4">
                                        <MethodBtn
                                            icon={<CreditCard />}
                                            title="Card Withdrawal"
                                            desc="Visa, Mastercard, Amex"
                                            onClick={() => {
                                                setSelectedMethod('card');
                                                setStep('card');
                                            }}
                                        />
                                        <MethodBtn
                                            icon={<Building2 />}
                                            title="Bank Transfer"
                                            desc="Direct to local bank"
                                            onClick={() => {
                                                setSelectedMethod('bank');
                                                setStep('initiation');
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* 1. CARD WITHDRAWAL STEP */}
                            {step === 'card' && (
                                <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid md:grid-cols-2 gap-16 items-center">
                                    {/* CARD PREVIEW */}
                                    <CardPreview details={cardDetails} />

                                    {/* CARD FORM */}
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Card Details</h2>
                                            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Funds will be pushed to this card instantly.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <WithdrawInputField label="Card Number" value={cardDetails.number} error={cardErrors.number} onChange={(e) => handleCardInputChange("number", e.target.value)} placeholder="0000 0000 0000 0000" />
                                            <WithdrawInputField label="Cardholder Name" value={cardDetails.name} error={cardErrors.name} onChange={(e) => handleCardInputChange("name", e.target.value.toUpperCase())} placeholder="JOHN DOE" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <WithdrawInputField label="Expiry" value={cardDetails.expiry} error={cardErrors.expiry} onChange={(e) => handleCardInputChange("expiry", e.target.value)} placeholder="MM/YY" />
                                                <WithdrawInputField label="CVC" type="password" value={cardDetails.cvc} error={cardErrors.cvc} onChange={(e) => handleCardInputChange("cvc", e.target.value)} placeholder="•••" />
                                            </div>
                                        </div>
                                        <Button onClick={handleCardSubmit} className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/10">Proceed to Review <ArrowRight className="w-4 h-4 ml-2" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. INITIATION STEP (BANK) */}
                            {step === 'initiation' && (
                                <motion.div
                                    key="initiation"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex flex-col items-center text-center"
                                >
                                    <div className="space-y-4 flex flex-col items-center">
                                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-2">
                                            <Globe className="text-emerald-500 w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Initiate Settlement</h2>
                                            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Select your payout destination and currency</p>
                                        </div>
                                    </div>

                                    <div className="w-full max-w-md space-y-8">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-white/20 uppercase tracking-[0.2em] block text-left ml-1">Payout Country</label>
                                                <select
                                                    value={selectedCountry}
                                                    onChange={(e) => {
                                                        const newCountry = e.target.value;
                                                        setSelectedCountry(newCountry);
                                                        const countryObj = countries.find(c => c.code === newCountry);
                                                        if (countryObj && !countryObj.currencies.includes(selectedCurrency)) {
                                                            setSelectedCurrency(countryObj.currencies[0]);
                                                        }
                                                    }}
                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 focus:border-emerald-500/50 outline-none text-white font-bold transition-all appearance-none cursor-pointer"
                                                >
                                                    {countries.map(c => (
                                                        <option key={c.code} value={c.code} className="bg-[#050505]">{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-white/20 uppercase tracking-[0.2em] block text-left ml-1">Payout Currency</label>
                                                <select
                                                    value={selectedCurrency}
                                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 focus:border-emerald-500/50 outline-none text-white font-bold transition-all appearance-none cursor-pointer"
                                                >
                                                    {currentCountryObj?.currencies.map(curr => (
                                                        <option key={curr} value={curr} className="bg-[#050505]">{curr}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => setStep('verification')}
                                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/10"
                                        >
                                            Verify Payout Method <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 1. BANK VERIFICATION STEP */}
                            {step === 'verification' && (
                                <motion.div
                                    key="verification"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-12 flex flex-col items-center"
                                >
                                    <div className="space-y-4 flex flex-col items-center text-center">
                                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-2">
                                            <Landmark className="text-emerald-500 w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Payout Details</h2>
                                            <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Configure your bank destination for this settlement</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-10 w-full items-center">
                                        <div className="space-y-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-white/20 uppercase tracking-[0.2em] ml-1">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter bank name"
                                                        value={bankDetails.bankName}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 focus:border-emerald-500/50 outline-none text-white font-bold transition-all placeholder:text-white/10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-white/20 uppercase tracking-[0.2em] ml-1">Account Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Account number"
                                                        value={bankDetails.accountNumber}
                                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 focus:border-emerald-500/50 outline-none text-white font-bold transition-all placeholder:text-white/10"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleResolveAccount}
                                                disabled={!bankDetails.accountNumber || !bankDetails.bankName || isResolving || showOtp}
                                                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/10"
                                            >
                                                {isResolving ? 'Resolving Account...' : showOtp ? 'Account Resolved' : 'Verify Account Details'}
                                            </Button>
                                        </div>

                                        <div className="space-y-8">
                                            {showOtp ? (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                                                    <div className="space-y-2">
                                                        <h3 className="text-lg font-black text-white tracking-tight uppercase">Confirm Ownership</h3>
                                                        <p className="text-sm text-white/50 leading-relaxed font-bold uppercase tracking-widest">Account: <span className="text-emerald-500">{bankDetails.accountName}</span></p>
                                                    </div>

                                                    <div className="flex gap-2 justify-between">
                                                        {otp.map((digit, index) => (
                                                            <input
                                                                key={index}
                                                                id={`otp-${index}`}
                                                                type="text"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                                className="w-10 h-12 bg-white/[0.03] border border-white/10 rounded-lg text-center text-xl font-bold text-white focus:border-emerald-500/50 outline-none transition-all"
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                                        <p className="text-sm text-blue-300 text-center font-bold uppercase tracking-widest leading-relaxed">Identity Check: Use code <span className="text-white">123456</span> for demo verification</p>
                                                    </div>

                                                    <button
                                                        onClick={handleVerifyOtp}
                                                        className="w-full h-12 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-slate-200 transition-all shadow-xl active:scale-95"
                                                    >
                                                        Confirm Identity
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
                                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                        <Fingerprint className="w-6 h-6 text-white/20" />
                                                    </div>
                                                    <p className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Awaiting Verification</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. REVIEW STEP */}
                            {step === 'review' && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-2xl mx-auto space-y-10"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                                            <Info className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Review Settlement</h2>
                                            <p className="text-sm font-bold text-white/20 uppercase tracking-widest px-10">Confirm the details below. Settlements are irreversible once processed by the bank network.</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#111111] border border-gray-900 rounded-3xl overflow-hidden divide-y divide-white/5">
                                        {selectedMethod === 'bank' ? (
                                            <>
                                                <ReviewItem label="Payout Destination" value={bankDetails.bankName} subValue={bankDetails.accountNumber} />
                                                <ReviewItem label="Beneficiary" value={bankDetails.accountName} />
                                            </>
                                        ) : (
                                            <>
                                                <ReviewItem label="Payout Card" value={`•••• •••• •••• ${cardDetails.number.slice(-4)}`} subValue={cardDetails.type?.toUpperCase() || 'CARD'} />
                                                <ReviewItem label="Cardholder" value={cardDetails.name} />
                                            </>
                                        )}
                                        <ReviewItem label="Gross Settlement" value={`$${amount.toLocaleString()}`} />
                                        <ReviewItem label="Network Fee" value="$0.00" subValue="Cleard Turbo Promotion applied" highlight="text-emerald-500" />
                                        <div className="p-6 bg-white/[0.02] flex justify-between items-center">
                                            <span className="text-sm font-black uppercase text-white/40 tracking-widest">Net Credit</span>
                                            <span className="text-2xl font-bold text-white">${amount.toLocaleString()} <span className="text-sm text-white/30">{selectedCurrency}</span></span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-300 leading-relaxed font-bold">
                                            By proceeding, you authorize Cleard to execute this transfer. Funds should arrive in your account within 5-10 minutes.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="ghost" onClick={() => setStep('verification')} className="h-14 font-black uppercase text-sm tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                            Modify Details
                                        </Button>
                                        <Button onClick={handleConfirmWithdrawal} className="h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/20">
                                            Confirm & Execute
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3. PROCESSING STATUS SCREEN */}
                            {step === 'processing' && (
                                <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                                    <ProcessingStatusScreen status={processingStatus} transactionId={transactionId} amount={amount} />
                                </motion.div>
                            )}

                            {/* 4. SUCCESS SCREEN */}
                            {step === 'success' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center space-y-8">
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40">
                                        <CheckCircle2 className="w-12 h-12 text-black" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl uppercase">SUCCESS!</h2>
                                        <p className="text-sm font-bold text-white/20 uppercase tracking-widest leading-relaxed">Your settlement has been authorized and dispatched.</p>
                                    </div>

                                    <div className="bg-[#111111] border border-gray-900 rounded-3xl p-8 space-y-6">
                                        <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                                            <span className="text-white/40">Amount Sent</span>
                                            <span className="text-white text-lg font-bold">${amount.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-6 border-t border-white/5 flex justify-between items-center text-sm font-black uppercase tracking-widest">
                                            <span className="text-white/40">Transaction ID</span>
                                            <span className="text-white font-mono">{transactionId}</span>
                                        </div>
                                    </div>

                                    <Button onClick={() => router.push('/freelancer/wallet')} className="w-full h-16 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-xl active:scale-95">
                                        Back to Dashboard
                                    </Button>
                                </motion.div>
                            )}
                            {/* 5. FAILURE SCREEN */}
                            {step === 'failure' && (
                                <motion.div key="failure" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center space-y-8">
                                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20">
                                        <XCircle className="w-12 h-12 text-red-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Transfer Failed</h2>
                                        <p className="text-sm font-bold text-white/20 uppercase tracking-widest leading-relaxed">The bank network rejected the settlement or the connection timed out.</p>
                                    </div>

                                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-left space-y-3">
                                        <p className="text-sm font-black text-white uppercase tracking-widest">Reject Code: SET_FAIL_BANK_COMM_ERR</p>
                                        <p className="text-sm text-red-400/80 font-bold uppercase tracking-widest">Please verify your account details or contact support if the issue persists.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" onClick={() => { setStep('verification'); setShowOtp(false); setOtp(['', '', '', '', '', '']); }} className="h-14 font-black uppercase text-sm tracking-widest border-white/10 hover:bg-white/10 rounded-xl transition-all">
                                            Retry Transfer
                                        </Button>
                                        <Button onClick={() => router.push('/freelancer/wallet')} className="h-14 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl">
                                            Exit to Wallet
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function MethodBtn({ icon, title, desc, onClick }) {
    return (
        <button onClick={onClick} className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center gap-6 group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-left">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                {React.cloneElement(icon, { className: "w-6 h-6" })}
            </div>
            <div className="flex-1">
                <p className="text-white font-black text-lg uppercase tracking-tight">{title}</p>
                <p className="text-sm font-bold text-white/20 uppercase tracking-widest mt-1">{desc}</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </button>
    );
}

function CardPreview({ details }) {
    return (
        <div className="relative aspect-[1.586/1] w-full rounded-[28px] bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 text-white shadow-2xl border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard className="w-40 h-40 rotate-12" /></div>
            <div className="relative h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="w-14 h-10 bg-white/20 rounded-lg backdrop-blur-md border border-white/20" />
                    {details.type === 'visa' && (
                        <div className="font-black italic text-2xl">VISA</div>
                    )}
                    {details.type === 'mastercard' && (
                        <div className="flex gap-1">
                            <div className="w-6 h-6 rounded-full bg-red-500 opacity-90" />
                            <div className="w-6 h-6 rounded-full bg-amber-500 opacity-90 -ml-3" />
                        </div>
                    )}
                    {!details.type && <span className="font-black italic text-xl opacity-80">CARD</span>}
                </div>
                <div className="space-y-6">
                    <p className="text-2xl tracking-[0.2em] font-mono">{details.number || "•••• •••• •••• ••••"}</p>
                    <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                        <div><p className="opacity-50 mb-1">Holder</p><p className="text-sm tracking-tight font-black">{details.name || "YOUR NAME"}</p></div>
                        <div className="text-right"><p className="opacity-50 mb-1">Expiry</p><p className="text-sm tracking-tight font-black">{details.expiry || "MM/YY"}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WithdrawInputField({ label, error, ...props }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-black uppercase text-white/20 tracking-[0.2em] ml-1">{label}</label>
            <input {...props} className={cn("w-full bg-white/[0.03] border h-14 rounded-xl px-5 text-white focus:border-emerald-500/50 outline-none transition-all font-black uppercase tracking-widest text-sm placeholder:text-white/10", error ? 'border-red-500' : 'border-white/10')} />
            {error && <p className="text-[10px] text-red-500 font-black ml-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
}

function ReviewItem({ label, value, subValue, highlight }) {
    return (
        <div className="p-6 flex justify-between items-center">
            <span className="text-sm font-black uppercase text-white/40 tracking-widest">{label}</span>
            <div className="text-right">
                <p className={cn("font-black text-white text-sm uppercase tracking-tight", highlight)}>{value}</p>
                {subValue && <p className="text-[10px] text-white/20 font-black uppercase mt-1 tracking-[0.2em]">{subValue}</p>}
            </div>
        </div>
    );
}

function ProcessingStatusScreen({ status, transactionId, amount }) {
    const steps = [
        { id: 'initiated', label: 'Auth Received', log: 'Handshake with Partna complete', status: 'completed' },
        { id: 'resolving', label: 'Account Validation', log: 'Beneficiary credentials verified', status: status === 'pending' ? 'current' : 'completed' },
        { id: 'processing', label: 'Settlement Processing', log: 'Crypto-to-fiat conversion active', status: status === 'processing' ? 'current' : (status === 'sent' || status === 'completed') ? 'completed' : 'pending' },
        { id: 'sent', label: 'Bank Payout Issued', log: 'Transfer released to ACH rails', status: status === 'sent' ? 'current' : status === 'completed' ? 'completed' : 'pending' }
    ];

    return (
        <div className="space-y-12">
            <div className="text-center space-y-6">
                <div className="relative inline-flex items-center justify-center w-24 h-24">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full" />
                    <Zap className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Executing Settlement</h2>
                    <p className="text-sm font-bold text-white/20 uppercase tracking-[0.3em]">Reference: {transactionId}</p>
                </div>
            </div>

            <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-10 space-y-10">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-6 relative">
                        {idx < steps.length - 1 && (
                            <div className={cn("absolute left-[19px] top-10 w-0.5 h-10 transition-colors", step.status === 'completed' ? 'bg-emerald-500' : 'bg-white/5')} />
                        )}
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                            step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-black' :
                                step.status === 'current' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                                    'bg-black border-white/5 text-white/10'
                        )}>
                            {step.status === 'completed' ? <Check className="w-5 h-5" strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="pt-1.5 flex-1">
                            <h4 className={cn("font-black text-sm tracking-[0.2em] uppercase", step.status === 'pending' ? 'text-white/10' : 'text-white')}>{step.label}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10 mt-1">{step.log}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProcessingOverlay() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full" />
                <Fingerprint className="w-10 h-10 text-emerald-500 absolute inset-0 m-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Authorizing Transfer</h3>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-emerald-500/60">Bio-Verified Protocol</p>
        </motion.div>
    );
}
