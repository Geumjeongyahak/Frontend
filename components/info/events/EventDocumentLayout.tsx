"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { EventInfoSidebar } from "@/components/info/events/EventInfoLayout";
import { colors, layout } from "@/styles/tokens";

type EventDocumentLayoutProps = {
  children: ReactNode;
};

export default function EventDocumentLayout({ children }: EventDocumentLayoutProps) {
  return (
    <Main>
      <Stage>
        <EventInfoSidebar />
        <Content>{children}</Content>
      </Stage>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
  }
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
`;
