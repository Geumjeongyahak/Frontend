"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  approveAbsenceRequest,
  getAbsenceRequests,
  rejectAbsenceRequest,
} from "@/api/request/request.api";
import type {
  AbsenceRequestResponseDto,
  AbsenceRequestStatus,
  RequestStatusQueryParamsDto,
} from "@/api/request/request.dto";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  PrimaryButton,
  SectionCard,
  SectionDescription,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TextArea,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { queryKeys } from "@/lib/queryKeys";
import { colors, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const ITEMS_PER_PAGE = 10;

const ABSENCE_STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "승인 대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELLED", label: "취소" },
  { value: "EXPIRED", label: "만료" },
] as const;

type AbsenceStatusFilter = (typeof ABSENCE_STATUS_OPTIONS)[number]["value"];

function formatAbsenceStatus(status?: AbsenceRequestStatus) {
  return ABSENCE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "-";
}

function formatDate(value?: string) {
  return value ? formatUtcToKstShortDate(value) : "-";
}

function StatusBadge({ status }: { status?: AbsenceRequestStatus }) {
  if (!status) return <>-</>;

  return <AbsenceStatusBadge $status={status}>{formatAbsenceStatus(status)}</AbsenceStatusBadge>;
}

const AbsenceStatusBadge = styled.span<{ $status: AbsenceRequestStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  color: ${({ $status }) => {
    switch ($status) {
      case "APPROVED":
        return "#3DA75C";
      case "REJECTED":
        return "#DA3A30";
      case "CANCELLED":
        return "#64706C";
      case "EXPIRED":
        return "#B45F06";
      case "PENDING":
      default:
        return "#E5AD34";
    }
  }};

  background: ${({ $status }) => {
    switch ($status) {
      case "APPROVED":
        return "#DCF4EA";
      case "REJECTED":
        return "#FDEBE9";
      case "CANCELLED":
        return "#EEF0EF";
      case "EXPIRED":
        return "#FFF3E0";
      case "PENDING":
      default:
        return "#FFF6DB";
    }
  }};
`;

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

const RejectNoteTextArea = styled(TextArea)`
  resize: none;
  font-weight: 500;
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

const DetailStack = styled.div`
  display: grid;
  gap: ${spacing.space20};
`;

const DetailFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space16};
`;

const DetailField = styled.div<{ $fullWidth?: boolean; $compact?: boolean }>`
  display: grid;
  gap: ${({ $compact }) => ($compact ? spacing.space4 : spacing.space8)};
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
`;

const DetailFieldLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const DetailFieldValue = styled.div`
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: break-word;
`;

const DetailTextBox = styled.div`
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background: #fafbfa;
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
  word-break: break-word;
`;

const DetailNoteBox = styled(DetailTextBox)`
  border-color: #f3c6c2;
  background: #fff7f6;
  color: #1f2b28;
`;

const CompactDivider = styled.hr`
  width: 100%;
  margin: ${spacing.space8} 0;
  border: 0;
  border-top: 1px solid #e6e9e7;
`;

const ReasonSection = styled.section`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
`;

const ActionSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  margin-top: -${spacing.space12};
`;

const ProcessedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: #dcf4ea;
  color: #3da75c;
  font-size: ${typography.fontSize13};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

export function AdminAbsenceRequestsSection() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AbsenceStatusFilter>("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const absenceRequestsQuery = useQuery({
    queryKey: [...queryKeys.requests.absenceList(), statusFilter, keyword, page, ITEMS_PER_PAGE],
    queryFn: () => {
      const query: RequestStatusQueryParamsDto = {
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: ITEMS_PER_PAGE,
      };

      if (statusFilter) {
        query.status = statusFilter as RequestStatusQueryParamsDto["status"];
      }

      return getAbsenceRequests(query);
    },
  });

  const absenceRequests = absenceRequestsQuery.data?.content ?? [];
  const totalPages = Math.max(1, absenceRequestsQuery.data?.totalPages ?? 1);
  const currentPage = page <= totalPages ? page : totalPages;

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.requests.absenceList() });
  };

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => approveAbsenceRequest({ requestId }),
    onMutate: (requestId) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateList();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, note }: { requestId: number; note: string }) =>
      rejectAbsenceRequest({ requestId }, { note }),
    onMutate: ({ requestId }) => {
      setPendingActionId(requestId);
    },
    onSuccess: () => {
      invalidateList();
      setRejectNote("");
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const sortedRequests = useMemo(
    () =>
      [...absenceRequests].sort((a, b) => {
        const aTime = new Date(a.createdAt ?? a.lessonDate ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? b.lessonDate ?? 0).getTime();
        return bTime - aTime;
      }),
    [absenceRequests],
  );

  const selectedAbsence = useMemo(
    () => sortedRequests.find((item) => item.id === selectedAbsenceId) ?? null,
    [sortedRequests, selectedAbsenceId],
  );

  const handleSearch = () => {
    setKeyword(keywordInput);
    setPage(1);
    setSelectedAbsenceId(null);
    setRejectNote("");
  };

  const selectAbsence = (item: AbsenceRequestResponseDto) => {
    if (!item.id) return;
    setSelectedAbsenceId(item.id);
    setRejectNote("");
  };

  const handleApprove = () => {
    const requestId = selectedAbsence?.id;
    if (!requestId || approveMutation.isPending) return;
    approveMutation.mutate(requestId);
  };

  const handleReject = () => {
    const requestId = selectedAbsence?.id;
    if (!requestId || rejectMutation.isPending) return;

    const note = rejectNote.trim();
    if (!note) return;

    rejectMutation.mutate({ requestId, note });
  };

  const isActionPending =
    pendingActionId === selectedAbsenceId && (approveMutation.isPending || rejectMutation.isPending);

  return (
    <TwoColumnGrid>
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
            onChange={(event) => {
              setStatusFilter(event.target.value as AbsenceStatusFilter);
              setPage(1);
              setSelectedAbsenceId(null);
              setRejectNote("");
            }}
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
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{formatDate(item.createdAt)}</td>
                </AbsenceTableRow>
              ))}
            </tbody>
          </AbsenceListTable>

          <PaginationNav aria-label="페이지 이동">
            <PageArrowButton
              type="button"
              aria-label="이전 페이지"
              disabled={currentPage <= 1 || absenceRequestsQuery.isFetching}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
                setSelectedAbsenceId(null);
                setRejectNote("");
              }}
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
              onClick={() => {
                setPage((current) => Math.min(totalPages, current + 1));
                setSelectedAbsenceId(null);
                setRejectNote("");
              }}
            >
              ›
            </PageArrowButton>
          </PaginationNav>
        </DataState>
      </SectionCard>

      <SectionCard>
        <SectionTitle>결석 요청 상세/처리</SectionTitle>
        <SectionDescription>
          선택한 결석 요청의 상세 정보를 확인하고 승인 또는 반려 처리를 수행합니다.
        </SectionDescription>

        <DataState
          isLoading={false}
          isError={false}
          isEmpty={!selectedAbsence}
          loadingLabel=""
          errorLabel=""
          emptyLabel="결석 요청을 선택하세요."
        >
          <DetailStack>
            <DetailFields>
              <DetailField $fullWidth>
                <DetailFieldLabel>제목</DetailFieldLabel>
                <DetailFieldValue>{selectedAbsence?.title ?? "-"}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>분반</DetailFieldLabel>
                <DetailFieldValue>{selectedAbsence?.classroomName ?? "-"}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>수업일</DetailFieldLabel>
                <DetailFieldValue>{formatDate(selectedAbsence?.lessonDate)}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>요청자</DetailFieldLabel>
                <DetailFieldValue>{selectedAbsence?.requestedByName ?? "-"}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>상태</DetailFieldLabel>
                <DetailFieldValue>
                  <StatusBadge status={selectedAbsence?.status} />
                </DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>만료 시각</DetailFieldLabel>
                <DetailFieldValue>{formatDate(selectedAbsence?.expiresAt)}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>요청일</DetailFieldLabel>
                <DetailFieldValue>{formatDate(selectedAbsence?.createdAt)}</DetailFieldValue>
              </DetailField>
              <DetailField>
                <DetailFieldLabel>처리일</DetailFieldLabel>
                <DetailFieldValue>{formatDate(selectedAbsence?.approvalAt)}</DetailFieldValue>
              </DetailField>
            </DetailFields>

            <ReasonSection>
              <CompactDivider />

              <DetailField $fullWidth $compact>
                <DetailFieldLabel>사유</DetailFieldLabel>
                <DetailTextBox>{selectedAbsence?.reason?.trim() || "-"}</DetailTextBox>
              </DetailField>

              {selectedAbsence?.status === "REJECTED" ? (
                <DetailField $fullWidth $compact>
                  <DetailFieldLabel>거절 사유</DetailFieldLabel>
                  <DetailNoteBox>{selectedAbsence.note?.trim() || "-"}</DetailNoteBox>
                </DetailField>
              ) : null}

              <CompactDivider />
            </ReasonSection>

            <ActionSection>
              <DetailFieldLabel>처리</DetailFieldLabel>
              {selectedAbsence?.approvalAt ? (
                <ProcessedBadge>처리 완료</ProcessedBadge>
              ) : (
                <FormGrid onSubmit={(event) => event.preventDefault()}>
                  <RejectNoteTextArea
                    value={rejectNote}
                    placeholder="거절 사유를 입력해 주세요."
                    disabled={isActionPending}
                    onChange={(event) => setRejectNote(event.target.value)}
                  />
                  <ButtonRow>
                    <PrimaryButton type="button" disabled={isActionPending} onClick={handleApprove}>
                      승인
                    </PrimaryButton>
                    <DangerButton
                      type="button"
                      disabled={isActionPending || !rejectNote.trim()}
                      onClick={handleReject}
                    >
                      거절
                    </DangerButton>
                  </ButtonRow>
                </FormGrid>
              )}
            </ActionSection>
          </DetailStack>
        </DataState>
      </SectionCard>
    </TwoColumnGrid>
  );
}
