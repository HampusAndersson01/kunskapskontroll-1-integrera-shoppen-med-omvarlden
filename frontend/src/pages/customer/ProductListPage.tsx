import { useEffect, useMemo, useState } from "react";
import { CategoryFilter } from "../../components/CategoryFilter";
import { ProductCard } from "../../components/ProductCard";
import { isSupabaseConfigured } from "../../lib/supabase";
import { getActiveProducts, getCategories, type Category, type Product } from "../../services/productService";

type LoadState = "loading" | "ready" | "error";

export function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      if (!isSupabaseConfigured) {
        setLoadState("error");
        return;
      }

      try {
        const [categoryRows, productRows] = await Promise.all([getCategories(), getActiveProducts()]);

        if (!active) {
          return;
        }

        setCategories(categoryRows);
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

  const visibleProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }

    return products.filter((product) => product.categorySlug === selectedCategory);
  }, [products, selectedCategory]);

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Produkter</h1>
        <p>Laddar produkter.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Produkter</h1>
        <p>Produkterna kunde inte hämtas från Supabase.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <h1>Produkter</h1>
        <CategoryFilter categories={categories} selectedSlug={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {visibleProducts.length === 0 ? (
        <p>Inga produkter hittades.</p>
      ) : (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
