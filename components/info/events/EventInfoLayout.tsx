"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import styled from "styled-components";
import { colors, layout, typography } from "@/styles/tokens";

const sidebarItems = [
  { label: "연혁", href: "/info/history" },
  { label: "부서 정보", href: "/info/departments" },
  { label: "반 정보", href: "/info/classes" },
  { label: "행사 정보", href: "/info/events" },
];

type EventInfoLayoutProps = {
  children: ReactNode;
};

export default function EventInfoLayout({ children }: EventInfoLayoutProps) {
  return (
    <Shell>
      <Stage>
        <EventInfoSidebar />
        {children}
      </Stage>
    </Shell>
  );
}

export function EventInfoSidebar() {
  return (
    <InfoSidebar>
      <SidebarHeader>기관 정보</SidebarHeader>
      <SidebarContent>
        <SidebarList>
          {sidebarItems.map((item) => {
            const isCurrent = item.href === "/info/events";
            return (
              <SidebarItem key={item.href}>
                <SidebarLink
                  href={item.href}
                  $isCurrent={isCurrent}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.label}
                </SidebarLink>
              </SidebarItem>
            );
          })}
        </SidebarList>
      </SidebarContent>
    </InfoSidebar>
  );
}

const Shell = styled.main`
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

const InfoSidebar = styled.aside`
  width: 11.625rem;
  flex-shrink: 0;
  background-color: ${colors.background};
  border-right: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    width: 17.4375rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
  }
`;

const SidebarHeader = styled.h1`
  display: flex;
  align-items: center;
  min-height: 3.625rem;
  margin: 0;
  padding: 0 1.625rem;
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 5.5rem;
    padding: 0 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const SidebarContent = styled.nav`
  padding: 1.75rem 0 2.5rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 0 3.75rem;
  }
`;

const SidebarList = styled.ul`
  display: grid;
  gap: 0.375rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 120rem) {
    gap: 0.625rem;
  }
`;

const SidebarItem = styled.li`
  display: block;
`;

const SidebarLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "transparent")};
  color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.point)};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "#eeeeee")};
    color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.text)};
  }

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;
