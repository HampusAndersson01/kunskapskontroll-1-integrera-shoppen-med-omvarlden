import { PagePlaceholder } from "../PagePlaceholder";

export function ProductListPage() {
  return (
    <PagePlaceholder
      title="Produkter"
      description="Här ska kunden se produkter från databasen."
      links={[
        { href: "/products/demo-product", label: "Exempel på produktsida" },
        { href: "/cart", label: "Gå till varukorgen" },
      ]}
    />
  );
}
