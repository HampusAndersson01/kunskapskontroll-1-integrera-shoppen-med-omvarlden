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
    </>
  );
}
