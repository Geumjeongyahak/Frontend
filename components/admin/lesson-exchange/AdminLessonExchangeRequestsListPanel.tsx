"use client";

import styled from "styled-components";
import {
  LESSON_EXCHANGE_ITEMS_PER_PAGE,
  LESSON_EXCHANGE_STATUS_OPTIONS,
  type LessonExchangeStatusFilter,
} from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import { LessonExchangeStatusBadge } from "@/components/admin/lesson-exchange/LessonExchangeStatusBadge";
import type { AdminLessonExchangeRequestsViewModel } from "@/components/admin/lesson-exchange/useAdminLessonExchangeRequests";
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

const TABLE_HEADER_HEIGHT = "2.5rem";
const TABLE_ROW_HEIGHT = "3.75rem";

type AdminLessonExchangeRequestsListPanelProps = {
  viewModel: AdminLessonExchangeRequestsViewModel;
};

export function AdminLessonExchangeRequestsListPanel({
  viewModel,
}: AdminLessonExchangeRequestsListPanelProps) {
  const {
    statusFilter,
    keywordInput,
    setKeywordInput,
    handleSearch,
    handleStatusFilterChange,
    lessonExchangeRequestsQuery,
    sortedRequests,
    selectedRequestId,
    selectLessonExchangeRequest,
    currentPage,
    totalPages,
    goToPrevPage,
    goToNextPage,
  } = viewModel;
  const isLoading = lessonExchangeRequestsQuery.isLoading;
  const isError = lessonExchangeRequestsQuery.isError;
  const isEmpty = !isLoading && !isError && sortedRequests.length === 0;

  return (
    <SectionCard>
      <SectionTitle>수업 교환 요청 목록</SectionTitle>
      <ControlRow
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <StatusSelect
          value={statusFilter}
          onChange={(event) =>
            handleStatusFilterChange(event.target.value as LessonExchangeStatusFilter)
          }
        >
          {LESSON_EXCHANGE_STATUS_OPTIONS.map((option) => (
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
              <LoadingSpinner label="수업 교환 요청 목록 불러오는 중" />
            </ListOverlay>
          ) : null}
          {isError ? (
            <ListOverlay role="alert">
              <ListOverlayMessage>수업 교환 요청 목록을 불러오지 못했습니다.</ListOverlayMessage>
            </ListOverlay>
          ) : null}
          {isEmpty ? (
            <ListOverlay>
              <ListOverlayMessage>수업 교환 요청이 없습니다.</ListOverlayMessage>
            </ListOverlay>
          ) : null}

          <LessonExchangeListTable>
            <thead>
              <tr>
                <th>제목</th>
                <th>분반</th>
                <th>요청자</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((item) => (
                <LessonExchangeTableRow
                  key={item.id}
                  $selected={item.id === selectedRequestId}
                  onClick={() => selectLessonExchangeRequest(item)}
                >
                  <td>{item.title ?? "-"}</td>
                  <td>{item.classroomName ?? "-"}</td>
                  <td>{item.requestedByName ?? "-"}</td>
                  <td>
                    <LessonExchangeStatusBadge status={item.status} />
                  </td>
                </LessonExchangeTableRow>
              ))}
            </tbody>
          </LessonExchangeListTable>
        </TableViewport>

        <PaginationNav aria-label="페이지 이동">
          <PageArrowButton
            type="button"
            aria-label="이전 페이지"
            disabled={currentPage <= 1 || lessonExchangeRequestsQuery.isFetching}
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
            disabled={currentPage >= totalPages || lessonExchangeRequestsQuery.isFetching}
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
    ${TABLE_HEADER_HEIGHT} + ${LESSON_EXCHANGE_ITEMS_PER_PAGE} * ${TABLE_ROW_HEIGHT} + 2.75rem
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

const LessonExchangeTableRow = styled.tr<{ $selected: boolean }>`
  height: ${TABLE_ROW_HEIGHT};
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : "transparent")};
`;

const LessonExchangeListTable = styled(Table)`
  th,
  td {
    vertical-align: middle;
  }

  thead tr {
    height: ${TABLE_HEADER_HEIGHT};
  }

  tbody tr {
    height: ${TABLE_ROW_HEIGHT};
  }

  th:last-child,
  td:last-child {
    width: 1%;
    white-space: nowrap;
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
