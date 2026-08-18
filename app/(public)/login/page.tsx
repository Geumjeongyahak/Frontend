import styled from "styled-components";
import LoginForm from "@/components/auth/LoginForm";
import MobileLoginPage from "@/pwa/components/MobileLoginPage";
import { layout } from "@/styles/tokens";

type LoginPageProps = {
  searchParams?: Promise<{ returnTo?: string }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams?.returnTo;

  return (
    <>
      <DesktopShell>
        <LoginForm returnTo={returnTo} />
      </DesktopShell>
      <MobileShell>
        <MobileLoginPage />
      </MobileShell>
    </>
  );
}

const DesktopShell = styled.div`
  display: block;

  @media (max-width: ${layout.breakpointMobile}) {
    display: none;
  }
`;

const MobileShell = styled.div`
  display: none;

  @media (max-width: ${layout.breakpointMobile}) {
    display: block;
  }
`;

