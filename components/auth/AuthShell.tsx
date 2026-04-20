"use client";

import Link from "next/link";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type AuthShellProps = {
  switchLabel: string;
  switchHref: string;
  switchText: string;
  children: React.ReactNode;
};

export default function AuthShell({
  switchLabel,
  switchHref,
  switchText,
  children,
}: AuthShellProps) {
  return (
    <Main>
      <Content>
        <Panel>
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
  background:
    linear-gradient(180deg, rgba(136, 205, 90, 0.12), rgba(248, 248, 248, 0) 28rem),
    ${colors.background};
`;

const Content = styled.div`
  width: 100%;
  max-width: 30rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  padding: ${spacing.space32} ${spacing.space20};
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${layout.breakpointMobile}) {
    min-height: auto;
    padding-top: ${spacing.space40};
    padding-bottom: ${spacing.space40};
  }
`;

const Panel = styled.section`
  width: 100%;
  padding: ${spacing.space28};
  background-color: ${colors.white};
  border: 1px solid rgba(34, 34, 34, 0.08);
  border-radius: 8px;
  box-shadow: 0 1rem 2rem rgba(34, 34, 34, 0.06);

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
`;

const SwitchText = styled.span`
  color: #64705f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;

const SwitchLink = styled(Link)`
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.2rem;
  }
`;
