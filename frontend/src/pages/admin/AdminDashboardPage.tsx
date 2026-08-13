import { useEffect, useMemo, useState } from "react";
import { Link } from "../../components/Link";
import { getAdminOrders, type AdminOrderListItem } from "../../services/orderService";
import { getAdminProducts, type Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error";

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
          <h1>Admin Dashboard</h1>
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
          <dt>Ordervarde</dt>
          <dd>{formatPrice(orderTotal)}</dd>
        </div>
      </dl>

      <section className="admin-card">
        <h2>Nasta steg</h2>
        <ul className="admin-actions">
          <li>
            <Link href="/admin/products">Visa och redigera produkter</Link>
          </li>
          <li>
            <Link href="/admin/products/new">Lägg till en ny produkt</Link>
          </li>
          <li>
            <Link href="/admin/orders">Visa ordrar och ändra status</Link>
          </li>
        </ul>
        <p>Senaste order: {latestOrder ? `${formatDate(latestOrder.createdAt)}, ${formatPrice(latestOrder.totalPrice)}` : "-"}</p>
      </section>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
