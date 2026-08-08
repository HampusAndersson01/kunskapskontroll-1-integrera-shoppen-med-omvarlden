import { CustomerLayout } from "./pages/customer/CustomerLayout";
import { renderRoute, routes } from "./routes/routes";
import { useCurrentPath } from "./routes/useCurrentPath";

export function App() {
  const currentPath = useCurrentPath();
  const activeRoute = routes.find((route) => route.match(currentPath)) ?? routes[routes.length - 1];

  return <CustomerLayout>{renderRoute(activeRoute, currentPath)}</CustomerLayout>;
}
