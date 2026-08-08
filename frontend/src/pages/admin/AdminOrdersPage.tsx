import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import {
  getAdminOrders,
  getOrderStatusLabel,
  type AdminOrderListItem,
} from "../../services/orderService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const orderRows = await getAdminOrders();

        if (!active) {
          return;
        }

        setOrders(orderRows);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Hantera ordrar</h1>
        <p>Laddar ordrar.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Hantera ordrar</h1>
        <p>Ordrarna kunde inte hämtas från Supabase.</p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="page-heading">
        <div>
          <h1>Hantera ordrar</h1>
          <p>Se kund, datum, status och totalpris för varje order.</p>
        </div>
      </div>

      <dl className="admin-summary">
        <div>
          <dt>Totalt</dt>
          <dd>{orders.length}</dd>
        </div>
        <div>
          <dt>Väntande</dt>
          <dd>{orders.filter((order) => order.status === "pending").length}</dd>
        </div>
        <div>
          <dt>Levererade</dt>
          <dd>{orders.filter((order) => order.status === "delivered").length}</dd>
        </div>
        <div>
          <dt>Omsättning</dt>
          <dd>{formatPrice(orders.reduce((sum, order) => sum + order.totalPrice, 0))}</dd>
        </div>
      </dl>

      {orders.length === 0 ? (
        <p>Inga ordrar finns ännu.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Datum</th>
                <th>Kund</th>
                <th>Status</th>
                <th>Total</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{shortOrderId(order.id)}</strong>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <strong>{order.customerName}</strong>
                    <br />
                    {order.customerEmail}
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(order.status)}>{getOrderStatusLabel(order.status)}</span>
                  </td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>Detaljer</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortOrderId(id: string) {
  return id.slice(0, 8);
}

function getStatusBadgeClass(status: string) {
  if (status === "refunded") {
    return "badge danger";
  }

  if (status === "delivered") {
    return "badge neutral";
  }

  return status === "processing" ? "badge muted" : "badge";
}
