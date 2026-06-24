import styled from "styled-components";
import DesktopHomePage from "@/components/home/DesktopHomePage";
import MobileHomePage from "@/pwa/components/MobileHomePage";
import { layout } from "@/styles/tokens";
import DeployTargetLogger from "../common/DeployTargetLogger";

export default function HomePage() {
  return (
    <>
      <DeployTargetLogger />

      <DesktopShell>
        <DesktopHomePage />
      </DesktopShell>
      <MobileShell>
        <MobileHomePage />
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
