import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

export type UserRole = "customer" | "admin";
export type ShopUser = { id: string; email: string; role: UserRole };

type AuthStatus = "loading" | "ready";
type AuthContextValue = {
  status: AuthStatus;
  user: ShopUser | null;
  role: UserRole | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  registerCustomer: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<ShopUser | null>(null);

  useEffect(() => {
    let active = true;
    void apiRequest<{ user: ShopUser | null }>("/auth/me")
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setStatus("ready");
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    role: user?.role ?? null,
    isAdmin: user?.role === "admin",
    async signIn(email, password) {
      const result = await apiRequest<{ user: ShopUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
    },
    async registerCustomer(email, password) {
      const result = await apiRequest<{ user: ShopUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
    },
    async signOut() {
      await apiRequest<void>("/auth/logout", { method: "POST" });
      setUser(null);
    },
  }), [status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
