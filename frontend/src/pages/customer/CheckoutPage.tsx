import { FormEvent, useState } from "react";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { createOrder, rememberOrderSummary } from "../../services/orderService";
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

      rememberOrderSummary(order);
      clearCart();
      window.history.pushState({}, "", `/order-confirmation/${order.id}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      setMessage("Ordern kunde inte skapas. Kontrollera uppgifterna, lagersaldot och anslutningen och försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="placeholder">
        <h1>Kassa</h1>
        <p>Varukorgen är tom.</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="page-heading">
        <div>
          <h1>Kassa</h1>
          <p>Betalningen är simulerad i detta studentprojekt.</p>
        </div>
        <Link href="/cart">Tillbaka till varukorgen</Link>
      </div>

      <div className="checkout-layout">
        <form className="form-block checkout-form checkout-panel" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Kundinformation</legend>
            <div className="form-row">
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
                Telefon
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  required
                  autoComplete="tel"
                />
              </label>
            </div>

            <label>
              E-postadress
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                required
                autoComplete="email"
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

            <div className="form-row">
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
            </div>
          </fieldset>

          <p className="notice">Observera: inga riktiga transaktioner genomförs.</p>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Skapar order..." : "Slutför köp"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>

        <aside className="order-summary">
          <h2>Din beställning</h2>
          <ul className="summary-list">
            {items.map((item) => (
              <li className="summary-item" key={item.productId}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span />}
                <span>
                  <strong>{item.name}</strong>
                  <span>Antal: {item.quantity}</span>
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Delsumma</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Frakt</span>
            <strong>Gratis</strong>
          </div>
          <div className="summary-row total">
            <span>Totalt</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
