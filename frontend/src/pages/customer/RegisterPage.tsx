import { FormEvent, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Link } from "../../components/Link";

export function RegisterPage() {
  const { registerCustomer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await registerCustomer(email, password);
      setMessage("Kontot är skapat.");
    } catch {
      setMessage("Registreringen misslyckades.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="placeholder">
      <h1>Registrera</h1>
      <p>Skapa ett kundkonto. Rollen sätts till customer.</p>

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
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Skapar konto..." : "Skapa konto"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      <p>
        <Link href="/login">Till login</Link>
      </p>
    </section>
  );
}
