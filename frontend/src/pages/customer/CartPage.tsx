import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { formatPrice } from "../../utils/format";

export function CartPage() {
  const { items, totalPrice, isSyncing, increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="placeholder">
        <h1>Varukorg</h1>
        <p>Varukorgen är tom.</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>Varukorg</h1>
      {isSyncing && <p>Sparar varukorg.</p>}

      <div className="cart-items">
        {items.map((item) => (
          <article className="cart-item" key={item.productId}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}

            <div>
              <h2>{item.name}</h2>
              <p>{formatPrice(item.price)} styck</p>
              <p>{formatPrice(item.price * item.quantity)} totalt</p>
            </div>

            <div className="quantity-controls" aria-label={`Antal för ${item.name}`}>
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

            <button type="button" onClick={() => removeItem(item.productId)}>
              Ta bort
            </button>
          </article>
        ))}
      </div>

      <div className="cart-summary">
        <p>Totalt: {formatPrice(totalPrice)}</p>
        <p>
          <Link href="/checkout">Gå till checkout</Link>
        </p>
        <button type="button" onClick={clearCart}>
          Töm varukorg
        </button>
      </div>
    </section>
  );
}
