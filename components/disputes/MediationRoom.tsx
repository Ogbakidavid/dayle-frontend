"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Timer, Handshake, ChevronRight, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CurrencyEstimate } from "@/components/shared/currency-estimate";
import { DotLoader } from "@/components/ui/dot-loader";


interface MediationRoomProps {
  dispute: any;
  vault: any;
  role: "client" | "freelancer";
  onUpdate: () => void;
}

export function MediationRoom({ dispute, vault, role, onUpdate }: MediationRoomProps) {
  const [isProposing, setIsProposing] = useState(false);
  const [amountToFreelancer, setAmountToFreelancer] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  useEffect(() => {
    if (!dispute.resolutionWindowExpiresAt) return;

    const interval = setInterval(() => {
      const expiry = new Date(dispute.resolutionWindowExpiresAt);
      const now = new Date();
      if (now > expiry) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        setTimeLeft(formatDistanceToNow(expiry, { addSuffix: true }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispute.resolutionWindowExpiresAt]);

  const latestProposal = (dispute.events || [])
    .filter((e: any) => e.eventType === "SETTLEMENT_PROPOSED")
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const vaultAmount = Number(vault?.amount || 0) / (10 ** (vault?.tokenDecimals || 18));
  const freelancerSplit = amountToFreelancer;
  const clientSplit = vaultAmount - freelancerSplit;

  const handlePropose = async () => {
    if (!notes.trim()) {
      toast.error("Please provide a brief explanation for your proposal.");
      return;
    }
    const percentage = (amountToFreelancer / vaultAmount) * 100;
    if (percentage < 10 || percentage > 90) {
      toast.error("For full refund or full release, please use the dedicated buttons.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.disputes.proposeSettlement(dispute.id, {
        amountToFreelancer,
        notes,
      });
      toast.success("Settlement proposal sent to the other party.");
      setIsProposing(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to send proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await api.disputes.acceptSettlement(dispute.id);
      toast.success("Settlement accepted! Funds are being released.");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTotalRefund = async () => {
    setIsSubmitting(true);
    try {
      await api.disputes.requestTotalRefund(dispute.id, { 
        notes: notes || "Requesting total refund." 
      });
      toast.success("Total refund request sent.");
      setIsProposing(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to request refund");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestTotalRelease = async () => {
    setIsSubmitting(true);
    try {
      await api.disputes.requestTotalRelease(dispute.id, { 
        notes: notes || "Requesting total release." 
      });
      toast.success("Total release request sent.");
      setIsProposing(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to request release");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!confirm("Are you sure you want to escalate this dispute? This will move the case to platform arbitration for final adjudication by a Dayle expert. This process is final and cannot be undone.")) return;
    
    setIsSubmitting(true);
    try {
      await api.disputes.escalate(dispute.id);
      toast.success("Dispute escalated to platform review.");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate dispute");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-amber-50/50 border-amber-200 border-2 overflow-hidden shadow-lg shadow-amber-600/5">
      <CardHeader className="bg-amber-100/50 border-b border-amber-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
              <Handshake className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-amber-900 text-base font-black uppercase tracking-tight">Mediation Room</CardTitle>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Mutual Resolution Phase</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
                variant="ghost" 
                size="sm"
                onClick={handleEscalate}
                disabled={isSubmitting}
                className="h-8 text-[10px] font-black text-amber-700 hover:bg-amber-100 hover:text-amber-900 uppercase tracking-tighter"
              >
                Escalate to Arbitration
              </Button>
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-black text-amber-900 tabular-nums uppercase">
                Expires {timeLeft}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {!isProposing ? (
          <>
            {latestProposal ? (
              <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Proposal</p>
                    <p className="text-sm font-bold text-slate-900">
                      {latestProposal.actorId === dispute.vault.clientId ? "Client" : "Freelancer"}&lsquo;s Offer
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Split Requested</p>
                    <p className="text-lg font-black text-slate-900">
                      {((latestProposal.payload?.amountToFreelancer || 0) / vaultAmount * 100).toFixed(0)}% <span className="text-slate-400 font-normal">to Freelancer</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-600 font-bold">
                  &quot;{latestProposal.payload?.notes}&quot;
                </div>

                <div className="flex gap-3">
                  {latestProposal.actorId !== (role === "client" ? vault?.clientId : vault?.freelancerId) ? (
                    <Button 
                      onClick={handleAccept}
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl"
                    >
                      {isSubmitting ? (
                        <DotLoader size="sm" color="white" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve & Settle
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex-1 text-center py-2 text-xs font-bold text-slate-400 italic">
                      Waiting for opposite party response...
                    </div>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setAmountToFreelancer(latestProposal.payload?.amountToFreelancer || 0);
                      setIsProposing(true);
                    }}
                    className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold h-11 rounded-xl"
                  >
                    Propose Counter
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto">
                  <Calculator className="w-8 h-8 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Start Mutual Resolution</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Suggest a settlement split to the other party. If they accept, funds are released immediately with lower protocol fees.
                  </p>
                </div>
                <Button 
                  onClick={() => setIsProposing(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 px-8 rounded-xl"
                >
                  Create First Proposal
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Propose Settlement Split</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsProposing(false)} className="h-7 text-slate-400">Cancel</Button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Freelancer ({((freelancerSplit / vaultAmount) * 100).toFixed(0)}%)</span>
                    <span>Client ({((clientSplit / vaultAmount) * 100).toFixed(0)}%)</span>
                  </div>
                  <input
                    type="range"
                    min={vaultAmount * 0.1}
                    max={vaultAmount * 0.9}
                    step={vaultAmount / 100}
                    value={amountToFreelancer}
                    onChange={(e) => setAmountToFreelancer(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-[9px] font-black text-emerald-600 uppercase">To Freelancer</p>
                      <p className="text-lg font-black text-emerald-700">
                        <CurrencyEstimate usdAmount={freelancerSplit} showNote={false} />
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-600 uppercase">To Client</p>
                      <p className="text-lg font-black text-blue-700">
                        <CurrencyEstimate usdAmount={clientSplit} showNote={false} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reasoning for Split</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. I have completed 70% of the work as per the agreement..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {role === "client" ? (
                    <Button 
                      variant="outline"
                      onClick={handleRequestTotalRefund}
                      disabled={isSubmitting}
                      className="border-red-200 text-red-700 hover:bg-red-50 font-bold h-11 rounded-xl w-full"
                    >
                      Request Full Refund
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleRequestTotalRelease}
                      disabled={isSubmitting}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold h-11 rounded-xl w-full"
                    >
                      Request Full Release
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={handlePropose}
                  disabled={isSubmitting}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20"
                >
                  {isSubmitting ? "Sending..." : "Send Split Proposal"}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-[10px] leading-tight text-blue-700 font-bold">
            Mediation is a collaborative phase. If no agreement is reached before the window expires, the case will escalate to platform arbitration which involves a longer review time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
