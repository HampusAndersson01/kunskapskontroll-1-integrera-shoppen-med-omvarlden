import { PagePlaceholder } from "../PagePlaceholder";

export function AdminOrdersPage() {
  return (
    <PagePlaceholder
      title="Admin ordrar"
      description="Här ska administratören se orderdatum, kund, totalpris och status."
      links={[{ href: "/admin/orders/demo-order", label: "Exempel på orderdetalj" }]}
    />
  );
}
