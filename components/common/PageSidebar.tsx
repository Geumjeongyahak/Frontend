"use client";

import styled from "styled-components";
import { useState } from "react";

export default function LeftSidebar() {
  const [activeMenu, setActiveMenu] = useState("수업 일지");

  return (
    <Container>
      <Header>교원</Header>

      <Nav>
        <Section>
          <SectionTitle>수업 관리</SectionTitle>
          <Menu>
            <MenuItem
              active={activeMenu === "수업 일지"}
              onClick={() => setActiveMenu("수업 일지")}
            >
              수업 일지
            </MenuItem>
            <MenuItem
              active={activeMenu === "수업 교환 신청"}
              onClick={() => setActiveMenu("수업 교환 신청")}
            >
              수업 교환 신청
            </MenuItem>
            <MenuItem
              active={activeMenu === "수업 결강 신청"}
              onClick={() => setActiveMenu("수업 결강 신청")}
            >
              수업 결강 신청
            </MenuItem>
          </Menu>
        </Section>

        <Section>
          <SectionTitle>재무 관리</SectionTitle>
          <Menu>
            <MenuItem
              active={activeMenu === "결제 신청"}
              onClick={() => setActiveMenu("결제 신청")}
            >
              결제 신청
            </MenuItem>
          </Menu>
        </Section>

        <Section>
          <SectionTitle>자료실</SectionTitle>
          <Menu>
            {["교칙", "연락망", "교학 회의록", "인수인계서", "시험 문제 자료", "서류 양식"].map(
              (item) => (
                <MenuItem
                  key={item}
                  active={activeMenu === item}
                  onClick={() => setActiveMenu(item)}
                >
                  {item}
                </MenuItem>
              ),
            )}
          </Menu>
        </Section>

        <Section>
          <SectionTitle>게시판</SectionTitle>
          <Menu>
            <MenuItem active={activeMenu === "게시판"} onClick={() => setActiveMenu("게시판")}>
              게시판
            </MenuItem>
          </Menu>
        </Section>

        <Section>
          <SectionTitle>학사일정</SectionTitle>
          <Menu>
            <MenuItem
              active={activeMenu === "월별 일정"}
              onClick={() => setActiveMenu("월별 일정")}
            >
              월별 일정
            </MenuItem>
          </Menu>
        </Section>
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
