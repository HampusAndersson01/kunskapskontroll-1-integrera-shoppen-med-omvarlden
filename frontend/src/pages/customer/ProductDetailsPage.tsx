import { PagePlaceholder } from "../PagePlaceholder";

export function ProductDetailsPage() {
  return (
    <PagePlaceholder
      title="Produktdetalj"
      description="Här ska kunden se produktbild, beskrivning, pris, kategori och lagerstatus."
      links={[{ href: "/cart", label: "Gå till varukorgen" }]}
    />
  );
}
