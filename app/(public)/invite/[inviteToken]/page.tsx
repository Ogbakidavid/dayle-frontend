"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, UserRole } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Lock,
  User,
  ArrowRight,
  XCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteData {
  invite: {
    id: string;
    email: string;
    status: string;
    vaultId: string;
  };
  vault: {
    id: string;
    title: string;
    amount: number;
    clientName: string;
    deliverableCount: number;
    isFunded: boolean;
    vaultAddress?: string;
    totalAmount?: number;
  };
}

interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteToken = params?.inviteToken as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InviteData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [processing, setProcessing] = useState(false);

  // For Decline Modal
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const DECLINE_REASONS = [
    { id: "TOO_BUSY", label: "Too busy right now" },
    { id: "NOT_A_FIT", label: "Project is not a good fit" },
    { id: "RATE_MISMATCH", label: "Rate expectations do not match" },
    { id: "SCOPE_UNCLEAR", label: "Scope is unclear" },
    { id: "OTHER", label: "Other" },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Get User Session (Optional)
        try {
          const user = (await api.auth.getCurrentUser()) as CurrentUser | null;
          setCurrentUser(user);
        } catch (authErr) {
          // Ignore auth errors, user might be a guest
          console.log("User is not logged in (Guest mode)");
        }

        // 2. Get Invite Data
        if (inviteToken) {
          const result = (await api.invites.getByToken(
            inviteToken,
          )) as InviteData;
          setData(result);
        }
      } catch (err: any) {
        console.error("Failed to load invite:", err);
        setError(err.message || "Failed to load invitation.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [inviteToken]);

  const handleLoginRedirect = () => {
    const returnTo = encodeURIComponent(`/invite/${inviteToken}`);
    router.push(`/login?returnTo=${returnTo}`);
  };

  const handleSignupRedirect = () => {
    const returnTo = encodeURIComponent(`/invite/${inviteToken}`);
    router.push(`/signup?returnTo=${returnTo}`);
  };

  const handleDecline = async () => {
    if (!declineReason) return;
    try {
      setProcessing(true);
      await api.invites.respond(inviteToken, {
        decision: "DECLINE",
        reasonCode: declineReason,
      });
      // Refresh state to show declined view
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
      setShowDeclineModal(false);
    }
  };

  const handleAccept = async () => {
    try {
      setProcessing(true);
      const res = (await api.invites.respond(inviteToken, {
        decision: "ACCEPT",
      })) as { success: boolean; vaultId: string };
      if (res.success && res.vaultId) {
        // Redirect to acceptance success page instead of vault directly
        router.push(`/invitation-accepted?vaultId=${res.vaultId}`);
        return;
      }
    } catch (err: any) {
      alert(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <DotLoader size="lg" />
      </div>
    );
  }

  // Error State (e.g., Not Found, Expired)
  if (error) {
    const isExpired = error.toLowerCase().includes("expired");
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-zinc-400">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {isExpired ? "Invitation Expired" : "Invitation Invalid"}
          </h1>
          <p className="text-white/60 font-medium font-['Poppins',sans-serif]">
            {isExpired
              ? "This secure link is no longer valid. For security, invitations expire after 72 hours."
              : error}
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success / Already Responded State
  if (data?.invite?.status !== "PENDING") {
    const status = data?.invite?.status;
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-zinc-400">
        <div className="max-w-md w-full text-center space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border ${status === "ACCEPTED" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}
          >
            {status === "ACCEPTED" ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {status === "ACCEPTED"
              ? "Invitation Accepted"
              : "Invitation Declined"}
          </h1>
          <p className="text-white/60 font-medium font-['Poppins',sans-serif]">
            You have already responded to this invitation.
          </p>
          {status === "ACCEPTED" && data?.vault && (
            <div className="pt-4">
              <Button
                onClick={() =>
                  router.push(`/freelancer/vault/${data.vault.id}`)
                }
                className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold"
              >
                View Vault
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { vault, invite } = data!;
  const isFreelancer = currentUser?.role === UserRole.FREELANCER;
  const isClient = currentUser?.role === UserRole.CLIENT;
  const isLoggedIn = currentUser && currentUser.role !== UserRole.NONE;

  return (
    <div className="min-h-screen bg-[#050505] font-['Poppins',sans-serif] selection:bg-emerald-500/30">
      {/* Simple Header */}
      <header className="border-b border-white/5 bg-[#080808]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black">
              <Shield className="w-5 h-5 stroke-[3px]" />
            </div>
            <span className="font-black tracking-tighter text-white text-xl uppercase">
              Dayle
            </span>
          </Link>
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-sm font-bold text-white/50">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={async () => {
                  await api.auth.logout();
                  window.location.reload();
                }}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors border border-emerald-500/30 px-2 py-1 rounded"
              >
                Switch
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        <div className="w-full max-w-3xl mb-12 text-center text-zinc-400">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold uppercase tracking-wide mb-6"
          >
            <Briefcase className="w-4 h-4" />
            <span>Project Invitation</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
            {vault.title}
          </h1>
          <p className="text-xl text-white/50 font-medium">
            Sent by <span className="text-white">{vault.clientName}</span>
          </p>
        </div>

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 items-start">
          {/* LEFT: Project Summary */}
          <div className="bg-muted border border-white/5 rounded-2xl p-6 md:p-8 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 font-['Poppins',sans-serif]">
                Safe Project Summary
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-1">
                    Total Value
                  </p>
                  <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                    <span className="text-lg text-emerald-500">$</span>
                    {(vault.totalAmount || vault.amount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10 my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {vault.isFunded ? (
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Lock className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-wide font-['Poppins',sans-serif]">
                      {vault.isFunded
                        ? "Funds Verified & Secured"
                        : "Awaiting Client Funding"}
                    </p>
                    <p className="text-white/40 text-xs font-medium mt-0.5">
                      {vault.isFunded
                        ? "Capital is held in a secure escrow vault."
                        : "Funds must be secured before work begins."}
                    </p>
                  </div>
                </div>

                {vault.vaultAddress && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-700 delay-300">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                        Securely Verified Escrow
                      </p>
                      <p className="text-white/30 text-[10px] font-mono mt-0.5 break-all">
                        {vault.vaultAddress}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Action Card */}
          <div className="bg-muted border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-center min-h-[300px]">
            {!isLoggedIn ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-8 h-8 text-white/70" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">
                    Join to Respond
                  </h3>
                  <p className="text-white/50 text-sm mt-2 font-medium">
                    Create an account or sign in to accept this project
                    invitation.
                  </p>
                </div>
                <div className="grid gap-3">
                  <Button
                    onClick={handleLoginRedirect}
                    className="w-full h-12 bg-white text-black hover:bg-emerald-500 hover:text-black font-bold uppercase tracking-wide rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={handleSignupRedirect}
                    variant="outline"
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 font-bold uppercase tracking-wide rounded-xl transition-all active:scale-95"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            ) : isClient ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                    Freelancer Access Only
                  </h3>
                  <p className="text-white/50 text-sm mt-2 font-medium">
                    You are logged in as a Client. This invitation is intended
                    for a Freelancer account.
                  </p>
                </div>
                <div className="grid gap-3">
                  <Button
                    onClick={() => router.push("/client")}
                    variant="outline"
                    className="w-full h-12 border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wide rounded-xl transition-all"
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    onClick={async () => {
                      await api.auth.logout();
                      window.location.reload();
                    }}
                    variant="ghost"
                    className="w-full h-10 text-white/30 hover:text-white font-bold uppercase text-[10px] tracking-widest"
                  >
                    Switch Account
                  </Button>
                </div>
              </div>
            ) : currentUser && currentUser.email !== invite.email ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-red-500/20">
                  <Lock className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic text-red-400">
                    Identity Mismatch
                  </h3>
                  <p className="text-white/50 text-sm mt-2 font-medium leading-relaxed">
                    This invitation was sent to{" "}
                    <span className="text-white font-bold">{invite.email}</span>
                    , but you are logged in as{" "}
                    <span className="text-white font-bold">
                      {currentUser.email}
                    </span>
                    .
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    await api.auth.logout();
                    window.location.reload();
                  }}
                  variant="outline"
                  className="w-full h-12 border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wide rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Login with Different Account
                </Button>
              </div>
            ) : (
              // Freelancer View
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                    Ready to collaborate?
                  </h3>
                  <p className="text-white/50 text-sm mt-2 font-medium">
                    Accepting creates a binding workspace. You can review full
                    requirements before confirming the vault.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={handleAccept}
                    disabled={processing}
                    className="w-full h-14 bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    {processing ? <DotLoader size="md" /> : "Accept Invitation"}
                  </Button>

                  <Button
                    onClick={() => setShowDeclineModal(true)}
                    disabled={processing}
                    variant="ghost"
                    className="w-full h-12 text-white/50 hover:text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wide rounded-xl"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 text-white/20 text-xs uppercase tracking-widest font-bold flex items-center gap-2 font-['Poppins',sans-serif]">
          <Shield className="w-3 h-3" />
          Secured by Dayle Protocol
        </p>
      </main>

      {/* Decline Modal */}
      <AnimatePresence>
        {showDeclineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-muted border border-white/10 rounded-2xl p-6 space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Decline Invitation
                </h3>
                <p className="text-white/50 text-sm mt-1 font-medium">
                  Please select a reason for declining.
                </p>
              </div>

              <div className="space-y-2">
                {DECLINE_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setDeclineReason(reason.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-all ${
                      declineReason === reason.id
                        ? "bg-white text-black border-white"
                        : "bg-black border-white/10 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 text-white/50 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!declineReason || processing}
                  onClick={handleDecline}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  {processing ? <DotLoader size="sm" /> : "Confirm Decline"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
