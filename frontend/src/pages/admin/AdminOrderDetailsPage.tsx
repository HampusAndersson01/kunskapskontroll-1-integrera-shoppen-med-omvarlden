import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "../../components/Link";
import type { PageProps } from "../../routes/routes";
import {
  getAdminOrderById,
  getOrderStatusLabel,
  orderStatusOptions,
  updateAdminOrderStatus,
  type AdminOrderDetails,
  type OrderStatus,
} from "../../services/orderService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error" | "not-found";

export function AdminOrderDetailsPage({ path }: PageProps) {
  const orderId = path.split("/").at(-1) ?? "";
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const orderRow = await getAdminOrderById(orderId);

        if (!active) {
          return;
        }

        if (!orderRow) {
          setLoadState("not-found");
          return;
        }

        setOrder(orderRow);
        setSelectedStatus(orderRow.status);
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

  const itemTotal = useMemo(() => {
    return order?.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0) ?? 0;
  }, [order]);

  async function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!order) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await updateAdminOrderStatus(order.id, selectedStatus);
      setOrder({ ...order, status: selectedStatus, updatedAt: new Date().toISOString() });
      setMessage("Status uppdaterad.");
    } catch {
      setMessage("Status kunde inte uppdateras.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Orderdetaljer</h1>
        <p>Laddar order.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Orderdetaljer</h1>
        <p>Ordern kunde inte hämtas. Kontrollera att du är inloggad som administratör.</p>
        <p>
          <Link href="/admin/orders">Till orderlistan</Link>
        </p>
      </section>
    );
  }

  if (loadState === "not-found" || !order) {
    return (
      <section className="placeholder">
        <h1>Ordern finns inte</h1>
        <p>
          <Link href="/admin/orders">Till orderlistan</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <p>
        <Link href="/admin/orders">Till orderlistan</Link>
      </p>

      <div className="page-heading">
        <div>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <p>
            {formatDate(order.createdAt)} - {getOrderStatusLabel(order.status)} - {formatPrice(order.totalPrice)}
          </p>
        </div>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2>Kund</h2>
          <dl className="admin-facts">
            <div>
              <dt>Namn</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>E-post</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{order.customerPhone || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="admin-card">
          <h2>Leverans</h2>
          <dl className="admin-facts">
            <div>
              <dt>Adress</dt>
              <dd>{order.shippingAddress || "-"}</dd>
            </div>
            <div>
              <dt>Postort</dt>
              <dd>{[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ") || "-"}</dd>
            </div>
            <div>
              <dt>Land</dt>
              <dd>{order.shippingCountry || "-"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="admin-card">
        <h2>Produkter</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Antal</th>
                <th>Pris vid köp</th>
                <th>Radtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.priceAtPurchase)}</td>
                  <td>{formatPrice(item.priceAtPurchase * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={3}>Total</th>
                <td>{formatPrice(itemTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <form className="status-form" onSubmit={handleStatusSubmit}>
        <label>
          Orderstatus
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}>
            {orderStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={isSaving || selectedStatus === order.status}>
          Spara status
        </button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
