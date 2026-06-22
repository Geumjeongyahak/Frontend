import styled from "styled-components";
import LoginForm from "@/components/auth/LoginForm";
import MobileLoginPage from "@/pwa/components/MobileLoginPage";
import { layout } from "@/styles/tokens";

export default function Page() {
  return (
    <>
      <DesktopShell>
        <LoginForm />
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

