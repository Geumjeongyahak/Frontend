"use client";

import styled from "styled-components";
import {
  ABSENCE_ITEMS_PER_PAGE,
  ABSENCE_STATUS_OPTIONS,
  formatAbsenceDate,
  type AbsenceStatusFilter,
} from "@/components/admin/absence-requests/absenceRequestConstants";
import { AbsenceStatusBadge } from "@/components/admin/absence-requests/AbsenceStatusBadge";
import type { AdminAbsenceRequestsViewModel } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import {
  ControlRow,
  SectionCard,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { colors, spacing, typography } from "@/styles/tokens";

const ABSENCE_TABLE_HEADER_HEIGHT = "2.5rem";
const ABSENCE_TABLE_ROW_HEIGHT = "3.75rem";

type AdminAbsenceRequestsListPanelProps = Pick<
  AdminAbsenceRequestsViewModel,
  | "statusFilter"
  | "keywordInput"
  | "setKeywordInput"
  | "handleSearch"
  | "handleStatusFilterChange"
  | "absenceRequestsQuery"
  | "sortedRequests"
  | "selectedAbsenceId"
  | "selectAbsence"
  | "currentPage"
  | "totalPages"
  | "goToPrevPage"
  | "goToNextPage"
>;

export function AdminAbsenceRequestsListPanel({
  statusFilter,
  keywordInput,
  setKeywordInput,
  handleSearch,
  handleStatusFilterChange,
  absenceRequestsQuery,
  sortedRequests,
  selectedAbsenceId,
  selectAbsence,
  currentPage,
  totalPages,
  goToPrevPage,
  goToNextPage,
}: AdminAbsenceRequestsListPanelProps) {
  const isLoading = absenceRequestsQuery.isLoading;
  const isError = absenceRequestsQuery.isError;
  const isEmpty = !isLoading && !isError && sortedRequests.length === 0;

  return (
    <SectionCard>
      <SectionTitle>결강 요청 목록</SectionTitle>
      <ControlRow
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <StatusSelect
          value={statusFilter}
          onChange={(event) => handleStatusFilterChange(event.target.value as AbsenceStatusFilter)}
        >
          {ABSENCE_STATUS_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </StatusSelect>
        <KeywordInput
          value={keywordInput}
          placeholder="검색어"
          onChange={(event) => setKeywordInput(event.target.value)}
        />
        <SmallButton type="submit">검색</SmallButton>
      </ControlRow>

      <ListTableArea>
        <TableViewport>
          {isLoading ? (
            <ListOverlay>
              <LoadingSpinner label="결강 요청 목록 불러오는 중" />
            </ListOverlay>
          ) : null}
          {isError ? (
            <ListOverlay role="alert">
              <ListOverlayMessage>결강 요청 목록을 불러오지 못했습니다.</ListOverlayMessage>
            </ListOverlay>
          ) : null}
          {isEmpty ? (
            <ListOverlay>
              <ListOverlayMessage>결강 요청이 없습니다.</ListOverlayMessage>
            </ListOverlay>
          ) : null}

          <AbsenceListTable>
            <thead>
              <tr>
                <th>제목</th>
                <th>분반</th>
                <th>요청자</th>
                <th>상태</th>
                <th>일자</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((item) => (
                <AbsenceTableRow
                  key={item.id ?? `${item.title}-${item.createdAt}`}
                  $selected={item.id === selectedAbsenceId}
                  onClick={() => selectAbsence(item)}
                >
                  <td>{item.title ?? "-"}</td>
                  <td>{item.classroomName ?? "-"}</td>
                  <td>{item.requestedByName ?? "-"}</td>
                  <td>
                    <AbsenceStatusBadge status={item.status} />
                  </td>
                  <td>
                    <ScheduleCell>
                      <ScheduleLine>수업일 {formatAbsenceDate(item.lessonDate)}</ScheduleLine>
                      <ScheduleLine $muted>요청일 {formatAbsenceDate(item.createdAt)}</ScheduleLine>
                    </ScheduleCell>
                  </td>
                </AbsenceTableRow>
              ))}
            </tbody>
          </AbsenceListTable>
        </TableViewport>

        <PaginationNav aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={currentPage <= 1 || absenceRequestsQuery.isFetching}
            onClick={goToPrevPage}
          >
            ‹
          </PageArrowButton>
          <PageIndicator>
            {currentPage} / {totalPages}
          </PageIndicator>
          <PageArrowButton
            type="button"
            aria-label="다음 페이지"
            disabled={currentPage >= totalPages || absenceRequestsQuery.isFetching}
            onClick={goToNextPage}
          >
            ›
          </PageArrowButton>
        </PaginationNav>
      </ListTableArea>
    </SectionCard>
  );
}

const ListTableArea = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(
    ${ABSENCE_TABLE_HEADER_HEIGHT} + ${ABSENCE_ITEMS_PER_PAGE} * ${ABSENCE_TABLE_ROW_HEIGHT} +
      2.75rem
  );
`;

const TableViewport = styled.div`
  position: relative;
  flex: 1 1 auto;
`;

const ListOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 72%);
`;

const ListOverlayMessage = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;

const AbsenceTableRow = styled.tr<{ $selected: boolean }>`
  height: ${ABSENCE_TABLE_ROW_HEIGHT};
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : "transparent")};
`;

const AbsenceListTable = styled(Table)`
  th,
  td {
    vertical-align: middle;
  }

  thead tr {
    height: ${ABSENCE_TABLE_HEADER_HEIGHT};
  }

  tbody tr {
    height: ${ABSENCE_TABLE_ROW_HEIGHT};
  }

  th:last-child,
  td:last-child {
    width: 1%;
    white-space: nowrap;
  }
`;

const ScheduleCell = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const ScheduleLine = styled.span<{ $muted?: boolean }>`
  color: ${({ $muted }) => ($muted ? "#64706c" : "#050505")};
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const StatusSelect = styled(Select)`
  max-width: 10rem;
`;

const KeywordInput = styled(TextInput)`
  max-width: 16rem;
`;

const PaginationNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacing.space8};
  margin-top: auto;
  padding-top: ${spacing.space12};
  flex-shrink: 0;
`;

const PageArrowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e6e9e7;
  border-radius: 999px;
  background: ${colors.white};
  color: #64706c;
  font-family: inherit;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    border-color: #88cd5a;
    background: #f5fff0;
    color: #5eb63a;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
`;

const PageIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.75rem;
  padding: 0.375rem 0.625rem;
  border-radius: 999px;
  background: #f4f6f5;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;
