import { PagePlaceholder } from "../PagePlaceholder";

export function AdminProductNewPage() {
  return (
    <PagePlaceholder
      title="Lägg till produkt"
      description="Här ska administratören kunna skapa en ny produkt."
      links={[{ href: "/admin/products", label: "Till produktlistan" }]}
    />
  );
}
