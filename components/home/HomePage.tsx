import styled from "styled-components";
import DesktopHomePage from "@/components/home/DesktopHomePage";
import MobileHomePage from "@/pwa/components/MobileHomePage";
import { colors, layout, spacing, typography } from "@/styles/tokens";
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
      <Footer>
        <FooterInner>
          <ContactText>연락처 051)515-7548</ContactText>
          <AddressText>부산광역시 금정구 동부곡로 12번길 39</AddressText>
        </FooterInner>
      </Footer>
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

const Footer = styled.footer`
  background-color: #e9e9e9;
`;

const FooterInner = styled.div`
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  margin: 0 auto;
  padding: ${spacing.space20};

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    padding: ${spacing.space24} ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding: ${spacing.space16} ${spacing.space20}
      calc(${spacing.space20} + env(safe-area-inset-bottom, 0rem));
  }
`;

const ContactText = styled.p`
  color: ${colors.placeholder};
  font-size: ${typography.fontSize24};
  font-weight: 600;
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
    font-weight: 600;
  }
`;

const AddressText = styled.p`
  margin-top: ${spacing.space4};
  color: ${colors.placeholder};
  font-size: ${typography.fontSize20};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;
