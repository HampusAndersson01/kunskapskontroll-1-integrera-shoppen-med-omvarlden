import { PagePlaceholder } from "../PagePlaceholder";

export function AdminProductEditPage() {
  return (
    <PagePlaceholder
      title="Redigera produkt"
      description="Här ska administratören kunna uppdatera produktens uppgifter."
      links={[{ href: "/admin/products", label: "Till produktlistan" }]}
    />
  );
}
