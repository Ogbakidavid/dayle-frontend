"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { api, UserRole } from "@/lib/api-client";
import { KycStatus } from "@/lib/domain/enums";
import { useRouter } from "next/navigation";
import { usePrivy, useCreateWallet, useWallets } from "@privy-io/react-auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  emailVerified: boolean;
  kycStatus?: KycStatus;
  paymentAccountReady?: boolean;
  country?: string;
  wallet?: {
    address: string;
  };
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: (token?: string) => Promise<User | null>;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncingRef = useRef(false);
  const router = useRouter();
  const {
    logout: privyLogout,
    authenticated,
    ready,
    getAccessToken,
  } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { wallets } = useWallets();

  useEffect(() => {
    // Check session on mount
    const persistedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("dayle_access_token")
        : null;
    checkSession(persistedToken || undefined);
  }, []);

  const syncWallet = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const token = await getAccessToken();
      if (token) {
        console.log("Syncing wallet to backend...");
        await api.auth.socialLogin({ accessToken: token });
        await checkSession();
      }
    } catch (err) {
      console.error("Wallet sync failed:", err);
    } finally {
      syncingRef.current = false;
    }
  };

  // Silent wallet creation for users (like email-only) who don't have one yet
  useEffect(() => {
    const hasNeedsSync =
      !user?.wallet?.address || user?.wallet?.address.startsWith("pending_");

    if (ready && authenticated && user && hasNeedsSync && !syncingRef.current) {
      const privyWallet = wallets.find((w) => w.walletClientType === "privy");

      if (privyWallet) {
        syncWallet();
      } else {
        // No wallet in Privy yet, create it
        console.log("Automatically creating embedded wallet for user...");
        createWallet()
          .then(() => syncWallet())
          .catch(async (err) => {
            if (err.message?.includes("already has an embedded wallet")) {
              syncWallet();
            } else {
              console.error("Failed to create embedded wallet:", err);
            }
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, user, wallets, createWallet, getAccessToken]);

  async function checkSession(token?: string): Promise<User | null> {
    try {
      const userData = await api.auth.getCurrentUser(token);
      setUser(userData);
      return userData;
    } catch (err: any) {
      // Silently handle auth errors (user not logged in)
      if (err.statusCode === 401) {
        setUser(null);
        return null;
      }
      // Log other errors
      console.error("Session check error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await privyLogout();
    await api.auth.logout();
    setUser(null);
    router.push("/login");
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser: checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
