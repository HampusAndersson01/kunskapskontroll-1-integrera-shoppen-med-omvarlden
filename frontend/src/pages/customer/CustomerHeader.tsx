import { useEffect, useState, type FormEvent } from "react";
import { LogIn, LogOut, ShieldCheck, Search, ShoppingCart } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../cart/CartContext";
import { Link } from "../../components/Link";
import { useCurrentPath } from "../../routes/useCurrentPath";

function readProductSearch() {
  return new URLSearchParams(window.location.search).get("search") ?? "";
}

function getInitials(email: string | undefined) {
  if (!email) {
    return "G";
  }

  const [namePart] = email.split("@");
  const parts = namePart.split(/[._-]/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return namePart.slice(0, 2).toUpperCase();
}

function getLoginPath() {
  const currentPath = window.location.pathname + window.location.search;

  if (currentPath === "/login" || currentPath.startsWith("/login?") || currentPath === "/register") {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(currentPath)}`;
}

export function CustomerHeader() {
  const { itemCount } = useCart();
  const { isAdmin, signOut, user } = useAuth();
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
        </nav>

        <form className="header-search" role="search" onSubmit={handleSearchSubmit}>
          <label htmlFor="product-search">Sök produkter</label>
          <div>
            <input
              id="product-search"
              name="search"
              type="search"
              placeholder="Sök produkter..."
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <button type="submit" aria-label="Sök produkter">
              <Search size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </form>

        <div className="header-actions">
          <div className="profile-menu">
            <button type="button" className="profile-avatar" aria-label="Öppna profilmeny">
              {getInitials(user?.email)}
            </button>
            <div className="profile-dropdown">
              <div className="profile-summary">
                <span className="profile-avatar small">{getInitials(user?.email)}</span>
                <span>
                  <strong>{user ? "Inloggad" : "Gäst"}</strong>
                  <span>{user?.email ?? "Logga in för adminåtkomst"}</span>
                </span>
              </div>

              {user ? (
                <button type="button" className="profile-menu-item" onClick={() => void signOut()}>
                  <LogOut size={18} strokeWidth={2.4} aria-hidden="true" />
                  Logga ut
                </button>
              ) : (
                <Link href={getLoginPath()} className="profile-menu-item">
                  <LogIn size={18} strokeWidth={2.4} aria-hidden="true" />
                  Logga in
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin" className="profile-menu-item">
                  <ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <Link
            href="/cart"
            className={currentPath === "/cart" ? "cart-icon-link active" : "cart-icon-link"}
            aria-label={`Varukorg med ${itemCount} produkter`}
          >
            <ShoppingCart size={30} strokeWidth={2.4} aria-hidden="true" />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
