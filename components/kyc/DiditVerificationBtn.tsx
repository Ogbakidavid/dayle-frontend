"use client";

import { useState, useEffect } from "react";
import { DiditSdk } from "@didit-protocol/sdk-web";
import { Button } from "@/components/ui/button";
import { DotLoader } from "@/components/ui/dot-loader";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { ScanFace } from "lucide-react";
import { toast } from "sonner";

interface DiditVerificationBtnProps {
  className?: string;
  onSuccess?: () => void;
}

export default function DiditVerificationBtn({
  className,
  onSuccess,
}: DiditVerificationBtnProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clean up the Didit SDK listener when the button triggers unmounting
  useEffect(() => {
    return () => {
      DiditSdk.shared.onComplete = undefined;
    };
  }, []);

  const startVerification = async () => {
    setLoading(true);
    try {
      // 1. Get session URL from our backend
      const response = await api.onboarding.getDiditSession();
      const { url } = response;

      if (!url) {
        throw new Error("No verification URL returned from backend");
      }

      // 2. Setup Global Callbacks using idiomatic switch
      DiditSdk.shared.onComplete = (result) => {
        switch (result.type) {
          case "completed":
            console.log("Verification completed!", result.session?.status);
            toast.success("Identity verification submitted successfully!");
            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/client");
            }
            break;
          case "cancelled":
            console.log("User cancelled verification");
            setLoading(false);
            break;
          case "failed":
            console.error("Verification failed:", result.error?.message);
            setLoading(false);
            break;
        }
      };

      // 3. Launch Didit SDK
      DiditSdk.shared.startVerification({
        url,
        configuration: {
          loggingEnabled: process.env.NEXT_PUBLIC_NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TESTNET_MODE === "true",
        },
      });
    } catch (error) {
      console.error("Failed to start Didit verification:", error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={startVerification}
      disabled={loading}
      className={
        className ||
        "w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] rounded-3xl transition-all disabled:opacity-50  shadow-lg shadow-emerald-500/10"
      }
    >
      {loading ? (
        <span className="flex items-center gap-3">
          <DotLoader size="sm" />
          Initializing...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <ScanFace className="w-5 h-5" />
          Verify identity with Didit
        </span>
      )}
    </Button>
  );
}
