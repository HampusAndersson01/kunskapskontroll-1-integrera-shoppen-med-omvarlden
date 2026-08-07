import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import { getOrderSummary, type CreatedOrder } from "../../services/orderService";
import { formatPrice } from "../../utils/format";
import type { PageProps } from "../../routes/routes";

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
      <section className="placeholder">
        <h1>Orderbekräftelse</h1>
        <p>Laddar order.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Orderbekräftelse</h1>
        <p>Ordern skapades, men bekräftelsen kunde inte hämtas.</p>
        <p>Ordernummer: {orderId}</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  if (loadState === "not-found" || !order) {
    return (
      <section className="placeholder">
        <h1>Ordern hittades inte</h1>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="placeholder">
      <h1>Orderbekräftelse</h1>
      <p>Ordern är mottagen.</p>
      <p>Ordernummer: {order.id}</p>
      <p>Totalpris: {formatPrice(order.totalPrice)}</p>
      <p>
        <Link href="/">Till produkterna</Link>
      </p>
    </section>
  );
}
