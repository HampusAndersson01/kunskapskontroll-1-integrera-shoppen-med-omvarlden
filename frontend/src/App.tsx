import { Link } from "./components/Link";
import { renderRoute, routes } from "./routes/routes";
import { useCurrentPath } from "./routes/useCurrentPath";
import { useCart } from "./cart/CartContext";

export function App() {
  const currentPath = useCurrentPath();
  const activeRoute = routes.find((route) => route.match(currentPath)) ?? routes[routes.length - 1];
  const { itemCount } = useCart();

  return (
    <>
      <header className="site-header">
        <Link href="/" className="site-title">
          Min egna e-handel
        </Link>

        <nav className="main-nav" aria-label="Huvudmeny">
          <Link href="/">Produkter</Link>
          <Link href="/cart">Varukorg ({itemCount})</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/login">Login</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <main className="page">
        {renderRoute(activeRoute, currentPath)}
      </main>
    </>
  );
}
