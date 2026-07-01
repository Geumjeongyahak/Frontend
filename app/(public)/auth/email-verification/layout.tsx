import type { ReactNode } from "react";

type EmailVerificationLayoutProps = {
  children: ReactNode;
};

export default function EmailVerificationLayout({
  children,
}: EmailVerificationLayoutProps) {
  return (
    <>
      <style>{`
        [data-app-header="true"],
        [data-app-header-backdrop="true"] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
