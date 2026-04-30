import Link from "next/link";
import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

export type StaffRequestBoardRow = {
  id: number;
  no: string;
  className: string;
  title: string;
  author: string;
  date: string;
  status: string;
  detailHref: string;
};

type StaffRequestBoardProps = {
  title: string;
  writeLabel: string;
  writeHref: string;
  listPath: string;
  rows: StaffRequestBoardRow[];
  currentPage: number;
  totalPages: number;
  mineOnly?: boolean;
  showMineOnlyToggle?: boolean;
  emptyMessage?: string;
};

type QueryValue = string | number | boolean;

function buildHref(path: string, query: Record<string, QueryValue | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === "boolean") {
      if (value) params.set(key, "1");
      return;
    }
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export default function StaffRequestBoard({
  title,
  writeLabel,
  writeHref,
  listPath,
  rows,
  currentPage,
  totalPages,
  mineOnly = false,
  showMineOnlyToggle = true,
  emptyMessage = "목록이 없습니다.",
}: StaffRequestBoardProps) {
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const toggleHref = buildHref(listPath, { mineOnly: mineOnly ? undefined : 1 });
  const baseQuery = showMineOnlyToggle && mineOnly ? { mineOnly: 1 } : {};

  return (
    <Container>
      <HeaderRow>
        <Title>{title}</Title>
        <WriteButton href={writeHref}>{writeLabel}</WriteButton>
      </HeaderRow>

      <TableSection>
        <Table>
          <thead>
            <tr>
              <Th $width="72px">no.</Th>
              <Th $width="120px">반</Th>
              <Th>제목</Th>
              <Th $width="140px">작성자</Th>
              <Th $width="140px">작성일</Th>
              <Th $width="140px">신청 현황</Th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Tr key={row.id}>
                  <Td $width="72px">{row.no}</Td>
                  <Td $width="120px">{row.className}</Td>
                  <TitleTd>
                    <TitleLink href={row.detailHref}>{row.title}</TitleLink>
                  </TitleTd>
                  <Td $width="140px">{row.author}</Td>
                  <Td $width="140px">{row.date}</Td>
                  <Td $width="140px">{row.status}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <EmptyTd colSpan={6}>{emptyMessage}</EmptyTd>
              </Tr>
            )}
          </tbody>
        </Table>
      </TableSection>

      <BottomRow $hasToggle={showMineOnlyToggle}>
        {showMineOnlyToggle ? (
          <ToggleArea>
            <ToggleLabel>내가 작성한 신청서만 보기</ToggleLabel>
            <ToggleButtonLink
              href={toggleHref}
              aria-label="내 신청서만 보기"
              aria-pressed={mineOnly}
              $active={mineOnly}
            >
              <ToggleThumb $active={mineOnly} />
            </ToggleButtonLink>
          </ToggleArea>
        ) : null}

        <Pagination aria-label="페이지 이동">
          <PageArrow
            href={buildHref(listPath, { ...baseQuery, page: prevPage === 1 ? undefined : prevPage })}
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
                href={buildHref(listPath, {
                  ...baseQuery,
                  page: pageNumber === 1 ? undefined : pageNumber,
                })}
                $isActive={pageNumber === currentPage}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
              </PageNumber>
            );
          })}
          <PageArrow
            href={buildHref(listPath, { ...baseQuery, page: nextPage === 1 ? undefined : nextPage })}
            aria-label="다음 페이지"
            $isDisabled={currentPage === totalPages}
          >
            ▶
          </PageArrow>
        </Pagination>
      </BottomRow>
    </Container>
  );
}

const Container = styled.section`
  min-height: 100vh;
  padding: 40px 56px 48px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${spacing.space32};
`;

const Title = styled.h1`
  font-size: ${typography.fontSize24};
  font-weight: 700;
  margin: 0;
`;

const WriteButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px ${spacing.space24};
  border: none;
  background: #e9e9e9;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
`;

const TableSection = styled.section`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th<{ $width?: string }>`
  width: ${({ $width }) => $width ?? "auto"};
  padding: 0 ${spacing.space20} 14px;
  border-bottom: 1px solid #a8a8a8;
  font-size: ${typography.fontSize16};
  font-weight: 700;
  text-align: center;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #a8a8a8;
`;

const Td = styled.td<{ $width?: string }>`
  width: ${({ $width }) => $width ?? "auto"};
  padding: 14px ${spacing.space20};
  font-size: ${typography.fontSize14};
  text-align: center;
  white-space: nowrap;
`;

const TitleTd = styled(Td)`
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyTd = styled.td`
  padding: 32px 20px;
  color: ${colors.muted};
  font-size: ${typography.fontSize14};
  text-align: center;
`;

const TitleLink = styled(Link)`
  color: ${colors.text};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const BottomRow = styled.div<{ $hasToggle: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $hasToggle }) => ($hasToggle ? "space-between" : "center")};
  margin-top: ${spacing.space46};
`;

const ToggleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ToggleLabel = styled.span`
  font-size: ${typography.fontSize14};
`;

const ToggleButtonLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#bbc4ff" : "#d9d9d9")};
`;

const ToggleThumb = styled.span<{ $active: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $active }) => ($active ? "22px" : "2px")};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6d6d6d;
  transition: left 0.2s ease;
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 auto;
`;

const PageArrow = styled(Link)<{ $isDisabled?: boolean }>`
  border: none;
  background: transparent;
  color: #666;
  text-decoration: none;
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? "none" : "auto")};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.3 : 1)};
`;

const PageNumber = styled(Link)<{ $isActive?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  text-decoration: none;
  font-size: ${typography.fontSize16};
  color: ${({ $isActive }) => ($isActive ? "#111" : "#9a9a9a")};
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
`;
