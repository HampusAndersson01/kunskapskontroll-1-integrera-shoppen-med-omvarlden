import { Link } from "../components/Link";

type PagePlaceholderProps = {
  title: string;
  description: string;
  links?: Array<{
    href: string;
    label: string;
  }>;
};

export function PagePlaceholder({ title, description, links = [] }: PagePlaceholderProps) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p>{description}</p>

      {links.length > 0 && (
        <ul className="link-list">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
