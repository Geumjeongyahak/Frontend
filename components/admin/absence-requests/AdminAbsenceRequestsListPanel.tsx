"use client";

import { type MouseEvent } from "react";
import styled from "styled-components";
import { AdminAbsenceRequestsDetailPanel } from "@/components/admin/absence-requests/AdminAbsenceRequestsDetailPanel";
import {
  ABSENCE_ITEMS_PER_PAGE,
  ABSENCE_STATUS_OPTIONS,
  formatAbsenceDate,
  formatAbsenceStatus,
  type AbsenceStatusFilter,
} from "@/components/admin/absence-requests/absenceRequestConstants";
import type { AdminAbsenceRequestsViewModel } from "@/components/admin/absence-requests/useAdminAbsenceRequests";
import {
  ControlRow,
  DataState,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  Select,
  Table,
  TablePaddingRows,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, layout, spacing, typography } from "@/styles/tokens";

type AdminAbsenceRequestsListPanelProps = Pick<
  AdminAbsenceRequestsViewModel,
  | "statusFilter"
  | "keywordInput"
  | "handleKeywordInputChange"
  | "handleSearch"
  | "handleStatusFilterChange"
  | "absenceRequestsQuery"
  | "sortedRequests"
  | "selectedAbsenceId"
  | "selectedAbsence"
  | "selectAbsence"
  | "resetSelection"
  | "currentPage"
  | "totalPages"
  | "goToPrevPage"
  | "goToNextPage"
  | "goToPage"
  | "rejectNote"
  | "setRejectNote"
  | "handleApprove"
  | "handleReject"
  | "isActionPending"
>;

export function AdminAbsenceRequestsListPanel({
  statusFilter,
  keywordInput,
  handleKeywordInputChange,
  handleSearch,
  handleStatusFilterChange,
  absenceRequestsQuery,
  sortedRequests,
  selectedAbsenceId,
  selectedAbsence,
  selectAbsence,
  resetSelection,
  currentPage,
  totalPages,
  goToPrevPage,
  goToNextPage,
  goToPage,
  rejectNote,
  setRejectNote,
  handleApprove,
  handleReject,
  isActionPending,
}: AdminAbsenceRequestsListPanelProps) {
  const isLoading = absenceRequestsQuery.isLoading;
  const isError = absenceRequestsQuery.isError;
  const isEmpty = !isLoading && !isError && sortedRequests.length === 0;
  const isDetailOpen = selectedAbsenceId !== null;

  function handleListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedRequestRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedRequestRow) {
      resetSelection();
    }
  }

  return (
    <AbsenceListSection $isPanelOpen={isDetailOpen} onClick={handleListSectionClick}>
      <SectionHeaderRow>
        <SectionTitle>결강 요청 목록</SectionTitle>
        <HeaderHeightSpacer aria-hidden="true" />
      </SectionHeaderRow>

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
          placeholder="반 or 제목 or 내용 or 작성자 검색"
          onChange={(event) => handleKeywordInputChange(event.target.value)}
        />
      </ControlRow>

      <AbsenceListFrame>
        <DataState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          loadingLabel="결강 요청 목록 불러오는 중"
          errorLabel="결강 요청 목록을 불러오지 못했습니다."
          emptyLabel="결강 요청이 없습니다."
        >
          <AbsenceListTable>
            <thead>
              <tr>
                <th>제목</th>
                <th>분반</th>
                <th>수업 예정 일자</th>
                <th>요청자</th>
                <th>상태</th>
                <th>작성 일자</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((item) => (
                <tr
                  key={item.id ?? `${item.title}-${item.createdAt}`}
                  onClick={() => selectAbsence(item)}
                >
                  <td>{item.title ?? "-"}</td>
                  <td>{item.classroomName ?? "-"}</td>
                  <td>{formatAbsenceDate(item.lessonDate)}</td>
                  <td>{item.requestedByName ?? "-"}</td>
                  <td>{formatAbsenceStatus(item.status)}</td>
                  <td>{formatAbsenceDate(item.createdAt)}</td>
                </tr>
              ))}
              <TablePaddingRows
                columnCount={6}
                visibleRowCount={sortedRequests.length}
                padTo={ABSENCE_ITEMS_PER_PAGE}
                keyPrefix="admin-absence-requests"
              />
            </tbody>
          </AbsenceListTable>
        </DataState>
      </AbsenceListFrame>

      <PaginationNav aria-label="페이지 이동">
        <PageArrowButton
          type="button"
          aria-label="이전 페이지"
          disabled={currentPage <= 1 || absenceRequestsQuery.isFetching}
          onClick={goToPrevPage}
        >
          ◀
        </PageArrowButton>
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <PageNumberButton
              key={pageNumber}
              type="button"
              $isActive={pageNumber === currentPage}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              onClick={() => goToPage(pageNumber)}
            >
              {pageNumber}
            </PageNumberButton>
          );
        })}
        <PageArrowButton
          type="button"
          aria-label="다음 페이지"
          disabled={currentPage >= totalPages || absenceRequestsQuery.isFetching}
          onClick={goToNextPage}
        >
          ▶
        </PageArrowButton>
      </PaginationNav>

      {isDetailOpen ? (
        <>
          <PanelBackdrop aria-hidden="true" />
          <SlidePanel aria-label="결강 요청 상세/처리" onClick={(event) => event.stopPropagation()}>
            <PanelHeader>
              <ClosePanelButton
                type="button"
                aria-label="결강 요청 상세 닫기"
                onClick={resetSelection}
              >
                <CloseIcon aria-hidden="true" />
              </ClosePanelButton>
              <SectionTitle>결강 요청 상세/처리</SectionTitle>
            </PanelHeader>
            <AdminAbsenceRequestsDetailPanel
              selectedAbsence={selectedAbsence}
              rejectNote={rejectNote}
              setRejectNote={setRejectNote}
              handleApprove={handleApprove}
              handleReject={handleReject}
              isActionPending={isActionPending}
            />
          </SlidePanel>
        </>
      ) : null}
    </AbsenceListSection>
  );
}

const AbsenceListSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
  position: relative;
  display: grid;
  align-content: start;
  overflow: hidden;
  box-shadow: ${({ $isPanelOpen }) => ($isPanelOpen ? "inset 0 0 0 1px #e6e9e7" : "none")};
`;

const HeaderHeightSpacer = styled.span`
  display: inline-flex;
  width: 0;
  min-height: 2.25rem;
`;

const AbsenceListFrame = styled.div`
  position: relative;
  min-height: 22.35rem;
  border-radius: 0.5rem;

  @media (min-width: 120rem) {
    min-height: 22.5rem;
  }
`;

const AbsenceListTable = styled(Table)`
  th,
  td {
    vertical-align: middle;
  }
`;

const StatusSelect = styled(Select)`
  width: 9.5rem;
  min-width: 9.5rem;
  max-width: 9.5rem;
  flex: 0 0 9.5rem;
  height: 2.375rem;
  min-height: 2.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  appearance: none;
`;

const KeywordInput = styled(TextInput)`
  flex: 1 1 auto;
  max-width: none;
`;

const PaginationNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: ${spacing.space16};
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    margin-top: ${spacing.space28};
    font-size: ${typography.fontSize16};
  }
`;

const PageArrowButton = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const PageNumberButton = styled.button<{ $isActive?: boolean }>`
  border: none;
  background: transparent;
  padding: 0;
  color: ${({ $isActive }) => ($isActive ? "#111" : "#9a9a9a")};
  font: inherit;
  font-size: ${typography.fontSize16};
  font-weight: ${({ $isActive }) => ($isActive ? 700 : 400)};
  cursor: pointer;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadeAbsencePanelBackdropIn 0.18s ease-out both;

  @keyframes fadeAbsencePanelBackdropIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
`;

const SlidePanel = styled.aside`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  display: grid;
  align-content: start;
  gap: ${spacing.space12};
  width: 75%;
  max-height: 100%;
  min-height: 100%;
  overflow-y: auto;
  border-left: 1px solid #e6e9e7;
  background-color: ${colors.white};
  padding: 1.25rem 1rem;
  box-shadow: -1rem 0 2rem rgba(17, 24, 39, 0.12);
  animation: slideAbsencePanelIn 0.22s ease-out both;

  @keyframes slideAbsencePanelIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 88%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  ${SectionTitle} {
    margin-bottom: 0;
  }
`;

const CloseIcon = styled.span`
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  background-color: currentColor;
  mask: url("/chevron_right.svg") center / contain no-repeat;
  -webkit-mask: url("/chevron_right.svg") center / contain no-repeat;
`;

const ClosePanelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: transparent;
  color: #1f2b28;
  cursor: pointer;

  &:hover {
    background-color: #f5fff0;
    color: #5eb63a;
  }
`;
