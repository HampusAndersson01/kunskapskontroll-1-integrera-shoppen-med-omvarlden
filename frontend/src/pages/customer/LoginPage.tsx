import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "../../components/Link";

export function LoginPage() {
  const { isConfigured, signIn, signOut, user, role } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      setMessage("Du ar inloggad.");
    } catch {
      setMessage("Inloggningen misslyckades. Kontrollera e-post och losenord.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="placeholder auth-panel">
      <span className="eyebrow">Everyday Market Admin</span>
      <h1>Logga in</h1>
      <p>Logga in med e-post och losenord.</p>

      {!isConfigured && <p className="form-message">Supabase saknar installningar i frontend/.env.local.</p>}

      {user ? (
        <div className="form-block">
          <p>Inloggad som {user.email}. Roll: {role ?? "saknas"}.</p>
          <button type="button" onClick={() => void signOut()}>
            Logga ut
          </button>
          {role === "admin" && (
            <p>
              <Link href="/admin">Ga till admin</Link>
            </p>
          )}
        </div>
      ) : (
        <form className="form-block" onSubmit={handleSubmit}>
          <label>
            E-post
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Losenord
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" disabled={isSubmitting || !isConfigured}>
            {isSubmitting ? "Loggar in..." : "Logga in"}
          </button>
        </form>
      )}

      {message && <p className="form-message">{message}</p>}

      <p>
        <Link href="/register">Registrera kundkonto</Link>
      </p>
    </section>
  );
}
