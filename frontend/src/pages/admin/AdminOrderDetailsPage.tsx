import { PagePlaceholder } from "../PagePlaceholder";

export function AdminOrderDetailsPage() {
  return (
    <PagePlaceholder
      title="Orderdetaljer"
      description="Här ska administratören se kunduppgifter, orderrader och kunna ändra status."
      links={[{ href: "/admin/orders", label: "Till orderlistan" }]}
    />
  );
}
