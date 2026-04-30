import Link from "next/link";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

export type ListPanelRow = {
  id: number;
  no: string;
  className: string;
  title: string;
  author: string;
  date: string;
  status: string;
  detailHref: string;
};

type ListPanelProps = {
  title: string;
  writeLabel: string;
  writeHref: string;
  listPath: string;
  rows: ListPanelRow[];
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

export default function ListPanel({
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
}: ListPanelProps) {
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
              <Th $width720="3.75rem" $width1080="5.5rem">
                no.
              </Th>
              <Th $width720="7.125rem" $width1080="10.75rem">
                반
              </Th>
              <Th>제목</Th>
              <Th $width720="5rem" $width1080="7.375rem">
                작성자
              </Th>
              <Th $width720="10.875rem" $width1080="16.3125rem">
                작성일
              </Th>
              <Th $width720="5rem" $width1080="7.375rem">
                신청 현황
              </Th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Tr key={row.id}>
                  <Td $width720="3.75rem" $width1080="5.5rem">
                    {row.no}
                  </Td>
                  <Td $width720="7.125rem" $width1080="10.75rem">
                    {row.className}
                  </Td>
                  <TitleTd>
                    <TitleLink href={row.detailHref}>{row.title}</TitleLink>
                  </TitleTd>
                  <Td $width720="5rem" $width1080="7.375rem">
                    {row.author}
                  </Td>
                  <Td $width720="10.875rem" $width1080="16.3125rem">
                    {row.date}
                  </Td>
                  <Td $width720="5rem" $width1080="7.375rem">
                    {row.status}
                  </Td>
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
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.5rem 3.3125rem 3rem 3.125rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 5rem 4rem 4.6875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 0.875rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.75rem;
  }
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
  min-width: 7.75rem;
  min-height: 2.75rem;
  padding: 0.75rem ${spacing.space20};
  border: none;
  background: #e4e4e4;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: #d9d9d9;
  }

  @media (min-width: 120rem) {
    min-width: 9.375rem;
    min-height: 4.25rem;
    font-size: ${typography.fontSize20};
  }
`;

const TableSection = styled.section`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th<{ $width720?: string; $width1080?: string }>`
  width: ${({ $width720 }) => $width720 ?? "auto"};
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #6d6d6d;
  font-size: ${typography.fontSize16};
  font-weight: 700;
  text-align: center;
  white-space: nowrap;

  @media (min-width: 120rem) {
    width: ${({ $width1080, $width720 }) => $width1080 ?? $width720 ?? "auto"};
    padding: ${spacing.space20} ${spacing.space12};
    font-size: ${typography.fontSize24};
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #6d6d6d;
`;

const Td = styled.td<{ $width720?: string; $width1080?: string }>`
  width: ${({ $width720 }) => $width720 ?? "auto"};
  padding: 0.875rem ${spacing.space12};
  font-size: ${typography.fontSize14};
  text-align: center;
  white-space: nowrap;

  @media (min-width: 120rem) {
    width: ${({ $width1080, $width720 }) => $width1080 ?? $width720 ?? "auto"};
    padding: ${spacing.space20} ${spacing.space12};
    font-size: ${typography.fontSize20};
  }
`;

const TitleTd = styled(Td)`
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyTd = styled.td`
  padding: ${spacing.space32} ${spacing.space20};
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
  gap: ${spacing.space24};
  margin-top: ${spacing.space32};

  @media (min-width: 120rem) {
    margin-top: 4rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
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
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
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
