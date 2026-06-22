import styled from "styled-components";
import MyPage from "@/components/auth/MyPage";
import MobileMyPage from "@/pwa/components/MobileMyPage";
import { layout } from "@/styles/tokens";

export default function Page() {
  return (
    <>
      <DesktopShell>
        <MyPage />
      </DesktopShell>
      <MobileShell>
        <MobileMyPage />
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

