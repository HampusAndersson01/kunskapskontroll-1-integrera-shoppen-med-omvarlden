import type { ReactNode } from "react";
import { CustomerHeader } from "./CustomerHeader";

type CustomerLayoutProps = {
  children: ReactNode;
};

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <>
      <CustomerHeader />
      <main className="page">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <strong>Everyday Market</strong>
            <span>Kvalitetsprodukter för din vardag, levererade med omsorg.</span>
          </div>
          <span>© 2026 Everyday Market. Alla rättigheter förbehållna.</span>
        </div>
      </footer>
    </>
  );
}
