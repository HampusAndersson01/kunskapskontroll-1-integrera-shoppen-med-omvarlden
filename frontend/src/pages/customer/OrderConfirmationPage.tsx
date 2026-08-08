import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import type { PageProps } from "../../routes/routes";
import { getOrderSummary, type CreatedOrder } from "../../services/orderService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error" | "not-found";

export function OrderConfirmationPage({ path }: PageProps) {
  const orderId = path.split("/").at(-1) ?? "";
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const orderSummary = await getOrderSummary(orderId);

        if (!active) {
          return;
        }

        if (!orderSummary) {
          setLoadState("not-found");
          return;
        }

        setOrder(orderSummary);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loadState === "loading") {
    return (
      <section className="placeholder auth-panel">
        <h1>Orderbekraftelse</h1>
        <p>Laddar order.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder auth-panel">
        <h1>Orderbekraftelse</h1>
        <p>Ordern skapades, men bekraftelsen kunde inte hamtas.</p>
        <p>Ordernummer: {orderId}</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  if (loadState === "not-found" || !order) {
    return (
      <section className="placeholder auth-panel">
        <h1>Ordern hittades inte</h1>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="placeholder auth-panel">
      <span className="badge">Order mottagen</span>
      <h1>Tack for din bestallning!</h1>
      <p>Vi har tagit emot din order.</p>
      <dl className="product-facts">
        <div>
          <dt>Ordernummer</dt>
          <dd>{order.id}</dd>
        </div>
        <div>
          <dt>Totalbelopp</dt>
          <dd>{formatPrice(order.totalPrice)}</dd>
        </div>
      </dl>
      <Link href="/" className="primary-action">
        Tillbaka till produkter
      </Link>
    </section>
  );
}
