import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminLayout } from "../pages/admin/AdminLayout";
import { AdminOrderDetailsPage } from "../pages/admin/AdminOrderDetailsPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminProductEditPage } from "../pages/admin/AdminProductEditPage";
import { AdminProductNewPage } from "../pages/admin/AdminProductNewPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { CartPage } from "../pages/customer/CartPage";
import { CheckoutPage } from "../pages/customer/CheckoutPage";
import { LoginPage } from "../pages/customer/LoginPage";
import { OrderConfirmationPage } from "../pages/customer/OrderConfirmationPage";
import { ProductDetailsPage } from "../pages/customer/ProductDetailsPage";
import { ProductListPage } from "../pages/customer/ProductListPage";
import { RegisterPage } from "../pages/customer/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import type { ReactElement } from "react";
import { RequireAdmin } from "../auth/RequireAdmin";

export type PageProps = {
  path: string;
};

export type RouteDefinition = {
  path: string;
  label: string;
  match: (path: string) => boolean;
  component: (props: PageProps) => ReactElement;
  requiresAdmin?: boolean;
};

const exact = (expectedPath: string) => (path: string) => path === expectedPath;
const pattern = (expression: RegExp) => (path: string) => expression.test(path);

export const routes: RouteDefinition[] = [
  {
    path: "/",
    label: "Produktlista",
    match: exact("/"),
    component: ProductListPage,
  },
  {
    path: "/products/:id",
    label: "Produktdetalj",
    match: pattern(/^\/products\/[^/]+$/),
    component: ProductDetailsPage,
  },
  {
    path: "/cart",
    label: "Varukorg",
    match: exact("/cart"),
    component: CartPage,
  },
  {
    path: "/checkout",
    label: "Checkout",
    match: exact("/checkout"),
    component: CheckoutPage,
  },
  {
    path: "/order-confirmation/:orderId",
    label: "Orderbekräftelse",
    match: pattern(/^\/order-confirmation\/[^/]+$/),
    component: OrderConfirmationPage,
  },
  {
    path: "/login",
    label: "Login",
    match: exact("/login"),
    component: LoginPage,
  },
  {
    path: "/register",
    label: "Registrera",
    match: exact("/register"),
    component: RegisterPage,
  },
  {
    path: "/admin",
    label: "Admin",
    match: exact("/admin"),
    component: AdminDashboardPage,
    requiresAdmin: true,
  },
  {
    path: "/admin/products",
    label: "Admin produkter",
    match: exact("/admin/products"),
    component: AdminProductsPage,
    requiresAdmin: true,
  },
  {
    path: "/admin/products/new",
    label: "Ny produkt",
    match: exact("/admin/products/new"),
    component: AdminProductNewPage,
    requiresAdmin: true,
  },
  {
    path: "/admin/products/:id/edit",
    label: "Redigera produkt",
    match: pattern(/^\/admin\/products\/[^/]+\/edit$/),
    component: AdminProductEditPage,
    requiresAdmin: true,
  },
  {
    path: "/admin/orders",
    label: "Admin ordrar",
    match: exact("/admin/orders"),
    component: AdminOrdersPage,
    requiresAdmin: true,
  },
  {
    path: "/admin/orders/:id",
    label: "Orderdetaljer",
    match: pattern(/^\/admin\/orders\/[^/]+$/),
    component: AdminOrderDetailsPage,
    requiresAdmin: true,
  },
  {
    path: "*",
    label: "Sidan finns inte",
    match: () => true,
    component: NotFoundPage,
  },
];

export function renderRoute(route: RouteDefinition, path: string) {
  const Page = route.component;
  const page = <Page path={path} />;

  return route.requiresAdmin ? (
    <RequireAdmin>
      <AdminLayout currentPath={path}>{page}</AdminLayout>
    </RequireAdmin>
  ) : (
    page
  );
}
