import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type UserRole = "customer" | "admin";

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  registerCustomer: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ProfileRow = {
  role: UserRole;
};

async function loadRole(userId: string) {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single<ProfileRow>();

  if (error || !data) {
    return null;
  }

  return data.role;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!isSupabaseConfigured) {
        setStatus("ready");
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setSession(data.session);
      setRole(data.session?.user ? await loadRole(data.session.user.id) : null);
      setStatus("ready");
    }

    void loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession?.user ? "loading" : "ready");

      if (!nextSession?.user) {
        setRole(null);
        return;
      }

      void loadRole(nextSession.user.id).then((nextRole) => {
        setRole(nextRole);
        setStatus("ready");
      });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      role,
      isAdmin: role === "admin",
      isConfigured: isSupabaseConfigured,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      async registerCustomer(email, password) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "customer",
            },
          },
        });

        if (error) {
          throw error;
        }
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [role, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
