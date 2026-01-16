'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Lock, Building2, Copy, Globe, Fingerprint,
    CheckCircle2, XCircle, Clock, AlertCircle, RefreshCcw,
    Shield, Zap, Check
} from "lucide-react";

export default function BankTransferPage() {
    const router = useRouter();
    const params = useParams();
    const amount = 1522.50; // Mock amount

    // Flow states: verification → instructions → processing → success/failure
    const [step, setStep] = useState('verification'); // verification, instructions, processing, success, failure
    const [isProcessing, setIsProcessing] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [requiresVerification, setRequiresVerification] = useState(true); // Toggle for testing
    const [transactionId] = useState(`TXN-${Date.now()}`);
    const [processingStatus, setProcessingStatus] = useState('pending'); // pending, processing, completed
    const [copied, setCopied] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(24 * 60 * 60); // 24 hours in seconds

    // Skip verification if not required
    useEffect(() => {
        if (!requiresVerification) {
            setStep('instructions');
        }
    }, [requiresVerification]);

    // Countdown timer for payment window
    useEffect(() => {
        if (step === 'instructions' && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeRemaining]);

    // Simulate status updates during processing
    useEffect(() => {
        if (step === 'processing') {
            const statusFlow = [
                { status: 'pending', delay: 2000 },
                { status: 'processing', delay: 3000 },
                { status: 'completed', delay: 2000 }
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
                            // Randomly succeed or fail for demo
                            setTimeout(() => {
                                const success = Math.random() > 0.2; // 80% success rate
                                setStep(success ? 'success' : 'failure');
                            }, 1000);
                        }
                    }, statusFlow[currentIndex].delay);
                }
            };
            updateStatus();
        }
    }, [step]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                // If current box has value, clear it
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // If current box is empty, move to previous and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                document.getElementById(`otp-${index - 1}`)?.focus();
            }
            e.preventDefault();
        } else if (e.key === 'Delete') {
            // Delete key clears current box
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            e.preventDefault();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const cleaned = pastedData.replace(/\D/g, '').slice(0, 6);

        if (cleaned.length === 6) {
            const newOtp = cleaned.split('');
            setOtp(newOtp);
            setOtpError('');
            // Focus the last input
            document.getElementById('otp-5')?.focus();
        }
    };

    const handleVerifyOtp = () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setOtpError('Please enter complete 6-digit code');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            if (otpValue === '123456') {
                setStep('instructions');
            } else {
                setOtpError('Invalid OTP. Try 123456 for demo.');
            }
        }, 1500);
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(''), 2000);
    };

    const handlePaymentConfirmed = () => {
        setStep('processing');
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white/80 font-sans antialiased">
            <AnimatePresence>
                {isProcessing && <ProcessingOverlay />}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* LEFT SIDEBAR */}
                <Sidebar
                    amount={amount}
                    transactionId={transactionId}
                    step={step}
                />

                {/* RIGHT CONTENT AREA */}
                <main className="flex-1 p-8 lg:p-20 flex items-center justify-center">
                    <div className="max-w-5xl w-full">
                        {/* Back Button */}
                        {(step === 'verification' || step === 'instructions') && (
                            <button
                                onClick={() => router.push(`/checkout/${params.vaultId}`)}
                                className="flex items-center gap-2 text-white hover:text-emerald-500 transition-all text-sm font-bold uppercase tracking-wide mb-8 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Change Payment Method
                            </button>
                        )}

                        <AnimatePresence mode="wait">

                            {/* VERIFICATION SCREEN */}
                            {step === 'verification' && (
                                <VerificationScreen
                                    otp={otp}
                                    otpError={otpError}
                                    onOtpChange={handleOtpChange}
                                    onOtpKeyDown={handleOtpKeyDown}
                                    onOtpPaste={handleOtpPaste}
                                    onVerify={handleVerifyOtp}
                                    onResend={() => setOtpError('')}
                                />
                            )}

                            {/* PAYMENT INSTRUCTIONS SCREEN */}
                            {step === 'instructions' && (
                                <PaymentInstructionsScreen
                                    amount={amount}
                                    transactionId={transactionId}
                                    timeRemaining={timeRemaining}
                                    formatTime={formatTime}
                                    onCopy={handleCopy}
                                    copied={copied}
                                    onConfirm={handlePaymentConfirmed}
                                />
                            )}

                            {/* PROCESSING/STATUS SCREEN */}
                            {step === 'processing' && (
                                <ProcessingStatusScreen
                                    status={processingStatus}
                                    transactionId={transactionId}
                                    amount={amount}
                                />
                            )}

                            {/* SUCCESS SCREEN */}
                            {step === 'success' && (
                                <SuccessScreen
                                    amount={amount}
                                    transactionId={transactionId}
                                    onContinue={() => router.push('/client')}
                                />
                            )}

                            {/* FAILURE SCREEN */}
                            {step === 'failure' && (
                                <FailureScreen
                                    onRetry={() => setStep('instructions')}
                                    onExit={() => router.push(`/checkout/${params.vaultId}`)}
                                />
                            )}

                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- COMPONENTS ---

function Sidebar({ amount, transactionId, step }) {
    return (
        <section className="w-full lg:w-[25%] bg-[#080808] p-10 border-r border-white/5 flex flex-col justify-between">
            <div className="space-y-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Lock className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-white font-bold tracking-tighter text-lg uppercase">Cleard</span>
                </div>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-sm font-black uppercase text-white tracking-wide">Payable Amount</p>
                        <h1 className="text-5xl font-bold text-white tracking-tighter">${amount.toLocaleString()}</h1>
                    </div>
                    {step !== 'verification' && (
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-sm font-black uppercase text-white tracking-wide mb-1">Transaction ID</p>
                            <p className="text-sm text-white/60 font-medium">{transactionId}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-black uppercase tracking-wide mb-2">
                    <Shield className="w-4 h-4" /> Secure Onramp
                </div>
                <p className="text-sm text-white leading-relaxed font-bold">Bank-verified crypto onramp. Funds are secured until transaction completes.</p>
            </div>
        </section>
    );
}

function VerificationScreen({ otp, otpError, onOtpChange, onOtpKeyDown, onOtpPaste, onVerify, onResend }) {
    return (
        <motion.div key="verification" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Shield className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Verify Your Identity</h2>
                <p className="text-white font-bold uppercase tracking-wide text-sm">Enter the 6-digit code sent to your phone</p>
            </div>

            <div className="space-y-6">
                <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => onOtpChange(index, e.target.value)}
                            onKeyDown={(e) => onOtpKeyDown(index, e)}
                            onPaste={index === 0 ? onOtpPaste : undefined}
                            className={`w-14 h-16 bg-white/[0.03] border ${otpError ? 'border-red-500' : 'border-white/10'} rounded-2xl text-center text-2xl font-bold text-white focus:border-emerald-500/50 outline-none transition-all`}
                        />
                    ))}
                </div>
                {otpError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-bold justify-center">
                        <AlertCircle className="w-4 h-4" />
                        {otpError}
                    </div>
                )}

                <button onClick={onVerify} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                    Verify & Continue
                </button>

                <button onClick={onResend} className="w-full text-white hover:text-white text-sm font-bold transition-all">
                    Didn't receive code? <span className="text-emerald-500">Resend</span>
                </button>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <p className="text-sm text-blue-400 text-center font-bold">💡 Demo: Use code <span className="font-bold">123456</span></p>
            </div>
        </motion.div>
    );
}

function PaymentInstructionsScreen({ amount, transactionId, timeRemaining, formatTime, onCopy, copied, onConfirm }) {
    return (
        <motion.div key="instructions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid lg:grid-cols-2 gap-20 items-start">
            {/* INFO CARD */}
            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Building2 className="text-emerald-500 w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">Transfer Instructions</h4>
                <p className="text-sm text-white leading-relaxed font-bold">
                    Transfer the exact amount to the virtual account below. Include the reference code to ensure automatic processing.
                </p>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-black uppercase text-white tracking-wide">
                        <Globe className="w-4 h-4" /> Global ACH/SWIFT
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black uppercase text-amber-500 tracking-wide">
                        <Clock className="w-4 h-4" /> {formatTime(timeRemaining)} remaining
                    </div>
                </div>
            </div>

            {/* BANK DETAILS */}
            <div className="space-y-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl divide-y divide-white/5 overflow-hidden">
                    <BankInfo label="Bank Name" value="Cleard Trust Bank" />
                    <BankInfo label="Account Number" value="9920 1120 4452" copy onCopy={() => onCopy("9920 1120 4452", "account")} copied={copied === "account"} />
                    <BankInfo label="Routing Number" value="121000358" copy onCopy={() => onCopy("121000358", "routing")} copied={copied === "routing"} />
                    <BankInfo label="Amount" value={`$${amount.toLocaleString()}`} highlight />
                    <BankInfo label="Reference Code" value={transactionId} copy onCopy={() => onCopy(transactionId, "reference")} copied={copied === "reference"} highlight />
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-400 leading-relaxed font-bold">
                            <span className="text-white">Important:</span> Include the reference code in your transfer to ensure automatic processing. Transfers without the code may be delayed.
                        </p>
                    </div>
                </div>

                <button onClick={onConfirm} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                    I have sent the payment
                </button>
            </div>
        </motion.div>
    );
}

function ProcessingStatusScreen({ status, transactionId, amount }) {
    const [currentTime] = useState(new Date());

    const getStatusMessage = () => {
        switch (status) {
            case 'pending':
                return 'Waiting for payment confirmation from your bank...';
            case 'processing':
                return 'Verifying transaction and preparing transfer...';
            case 'completed':
                return 'Finalizing transfer to your vault...';
            default:
                return 'Processing your transaction...';
        }
    };

    const getProgressPercentage = () => {
        switch (status) {
            case 'pending': return 25;
            case 'processing': return 65;
            case 'completed': return 95;
            default: return 0;
        }
    };

    const formatTimestamp = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const steps = [
        {
            id: 'created',
            label: 'Transaction Initiated',
            description: 'Your onramp request has been received',
            timestamp: formatTimestamp(currentTime),
            status: 'completed'
        },
        {
            id: 'initiated',
            label: 'Payment Verification',
            description: 'Confirming bank transfer details',
            timestamp: status !== 'pending' ? formatTimestamp(new Date(currentTime.getTime() + 2000)) : null,
            status: status === 'pending' ? 'current' : 'completed'
        },
        {
            id: 'received',
            label: 'Funds Received',
            description: 'Bank transfer confirmed and validated',
            timestamp: status === 'completed' ? formatTimestamp(new Date(currentTime.getTime() + 5000)) : null,
            status: status === 'processing' ? 'current' : status === 'completed' ? 'completed' : 'pending'
        },
        {
            id: 'credited',
            label: 'Funds Transfer',
            description: 'Transferring funds to your vault',
            timestamp: null,
            status: status === 'completed' ? 'current' : 'pending'
        }
    ];

    return (
        <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto space-y-6"
        >
            {/* HEADER */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full border-2 border-emerald-500/20 relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full"
                    />
                    <Zap className="w-9 h-9 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Processing Your Payment</h2>
                    <p className="text-white text-sm font-bold uppercase tracking-wide max-w-md mx-auto">{getStatusMessage()}</p>
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between text-sm font-black uppercase tracking-wide">
                    <span className="text-white">Progress</span>
                    <span className="text-emerald-500 font-bold">{getProgressPercentage()}%</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage()}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                </div>
            </div>



            {/* TIMELINE */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <h3 className="text-sm font-black uppercase text-white tracking-wide mb-6">Transaction Timeline</h3>
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4"
                        >
                            {/* ICON */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' :
                                    step.status === 'current' ? 'bg-emerald-500/10 border-emerald-500' :
                                        'bg-white/5 border-white/10'
                                    }`}>
                                    {step.status === 'completed' ? (
                                        <Check className="w-5 h-5 text-black" />
                                    ) : step.status === 'current' ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-3 h-3 bg-emerald-500 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-3 h-3 bg-white/10 rounded-full" />
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-0.5 h-16 mt-2 transition-all duration-500 ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-white/10'
                                        }`} />
                                )}
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 pt-1.5">
                                <div className="flex items-start justify-between gap-4 mb-1">
                                    <h4 className={`font-bold text-base transition-colors ${step.status === 'completed' || step.status === 'current' ? 'text-white' : 'text-white'
                                        }`}>
                                        {step.label}
                                    </h4>
                                    {step.timestamp && (
                                        <span className="text-sm text-white/30 whitespace-nowrap font-bold uppercase tracking-wide">{step.timestamp}</span>
                                    )}
                                </div>
                                <p className={`text-sm font-medium transition-colors ${step.status === 'completed' || step.status === 'current' ? 'text-white/60' : 'text-white'
                                    }`}>
                                    {step.description}
                                </p>
                                {step.status === 'current' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <motion.div
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm text-emerald-500 font-bold">Processing</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FOOTER INFO */}
            <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Clock className="w-4 h-4 text-white" />
                <p className="text-white">
                    Estimated completion: <span className="text-white">2-5 minutes</span>
                </p>
            </div>

            {/* HELP TEXT */}
            <div className="text-center">
                <p className="text-sm font-bold text-white uppercase tracking-wide">
                    You can safely close this page. We'll notify you when the transaction completes.
                </p>
            </div>
        </motion.div>
    );
}

function SuccessScreen({ amount, transactionId, onContinue }) {
    return (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-lg mx-auto space-y-8">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-black" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">Payment Successful!</h2>
                <p className="text-white font-bold uppercase tracking-wide text-sm">Your funds have been deposited to your vault</p>
            </div>

            <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-white font-bold uppercase tracking-wide">Amount Deposited</span>
                    <span className="text-lg font-bold text-white">${amount.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-white font-black uppercase tracking-wide">Transaction ID</span>
                        <span className="text-sm text-white/60 font-medium">{transactionId}</span>
                    </div>
                </div>
            </div>

            <button onClick={onContinue} className="w-full h-16 bg-white text-black font-bold text-lg rounded-2xl hover:bg-slate-200 transition-all shadow-xl">
                Continue to Dashboard
            </button>
        </motion.div>
    );
}

function FailureScreen({ onRetry, onExit }) {
    return (
        <motion.div key="failure" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-lg mx-auto space-y-8">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20">
                <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">Transaction Failed</h2>
                <p className="text-white font-bold uppercase tracking-wide text-sm">We couldn't process your payment</p>
            </div>

            <div className="w-full bg-red-500/5 border border-red-500/10 rounded-3xl p-6 space-y-3">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-left space-y-2">
                        <p className="text-sm font-bold text-white">Possible reasons:</p>
                        <ul className="text-sm text-white font-bold uppercase tracking-wide space-y-1 list-disc list-inside">
                            <li>Payment timeout (24-hour window expired)</li>
                            <li>Incorrect reference code</li>
                            <li>Insufficient funds in source account</li>
                            <li>Bank transfer rejected</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-3">
                <button onClick={onRetry} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <RefreshCcw className="w-5 h-5" />
                    Try Again
                </button>
                <button onClick={onExit} className="w-full h-14 border border-white/10 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                    Change Payment Method
                </button>
            </div>

            <button className="text-sm text-white hover:text-emerald-500 font-bold uppercase tracking-wide transition-all">
                Contact Support →
            </button>
        </motion.div>
    );
}

function BankInfo({ label, value, copy, onCopy, copied, highlight }) {
    return (
        <div className="p-5 flex justify-between items-center">
            <div>
                <p className="text-sm font-black uppercase text-white tracking-wide mb-1">{label}</p>
                <p className={`text-sm ${highlight ? 'text-emerald-500 font-bold' : 'text-white'}`}>{value}</p>
            </div>
            {copy && (
                <button onClick={onCopy} className="group relative">
                    {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-white group-hover:text-emerald-500 transition-all" />
                    )}
                </button>
            )}
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
            <h3 className="text-2xl font-bold text-white mb-2">Verifying...</h3>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500/50">Please wait</p>
        </motion.div>
    );
}

