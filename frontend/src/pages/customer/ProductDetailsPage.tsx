import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import { isSupabaseConfigured } from "../../lib/supabase";
import { getActiveProductById, type Product } from "../../services/productService";
import { formatPrice } from "../../utils/format";
import type { PageProps } from "../../routes/routes";

type LoadState = "loading" | "ready" | "error" | "not-found";

export function ProductDetailsPage({ path }: PageProps) {
  const productId = path.split("/").at(-1) ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");

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

  return (
    <section className="product-details">
      <p>
        <Link href="/">Till produkterna</Link>
      </p>

      {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}

      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <dl className="product-facts">
          <div>
            <dt>Pris</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          <div>
            <dt>Lager</dt>
            <dd>{product.stock > 0 ? `${product.stock} i lager` : "Slut i lager"}</dd>
          </div>
          {product.categoryName && (
            <div>
              <dt>Kategori</dt>
              <dd>{product.categoryName}</dd>
            </div>
          )}
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
          onClick={() => setMessage("Varukorgen byggs i nästa steg.")}
        >
          Lägg i varukorg
        </button>
        {message && <p className="form-message">{message}</p>}
      </div>
    </section>
  );
}
