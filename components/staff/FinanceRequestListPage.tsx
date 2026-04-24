import Link from "next/link";
import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import type { FinanceRequest } from "@/components/staff/staffFinanceData";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type FinanceRequestListPageProps = {
  currentPage: number;
  requests: FinanceRequest[];
  totalPages: number;
};

export default function FinanceRequestListPage({
  currentPage,
  requests,
  totalPages,
}: FinanceRequestListPageProps) {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <Main>
      <StaffSidebar currentItem="결제 신청" />

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
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{String(request.id).padStart(2, "0")}</TableCell>
                  <TableCell>{request.className}</TableCell>
                  <TitleCell>
                    <TitleLink href={`/staff/finance/${request.id}`}>
                      {request.title}
                    </TitleLink>
                  </TitleCell>
                  <TableCell>{request.author}</TableCell>
                  <TableCell>{request.paymentDate}</TableCell>
                  <TableCell>{request.status}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        <Pagination aria-label="페이지 이동">
          <PageArrow
            href={prevPage <= 1 ? "/staff/finance" : `/staff/finance?page=${prevPage}`}
            aria-label="이전 페이지"
            $isDisabled={currentPage === 1}
          >
            ◀
          </PageArrow>
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <PageNumber
                key={pageNumber}
                href={
                  pageNumber === 1
                    ? "/staff/finance"
                    : `/staff/finance?page=${pageNumber}`
                }
                $isActive={pageNumber === currentPage}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
              </PageNumber>
            );
          })}
          <PageArrow
            href={
              nextPage === 1
                ? "/staff/finance"
                : `/staff/finance?page=${nextPage}`
            }
            aria-label="다음 페이지"
            $isDisabled={currentPage === totalPages}
          >
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

const TitleLink = styled(Link)`
  color: ${colors.text};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Pagination = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
`;

const PageArrow = styled(Link)<{ $isDisabled?: boolean }>`
  background: transparent;
  padding: 0;
  color: #767676;
  font-size: 1rem;
  line-height: 1;
  text-decoration: none;
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? "none" : "auto")};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.3 : 1)};
`;

const PageNumber = styled(Link)<{ $isActive?: boolean }>`
  background: transparent;
  padding: 0;
  color: ${({ $isActive }) => ($isActive ? colors.text : "#9c9c9c")};
  font-size: 1rem;
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  line-height: 1;
  text-decoration: none;
`;
