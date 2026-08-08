import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";

function readProductSearch() {
  return new URLSearchParams(window.location.search).get("search") ?? "";
}

export function CustomerHeader() {
  const { itemCount } = useCart();
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
          Min egna e-handel
        </Link>

        <form className="header-search" role="search" onSubmit={handleSearchSubmit}>
          <label htmlFor="product-search">Sök produkter</label>
          <div>
            <input
              id="product-search"
              name="search"
              type="search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <button type="submit">Sök</button>
          </div>
        </form>
      </div>

      <nav className="main-nav" aria-label="Huvudmeny">
        <Link href="/">Produkter</Link>
        <Link href="/cart">Varukorg ({itemCount})</Link>
        <Link href="/checkout">Checkout</Link>
        <Link href="/login">Login</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}
