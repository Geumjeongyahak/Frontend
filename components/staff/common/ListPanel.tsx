import Link from "next/link";
import { IconPinFilled } from "@tabler/icons-react";
import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export type ListPanelRow = {
  id: number;
  no: string;
  className: string;
  title: string;
  author: string;
  date: string;
  status: string;
  statusType?: "PENDING" | "APPROVED" | "PURCHASED" | "CONFIRMED" | "REJECTED";
  detailHref: string;
  isNotice?: boolean;
  isPinned?: boolean;
};

type ListPanelTone = "default" | "journal" | "finance" | "archive";

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
  headerTone?: ListPanelTone;
  showClassColumn?: boolean;
  classHeader?: string;
  showStatusColumn?: boolean;
  statusHeader?: string;
  writeIcon?: ReactNode;
  filterSlot?: ReactNode;
  searchSlot?: ReactNode;
  toggleLabel?: string;
  toggleAriaLabel?: string;
  onMineOnlyToggle?: () => void;
  stableTableRows?: number;
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
  headerTone = "default",
  showClassColumn = true,
  classHeader = "반",
  showStatusColumn = true,
  statusHeader = "신청 현황",
  writeIcon,
  filterSlot,
  searchSlot,
  toggleLabel = "내가 작성한 신청서만 보기",
  toggleAriaLabel = "내 신청서만 보기",
  onMineOnlyToggle,
  stableTableRows,
}: ListPanelProps) {
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const toggleHref = buildHref(listPath, { mineOnly: mineOnly ? undefined : 1 });
  const baseQuery = showMineOnlyToggle && mineOnly ? { mineOnly: 1 } : {};
  const columnCount = 2 + Number(showClassColumn) + 2 + Number(showStatusColumn);

  return (
    <Container>
      <HeaderRow>
        <Title $tone={headerTone}>{title}</Title>
        <WriteButton href={writeHref} $tone={headerTone}>
          <span>{writeLabel}</span>
          {writeIcon}
        </WriteButton>
      </HeaderRow>

      {filterSlot ? <FilterSlot>{filterSlot}</FilterSlot> : null}

      <TableSection $stableRows={stableTableRows}>
        <Table>
          <thead>
            <tr>
              <Th $width720="3.75rem" $width1080="5.5rem" $tone={headerTone}>
                no.
              </Th>
              {showClassColumn ? (
                <Th $width720="7.125rem" $width1080="10.75rem" $tone={headerTone}>
                  {classHeader}
                </Th>
              ) : null}
              <Th $tone={headerTone}>제목</Th>
              <Th $width720="5rem" $width1080="7.375rem" $tone={headerTone}>
                작성자
              </Th>
              <Th $width720="10.875rem" $width1080="16.3125rem" $tone={headerTone}>
                작성일
              </Th>
              {showStatusColumn ? (
                <Th $width720="5rem" $width1080="7.375rem" $tone={headerTone}>
                  {statusHeader}
                </Th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Tr key={row.id} $tone={headerTone}>
                  <Td $width720="3.75rem" $width1080="5.5rem" $isNotice={row.isNotice}>
                    {row.no}
                  </Td>
                  {showClassColumn ? (
                    <Td $width720="7.125rem" $width1080="10.75rem">
                      {row.className}
                    </Td>
                  ) : null}
                  <TitleTd>
                    <TitleLink href={row.detailHref}>
                      <TitleContent>
                        {row.isPinned ? (
                          <PinIcon aria-label="고정 게시물" size={16} stroke={2.25} />
                        ) : null}
                        <TitleText>{row.title}</TitleText>
                      </TitleContent>
                    </TitleLink>
                  </TitleTd>
                  <Td $width720="5rem" $width1080="7.375rem">
                    {row.author}
                  </Td>
                  <Td $width720="10.875rem" $width1080="16.3125rem">
                    {row.date}
                  </Td>
                  {showStatusColumn ? (
                    <Td $width720="5rem" $width1080="7.375rem">
                      <StatusBadge $status={row.statusType}>{row.status}</StatusBadge>
                    </Td>
                  ) : null}
                </Tr>
              ))
            ) : (
              <Tr $tone={headerTone}>
                <EmptyTd colSpan={columnCount}>{emptyMessage}</EmptyTd>
              </Tr>
            )}
          </tbody>
        </Table>
      </TableSection>

      <BottomRow $hasToggle={showMineOnlyToggle} $hasSearch={Boolean(searchSlot)}>
        {showMineOnlyToggle ? (
          <ToggleArea>
            <ToggleLabel>{toggleLabel}</ToggleLabel>
            {onMineOnlyToggle ? (
              <ToggleButton
                type="button"
                aria-label={toggleAriaLabel}
                aria-pressed={mineOnly}
                $active={mineOnly}
                onClick={onMineOnlyToggle}
              >
                <ToggleThumb $active={mineOnly} />
              </ToggleButton>
            ) : (
              <ToggleButtonLink
                href={toggleHref}
                aria-label={toggleAriaLabel}
                aria-pressed={mineOnly}
                $active={mineOnly}
              >
                <ToggleThumb $active={mineOnly} />
              </ToggleButtonLink>
            )}
          </ToggleArea>
        ) : null}

        <Pagination aria-label="페이지 이동">
          <PageArrow
            href={buildHref(listPath, {
              ...baseQuery,
              page: prevPage === 1 ? undefined : prevPage,
            })}
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
            href={buildHref(listPath, {
              ...baseQuery,
              page: nextPage === 1 ? undefined : nextPage,
            })}
            aria-label="다음 페이지"
            $isDisabled={currentPage === totalPages}
          >
            ▶
          </PageArrow>
        </Pagination>

        {searchSlot ? <SearchSlot>{searchSlot}</SearchSlot> : null}
      </BottomRow>
    </Container>
  );
}

const Container = styled.section`
  min-height: 0;
  overflow: visible;
  padding: 2.1875rem 3.3125rem 0 3.125rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 3.875rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    height: auto;
    overflow: visible;
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 1.4375rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.75rem;
  }
`;

const Title = styled.h1<{ $tone: ListPanelTone }>`
  margin: 0;
  color: #000000;
  font-size: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive"
      ? "1.625rem"
      : typography.fontSize24};
  font-weight: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive" ? 600 : 700};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${({ $tone }) =>
      $tone === "journal" || $tone === "finance" || $tone === "archive"
        ? "2.5rem"
        : typography.fontSize24};
  }
`;

const WriteButton = styled(Link)<{ $tone: ListPanelTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-width: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive" ? "auto" : "7.75rem"};
  min-height: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive" ? "2.6875rem" : "2.75rem"};
  padding: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive"
      ? `0.8125rem ${spacing.space20}`
      : `0.75rem ${spacing.space20}`};
  border: ${({ $tone }) => ($tone === "archive" ? `1px solid ${colors.point}` : "0")};
  border-radius: ${({ $tone }) =>
    $tone === "journal" || $tone === "finance" || $tone === "archive" ? radii.radius15 : "0"};
  background: ${({ $tone }) =>
    $tone === "archive"
      ? colors.white
      : $tone === "journal" || $tone === "finance"
        ? colors.point
        : "#e4e4e4"};
  color: ${({ $tone }) =>
    $tone === "archive"
      ? colors.point
      : $tone === "journal" || $tone === "finance"
        ? colors.white
        : colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;

  svg {
    flex: 0 0 auto;
  }

  &:hover {
    background: ${({ $tone }) =>
      $tone === "archive"
        ? "#eef9e6"
        : $tone === "journal" || $tone === "finance"
          ? "#76bd49"
          : "#d9d9d9"};
  }

  @media (min-width: 120rem) {
    min-width: ${({ $tone }) =>
      $tone === "journal" || $tone === "finance" || $tone === "archive" ? "auto" : "9.375rem"};
    min-height: ${({ $tone }) =>
      $tone === "journal" || $tone === "finance" || $tone === "archive" ? "4rem" : "4.25rem"};
    padding: ${({ $tone }) =>
      $tone === "journal" || $tone === "finance" || $tone === "archive"
        ? `${spacing.space20} 1.875rem`
        : `0.75rem ${spacing.space20}`};
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const TableSection = styled.section<{ $stableRows?: number }>`
  width: 100%;
  min-height: ${({ $stableRows }) =>
    $stableRows ? `calc(6rem + ${$stableRows} * 1.875rem)` : "0"};

  @media (min-width: 120rem) {
    min-height: ${({ $stableRows }) =>
      $stableRows ? `calc(13rem + ${$stableRows} * 2.75rem)` : "0"};
  }
`;

const FilterSlot = styled.div`
  margin-bottom: 1.25rem;

  @media (min-width: 120rem) {
    margin-bottom: 1.875rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th<{ $width720?: string; $width1080?: string; $tone: ListPanelTone }>`
  width: ${({ $width720 }) => $width720 ?? "auto"};
  padding: 0.625rem ${spacing.space12};
  border-bottom: 1px solid
    ${({ $tone }) => ($tone === "finance" || $tone === "archive" ? colors.muted : "#6d6d6d")};
  font-size: ${typography.fontSize16};
  font-weight: 700;
  text-align: center;
  white-space: nowrap;

  @media (min-width: 120rem) {
    width: ${({ $width1080, $width720 }) => $width1080 ?? $width720 ?? "auto"};
    padding: 1rem ${spacing.space12};
    font-size: ${typography.fontSize24};
  }
`;

const Tr = styled.tr<{ $tone: ListPanelTone }>`
  border-bottom: 1px solid
    ${({ $tone }) => ($tone === "finance" || $tone === "archive" ? colors.muted : "#6d6d6d")};
`;

const Td = styled.td<{ $width720?: string; $width1080?: string; $isNotice?: boolean }>`
  width: ${({ $width720 }) => $width720 ?? "auto"};
  padding: 0.65625rem ${spacing.space12};
  color: ${({ $isNotice }) => ($isNotice ? colors.notice : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $isNotice }) => ($isNotice ? 700 : 400)};
  text-align: center;
  white-space: nowrap;

  @media (min-width: 120rem) {
    width: ${({ $width1080, $width720 }) => $width1080 ?? $width720 ?? "auto"};
    padding: 1.1875rem ${spacing.space12};
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

const TitleContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  max-width: 100%;
`;

const TitleText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PinIcon = styled(IconPinFilled)`
  flex: 0 0 auto;
  color: ${colors.point};
`;

const BottomRow = styled.div<{ $hasToggle: boolean; $hasSearch: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space24};
  margin-top: 1.75rem;

  @media (min-width: 120rem) {
    margin-top: 3.25rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ToggleArea = styled.div`
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 14px;

  @media (min-width: 120rem) {
    gap: 1.1875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    position: static;
  }
`;

const ToggleLabel = styled.span`
  font-size: ${typography.fontSize14};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const toggleButtonStyle = css<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#bbc4ff" : "#d9d9d9")};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 4.5rem;
    height: 2.375rem;
  }
`;

const ToggleButtonLink = styled(Link)<{ $active: boolean }>`
  ${toggleButtonStyle}
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  ${toggleButtonStyle}
  padding: 0;
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

  @media (min-width: 120rem) {
    left: ${({ $active }) => ($active ? "2.25rem" : "0.125rem")};
    width: 2.125rem;
    height: 2.125rem;
  }
`;

const SearchSlot = styled.div`
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;

  @media (max-width: ${layout.breakpointMobile}) {
    position: static;
    width: 100%;
  }
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 auto;
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
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

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize24};
  }
`;

const StatusBadge = styled.span<{
  $status?: "PENDING" | "APPROVED" | "PURCHASED" | "CONFIRMED" | "REJECTED";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;

  font-size: ${typography.fontSize14};

  color: ${({ $status }) => {
    switch ($status) {
      case "APPROVED":
        return "#3DA75C";
      case "PURCHASED":
        return "#2F80ED";
      case "CONFIRMED":
        return "#1D9A35";
      case "REJECTED":
        return "#DA3A30";
      case "PENDING":
      default:
        return "#E5AD34";
    }
  }};

  @media (min-width: 120rem) {
    min-width: 4.5rem;
    font-size: ${typography.fontSize20};
  }
`;
