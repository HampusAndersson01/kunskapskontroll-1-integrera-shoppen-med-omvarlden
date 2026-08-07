import { FormEvent, useState } from "react";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { isSupabaseConfigured } from "../../lib/supabase";
import { createOrder } from "../../services/orderService";
import { formatPrice } from "../../utils/format";

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Sverige");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured) {
      setMessage("Supabase saknar inställningar.");
      return;
    }

    if (items.length === 0) {
      setMessage("Varukorgen är tom.");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingPostalCode,
        shippingCity,
        shippingCountry,
        items,
      });

      clearCart();
      window.history.pushState({}, "", `/order-confirmation/${order.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      setMessage("Ordern kunde inte skapas. Kontrollera Supabase-regler och försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="placeholder">
        <h1>Checkout</h1>
        <p>Varukorgen är tom.</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="form-block checkout-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Kontaktuppgifter</legend>
            <label>
              Namn
              <input
                type="text"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label>
              E-post
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              Telefon
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                required
                autoComplete="tel"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Leveransadress</legend>
            <label>
              Adress
              <input
                type="text"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                required
                autoComplete="street-address"
              />
            </label>

            <label>
              Postnummer
              <input
                type="text"
                value={shippingPostalCode}
                onChange={(event) => setShippingPostalCode(event.target.value)}
                required
                autoComplete="postal-code"
              />
            </label>

            <label>
              Ort
              <input
                type="text"
                value={shippingCity}
                onChange={(event) => setShippingCity(event.target.value)}
                required
                autoComplete="address-level2"
              />
            </label>

            <label>
              Land
              <input
                type="text"
                value={shippingCountry}
                onChange={(event) => setShippingCountry(event.target.value)}
                required
                autoComplete="country-name"
              />
            </label>
          </fieldset>

          <button type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
            {isSubmitting ? "Skapar order..." : "Slutför köp"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>

        <aside className="order-summary">
          <h2>Ordersammanfattning</h2>
          <ul>
            {items.map((item) => (
              <li key={item.productId}>
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p>Totalt: {formatPrice(totalPrice)}</p>
        </aside>
      </div>
    </section>
  );
}
