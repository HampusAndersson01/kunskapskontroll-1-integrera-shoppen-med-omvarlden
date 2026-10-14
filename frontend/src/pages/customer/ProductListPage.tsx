import { useEffect, useMemo, useState } from "react";
import { CategoryFilter } from "../../components/CategoryFilter";
import { ProductCard } from "../../components/ProductCard";
import { getActiveProducts, getCategories, type Category, type Product } from "../../services/productService";

type LoadState = "loading" | "ready" | "error";

const PRODUCTS_PER_PAGE = 12;

function readProductSearch() {
  return new URLSearchParams(window.location.search).get("search")?.trim() ?? "";
}

function normalizeSearchText(value: string | null) {
  return (value ?? "").toLocaleLowerCase("sv-SE");
}

export function ProductListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState(readProductSearch);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
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

  useEffect(() => {
    function handleNavigation() {
      setSearchQuery(readProductSearch());
    }

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [product.name, product.brand, product.categoryName].map(normalizeSearchText).join(" ");

      return searchableText.includes(normalizedQuery);
    });
  }, [products, searchQuery, selectedCategory]);

  const heading = selectedCategory
    ? categories.find((category) => category.slug === selectedCategory)?.name ?? "Produkter"
    : "Alla produkter";
  const shownProducts = visibleProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < visibleProducts.length;
  const emptyMessage = searchQuery ? `Inga produkter matchar "${searchQuery}".` : "Inga produkter hittades.";

  function clearSearch() {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

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
        <p>Produkterna kunde inte hämtas. Försök igen senare.</p>
      </section>
    );
  }

  return (
    <section className="storefront-layout">
      <CategoryFilter categories={categories} selectedSlug={selectedCategory} onChange={setSelectedCategory} />

      <div className="product-list-content">
        <div className="page-heading">
          <div>
            <h1>{heading}</h1>
            <p>
              Visar {shownProducts.length} av {visibleProducts.length} produkter
            </p>
            {searchQuery ? (
              <p className="search-summary">
                <span>Resultat för "{searchQuery}".</span>
                <button type="button" onClick={clearSearch}>
                  Rensa sökning
                </button>
              </p>
            ) : null}
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <>
            <div className="product-grid">
              {shownProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="load-more-row">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setVisibleCount((currentCount) => currentCount + PRODUCTS_PER_PAGE)}
                >
                  Visa fler produkter
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
