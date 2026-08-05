import { PagePlaceholder } from "../PagePlaceholder";

export function CheckoutPage() {
  return (
    <PagePlaceholder
      title="Checkout"
      description="Här ska kunden fylla i uppgifter och genomföra en simulerad betalning."
      links={[{ href: "/order-confirmation/demo-order", label: "Exempel på orderbekräftelse" }]}
    />
  );
}
