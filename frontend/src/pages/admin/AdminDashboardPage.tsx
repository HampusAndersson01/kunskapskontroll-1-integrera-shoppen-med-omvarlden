import { useEffect, useMemo, useState } from "react";
import { Link } from "../../components/Link";
import { getAdminOrders, getOrderStatusLabel, type AdminOrderListItem } from "../../services/orderService";
import { getAdminProducts, type Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error";

const historyWindowDays = 30;

export function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [productRows, orderRows] = await Promise.all([getAdminProducts(), getAdminOrders()]);

        if (!active) {
          return;
        }

        setProducts(productRows);
        setOrders(orderRows);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const activeProductCount = useMemo(() => products.filter((product) => product.isActive).length, [products]);
  const latestOrder = orders[0] ?? null;
  const orderTotal = useMemo(() => orders.reduce((sum, order) => sum + order.totalPrice, 0), [orders]);
  const recentOrders = useMemo(() => getOrdersWithinDays(orders, historyWindowDays), [orders]);
  const recentOrderTotal = useMemo(
    () => recentOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    [recentOrders],
  );
  const recentAverageOrder = recentOrders.length > 0 ? recentOrderTotal / recentOrders.length : 0;
  const refundedRecentTotal = useMemo(
    () =>
      recentOrders
        .filter((order) => order.status === "refunded")
        .reduce((sum, order) => sum + order.totalPrice, 0),
    [recentOrders],
  );

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Admin</h1>
        <p>Laddar översikt.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Admin</h1>
        <p>Översikten kunde inte hämtas från Supabase.</p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="page-heading">
        <div>
          <h1>Adminöversikt</h1>
          <p>Översikt över produkter, lager och ordrar.</p>
        </div>
      </div>

      <dl className="admin-summary">
        <div>
          <dt>Produkter</dt>
          <dd>{products.length}</dd>
        </div>
        <div>
          <dt>Aktiva produkter</dt>
          <dd>{activeProductCount}</dd>
        </div>
        <div>
          <dt>Ordrar</dt>
          <dd>{orders.length}</dd>
        </div>
        <div>
          <dt>Ordervärde</dt>
          <dd>{formatPrice(orderTotal)}</dd>
        </div>
      </dl>

      <div className="admin-detail-grid">
        <section className="admin-card">
          <h2>Senaste 30 dagar</h2>
          <p>Orderhistorik baserat på skapade ordrar.</p>

          <dl className="admin-report-list">
            <div>
              <dt>Ordrar</dt>
              <dd>{recentOrders.length}</dd>
            </div>
            <div>
              <dt>Försäljning</dt>
              <dd>{formatPrice(recentOrderTotal)}</dd>
            </div>
            <div>
              <dt>Snittorder</dt>
              <dd>{formatPrice(recentAverageOrder)}</dd>
            </div>
            <div>
              <dt>Återbetalat</dt>
              <dd>{formatPrice(refundedRecentTotal)}</dd>
            </div>
          </dl>

          {recentOrders.length > 0 ? (
            <div className="recent-order-list" aria-label="Senaste ordrar i perioden">
              {recentOrders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <span>
                    {formatDate(order.createdAt)} - {getOrderStatusLabel(order.status)}
                  </span>
                  <strong>{formatPrice(order.totalPrice)}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <p>Det finns inga ordrar från de senaste 30 dagarna.</p>
          )}
        </section>

        <section className="admin-card">
          <h2>Senaste order</h2>
          {latestOrder ? (
            <>
              <dl className="admin-facts">
                <div>
                  <dt>Datum</dt>
                  <dd>{formatDate(latestOrder.createdAt)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{getOrderStatusLabel(latestOrder.status)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatPrice(latestOrder.totalPrice)}</dd>
                </div>
              </dl>
              <Link href={`/admin/orders/${latestOrder.id}`}>Visa order</Link>
            </>
          ) : (
            <p>Det finns inga ordrar ännu.</p>
          )}
        </section>
      </div>
    </section>
  );
}

function getOrdersWithinDays(orders: AdminOrderListItem[], days: number) {
  const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return orders.filter((order) => new Date(order.createdAt).getTime() >= startTime);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
