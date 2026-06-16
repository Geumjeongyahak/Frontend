"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { useAuthSession } from "@/hooks/useAuthSession";
import { colors, layout, typography } from "@/styles/tokens";

const staffSections = [
  {
    title: "수업 관리",
    items: [
      { label: "시간표", href: "/staff/class-management/weekly-schedule" },
      { label: "수업 일지", href: "/staff/class-management" },
      { label: "수업 교환 신청", href: "/staff/class-management/exchange-request" },
      { label: "수업 결강 신청", href: "/staff/class-management/absence-request" },
    ],
  },
  {
    title: "재무 관리",
    items: [{ label: "결제 신청", href: "/staff/finance-management" }],
  },
  {
    title: "자료실",
    items: [
      { label: "교칙", href: "/staff/archive/school-rules" },
      { label: "연락망", href: "/staff/archive/phone-book" },
      { label: "교학 회의록", href: "/staff/archive/meeting-records" },
      { label: "인수인계서", href: "/staff/archive/handover-documents" },
      { label: "시험 문제 자료", href: "/staff/archive/exam-materials" },
      { label: "서류 양식", href: "/staff/archive/document-forms" },
    ],
  },
  {
    title: "게시판",
    items: [{ label: "게시판", href: "/staff/board" }],
  },
  {
    title: "학사일정",
    items: [{ label: "월별 일정", href: "/staff/calendar" }],
  },
];

const adminSection = {
  title: "관리자",
  items: [{ label: "대시보드", href: "/admin/login" }],
};

type StaffSection = (typeof staffSections)[number];

function isCurrentStaffPath(pathname: string, href: string) {
  if (href === "/staff/class-management") {
    return (
      pathname === href ||
      pathname === "/staff/class-management/class-journal" ||
      /^\/staff\/class-management\/(?!(weekly-schedule|exchange-request|absence-request)(\/|$))[^/]+$/.test(
        pathname,
      )
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentSectionTitle(pathname: string, sections: StaffSection[]) {
  return sections.find((section) =>
    section.items.some((item) => isCurrentStaffPath(pathname, item.href)),
  )?.title;
}

function getOpenSectionsForTitle(sections: StaffSection[], title?: string) {
  return Object.fromEntries(
    sections.map((section) => [section.title, Boolean(title && section.title === title)]),
  );
}

function getOpenSectionsForPath(pathname: string, sections: StaffSection[]) {
  return getOpenSectionsForTitle(sections, getCurrentSectionTitle(pathname, sections));
}

type StaffSidebarProps = {
  mode?: "accordion" | "expanded";
};

export default function StaffSidebar({ mode = "accordion" }: StaffSidebarProps) {
  const pathname = usePathname();
  const { status, user } = useAuthSession();
  const visibleSections =
    status === "authenticated" && user?.role === "ADMIN"
      ? [...staffSections, adminSection]
      : staffSections;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    getOpenSectionsForPath(pathname, staffSections),
  );
  const [overridePathname, setOverridePathname] = useState<string | null>(null);
  const isExpandedMode = mode === "expanded";
  const routeOpenSections = getOpenSectionsForPath(pathname, visibleSections);
  const visibleOpenSections = overridePathname === pathname ? openSections : routeOpenSections;

  const isCurrent = (href: string) => {
    return isCurrentStaffPath(pathname, href);
  };

  const toggleSection = (title: string) => {
    setOpenSections((current) => {
      const sourceOpenSections = overridePathname === pathname ? current : routeOpenSections;
      const nextOpenSections = {
        ...sourceOpenSections,
        [title]: !sourceOpenSections[title],
      };

      return nextOpenSections;
    });
    setOverridePathname(pathname);
  };

  const keepOnlySectionOpen = (title: string) => {
    const nextOpenSections = getOpenSectionsForTitle(visibleSections, title);

    setOpenSections(nextOpenSections);
    setOverridePathname(pathname);
  };

  return (
    <Sidebar>
      <SidebarHeader>교원</SidebarHeader>
      <SidebarContent>
        {visibleSections.map((section, sectionIndex) => {
          const isOpen = isExpandedMode || (visibleOpenSections[section.title] ?? false);
          const sectionId = `staff-sidebar-section-${sectionIndex}`;

          return (
            <SectionBlock key={section.title}>
              {isExpandedMode ? (
                <SectionLabel>{section.title}</SectionLabel>
              ) : (
                <SectionButton
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={isOpen}
                  aria-controls={sectionId}
                >
                  <span>{section.title}</span>
                  <Chevron aria-hidden="true" $isOpen={isOpen}>
                    ▾
                  </Chevron>
                </SectionButton>
              )}
              <SectionList id={sectionId} $isOpen={isOpen}>
                {section.items.map((item) => {
                  const current = isCurrent(item.href);
                  return (
                    <SectionItem key={item.href}>
                      <SectionLink
                        href={item.href}
                        $isCurrent={current}
                        aria-current={current ? "page" : undefined}
                        onClick={() => keepOnlySectionOpen(section.title)}
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
      margin-top: 1.5rem;
    }
  }
`;

const SectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 0;
  padding: 0 1.625rem;
  background: transparent;
  color: ${colors.point};
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

const SectionLabel = styled.p`
  padding: 0 1.625rem;
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

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
  margin: ${({ $isOpen }) => ($isOpen ? "0.625rem 0 0" : "0")};
  padding: 0;
  overflow: hidden;
  list-style: none;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-0.375rem")});
  transition:
    max-height 0.28s ease,
    margin 0.28s ease,
    opacity 0.18s ease,
    transform 0.28s ease;

  @media (min-width: 120rem) {
    margin-top: ${({ $isOpen }) => ($isOpen ? "0.9375rem" : "0")};
  }
`;

const SectionItem = styled.li`
  display: block;
  min-height: 0;
`;

const SectionLink = styled(Link)<{ $isCurrent: boolean }>`
  display: block;
  padding: 0.25rem 1.625rem;
  background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "transparent")};
  color: ${({ $isCurrent }) => ($isCurrent ? colors.white : "#000000")};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  transition:
    background-color 0.28s ease,
    color 0.28s ease;

  &:hover {
    background-color: ${({ $isCurrent }) => ($isCurrent ? colors.point : "#eeeeee")};
  }

  @media (min-width: 120rem) {
    padding: 0.3125rem 2.5rem;
    font-size: ${typography.fontSize20};
  }
`;
