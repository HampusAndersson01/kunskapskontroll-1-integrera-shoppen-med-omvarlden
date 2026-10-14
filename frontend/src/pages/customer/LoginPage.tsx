import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "../../components/Link";

function getRedirectPath() {
  const nextPath = new URLSearchParams(window.location.search).get("next");

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//") || nextPath.startsWith("/login")) {
    return "/";
  }

  return nextPath;
}

function navigateTo(path: string) {
  window.history.replaceState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function LoginPage() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigateTo(getRedirectPath());
    }
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigateTo(getRedirectPath());
    } catch {
      setMessage("Inloggningen misslyckades. Kontrollera e-post och lösenord.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user) {
    return <></>;
  }

  return (
    <section className="placeholder auth-panel">
      <span className="eyebrow">Everyday Market Admin</span>
      <h1>Logga in</h1>
      <p>Logga in med e-post och lösenord.</p>

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
          Lösenord
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Loggar in..." : "Logga in"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      <p>
        <Link href="/register">Registrera kundkonto</Link>
      </p>
    </section>
  );
}
