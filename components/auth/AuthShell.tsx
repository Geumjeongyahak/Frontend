"use client";

import Link from "next/link";
import styled from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type AuthShellProps = {
  switchLabel: string;
  switchHref: string;
  switchText: string;
  panelSize?: "narrow" | "wide";
  children: React.ReactNode;
};

export default function AuthShell({
  switchLabel,
  switchHref,
  switchText,
  panelSize = "narrow",
  children,
}: AuthShellProps) {
  return (
    <Main>
      <Content>
        <Panel $panelSize={panelSize}>
          {children}
          <SwitchArea>
            <SwitchText>{switchText}</SwitchText>
            <SwitchLink href={switchHref}>{switchLabel}</SwitchLink>
          </SwitchArea>
        </Panel>
      </Content>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.background};
`;

const Content = styled.div`
  width: 100%;
  max-width: ${layout.homeMaxWidth};
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  padding: ${spacing.space28} ${spacing.space20} ${spacing.space32};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (min-width: 120rem) {
    max-width: ${layout.homeMaxWidthLarge};
    min-height: calc(100vh - 7.1875rem);
    padding-top: ${spacing.space46};
    padding-bottom: ${spacing.space47};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    min-height: auto;
    padding-top: ${spacing.space40};
    padding-bottom: ${spacing.space40};
  }
`;

const Panel = styled.section<{ $panelSize: "narrow" | "wide" }>`
  width: 100%;
  max-width: ${({ $panelSize }) => ($panelSize === "wide" ? "51.9375rem" : "34.625rem")};
  padding: ${spacing.space24};
  background-color: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: ${radii.radius30};

  @media (min-width: 120rem) {
    max-width: ${({ $panelSize }) => ($panelSize === "wide" ? "77.875rem" : "51.9375rem")};
    padding: ${spacing.space32};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding: ${spacing.space24};
  }
`;

const SwitchArea = styled.div`
  margin-top: ${spacing.space24};
  padding-top: ${spacing.space20};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  border-top: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    margin-top: ${spacing.space32};
    padding-top: ${spacing.space28};
  }
`;

const SwitchText = styled.span`
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const SwitchLink = styled(Link)`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }
`;
