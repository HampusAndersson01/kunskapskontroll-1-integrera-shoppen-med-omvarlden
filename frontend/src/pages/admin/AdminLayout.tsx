import type { ReactNode } from "react";
import { Link } from "../../components/Link";

type AdminLayoutProps = {
  currentPath: string;
  children: ReactNode;
};

const adminLinks = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/products", label: "Produkter" },
  { href: "/admin/products/new", label: "Lägg till produkt" },
  { href: "/admin/orders", label: "Ordrar" },
];

export function AdminLayout({ currentPath, children }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav aria-label="Adminmeny">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActiveAdminLink(currentPath, link.href) ? "active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="admin-content">{children}</div>
    </div>
  );
}

function isActiveAdminLink(currentPath: string, href: string) {
  if (href === "/admin") {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
