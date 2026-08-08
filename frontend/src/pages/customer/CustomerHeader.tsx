import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { useCurrentPath } from "../../routes/useCurrentPath";

function readProductSearch() {
  return new URLSearchParams(window.location.search).get("search") ?? "";
}

export function CustomerHeader() {
  const { itemCount } = useCart();
  const currentPath = useCurrentPath();
  const [productSearch, setProductSearch] = useState(readProductSearch);

  useEffect(() => {
    function handleNavigation() {
      setProductSearch(readProductSearch());
    }

    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const search = productSearch.trim();
    const nextPath = search ? `/?search=${encodeURIComponent(search)}` : "/";

    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <header className="site-header">
      <div className="site-header-main">
        <Link href="/" className="site-title">
          Everyday Market
        </Link>

        <nav className="main-nav" aria-label="Huvudmeny">
          <Link href="/" className={currentPath === "/" ? "active" : undefined}>
            Produkter
          </Link>
          <Link href="/cart" className={currentPath === "/cart" ? "active cart-link" : "cart-link"}>
            Varukorg <span className="cart-count">{itemCount}</span>
          </Link>
          <Link href="/login" className={currentPath === "/login" ? "active" : undefined}>
            Logga in
          </Link>
          <Link href="/admin" className={currentPath.startsWith("/admin") ? "active" : undefined}>
            Admin
          </Link>
        </nav>

        <form className="header-search" role="search" onSubmit={handleSearchSubmit}>
          <label htmlFor="product-search">Sok produkter</label>
          <div>
            <input
              id="product-search"
              name="search"
              type="search"
              placeholder="Sok produkter..."
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <button type="submit" aria-label="Sok produkter">
              Sok
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
