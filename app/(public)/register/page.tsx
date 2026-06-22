import styled from "styled-components";
import RegisterForm from "@/components/auth/RegisterForm";
import MobileRegisterPage from "@/pwa/components/MobileRegisterPage";
import { layout } from "@/styles/tokens";

export default function Page() {
  return (
    <>
      <DesktopShell>
        <RegisterForm />
      </DesktopShell>
      <MobileShell>
        <MobileRegisterPage />
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

