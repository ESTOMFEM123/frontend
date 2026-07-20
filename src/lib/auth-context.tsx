import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export type AppRole = "admin" | "student";

export interface Profile {
  id: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
}

interface AuthContextValue {
  user: { id: string; fullName: string; email: string; role: AppRole } | null;
  role: AppRole | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const response = await api.me();
      const currentUser = response.user;
      setUser(currentUser);
      setRole(currentUser?.role ?? null);

      const profileResponse = await api.getMyProfile();
      setProfile(profileResponse);
    } catch {
      setUser(null);
      setRole(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      setRole(null);
      setProfile(null);
      return;
    }

    loadUser().finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const refresh = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const ADMIN_SIGNUP_CODE = "ADMIN2026";
