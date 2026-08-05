import { PagePlaceholder } from "../PagePlaceholder";

export function AdminDashboardPage() {
  return (
    <PagePlaceholder
      title="Admin"
      description="Här ska administratören få en enkel översikt."
      links={[
        { href: "/admin/products", label: "Hantera produkter" },
        { href: "/admin/orders", label: "Hantera ordrar" },
      ]}
    />
  );
}
