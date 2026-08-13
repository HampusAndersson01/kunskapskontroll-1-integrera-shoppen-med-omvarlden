import { useEffect, useState } from "react";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { isSupabaseConfigured } from "../../lib/supabase";
import type { PageProps } from "../../routes/routes";
import { getActiveProductById, type Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";

type LoadState = "loading" | "ready" | "error" | "not-found";

export function ProductDetailsPage({ path }: PageProps) {
  const productId = path.split("/").at(-1) ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const { addProduct } = useCart();

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (!isSupabaseConfigured) {
        setLoadState("error");
        return;
      }

      try {
        const productRow = await getActiveProductById(productId);

        if (!active) {
          return;
        }

        if (!productRow) {
          setLoadState("not-found");
          return;
        }

        setProduct(productRow);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Produkt</h1>
        <p>Laddar produkt.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Produkt</h1>
        <p>Produkten kunde inte hämtas från Supabase.</p>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  if (loadState === "not-found" || !product) {
    return (
      <section className="placeholder">
        <h1>Produkten finns inte</h1>
        <p>
          <Link href="/">Till produkterna</Link>
        </p>
      </section>
    );
  }

  const stockLabel = product.stock > 0 ? `I lager - ${product.stock} st` : "Slut i lager";

  return (
    <section className="product-details">
      <p className="product-detail-back">
        <Link href="/">Tillbaka till produkter</Link>
      </p>

      <div className="product-media-panel">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>Ingen produktbild</span>}
      </div>

      <aside className="product-info-panel">
        <span className="eyebrow">{product.brand ?? product.categoryName ?? "Everyday Market"}</span>
        <h1>{product.name}</h1>
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          {product.discountPercentage > 0 && <span className="badge">Rabatt {product.discountPercentage}%</span>}
        </div>
        <p className={product.stock > 0 ? "stock-label" : "stock-label out"}>{stockLabel}</p>
        {product.description && <p className="product-description">{product.description}</p>}

        <dl className="product-facts">
          {product.categoryName && (
            <div>
              <dt>Kategori</dt>
              <dd>{product.categoryName}</dd>
            </div>
          )}
          {product.brand && (
            <div>
              <dt>Varumärke</dt>
              <dd>{product.brand}</dd>
            </div>
          )}
          <div>
            <dt>SKU</dt>
            <dd>{product.sku}</dd>
          </div>
          {product.rating !== null && (
            <div>
              <dt>Betyg</dt>
              <dd>{product.rating}</dd>
            </div>
          )}
        </dl>

        <button
          type="button"
          disabled={product.stock <= 0}
          onClick={() => {
            addProduct(product);
            setMessage("Produkten lades i varukorgen.");
          }}
        >
          Lägg i varukorg
        </button>
        {message && <p className="form-message">{message}</p>}
      </aside>
    </section>
  );
}
