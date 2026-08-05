import { PagePlaceholder } from "../PagePlaceholder";

export function AdminProductsPage() {
  return (
    <PagePlaceholder
      title="Admin produkter"
      description="Här ska administratören se produkter och kunna välja att lägga till eller redigera."
      links={[
        { href: "/admin/products/new", label: "Lägg till produkt" },
        { href: "/admin/products/demo-product/edit", label: "Exempel på redigera produkt" },
      ]}
    />
  );
}
