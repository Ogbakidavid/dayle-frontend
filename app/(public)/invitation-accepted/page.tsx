"use client";
import { DotLoader } from "@/components/ui/dot-loader";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface Vault {
  id: string;
  title: string;
  status: string;
  clientName?: string;
  amount: number;
  formattedTotalAmount?: string;
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
        const data = (await api.vaults.getById(vaultId)) as Vault;
        setVault(data);
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, [vaultId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <DotLoader size="lg" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-900">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-emerald-500/30 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-4">
            Invitation accepted
          </h1>
          <p className="text-xl text-slate-500 max-w-lg mx-auto">
            You have successfully accepted the invitation for{" "}
            <span className="text-slate-900 font-bold">{vault.title}</span>.
          </p>
        </div>

        <Card className="bg-white border-slate-200 max-w-xl mx-auto text-left shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm ">Status</span>
              <Badge
                variant="outline"
                className="text-emerald-700 bg-emerald-50 border-emerald-100 font-bold"
              >
                {vault.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500 text-sm ">Client</span>
              <span className="text-slate-900 font-bold">
                {vault.clientName || "Client"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 text-sm ">Total Value</span>
              <span className="text-slate-900 font-bold">
                ${vault.formattedTotalAmount || vault.amount}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="pt-8">
          <Button
            onClick={() => router.replace(`/freelancer/vault/${vault.id}`)}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold  px-8 shadow-lg shadow-emerald-600/20"
          >
            View project
          </Button>
        </div>
      </div>
    </div>
  );
}
