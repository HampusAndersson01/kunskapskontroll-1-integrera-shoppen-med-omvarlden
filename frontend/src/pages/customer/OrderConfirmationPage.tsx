import { PagePlaceholder } from "../PagePlaceholder";

export function OrderConfirmationPage() {
  return (
    <PagePlaceholder
      title="Orderbekräftelse"
      description="Här ska kunden se ordernummer, totalpris och bekräftelse på att ordern är mottagen."
      links={[{ href: "/", label: "Tillbaka till produkterna" }]}
    />
  );
}
