import { PagePlaceholder } from "../PagePlaceholder";

export function CartPage() {
  return (
    <PagePlaceholder
      title="Varukorg"
      description="Här ska kunden kunna ändra antal, ta bort produkter och gå vidare till checkout."
      links={[{ href: "/checkout", label: "Gå till checkout" }]}
    />
  );
}
