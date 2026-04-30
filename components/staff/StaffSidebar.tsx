"use client";

import { useState } from "react";
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(staffSections.map((section) => [section.title, true])),
  );

  const isCurrent = (href: string) => {
    if (href === "/staff/class") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleSection = (title: string) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader>교원</SidebarHeader>
      <SidebarContent>
        {staffSections.map((section, sectionIndex) => {
          const hasCurrentItem = section.items.some((item) => isCurrent(item.href));
          const isOpen = openSections[section.title] ?? hasCurrentItem;
          const sectionId = `staff-sidebar-section-${sectionIndex}`;

          return (
            <SectionBlock key={section.title}>
              <SectionButton
                type="button"
                onClick={() => toggleSection(section.title)}
                aria-expanded={isOpen}
                aria-controls={sectionId}
                $hasCurrentItem={hasCurrentItem}
              >
                <span>{section.title}</span>
                <Chevron aria-hidden="true" $isOpen={isOpen}>
                  ▾
                </Chevron>
              </SectionButton>
              <SectionList id={sectionId} $isOpen={isOpen}>
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
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

const Sidebar = styled.aside`
  width: 11.625rem;
  flex-shrink: 0;
  background-color: #e8e8e8;

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
  background-color: #939393;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 5.5rem;
    padding: 0 2.5rem;
    font-size: ${typography.fontSize24};
  }
`;

const SidebarContent = styled.div`
  padding: 1.75rem 0 2.5rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 0 3.75rem;
  }
`;

const SectionBlock = styled.section`
  & + & {
    margin-top: 1.375rem;

    @media (min-width: 120rem) {
      margin-top: 2.5rem;
    }
  }
`;

const SectionButton = styled.button<{ $hasCurrentItem: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 0;
  padding: 0 1.625rem;
  background: transparent;
  color: ${({ $hasCurrentItem }) => ($hasCurrentItem ? colors.text : "#9f9f9f")};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: left;
  cursor: pointer;

  &:hover {
    color: ${colors.text};
  }

  @media (min-width: 120rem) {
    padding: 0 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;

const Chevron = styled.span<{ $isOpen: boolean }>`
  display: inline-flex;
  transform: rotate(${({ $isOpen }) => ($isOpen ? "0deg" : "-90deg")});
  transition: transform 0.2s ease;
`;

const SectionList = styled.ul<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? "24rem" : "0")};
  margin: 0.375rem 0 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
  transition: max-height 0.2s ease;

  @media (min-width: 120rem) {
    margin-top: 0.9375rem;
  }
`;

const SectionItem = styled.li`
  display: block;
  min-height: 0;
`;

const SectionLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${({ $isCurrent }) => ($isCurrent ? "#d9d9d9" : "transparent")};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  &:hover {
    background-color: ${({ $isCurrent }) => ($isCurrent ? "#d9d9d9" : "#dedede")};
  }

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;
