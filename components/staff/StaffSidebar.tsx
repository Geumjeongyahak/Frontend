"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { colors, layout, typography } from "@/styles/tokens";

const staffSections = [
  {
    title: "수업 관리",
    items: [
      { label: "수업 일지", href: "/staff/class" },
      { label: "수업 교환 신청", href: "/staff/class/exchange" },
      { label: "수업 결강 신청", href: "/staff/class/absence" },
    ],
  },
  {
    title: "재무 관리",
    items: [{ label: "결제 신청", href: "/staff/finance" }],
  },
  {
    title: "자료실",
    items: [
      { label: "교칙", href: "/docs/rules" },
      { label: "연락망", href: "/docs/contact" },
      { label: "교학 회의록", href: "/docs/meeting" },
      { label: "인수인계서", href: "/docs/handover" },
      { label: "시험 문제 자료", href: "/docs/exam" },
      { label: "서류 양식", href: "/docs/forms" },
    ],
  },
  {
    title: "게시판",
    items: [{ label: "게시판", href: "/board" }],
  },
  {
    title: "학사일정",
    items: [{ label: "월별 일정", href: "/calendar" }],
  },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === "/staff/class") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader>교원</SidebarHeader>
      <SidebarContent>
        {staffSections.map((section) => (
          <SectionBlock key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <SectionList>
              {section.items.map((item) => {
                const current = isCurrent(item.href);
                return (
                  <SectionItem key={item.href}>
                    <SectionLink
                      href={item.href}
                      $isCurrent={current}
                      aria-current={current ? "page" : undefined}
                    >
                      {item.label}
                    </SectionLink>
                  </SectionItem>
                );
              })}
            </SectionList>
          </SectionBlock>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

const Sidebar = styled.aside`
  width: 15.12rem;
  flex-shrink: 0;
  background-color: #efefef;

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
  }
`;

const SidebarHeader = styled.h1`
  display: flex;
  align-items: center;
  min-height: 3.5rem;
  padding: 0 1.5rem;
  background-color: #a3a3a3;
  color: ${colors.text};
  font-size: 1.2rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const SidebarContent = styled.div`
  padding: 1.5rem 0 2rem;
`;

const SectionBlock = styled.section`
  & + & {
    margin-top: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  padding: 0 1.5rem;
  color: #88cd5a;
  font-size: 1rem;
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const SectionList = styled.ul`
  margin-top: 0.375rem;
`;

const SectionItem = styled.li`
  display: block;
`;

const SectionLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.45rem 1.5rem;
  background-color: ${({ $isCurrent }) => ($isCurrent ? "#88cd5a" : "transparent")};
  color: ${({ $isCurrent }) => ($isCurrent ? colors.white : colors.text)};
  font-size: 1rem;
  font-weight: ${({ $isCurrent }) => ($isCurrent ? 800 : 600)};
  line-height: ${typography.lineHeight130};
  text-decoration: none;
`;
