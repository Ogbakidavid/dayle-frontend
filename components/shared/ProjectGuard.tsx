"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/lib/store/user-context";
import { api } from "@/lib/api-client";
import { DotLoader } from "@/components/ui/dot-loader";
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
        // We verify access by attempting to fetch the project details.
        // The backend should return 403 if the user is not a participant.
        await api.vaults.getById(vaultId as string);
        setAuthorized(true);
      } catch (err: any) {
        console.error("Project access verification failed:", err);
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
        <DotLoader size="lg" />
        <p className="text-[10px] font-bold text-emerald-500 tracking-[0.2em]">
          Validating project access
        </p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Access denied
        </h2>
        <p className="text-zinc-400 text-sm max-w-md mb-8">
          You do not have permission to access this project. If you believe this
          is an error, please contact support or the project owner.
        </p>
        <Button
          onClick={() => router.back()}
          className="bg-white text-black font-bold tracking-wide text-xs px-8 h-12 rounded-xl"
        >
          Go back
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
