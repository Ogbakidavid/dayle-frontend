"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { api } from "@/lib/api-client";
import { LogoLoader } from "@/components/ui/logo-loader";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectGuardProps {
  children: React.ReactNode;
}

/**
 * ProjectGuard ensures the authenticated user is a participant
 * in the project (vault) identified by the URL parameter.
 */
export default function ProjectGuard({ children }: ProjectGuardProps) {
  const { user, loading: userLoading } = useUser();
  const { vaultId } = useParams();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyProjectAccess() {
      if (userLoading || !user || !vaultId) return;

      try {
        setChecking(true);
        console.log(`[ProjectGuard] Verifying access to vault ${vaultId} for user ${user.id}`);
        // We verify access by attempting to fetch the project details.
        // The backend should return 403 if the user is not a participant.
        const vault = await api.vaults.getById(vaultId as string);
        console.log(`[ProjectGuard] Access granted for vault: ${vault.title}`);
        setAuthorized(true);
      } catch (err: any) {
        console.error("[ProjectGuard] Project access verification failed:", {
          vaultId,
          userId: user.id,
          status: err.statusCode,
          message: err.message,
          error: err
        });
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    }

    verifyProjectAccess();
  }, [user, userLoading, vaultId]);

  if (userLoading || checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <LogoLoader />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-['Poppins',sans-serif]">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tighter mb-4">
          Access denied
        </h2>
        <p className="text-slate-500 text-sm max-w-md mb-8 font-bold leading-relaxed">
          You do not have permission to access this project. If you believe this
          is an error, please contact support or the project owner.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/client")}
            className="bg-slate-900 text-white font-bold text-sm px-8 h-12 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white border-slate-200 text-slate-600 font-bold text-sm px-8 h-12 rounded-xl shadow-sm active:scale-95 transition-all"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
