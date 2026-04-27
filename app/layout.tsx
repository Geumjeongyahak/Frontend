import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import Header from "@/components/layout/Header";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "금정열린배움터",
  description: "금정열린배움터 업무지원 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <StyledComponentsRegistry>
          <QueryProvider>
            <Header />
            {children}
          </QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
