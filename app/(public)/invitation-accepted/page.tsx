"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    CheckCircle,
    Loader2,
    AlertTriangle,
} from "lucide-react";

interface Vault {
    id: string;
    title: string;
    status: string;
    clientName?: string;
    amount: number;
}

export default function InvitationAcceptedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vaultId = searchParams.get("vaultId");

    const [vault, setVault] = useState<Vault | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVault() {
            if (!vaultId) {
                router.push("/freelancer");
                return;
            }

            try {
                const data = await api.vaults.getById(vaultId) as Vault;
                setVault(data);
            } catch (err) {
                console.error("Failed to load vault:", err);
            } finally {
                setLoading(false);
            }
        }
        loadVault();
    }, [vaultId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!vault) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-white">Vault not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-gray-400 font-sans selection:bg-emerald-500/30 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>

                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Invitation Accepted
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg mx-auto">
                        You have successfully accepted the invitation for <span className="text-white font-bold">{vault.title}</span>.
                    </p>
                </div>

                <Card className="bg-[#0D0D0E] border-white/5 max-w-xl mx-auto text-left">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm uppercase tracking-wide">Status</span>
                            <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                                {vault.status}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm uppercase tracking-wide">Client</span>
                            <span className="text-white font-bold">{vault.clientName || "Client"}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400 text-sm uppercase tracking-wide">Total Value</span>
                            <span className="text-white font-bold">${vault.amount.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-8">
                    <Button
                        onClick={() => router.push(`/freelancer/vault/${vault.id}`)}
                        className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold uppercase tracking-wide px-8"
                    >
                        View Vault
                    </Button>
                </div>
            </div>
        </div>
    );
}
