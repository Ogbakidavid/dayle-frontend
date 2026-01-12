'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store/user-context';
import { api } from '@/lib/mock-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Shield,
    CheckCircle2,
    AlertCircle,
    Lock,
    ArrowLeft,
    ArrowRight,
    Globe,
    Building2,
    CreditCard,
    Loader2,
    UserCircle2,
    MapPin,
    Camera,
    Scan,
    Fingerprint
} from 'lucide-react';

export default function KYCPage() {
    const router = useRouter();
    const { user, refreshUser } = useUser();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [cameraError, setCameraError] = useState(null);
    const [idImage, setIdImage] = useState(null);
    const [idScanProgress, setIdScanProgress] = useState(0);
    const [isIdScanning, setIsIdScanning] = useState(false);
    const [capturedFace, setCapturedFace] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        ssn: '', // or tax ID
        address: '',
        city: '',
        state: '',
        zip: '',
        businessName: '',
        ein: '',
    });

    const isClient = user?.role === 'client';
    const totalSteps = isClient ? 5 : 4;

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startScan = async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            streamRef.current = stream;
            streamRef.current = stream;
            setIsCameraActive(true);
            setCapturedFace(null);
            setScanProgress(0);
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraError('Please enable camera access to complete the liveness check.');
        }
    };

    // Effect to attach stream to video element when it becomes available in the DOM
    useEffect(() => {
        if (isCameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCameraActive]);

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            // Mirror the capture to match the mirrored video preview
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoRef.current, 0, 0);

            setCapturedFace(canvas.toDataURL('image/jpeg'));
            stopCamera();
            setIsCameraActive(false);
        }
    };

    const retakePhoto = () => {
        setCapturedFace(null);
        startScan();
    };

    const confirmFace = () => {
        setCurrentStep(4);
    };

    const handleIdUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setIdImage(event.target.result);
                // Start mock scan
                setIsIdScanning(true);
                setIdScanProgress(0);
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 4;
                    setIdScanProgress(progress);
                    if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setIsIdScanning(false);
                            // We don't auto-move to let user see "Verified" status
                        }, 800);
                    }
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    };

    // Cleanup camera on unmount or step change
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (currentStep < totalSteps) {
            // Validate ID upload before moving from step 2
            if (currentStep === 2 && !idImage) {
                return;
            }
            // Logic for step 3 (Face scan) is handled by the auto-transition in useEffect
            if (currentStep === 3) return;

            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            await api.users.updateProfile({ kycStatus: 'approved', ...formData });
            await refreshUser();
            const dashboardPath = isClient ? '/client' : '/freelancer';
            router.push(dashboardPath);
        } catch (error) {
            console.error('KYC update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col font-['Poppins',_sans-serif] selection:bg-emerald-500/30">
            {/* Background Grid Decoration */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-12">
                <div className="w-full max-w-2xl">
                    {/* Centered Heading */}
                    <div className="text-center mb-12 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Verification Protocol
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Verify <span className="text-emerald-500 italic">Account.</span>
                        </h1>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        {/* Progress Bar Top */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            ></div>
                        </div>

                        {/* Accent Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none transition-all group-hover:bg-emerald-500/10"></div>

                        <div className="p-8 md:p-16 relative z-10">
                            {/* Step Indicator Text */}
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Phase {currentStep} of {totalSteps}</span>
                                <div className="flex gap-1.5">
                                    {[...Array(totalSteps)].map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${currentStep > i ? 'bg-emerald-500' : 'bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-12">

                                {currentStep === 1 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <UserCircle2 className="w-8 h-8 text-emerald-500" /> Legal Identity
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">As shown on your official government documents.</p>
                                        </div>

                                        <div className="space-y-8">
                                            <Input
                                                label="Full Legal Name"
                                                placeholder="Enter your legal name as on ID"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="!bg-[#050505] !border-white/10 !text-white focus:!border-emerald-500/50 !h-16"
                                                required
                                            />

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <Input
                                                    label="Date of Birth"
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                    className="!bg-[#050505] !border-white/10 !text-white appearance-none !h-16"
                                                    required
                                                />
                                                <Input
                                                    label="SSN / National ID"
                                                    placeholder="XXX-XX-XXXX"
                                                    value={formData.ssn}
                                                    onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                                                    className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <CreditCard className="w-8 h-8 text-emerald-500" /> ID Document
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">Upload a clear photo of your Passport or Driver's License.</p>
                                        </div>

                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${idImage ? 'border-emerald-500/50 bg-emerald-500/[0.02]' : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'}`}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleIdUpload}
                                            />

                                            {idImage ? (
                                                <>
                                                    <img src={idImage} alt="ID Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                                    <div className="relative z-10 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                                        {isIdScanning ? (
                                                            <>
                                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                                                <div className="space-y-2 text-center">
                                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">OCR Extraction Active</p>
                                                                    <div className="w-32 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-emerald-500 transition-all duration-300"
                                                                            style={{ width: `${idScanProgress}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                                                                    <CheckCircle2 className="w-6 h-6 text-black" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Document Verified</p>
                                                                <button className="text-[9px] text-slate-500 hover:text-white underline uppercase tracking-tighter">Replace Document</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                        <Globe className="w-8 h-8 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-black text-white uppercase tracking-widest">Click to upload document</p>
                                                        <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-tighter">PNG, JPG or PDF up to 10MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="space-y-2 text-center">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
                                                <Scan className="w-8 h-8 text-emerald-500" /> Live Identity
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">Please position your face within the frame and look directly at the camera.</p>
                                        </div>

                                        <div className="relative group/camera mx-auto w-full max-w-sm aspect-square">
                                            {/* Camera Frame */}
                                            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full flex items-center justify-center p-4">
                                                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-pulse-slow clip-path-face z-30 pointer-events-none"></div>

                                                {!isCameraActive && !capturedFace ? (
                                                    <div className="w-full h-full rounded-full bg-white/[0.02] flex flex-col items-center justify-center gap-6 border border-white/5 group-hover/camera:bg-white/[0.04] transition-all relative z-10">
                                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                            <Camera className="w-10 h-10 text-emerald-500" />
                                                        </div>
                                                        {cameraError ? (
                                                            <div className="text-center px-8 space-y-4">
                                                                <p className="text-[10px] font-medium text-red-500 uppercase tracking-widest">{cameraError}</p>
                                                                <Button
                                                                    onClick={startScan}
                                                                    type="button"
                                                                    className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] px-6 py-3 rounded-full border border-white/10"
                                                                >
                                                                    Retry Access
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                onClick={startScan}
                                                                type="button"
                                                                className="bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
                                                            >
                                                                Enable Camera
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : capturedFace ? (
                                                    <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center overflow-hidden relative border border-emerald-500/30">
                                                        <img
                                                            src={capturedFace}
                                                            alt="Captured Face"
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                                                            <div className="flex gap-3">
                                                                <Button
                                                                    onClick={retakePhoto}
                                                                    type="button"
                                                                    className="bg-transparent border border-white/20 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest px-4 h-10 rounded-full"
                                                                >
                                                                    Retake
                                                                </Button>
                                                                <Button
                                                                    onClick={confirmFace}
                                                                    type="button"
                                                                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] uppercase tracking-widest px-4 h-10 rounded-full"
                                                                >
                                                                    Confirm
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center overflow-hidden relative border border-emerald-500/30">
                                                        <video
                                                            ref={videoRef}
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                                        />

                                                        {/* Scanning Overlay Text */}
                                                        <div className="absolute inset-x-0 bottom-12 z-40 text-center space-y-3">
                                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30">
                                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Feed</span>
                                                            </div>
                                                            <Button
                                                                onClick={capturePhoto}
                                                                type="button"
                                                                className="mx-auto flex bg-white text-black font-black uppercase tracking-widest text-[10px] px-6 py-2 rounded-full hover:scale-105 transition-transform"
                                                            >
                                                                Capture Photo
                                                            </Button>
                                                        </div>

                                                        {/* Digital Grid Overlay */}
                                                        <div className="absolute inset-0 opacity-20 pointer-events-none z-20 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Trust Tags */}
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4 w-max">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050505] border border-white/10 shadow-xl">
                                                    <Fingerprint className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Biometric Encrypted</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <MapPin className="w-8 h-8 text-emerald-500" /> Residency
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">Your current primary residence address.</p>
                                        </div>

                                        <div className="space-y-8">
                                            <Input
                                                label="Street Address"
                                                placeholder="123 Financial District"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                required
                                            />

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                                <Input
                                                    label="City"
                                                    placeholder="San Francisco"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                    required
                                                />
                                                <Input
                                                    label="State"
                                                    placeholder="CA"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                    required
                                                />
                                                <Input
                                                    label="ZIP"
                                                    placeholder="94103"
                                                    value={formData.zip}
                                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                                    className="!bg-[#050505] !border-white/10 !text-white !h-16 md:col-span-1 col-span-2"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 5 && isClient && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <Building2 className="w-8 h-8 text-emerald-500" /> Business Entity
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">Details for the legal entity funding the account.</p>
                                        </div>

                                        <div className="space-y-8">
                                            <Input
                                                label="Legal Business Name"
                                                placeholder="Acme Holdings Inc."
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                required
                                            />
                                            <Input
                                                label="EIN / Business ID"
                                                placeholder="XX-XXXXXXX"
                                                value={formData.ein}
                                                onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                                                className="!bg-[#050505] !border-white/10 !text-white !h-16"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-12 border-t border-white/5 space-y-8">
                                    <div className="flex gap-4">
                                        {currentStep > 1 && (
                                            <Button
                                                type="button"
                                                onClick={prevStep}
                                                className="h-18 flex-1 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-black uppercase tracking-widest text-xs rounded-2xl py-6 transition-all"
                                            >
                                                Back
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            disabled={currentStep === 2 && !idImage}
                                            className={`${currentStep > 1 ? 'flex-[2]' : 'w-full'} h-18 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 group py-6 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-3">
                                                    <Loader2 className="w-6 h-6 animate-spin" /> Finalizing
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-3">
                                                    {currentStep === totalSteps ? 'Complete Verification' : (currentStep === 3 ? 'Scanning...' : 'Continue')}
                                                    {currentStep === totalSteps ? <CheckCircle2 className="w-6 h-6" /> : (currentStep !== 3 && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />)}
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Security Notice */}
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-center">
                                        <AlertCircle className="w-5 h-5 text-slate-600 shrink-0" />
                                        <p className="text-[10px] font-medium text-slate-500 leading-tight uppercase tracking-widest">
                                            Information is secured by military-grade AES-256 encryption. Our verification partners are SOC2 Type II compliant.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) opacity(0.5);
                    cursor: pointer;
                }
                .animate-in {
                    animation-duration: 500ms;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .clip-path-face {
                    clip-path: ellipse(40% 50% at 50% 50%);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
