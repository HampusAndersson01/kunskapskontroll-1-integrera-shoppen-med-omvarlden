import type { ReactNode } from "react";
import { Link } from "../components/Link";
import { useAuth } from "./AuthContext";

function getLoginPath() {
  return `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user, isAdmin, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <section className="placeholder">
        <h1>Admin kräver Supabase</h1>
        <p>Lägg till Supabase-inställningar i frontend/.env.local för att logga in som admin.</p>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="placeholder">
        <h1>Laddar</h1>
        <p>Kontrollerar inloggning.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="placeholder">
        <h1>Login krävs</h1>
        <p>Du behöver logga in som administratör för att se adminområdet.</p>
        <p>
          <Link href={getLoginPath()}>Gå till login</Link>
        </p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="placeholder">
        <h1>Ingen behörighet</h1>
        <p>Det inloggade kontot saknar rollen admin.</p>
      </section>
    );
  }

  return <>{children}</>;
}
