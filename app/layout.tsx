import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "금정열린배움터 업무지원 플랫폼",
  description: "금정열린배움터 업무지원 플랫폼 홈 화면",
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
          <Header />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
