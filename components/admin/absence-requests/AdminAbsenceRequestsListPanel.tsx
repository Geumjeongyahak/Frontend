"use client";

import styled from "styled-components";
import {
  ABSENCE_STATUS_OPTIONS,
  formatAbsenceDate,
  type AbsenceStatusFilter,
} from "@/components/admin/absence-requests/absenceRequestConstants";
import { AbsenceStatusBadge } from "@/components/admin/absence-requests/AbsenceStatusBadge";
import type { AdminAbsenceRequestsViewModel } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import {
  ControlRow,
  DataState,
  SectionCard,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, spacing, typography } from "@/styles/tokens";

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
  return (
    <SectionCard>
      <SectionTitle>결석 요청 목록</SectionTitle>
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

      <DataState
        isLoading={absenceRequestsQuery.isLoading}
        isError={absenceRequestsQuery.isError}
        isEmpty={sortedRequests.length === 0}
        loadingLabel="결석 요청 목록 불러오는 중"
        errorLabel="결석 요청 목록을 불러오지 못했습니다."
        emptyLabel="결석 요청이 없습니다."
      >
        <AbsenceListTable>
          <thead>
            <tr>
              <th>제목</th>
              <th>분반</th>
              <th>요청자</th>
              <th>상태</th>
              <th>요청일</th>
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
                <td>{formatAbsenceDate(item.createdAt)}</td>
              </AbsenceTableRow>
            ))}
          </tbody>
        </AbsenceListTable>

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
      </DataState>
    </SectionCard>
  );
}

const AbsenceTableRow = styled.tr<{ $selected: boolean }>`
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : "transparent")};
`;

const AbsenceListTable = styled(Table)`
  th,
  td {
    vertical-align: middle;
  }
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
  margin-top: ${spacing.space12};
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
