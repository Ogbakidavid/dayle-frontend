'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ShieldCheck, Lock, Loader2, CreditCard,
    CheckCircle2, HelpCircle, Fingerprint, XCircle,
    RefreshCcw, Building2, Copy, Globe, ChevronRight
} from "lucide-react";

export default function PremiumDepositPage() {
    const router = useRouter();
    const amount = 1522.50; // Mock amount

    const [step, setStep] = useState('selection'); // selection, card, bank
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "", name: "", type: "" });
    const [errors, setErrors] = useState({});

    const detectCardType = (number) => {
        const clean = number.replace(/\D/g, '');
        if (clean.match(/^4/)) return 'visa';
        if (clean.match(/^5[1-5]/)) return 'mastercard';
        return '';
    };

    // --- LOGIC FROM YOUR CODE ---
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

    const handleInputChange = (field, value) => {
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

    const handleBankSubmit = () => {
        setIsProcessing(true);
        // Simulate brief processing without full overlay if desired, or just:
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
        }, 1500);
    };

    const handleCardSubmit = () => {
        const cleanNum = cardDetails.number.replace(/\D/g, "");
        const newErrors = {};

        if (!validateCardNumber(cleanNum)) {
            newErrors.number = "Invalid card number";
        }
        if (!cardDetails.name.trim()) {
            newErrors.name = "Required";
        }
        if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
            newErrors.expiry = "Invalid date";
        }
        if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
            newErrors.cvc = "Invalid CVC";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({}); // Clear errors if valid
        setIsProcessing(true);
        setTimeout(() => {
            if (cleanNum.endsWith("0000")) {
                setIsProcessing(false);
                setPaymentError("Your bank has declined this transaction. Please contact your provider.");
            } else {
                setIsProcessing(false);
                setStep('success');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans antialiased">
            <AnimatePresence>
                {isProcessing && <ProcessingOverlay amount={amount} />}
                {paymentError && <FailureModal message={paymentError} onClose={() => setPaymentError(null)} />}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* LEFT SIDEBAR (25%) */}
                <section className="w-full lg:w-[25%] bg-[#080808] p-10 border-r border-white/5 flex flex-col justify-between">
                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Lock className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-white font-bold tracking-tighter text-lg uppercase">Skentral</span>
                        </div>
                        <div className="space-y-6">
                            {step !== 'selection' && step !== 'success' && (
                                <button onClick={() => setStep('selection')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Change Method
                                </button>
                            )}
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Payable Amount</p>
                                <h1 className="text-5xl font-bold text-white tracking-tighter">${amount.toLocaleString()}</h1>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">
                            <ShieldCheck className="w-4 h-4" /> Vault Escrow Active
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Funds are held in a secure multi-sig vault until milestone approval.</p>
                    </div>
                </section>

                {/* RIGHT CONTENT AREA */}
                <main className="flex-1 p-8 lg:p-20 flex items-center justify-center">
                    <div className={step === 'selection' ? "max-w-md w-full" : "max-w-5xl w-full"}>
                        <AnimatePresence mode="wait">

                            {/* 1. SELECTION SCREEN */}
                            {step === 'selection' && (
                                <motion.div key="sel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-bold text-white tracking-tight">Payment Method</h2>
                                        <p className="text-slate-500">Select how you want to fund this project</p>
                                    </div>
                                    <div className="grid gap-4">
                                        <MethodBtn icon={<CreditCard />} title="Card Payment" desc="Visa, Mastercard, Amex" onClick={() => setStep('card')} />
                                        <MethodBtn icon={<Building2 />} title="Bank Transfer" desc="Wire, ACH, SWIFT" onClick={() => setStep('bank')} />
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. CARD GRID (PREMIUM DARK STYLE) */}
                            {step === 'card' && (
                                <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-2 gap-20 items-center">
                                    <div className="relative aspect-[1.586/1] w-full rounded-[28px] bg-gradient-to-br from-emerald-600 to-emerald-900 p-10 text-white shadow-2xl border border-white/10 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10"><CreditCard className="w-40 h-40 rotate-12" /></div>
                                        <div className="relative h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-14 h-10 bg-white/20 rounded-lg backdrop-blur-md border border-white/20" />
                                                {cardDetails.type === 'visa' && (
                                                    <svg className="h-8 w-auto" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M18.8 2H30.2L27.8 17H16.4L18.8 2Z" fill="white" fillOpacity="0.3" />
                                                        <path d="M36.2 2H47.6L45.2 17H33.8L36.2 2Z" fill="white" fillOpacity="0.3" />
                                                        <text x="2" y="34" fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="white" fontStyle="italic">VISA</text>
                                                    </svg>
                                                )}
                                                {cardDetails.type === 'mastercard' && (
                                                    <svg className="h-8 w-auto" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="10" cy="10" r="10" fill="#EB001B" fillOpacity="0.9" />
                                                        <circle cx="22" cy="10" r="10" fill="#F79E1B" fillOpacity="0.9" />
                                                    </svg>
                                                )}
                                                {!cardDetails.type && <span className="font-black italic text-xl opacity-80">CARD</span>}
                                            </div>
                                            <div className="space-y-6">
                                                <p className="text-2xl font-mono tracking-[0.2em]">{cardDetails.number || "•••• •••• •••• ••••"}</p>
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <div><p className="opacity-50 mb-1">Holder</p><p className="text-sm tracking-normal">{cardDetails.name || "YOUR NAME"}</p></div>
                                                    <div className="text-right"><p className="opacity-50 mb-1">Expiry</p><p className="text-sm tracking-normal">{cardDetails.expiry || "MM/YY"}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <InputField label="Card Number" value={cardDetails.number} error={errors.number} onChange={(e) => handleInputChange("number", e.target.value)} placeholder="0000 0000 0000 0000" />
                                            <InputField label="Cardholder Name" value={cardDetails.name} error={errors.name} onChange={(e) => handleInputChange("name", e.target.value.toUpperCase())} placeholder="JOHN DOE" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Expiry" value={cardDetails.expiry} error={errors.expiry} onChange={(e) => handleInputChange("expiry", e.target.value)} placeholder="MM/YY" />
                                                <InputField label="CVC" type="password" value={cardDetails.cvc} error={errors.cvc} onChange={(e) => handleInputChange("cvc", e.target.value)} placeholder="•••" />
                                            </div>
                                        </div>
                                        <button onClick={handleCardSubmit} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]">Deposit ${amount}</button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 3. BANK TRANSFER GRID */}
                            {step === 'bank' && (
                                <motion.div key="bank" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-2 gap-20 items-start">
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                            <Building2 className="text-emerald-500 w-8 h-8" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white">Wire Instructions</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Please transfer the exact amount to the escrow details provided. Automated verification takes 1-2 hours.</p>
                                        <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] font-black uppercase text-slate-600 tracking-widest"><Globe className="w-4 h-4" /> Global ACH/SWIFT</div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl divide-y divide-white/5 overflow-hidden">
                                            <BankInfo label="Bank Name" value="Skentral Trust Bank" />
                                            <BankInfo label="Account Number" value="9920 1120 4452" copy />
                                            <BankInfo label="Routing Number" value="121000358" copy />
                                            <BankInfo label="Reference ID" value="SK-992-TX" copy highlight />
                                        </div>
                                        <button onClick={handleBankSubmit} className="w-full h-16 border border-white/10 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all">I have sent the payment</button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 4. SUCCESS */}
                            {step === 'success' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-lg mx-auto space-y-8">
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                                        <CheckCircle2 className="w-12 h-12 text-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-bold text-white tracking-tight">Deposit Locked</h2>
                                        <p className="text-slate-500">Milestone #1 is now fully funded. Funds are held securely in Skentral Escrow.</p>
                                    </div>
                                    <button onClick={() => router.push('/client')} className="w-full h-16 bg-white text-black font-bold text-lg rounded-2xl hover:bg-slate-200 transition-all shadow-xl">Continue to Dashboard</button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- COMPONENTS ---

function MethodBtn({ icon, title, desc, onClick }) {
    return (
        <button onClick={onClick} className="w-full p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center gap-6 group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all text-left">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">{icon}</div>
            <div className="flex-1">
                <p className="text-white font-bold text-lg">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
    );
}

function InputField({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">{label}</label>
            <input {...props} className={`w-full bg-white/[0.03] border ${error ? 'border-red-500' : 'border-white/10'} h-14 rounded-2xl px-5 text-white focus:border-emerald-500/50 outline-none transition-all`} />
            {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}

function BankInfo({ label, value, copy, highlight }) {
    return (
        <div className="p-5 flex justify-between items-center">
            <div>
                <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">{label}</p>
                <p className={`font-mono text-sm ${highlight ? 'text-emerald-500 font-bold' : 'text-white'}`}>{value}</p>
            </div>
            {copy && <Copy className="w-4 h-4 text-slate-700 hover:text-emerald-500 cursor-pointer" />}
        </div>
    );
}

// COPY OF YOUR PROCESSING OVERLAY (DARK ADAPTED)
function ProcessingOverlay({ amount }) {
    const messages = ["Encrypting details...", "Authorizing with bank...", "Locking vault deposit..."];
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setMsgIdx(s => (s + 1) % 3), 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-10">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full" />
                <Fingerprint className="w-10 h-10 text-emerald-500 absolute inset-0 m-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Processing ${amount}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50">{messages[msgIdx]}</p>
        </motion.div>
    );
}

function FailureModal({ message, onClose }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#0D0D0D] border border-white/5 w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="w-8 h-8 text-red-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">Failed</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">{message}</p>
                <button onClick={onClose} className="w-full bg-white text-black h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"><RefreshCcw className="w-4 h-4" /> Try Again</button>
            </div>
        </motion.div>
    );
}