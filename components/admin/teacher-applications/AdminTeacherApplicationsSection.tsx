"use client";

import { type MouseEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  approveTeacherApplication,
  getTeacherApplication,
  getTeacherApplications,
  rejectTeacherApplication,
} from "@/api/teacherApplication/teacherApplication.api";
import type { TeacherApplicationResponseDto, TeacherApplicationStatus } from "@/api/teacherApplication/teacherApplication.dto";
import { updateUser } from "@/api/user/user.api";
import {
  formatTeacherApplicationPreference,
  formatTeacherApplicationStatus,
  getTeacherApplicationFields,
} from "@/components/apply/teacherApplicationUtils";
import {
  ButtonRow,
  ControlRow,
  DangerButton,
  DataState,
  FormGrid,
  List,
  ListItem,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  Select,
  SmallButton,
  Table,
  TablePaddingRows,
  TextArea,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const APPLICATIONS_PER_PAGE = 10;

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getApprovalPayload(application?: TeacherApplicationResponseDto) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  return {
    assignedSubjectIds:
      typeof application?.preferredSubjectId === "number" ? [application.preferredSubjectId] : [],
    teacherStartAt: formatDateInput(today),
    teacherEndAt: formatDateInput(nextYear),
    note: "관리자 승인",
  };
}

export function AdminTeacherApplicationsSection() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TeacherApplicationStatus | "">("");
  const [keyword, setKeyword] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, search: "" });
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const isDetailOpen = selectedApplicationId !== null;

  const listQuery = useQuery({
    queryKey: queryKeys.teacherApplications.adminList({
      keyword: keyword.trim() || undefined,
      status: statusFilter || undefined,
    }),
    queryFn: () =>
      getTeacherApplications({
        keyword: keyword.trim() || undefined,
        status: statusFilter || undefined,
      }),
  });

  const detailQuery = useQuery({
    queryKey: queryKeys.teacherApplications.adminDetail(selectedApplicationId ?? 0),
    queryFn: () => getTeacherApplication({ applicationId: selectedApplicationId! }),
    enabled: selectedApplicationId !== null,
  });

  const applications = useMemo(() => listQuery.data?.content ?? [], [listQuery.data?.content]);
  const totalPages = Math.max(1, Math.ceil(applications.length / APPLICATIONS_PER_PAGE));
  const paginationKey = `${statusFilter}:${keyword}`;
  const requestedPage = pagination.search === paginationKey ? pagination.page : 1;
  const safeCurrentPage = Math.min(requestedPage, totalPages);
  const pagedApplications = applications.slice(
    (safeCurrentPage - 1) * APPLICATIONS_PER_PAGE,
    safeCurrentPage * APPLICATIONS_PER_PAGE,
  );
  const selectedApplication = detailQuery.data;
  const fields = getTeacherApplicationFields(selectedApplication);
  const canApprove =
    selectedApplication?.status === "PENDING" &&
    typeof selectedApplication.id === "number" &&
    typeof selectedApplication.applicantId === "number";

  const approveMutation = useMutation({
    mutationFn: async (application: TeacherApplicationResponseDto) => {
      if (typeof application.id !== "number" || typeof application.applicantId !== "number") {
        throw new Error("승인에 필요한 신청자 정보가 없습니다.");
      }

      await approveTeacherApplication(
        { applicationId: application.id },
        getApprovalPayload(application),
      );

      await updateUser(
        { userId: application.applicantId },
        {
          role: "VOLUNTEER",
        },
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.adminList() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.adminDetail(selectedApplicationId ?? 0) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
      ]);
      setConfirmAction(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (application: TeacherApplicationResponseDto) => {
      if (typeof application.id !== "number") {
        throw new Error("반려에 필요한 신청 정보가 없습니다.");
      }

      await rejectTeacherApplication(
        { applicationId: application.id },
        { note: rejectNote.trim() || "관리자 반려" },
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.adminList() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.teacherApplications.adminDetail(selectedApplicationId ?? 0),
        }),
      ]);
      setConfirmAction(null);
      setIsRejecting(false);
      setRejectNote("");
    },
  });

  function closeDetail() {
    setSelectedApplicationId(null);
    setRejectNote("");
    setIsRejecting(false);
    setConfirmAction(null);
  }

  function selectApplication(item: TeacherApplicationResponseDto) {
    if (!item.id) {
      return;
    }

    setSelectedApplicationId(item.id);
    setRejectNote("");
    setIsRejecting(false);
    setConfirmAction(null);
  }

  function handleSearchChange(value: string) {
    setKeyword(value);
    setPagination({ page: 1, search: `${statusFilter}:${value}` });

    if (isDetailOpen) {
      closeDetail();
    }
  }

  function handleStatusChange(value: TeacherApplicationStatus | "") {
    setStatusFilter(value);
    setPagination({ page: 1, search: `${value}:${keyword}` });

    if (isDetailOpen) {
      closeDetail();
    }
  }

  function handleApprove() {
    if (!selectedApplication || !canApprove || approveMutation.isPending) {
      return;
    }

    approveMutation.mutate(selectedApplication);
  }

  function handleReject() {
    if (
      !selectedApplication ||
      selectedApplication.status !== "PENDING" ||
      rejectMutation.isPending ||
      !rejectNote.trim()
    ) {
      return;
    }

    rejectMutation.mutate(selectedApplication);
  }

  function handleListSectionClick(event: MouseEvent<HTMLElement>) {
    if (!isDetailOpen) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const isLeftVisibleArea = event.clientX <= bounds.left + bounds.width * 0.25;
    const clickedApplicationRow = (event.target as HTMLElement).closest("tbody tr");

    if (isLeftVisibleArea && !clickedApplicationRow) {
      closeDetail();
    }
  }

  function runConfirmedAction() {
    if (confirmAction === "approve") {
      handleApprove();
      return;
    }

    if (confirmAction === "reject") {
      handleReject();
    }
  }

  return (
    <ApplicationsSection $isPanelOpen={isDetailOpen} onClick={handleListSectionClick}>
      <SectionHeaderRow>
        <SectionTitle>교사 신청 목록</SectionTitle>
        <HeaderHeightSpacer aria-hidden="true" />
      </SectionHeaderRow>

      <ControlRow
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={(event) => handleStatusChange(event.target.value as TeacherApplicationStatus | "")}
          aria-label="교사 신청 상태 필터"
        >
          <option value="">전체</option>
          <option value="PENDING">대기</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">반려</option>
          <option value="CANCELLED">취소</option>
        </FilterSelect>
        <TextInput
          value={keyword}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="이름, 이메일, 연락처 검색"
        />
      </ControlRow>

      <ApplicationListFrame>
        <DataState
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          isEmpty={applications.length === 0}
          loadingLabel="교사 신청 목록 불러오는 중"
          errorLabel="교사 신청 목록을 불러오지 못했습니다."
          emptyLabel="교사 신청 내역이 없습니다."
        >
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>연락처</th>
                <th>희망 수업</th>
                <th>상태</th>
                <th>신청일</th>
              </tr>
            </thead>
            <tbody>
              {pagedApplications.map((item) => (
                <tr key={item.id} onClick={() => selectApplication(item)}>
                  <td>{item.id ?? "-"}</td>
                  <td>{item.applicantName ?? "-"}</td>
                  <td>{item.applicantPhoneNumber ?? "-"}</td>
                  <td>{formatTeacherApplicationPreference(item)}</td>
                  <td>{formatTeacherApplicationStatus(item.status)}</td>
                  <td>{formatUtcToKstShortDate(item.createdAt) || "-"}</td>
                </tr>
              ))}
              <TablePaddingRows
                columnCount={6}
                visibleRowCount={pagedApplications.length}
                padTo={APPLICATIONS_PER_PAGE}
                keyPrefix="admin-teacher-applications"
              />
            </tbody>
          </Table>
        </DataState>
      </ApplicationListFrame>

      <Pagination aria-label="페이지 이동">
        <PageArrowButton
          type="button"
          aria-label="이전 페이지"
          disabled={safeCurrentPage === 1}
          onClick={() =>
            setPagination({
              page: Math.max(1, safeCurrentPage - 1),
              search: paginationKey,
            })
          }
        >
          ◀
        </PageArrowButton>
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <PageNumberButton
              key={pageNumber}
              type="button"
              $isActive={pageNumber === safeCurrentPage}
              aria-current={pageNumber === safeCurrentPage ? "page" : undefined}
              onClick={() => setPagination({ page: pageNumber, search: paginationKey })}
            >
              {pageNumber}
            </PageNumberButton>
          );
        })}
        <PageArrowButton
          type="button"
          aria-label="다음 페이지"
          disabled={safeCurrentPage === totalPages}
          onClick={() =>
            setPagination({
              page: Math.min(totalPages, safeCurrentPage + 1),
              search: paginationKey,
            })
          }
        >
          ▶
        </PageArrowButton>
      </Pagination>

      {isDetailOpen ? (
        <>
          <PanelBackdrop aria-hidden="true" />
          <SlidePanel aria-label="교사 신청 상세" onClick={(event) => event.stopPropagation()}>
            <PanelHeader>
              <ClosePanelButton type="button" aria-label="교사 신청 상세 닫기" onClick={closeDetail}>
                <CloseIcon aria-hidden="true" />
              </ClosePanelButton>
              <SectionTitle>교사 신청 상세</SectionTitle>
            </PanelHeader>

            <DataState
              isLoading={detailQuery.isLoading}
              isError={detailQuery.isError}
              isEmpty={!selectedApplicationId}
              loadingLabel="교사 신청 상세 불러오는 중"
              errorLabel="교사 신청 상세를 불러오지 못했습니다."
              emptyLabel="교사 신청을 선택하세요."
            >
              <PanelContent>
                <DetailBlock>
                  <DetailBlockTitle>신청 정보</DetailBlockTitle>
                  <List>
                    <ListItem>
                      <span>상태</span>
                      <span>{formatTeacherApplicationStatus(selectedApplication?.status)}</span>
                    </ListItem>
                    <ListItem>
                      <span>신청일</span>
                      <span>{formatUtcToKstShortDate(selectedApplication?.createdAt) || "-"}</span>
                    </ListItem>
                    <ListItem>
                      <span>검토자</span>
                      <span>{selectedApplication?.reviewedByName ?? "-"}</span>
                    </ListItem>
                    <ListItem>
                      <span>검토 메모</span>
                      <span>{selectedApplication?.reviewNote?.trim() || "-"}</span>
                    </ListItem>
                  </List>
                </DetailBlock>

                <DetailBlock>
                  <DetailBlockTitle>지원서 내용</DetailBlockTitle>
                  <DetailFields>
                    {fields.map((field) => (
                      <FieldCard key={field.label}>
                        <FieldLabel>{field.label}</FieldLabel>
                        <FieldValue>{field.value}</FieldValue>
                      </FieldCard>
                    ))}
                  </DetailFields>
                </DetailBlock>

                {selectedApplication?.status === "PENDING" ? (
                  <ActionBlock>
                    <FormGrid onSubmit={(event) => event.preventDefault()}>
                      {isRejecting ? (
                        <>
                          <ReviewNoteLabel>검토 메모</ReviewNoteLabel>
                          <RejectNoteTextArea
                            value={rejectNote}
                            placeholder="검토 메모를 입력해 주세요."
                            disabled={rejectMutation.isPending}
                            onChange={(event) => setRejectNote(event.target.value)}
                            autoFocus
                          />
                        </>
                      ) : null}
                      <ButtonRow>
                        {isRejecting ? (
                          <>
                            <DangerButton
                              type="button"
                              disabled={rejectMutation.isPending || !rejectNote.trim()}
                              onClick={() => setConfirmAction("reject")}
                            >
                              확인
                            </DangerButton>
                            <SmallButton
                              type="button"
                              disabled={rejectMutation.isPending}
                              onClick={() => {
                                setIsRejecting(false);
                                setRejectNote("");
                              }}
                            >
                              취소
                            </SmallButton>
                          </>
                        ) : (
                          <>
                            <ApproveButton
                              type="button"
                              disabled={!canApprove || approveMutation.isPending}
                              onClick={() => setConfirmAction("approve")}
                            >
                              승인
                            </ApproveButton>
                            <DangerButton
                              type="button"
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => setIsRejecting(true)}
                            >
                              반려
                            </DangerButton>
                          </>
                        )}
                      </ButtonRow>
                    </FormGrid>
                  </ActionBlock>
                ) : null}
              </PanelContent>
            </DataState>
          </SlidePanel>
        </>
      ) : null}

      {confirmAction ? (
        <ModalBackdrop onMouseDown={() => setConfirmAction(null)}>
          <ConfirmDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-application-action-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ConfirmTitle id="teacher-application-action-confirm-title">교사 신청 처리</ConfirmTitle>
            <ConfirmMessage>
              {confirmAction === "approve" ? "승인하시겠습니까?" : "반려하시겠습니까?"}
            </ConfirmMessage>
            <ButtonRow>
              <ApproveButton
                type="button"
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={runConfirmedAction}
              >
                확인
              </ApproveButton>
              <SmallButton
                type="button"
                disabled={approveMutation.isPending || rejectMutation.isPending}
                onClick={() => setConfirmAction(null)}
              >
                취소
              </SmallButton>
            </ButtonRow>
          </ConfirmDialog>
        </ModalBackdrop>
      ) : null}
    </ApplicationsSection>
  );
}

const ApplicationsSection = styled(SectionCard)<{ $isPanelOpen: boolean }>`
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

const selectBase = `
  width: 9.5rem;
  min-width: 9.5rem;
  max-width: 9.5rem;
  flex: 0 0 9.5rem;
  min-height: 2.375rem;
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  padding: 0 2.5rem 0 ${spacing.space12};
  background-color: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%2364706C' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-position: right 0.875rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  appearance: none;
  outline: none;

  &:focus {
    border-color: ${colors.point};
  }
`;

const FilterSelect = styled(Select)`
  ${selectBase}
  height: 2.375rem;
`;

const ApplicationListFrame = styled.div`
  position: relative;
  min-height: 22.35rem;
  border-radius: 0.5rem;
`;

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: ${spacing.space16};
  font-size: ${typography.fontSize16};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
    margin-top: ${spacing.space28};
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
`;

const PanelBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  background-color: rgba(17, 24, 39, 0.18);
  pointer-events: none;
  animation: fadeTeacherApplicationPanelBackdropIn 0.18s ease-out both;

  @keyframes fadeTeacherApplicationPanelBackdropIn {
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
  animation: slideTeacherApplicationPanelIn 0.22s ease-out both;

  @keyframes slideTeacherApplicationPanelIn {
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

const PanelContent = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ActionBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space4};

  ${List} {
    margin: 0;
  }
`;

const DetailBlockTitle = styled.h3`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const DetailFields = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldCard = styled.div`
  display: grid;
  gap: ${spacing.space8};
  padding: ${spacing.space8};
  border: 1px solid #e6e9e7;
  border-radius: 0.375rem;
  background-color: ${colors.white};
`;

const FieldLabel = styled.strong`
  color: #1f2b28;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const FieldValue = styled.div`
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
`;

const ApproveButton = styled(SmallButton)`
  border-color: ${colors.point};
  color: ${colors.point};

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
    color: ${colors.point};
  }
`;

const RejectNoteTextArea = styled(TextArea)`
  min-height: 6rem;
  resize: none;
  font-weight: 500;
`;

const ReviewNoteLabel = styled.span`
  display: inline-flex;
  align-items: center;
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.space20};
  background-color: rgb(0 0 0 / 42%);
`;

const ConfirmDialog = styled.div`
  display: grid;
  gap: ${spacing.space16};
  width: min(100%, 24rem);
  max-height: calc(100vh - 2.5rem);
  overflow-y: auto;
  padding: ${spacing.space20};
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 18%);
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;
