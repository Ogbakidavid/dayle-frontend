"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, UserRole } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  emailVerified: boolean;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: (token?: string) => Promise<User | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { logout: privyLogout } = usePrivy();

  useEffect(() => {
    // Check session on mount
    checkSession();
  }, []);

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

  async function login(email: string, password: string): Promise<User> {
    const userData = await api.auth.login(email, password);
    setUser(userData);
    return userData;
  }

  async function signup(
    email: string,
    password: string,
    name: string,
    role: string,
  ): Promise<User> {
    const userData = await api.auth.signup(email, password, name, role);
    setUser(userData);
    return userData;
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
        login,
        signup,
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
