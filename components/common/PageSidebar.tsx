"use client";

import styled from "styled-components";
import { useRouter, usePathname } from "next/navigation";

const sections = [
  {
    title: "수업 관리",
    items: [
      { label: "수업 일지", href: "/class" },
      { label: "수업 교환 신청", href: "/class/exchange" },
      { label: "수업 결강 신청", href: "/class/absence" },
    ],
  },
  {
    title: "재무 관리",
    items: [{ label: "결제 신청", href: "/payment" }],
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

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Container>
      <Header>교원</Header>

      <Nav>
        {sections.map((section) => (
          <Section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>

            <Menu>
              {section.items.map((item) => (
                <MenuItem
                  key={item.href}
                  active={isActive(item.href)}
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </Section>
        ))}
      </Nav>
    </Container>
  );
}

const Container = styled.aside`
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e5e5;
`;

const Header = styled.div`
  padding: 20px 28px;
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid #e5e5e5;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  padding: 0 24px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #9ca3af;
`;

const Menu = styled.ul`
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.li<{ active?: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;

  ${({ active }) =>
    active &&
    `
    background-color: #f3f4f6;
    font-weight: 600;
  `}

  &:hover {
    background-color: #f3f4f6;
  }
`;
