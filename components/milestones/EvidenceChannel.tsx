"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Send,
  Paperclip,
  ShieldAlert,
  Clock,
  User,
  Loader2,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

// Production Evidence/Event Types
// CLARIFICATION_REQUEST, REQUIREMENT_CONFIRMATION, FILE_COMMENT, DISPUTE_NOTE, DISPUTE_OPENED, DISPUTE_EVIDENCE
const EVIDENCE_TYPES = {
  MESSAGE: "MESSAGE",
  SYSTEM: "SYSTEM",
  SUBMISSION: "SUBMISSION",
  REJECTION: "REJECTION",
  DISPUTE: "DISPUTE",
} as const;

export interface EvidenceChannelProps {
  vaultId?: string;
  milestoneId?: string;
  role?: "client" | "freelancer";
  initialEvents?: EvidenceEvent[];
}

export interface EvidenceEvent {
  id: string;
  type: string;
  content: string;
  timestamp: string | Date;
  authorName: string;
  authorRole: string;
}

export function EvidenceChannel({
  vaultId,
  milestoneId,
  role = "client", // 'client' | 'freelancer'
  initialEvents = [],
}: EvidenceChannelProps) {
  const [events, setEvents] = useState<EvidenceEvent[]>(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (milestoneId) {
      fetchEvidence();
    }
  }, [milestoneId]);

  async function fetchEvidence() {
    if (!milestoneId) return;
    setLoading(true);
    try {
      const data = await api.evidence.list({ milestoneId });
      const mapped: EvidenceEvent[] = data.map(ev => ({
        id: ev.id,
        type: ev.type,
        content: ev.notes,
        timestamp: ev.createdAt,
        authorName: (ev as any).creator?.name || "User",
        authorRole: (ev as any).creator?.role?.toLowerCase() || "system"
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !milestoneId) return;

    setIsSending(true);
    try {
      await api.evidence.create({
        milestoneId,
        type: "MESSAGE",
        notes: newMessage,
      });
      setNewMessage("");
      await fetchEvidence(); // Refresh
    } catch (err) {
      console.error("Failed to log evidence:", err);
      alert("Failed to log evidence. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-[#0D0D0E] border-white/5 h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          Evidence Channel
        </CardTitle>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          Immutable Communication Log · ID: {milestoneId}
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-6 min-h-[400px]">
        {/* Messages Trend */}
        <div className="flex-1 space-y-6 overflow-y-auto mb-6 pr-2 max-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Syncing evidence ledger...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-white/20 italic text-xs">
              No evidence logged for this milestone yet.
            </div>
          ) : events.map((event) => (
            <div key={event.id} className="flex flex-col gap-1">
              {/* Event Header */}
              <div className="flex items-center gap-2 mb-1">
                {event.type === EVIDENCE_TYPES.SYSTEM ? (
                  <span className="bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/5">
                    System Event
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                      event.authorRole === role
                        ? "text-emerald-500"
                        : "text-amber-500"
                    )}
                  >
                    <User className="w-3 h-3" />
                    {event.authorName}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(event.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Event Content */}
              <div
                className={cn(
                  "p-3 rounded-lg text-sm leading-relaxed border",
                  event.type === EVIDENCE_TYPES.SYSTEM
                    ? "bg-white/2 border-white/5 text-gray-400 italic"
                    : "bg-[#141416] border-white/10 text-gray-400"
                )}
              >
                {event.content}
              </div>
            </div>
          ))}

          {/* Immutable Disclaimer */}
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-px bg-white/5 w-12" />
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              End of Ledger
            </p>
            <div className="h-px bg-white/5 w-12" />
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
          <Textarea
            placeholder={
              role === "client"
                ? "Request clarification or confirm requirements..."
                : "Ask about requirements or provide updates..."
            }
            className="bg-[#141416] border-white/10 text-white min-h-[80px] focus-visible:ring-emerald-500/50 resize-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attach Evidence
            </Button>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase text-xs tracking-wide"
            >
              {isSending ? "Loging..." : "Log to Detail"}
              {isSending ? <Loader2 className="w-3 h-3 ml-2 animate-spin" /> : <Send className="w-3 h-3 ml-2" />}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">
            All messages are cryptographically signed and stored as evidence for
            potential disputes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
