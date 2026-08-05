import { PagePlaceholder } from "./PagePlaceholder";

export function NotFoundPage() {
  return (
    <PagePlaceholder
      title="Sidan finns inte"
      description="Kontrollera adressen eller gå tillbaka till produktlistan."
      links={[{ href: "/", label: "Till produkterna" }]}
    />
  );
}
