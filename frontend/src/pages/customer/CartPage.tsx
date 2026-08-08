import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { formatPrice } from "../../utils/format";

export function CartPage() {
  const { items, totalPrice, isSyncing, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="placeholder">
        <h1>Din varukorg</h1>
        <p>Varukorgen är tom.</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="page-heading">
        <div>
          <h1>Din varukorg</h1>
          <p>Se över dina produkter innan du går vidare till kassan.</p>
          {isSyncing && <p>Sparar varukorg.</p>}
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.productId}>
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span />}

              <div>
                <h2>{item.name}</h2>
                <p>{formatPrice(item.price)} styck</p>
                <button className="remove-button" type="button" onClick={() => removeItem(item.productId)}>
                  Ta bort
                </button>
              </div>

              <div className="quantity-stack">
                <div className="quantity-controls" aria-label={`Antal for ${item.name}`}>
                  <button type="button" onClick={() => decreaseQuantity(item.productId)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.productId)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Ordersammanfattning</h2>
          <div className="summary-row">
            <span>Delsumma</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Frakt</span>
            <strong>Gratis</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link href="/checkout" className="primary-action">
            Gå till kassan
          </Link>
          <Link href="/" className="secondary-action">
            Fortsätt handla
          </Link>
          <button type="button" className="secondary-action" onClick={clearCart}>
            Töm varukorg
          </button>
        </aside>
      </div>
    </section>
  );
}
