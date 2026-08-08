import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import { getAdminProducts, type Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error";

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const productRows = await getAdminProducts();

        if (!active) {
          return;
        }

        setProducts(productRows);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Admin produkter</h1>
        <p>Laddar produkter.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Admin produkter</h1>
        <p>Produkterna kunde inte hämtas från Supabase.</p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="page-heading">
        <div>
          <h1>Admin produkter</h1>
          <p>Hantera produkter som visas i butiken.</p>
        </div>
        <Link href="/admin/products/new">Lägg till produkt</Link>
      </div>

      {products.length === 0 ? (
        <p>Inga produkter finns ännu.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategori</th>
                <th>Pris</th>
                <th>Lager</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <br />
                    SKU: {product.sku}
                  </td>
                  <td>{product.categoryName ?? "-"}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{product.isActive ? "Aktiv" : "Inaktiv"}</td>
                  <td>
                    <Link href={`/admin/products/${product.id}/edit`}>Redigera</Link>
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
