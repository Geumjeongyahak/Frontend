"use client";

import Link from "next/link";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

const financeRequests = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  className: "개나리반",
  title: "개나리반 수학 수업 교환 신청합니다",
  author: "작성자",
  date: "00.00.00",
  status: "대기 중",
}));

const staffSections = [
  {
    title: "수업 관리",
    items: ["수업 일지", "수업 교환 신청", "수업 결강 신청"],
  },
  {
    title: "재무 관리",
    items: ["결제 신청"],
  },
  {
    title: "자료실",
    items: ["교칙", "연락망", "교학 회의록", "인수인계서", "시험 문제 자료", "서류 양식"],
  },
  {
    title: "게시판",
    items: ["게시판"],
  },
  {
    title: "학사일정",
    items: ["월별 일정"],
  },
];

export default function FinanceRequestPage() {
  return (
    <Main>
      <Sidebar>
        <SidebarHeader>교원</SidebarHeader>
        <SidebarContent>
          {staffSections.map((section) => (
            <SectionBlock key={section.title}>
              <SectionTitle>{section.title}</SectionTitle>
              <SectionList>
                {section.items.map((item) => {
                  const isCurrent = item === "결제 신청";

                  return (
                    <SectionItem key={item}>
                      <SectionLink href="/staff/finance" $isCurrent={isCurrent} aria-current={isCurrent ? "page" : undefined}>
                        {item}
                      </SectionLink>
                    </SectionItem>
                  );
                })}
              </SectionList>
            </SectionBlock>
          ))}
        </SidebarContent>
      </Sidebar>

      <Content>
        <ContentHeader>
          <Title>결제 신청</Title>
          <RequestButton type="button">결제 신청 하기</RequestButton>
        </ContentHeader>

        <TableWrapper>
          <Table aria-label="결제 신청 목록">
            <thead>
              <tr>
                <TableHeaderCell $width="7rem">no.</TableHeaderCell>
                <TableHeaderCell $width="8rem">반</TableHeaderCell>
                <TableHeaderCell>제목</TableHeaderCell>
                <TableHeaderCell $width="12rem">작성자</TableHeaderCell>
                <TableHeaderCell $width="11rem">작성일</TableHeaderCell>
                <TableHeaderCell $width="11rem">신청 현황</TableHeaderCell>
              </tr>
            </thead>
            <tbody>
              {financeRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{String(request.id).padStart(2, "0")}</TableCell>
                  <TableCell>{request.className}</TableCell>
                  <TitleCell>{request.title}</TitleCell>
                  <TableCell>{request.author}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{request.status}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        <Pagination aria-label="페이지 이동">
          <PageArrow type="button" aria-label="이전 페이지">
            ◀
          </PageArrow>
          <PageNumber type="button" $isActive>
            1
          </PageNumber>
          <PageNumber type="button">2</PageNumber>
          <PageNumber type="button">3</PageNumber>
          <PageNumber type="button">4</PageNumber>
          <PageNumber type="button">5</PageNumber>
          <PageArrow type="button" aria-label="다음 페이지">
            ▶
          </PageArrow>
        </Pagination>
      </Content>
    </Main>
  );
}

const Main = styled.main`
  display: flex;
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

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

const Content = styled.section`
  flex: 1;
  min-width: 0;
  padding: 2rem 2.5rem 2.5rem;

  @media (max-width: ${layout.breakpointDesktop}) {
    padding: 1.75rem 1.5rem 2rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding: 1.5rem 1rem;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space20};
  margin-bottom: 1.75rem;

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h2`
  color: ${colors.text};
  font-size: 1.9rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const RequestButton = styled.button`
  border: 0;
  background-color: #ececec;
  padding: 0.75rem 1rem;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 40rem;
`;

const TableHeaderCell = styled.th<{ $width?: string }>`
  width: ${({ $width }) => $width ?? "auto"};
  padding: 0 0.875rem 0.625rem;
  border-bottom: 1px solid #8b8b8b;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  text-align: center;
  white-space: nowrap;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #8b8b8b;
`;

const TableCell = styled.td`
  padding: 0.75rem 0.875rem;
  color: ${colors.text};
  font-size: 0.9rem;
  font-weight: 400;
  line-height: ${typography.lineHeight150};
  text-align: center;
  white-space: nowrap;
`;

const TitleCell = styled(TableCell)`
  text-align: left;
`;

const Pagination = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
`;

const PageArrow = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  color: #767676;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
`;

const PageNumber = styled.button<{ $isActive?: boolean }>`
  border: 0;
  background: transparent;
  padding: 0;
  color: ${({ $isActive }) => ($isActive ? colors.text : "#9c9c9c")};
  font-size: 1rem;
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  line-height: 1;
  cursor: pointer;
`;
