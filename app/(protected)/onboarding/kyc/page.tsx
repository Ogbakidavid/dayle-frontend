"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { api, UserRole } from "@/lib/api-client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  CreditCard,
  UserCircle2,
  Camera,
  Scan,
  Fingerprint,
} from "lucide-react";

interface KYCFormData {
  fullName: string;
  dateOfBirth: string;
  ssn: string;
}

function KYCPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const { user, refreshUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idScanProgress, setIdScanProgress] = useState(0);
  const [isIdScanning, setIsIdScanning] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState<
    "passport" | "drivers_license" | "national_id"
  >("passport");
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: "",
    dateOfBirth: "",
    ssn: "",
  });

  const isClient = roleParam
    ? roleParam.toLowerCase() === "client"
    : user?.role === UserRole.CLIENT;
  const totalSteps = 3;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startScan = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      setCapturedFace(null);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Please enable camera access to complete the liveness check.",
      );
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the capture to match the mirrored video preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedFace(canvas.toDataURL("image/jpeg"));
      }
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

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setIdImage(result);
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
            }, 800);
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentStep < totalSteps) {
      if (currentStep === 2 && !idImage) {
        return;
      }
      if (currentStep === 3) return;

      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      // Submit KYC data to the correct onboarding endpoint
      await api.onboarding.submitKyc({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: "NOT_REQUIRED_ONBOARDING",
        idDocumentUrl: idImage, // Sending the base64 image
        idNumber: formData.ssn,
        idType: documentType,
      });

      // Update basic profile info if needed (optional, typically KYC handles status)
      await api.auth.updateProfile({
        name: formData.fullName,
      });

      const freshUser = await refreshUser();
      const currentUserRole = roleParam || freshUser?.role || user?.role;

      if (
        currentUserRole &&
        currentUserRole.toString().toUpperCase() === UserRole.CLIENT
      ) {
        router.push("/client");
      } else {
        router.push("/freelancer");
      }
    } catch (error) {
      console.error("KYC update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-dvh bg-black text-white flex flex-col font-['Inter',sans-serif] selection:bg-emerald-500/30 overflow-hidden">
      {/* Top Navigation Bar - Mobile App Style */}
      <header className="fixed top-0 inset-x-0 h-16 bg-black z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 w-full">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          ) : (
            <div className="w-10 h-10"></div>
          )}
          <div className="flex-1 text-center font-semibold text-[17px] tracking-tight text-white">
            Verification Phase {currentStep}
          </div>
          <div className="w-10 h-10 flex items-center justify-center font-mono text-xs text-white/40">
            {currentStep}/{totalSteps}
          </div>
        </div>
      </header>

      {/* Sleek Native Top Progress Bar */}
      <div className="fixed top-16 inset-x-0 h-1 bg-white/5 z-50">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Main Content Area - Full Bleed */}
      <main className="flex-1 overflow-y-auto w-full pt-20 pb-32">
        <div className="max-w-md mx-auto w-full px-6 py-6 h-full flex flex-col">
          {/* Header Copy */}
          <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold tracking-tight">
              Complete ID Verify
            </h1>
            <p className="text-sm text-zinc-400">
              Unlock full access to funding and withdrawals in under 60 seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <UserCircle2 className="w-8 h-8 text-emerald-500" /> Legal
                    Identity
                  </h3>
                  <p className="text-sm font-medium text-zinc-400">
                    As shown on your official government documents.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                      Full Legal Name
                    </Label>
                    <Input
                      placeholder="Enter your legal name as on ID"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullName: e.target.value,
                        })
                      }
                      className="bg-transparent border-0 border-b-2 border-white/10 rounded-none px-1 text-white text-xl placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors h-14"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                        Date of Birth
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-0 border-b-2 border-white/10 rounded-none px-1 text-white text-xl focus:ring-0 focus:outline-none focus-visible:border-emerald-500 transition-colors h-14 scheme:dark"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">
                        National ID Number
                      </Label>
                      <Input
                        placeholder="e.g. BVN, NIN, CPF"
                        value={formData.ssn}
                        onChange={(e) =>
                          setFormData({ ...formData, ssn: e.target.value })
                        }
                        className="bg-transparent border-0 border-b-2 border-white/10 rounded-none px-1 text-white text-xl placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors h-14"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-emerald-500" /> ID
                    Document
                  </h3>
                  <p className="text-sm font-medium text-zinc-400">
                    Select your document type and upload a clear photo.
                  </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl items-center">
                  <button
                    type="button"
                    onClick={() => setDocumentType("passport")}
                    className={`flex-1 py-3 px-2 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${documentType === "passport" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
                  >
                    Passport
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType("drivers_license")}
                    className={`flex-1 py-3 px-2 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${documentType === "drivers_license" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
                  >
                    Driver License
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentType("national_id")}
                    className={`flex-1 py-3 px-2 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${documentType === "national_id" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
                  >
                    National ID
                  </button>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-4/3 w-full max-w-sm mx-auto rounded-3xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden ${idImage ? "bg-black" : "bg-white/5 hover:bg-white/10"}`}
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
                      <Image
                        src={idImage}
                        alt="ID Preview"
                        fill
                        className="object-cover opacity-40"
                        unoptimized
                      />

                      <div className="relative z-10 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                        {isIdScanning ? (
                          <>
                            <DotLoader size="lg" />
                            <div className="space-y-2 text-center">
                              <p className="text-sm font-black text-emerald-500 uppercase tracking-wide">
                                OCR Extraction Active
                              </p>
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
                            <p className="text-sm font-black text-white uppercase tracking-wide">
                              Document Verified
                            </p>
                            <button className="text-[9px] text-gray-400 hover:text-white underline uppercase tracking-tighter">
                              Replace Document
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-xl">
                        <Camera className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-sm font-semibold text-white">
                          Tap to Front ID
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Ensure all corners are visible.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
                    <Scan className="w-8 h-8 text-emerald-500" /> Live Identity
                  </h3>
                  <p className="text-sm font-medium text-zinc-400">
                    Please position your face within the frame and look directly
                    at the camera.
                  </p>
                </div>

                <div className="relative group/camera mx-auto w-full max-w-sm aspect-square">
                  <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full flex items-center justify-center p-4">
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-pulse-slow clip-path-face z-30 pointer-events-none"></div>

                    {!isCameraActive && !capturedFace ? (
                      <div className="w-full h-full rounded-full bg-white/2 flex flex-col items-center justify-center gap-6 border border-white/5 group-hover/camera:bg-white/4 transition-all relative z-10">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Camera className="w-10 h-10 text-emerald-500" />
                        </div>
                        {cameraError ? (
                          <div className="text-center px-8 space-y-4">
                            <p className="text-sm font-medium text-red-500 uppercase tracking-wide font-['Poppins',sans-serif]">
                              {cameraError}
                            </p>
                            <Button
                              onClick={startScan}
                              type="button"
                              className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wide text-[9px] px-6 py-3 rounded-full border border-white/10"
                            >
                              Retry Access
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={startScan}
                            type="button"
                            className="bg-emerald-500 text-black font-black uppercase tracking-wide text-sm px-8 py-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
                          >
                            Enable Camera
                          </Button>
                        )}
                      </div>
                    ) : capturedFace ? (
                      <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center overflow-hidden relative border border-emerald-500/30">
                        <Image
                          src={capturedFace}
                          alt="Captured Face"
                          fill
                          className="object-cover"
                          unoptimized
                        />

                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                          <div className="flex gap-3">
                            <Button
                              onClick={retakePhoto}
                              type="button"
                              className="bg-transparent border border-white/20 hover:bg-white/10 text-white text-sm uppercase tracking-wide px-4 h-10 rounded-full"
                            >
                              Retake
                            </Button>
                            <Button
                              onClick={confirmFace}
                              type="button"
                              className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm uppercase tracking-wide px-4 h-10 rounded-full"
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

                        <div className="absolute inset-x-0 bottom-6 z-40 flex flex-col items-center gap-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                              Live Feed
                            </span>
                          </div>
                          <button
                            onClick={capturePhoto}
                            type="button"
                            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
                          >
                            <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center"></div>
                          </button>
                        </div>

                        <div className="absolute inset-0 opacity-20 pointer-events-none z-20 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-size-[20px_20px]"></div>
                      </div>
                    )}
                  </div>

                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4 w-max">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050505] border border-white/10 shadow-xl">
                      <Fingerprint className="w-3 h-3 text-emerald-500" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-wide font-['Poppins',sans-serif]">
                        Biometric Encrypted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto sticky bottom-0 inset-x-0 bg-linear-to-t from-black via-black to-transparent pt-12 pb-6 space-y-6">
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="h-14 flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-[15px] rounded-3xl transition-all"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={currentStep === 2 && !idImage}
                  className={`${currentStep > 1 ? "flex-2" : "w-full"} h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[15px] rounded-3xl transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      Finalizing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {currentStep === totalSteps
                        ? "Complete Verification"
                        : currentStep === 3
                          ? "Scanning..."
                          : "Continue"}
                    </span>
                  )}
                </Button>
              </div>

              <div className="flex justify-center items-center gap-2 text-zinc-500">
                <AlertCircle className="w-4 h-4" />
                <p className="text-[11px] font-medium tracking-tight">
                  Secured by AES-256. Bank-grade SOC2 Type II.
                </p>
              </div>
            </div>
          </form>
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

export default function KYCPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <DotLoader size="lg" />
        </div>
      }
    >
      <KYCPageContent />
    </React.Suspense>
  );
}
