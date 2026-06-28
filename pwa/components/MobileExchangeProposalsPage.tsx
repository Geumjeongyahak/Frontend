"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import dayjs from "dayjs";
import { IconCalendarMonth } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { getCurrentUser } from "@/api/user/user.api";
import {
  acceptLessonExchangeProposal,
  createLessonExchangeProposal,
  getLessonExchangeProposals,
  getLessonExchangeRequestDetail,
  updateLessonExchangeProposal,
  withdrawLessonExchangeProposal,
} from "@/api/lessonExchange/lessonExchange.api";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import { getAssignmentClassNames } from "@/pwa/requests/requestFormUtils";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { formatRequestStatus } from "@/utils/formatRequestStatus";

type MobileExchangeProposalsPageProps = {
  requestId: number;
};

function formatDetailDate(value?: string) {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YY.MM.DD") : "-";
}

function isCurrentUserRequest(
  requestedById: number | undefined,
  requestedByName: string | undefined,
  user: {
    id?: number;
    name?: string;
    nickname?: string;
    email?: string;
  } | null,
) {
  if (!user) {
    return false;
  }

  if (typeof requestedById === "number" && typeof user.id === "number") {
    return requestedById === user.id;
  }

  if (!requestedByName) {
    return false;
  }

  return [user.name, user.nickname, user.email].some(
    (value) => typeof value === "string" && value.length > 0 && value === requestedByName,
  );
}

function getProposalTypeLabel(proposal: {
  proposalType?: string;
  proposalScope?: string;
  lessonDate?: string;
}) {
  const proposalType = proposal.proposalType?.toUpperCase();
  const proposalScope = proposal.proposalScope?.toUpperCase();

  if (proposalType === "SUBSTITUTE" || proposalType === "SUBSTITUTION") return "대체";
  if (proposalType === "EXCHANGE") return "교환";
  if (proposalScope === "SUBSTITUTE" || proposalScope === "SUBSTITUTION") return "대체";
  if (proposalScope === "EXCHANGE") return "교환";

  return proposal.lessonDate ? "교환" : "대체";
}

function toIsoDateOnly(value?: string) {
  if (!value) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
}

function formatIsoDateToShort(value?: string) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YY.MM.DD") : "";
}

export default function MobileExchangeProposalsPage({
  requestId,
}: MobileExchangeProposalsPageProps) {
  const proposalLessonDateInputRef = useRef<HTMLInputElement>(null);
  const editingProposalLessonDateInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { status, user, refreshSession } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());
  const isAuthPending = status === "loading" || (status === "error" && hasStoredToken);
  const [proposalClassName, setProposalClassName] = useState("");
  const [proposalLessonDate, setProposalLessonDate] = useState("");
  const [proposalLessonDateText, setProposalLessonDateText] = useState("");
  const [proposalContent, setProposalContent] = useState("");
  const [editingProposalId, setEditingProposalId] = useState<number | null>(null);
  const [editingProposalLessonDate, setEditingProposalLessonDate] = useState("");
  const [editingProposalLessonDateText, setEditingProposalLessonDateText] = useState("");
  const [editingProposalContent, setEditingProposalContent] = useState("");

  const currentUserQuery = useQuery({
    queryKey: [...queryKeys.user.me(), "exchange-proposal-mobile", requestId],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (status === "error" && hasStoredToken) {
      refreshSession().catch(() => undefined);
    }
  }, [hasStoredToken, refreshSession, status]);

  const currentUser = currentUserQuery.data ?? user;
  const assignmentClassNames = getAssignmentClassNames(currentUser?.teacherAssignments);

  useEffect(() => {
    if (!proposalClassName && assignmentClassNames.length > 0) {
      setProposalClassName(assignmentClassNames[0]);
    }
  }, [assignmentClassNames, proposalClassName]);

  const requestDetailQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(requestId),
    queryFn: () => getLessonExchangeRequestDetail({ requestId }),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (!proposalClassName && assignmentClassNames.length === 0) {
      const fallbackClassName =
        currentUser?.classroom?.name?.trim() || requestDetailQuery.data?.classroomName?.trim() || "";

      if (fallbackClassName) {
        setProposalClassName(fallbackClassName);
      }
    }
  }, [
    assignmentClassNames,
    currentUser?.classroom?.name,
    proposalClassName,
    requestDetailQuery.data?.classroomName,
  ]);

  const proposalsQuery = useQuery({
    queryKey: queryKeys.requests.lessonExchangeProposals(requestId),
    queryFn: () => getLessonExchangeProposals({ requestId }),
    enabled: isAuthenticated,
    retry: false,
  });

  const createProposalMutation = useMutation({
    mutationFn: () => {
      const body = {
        content: proposalContent.trim(),
        ...(proposalLessonDate ? { lessonDate: proposalLessonDate } : {}),
      };

      return createLessonExchangeProposal({ requestId }, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(requestId),
      });
      setProposalLessonDate("");
      setProposalLessonDateText("");
      setProposalContent("");
      toast.success("교환 제안을 등록했습니다.");
    },
    onError: () => {
      toast.error("교환 제안 등록에 실패했습니다.");
    },
  });

  const acceptProposalMutation = useMutation({
    mutationFn: (proposalId: number) =>
      acceptLessonExchangeProposal({ requestId, proposalId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(requestId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(requestId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      toast.success("교환 제안을 수락했습니다.");
    },
    onError: () => {
      toast.error("교환 제안 수락에 실패했습니다.");
    },
  });

  const updateProposalMutation = useMutation({
    mutationFn: ({
      proposalId,
      lessonDate,
      content,
    }: {
      proposalId: number;
      lessonDate?: string;
      content: string;
    }) => {
      const body = {
        content,
        ...(lessonDate ? { lessonDate } : {}),
      };

      return updateLessonExchangeProposal({ requestId, proposalId }, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(requestId),
      });
      setEditingProposalId(null);
      setEditingProposalLessonDate("");
      setEditingProposalLessonDateText("");
      setEditingProposalContent("");
      toast.success("교환 제안을 수정했습니다.");
    },
    onError: () => {
      toast.error("교환 제안 수정에 실패했습니다.");
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: (proposalId: number) =>
      withdrawLessonExchangeProposal({ requestId, proposalId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(requestId),
      });
      setEditingProposalId(null);
      setEditingProposalLessonDate("");
      setEditingProposalLessonDateText("");
      setEditingProposalContent("");
      toast.success("교환 제안을 삭제했습니다.");
    },
    onError: () => {
      toast.error("교환 제안 삭제에 실패했습니다.");
    },
  });

  const request = requestDetailQuery.data;
  const isRequester = isCurrentUserRequest(
    request?.requestedById,
    request?.requestedByName,
    currentUser,
  );
  const proposalClassNameFallback =
    proposalClassName ||
    assignmentClassNames[0] ||
    currentUser?.classroom?.name?.trim() ||
    request?.classroomName?.trim() ||
    "담당 반 정보 없음";
  const proposals = proposalsQuery.data ?? [];
  const canShowProposalForm =
    !isRequester && request?.status === "APPROVED";
  const canSubmitProposal =
    canShowProposalForm &&
    proposalContent.trim().length > 0 &&
    !createProposalMutation.isPending;

  function canManageProposal(proposal: {
    proposedById?: number;
    status?: string | null;
  }) {
    return (
      isAuthenticated &&
      typeof currentUser?.id === "number" &&
      typeof proposal.proposedById === "number" &&
      currentUser.id === proposal.proposedById &&
      (proposal.status === "ACTIVE" || proposal.status == null)
    );
  }

  function handleProposalLessonDateChange(value: string) {
    setProposalLessonDate(value);
    setProposalLessonDateText(formatIsoDateToShort(value));
  }

  function openDatePicker(inputRef: React.RefObject<HTMLInputElement | null>) {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  }

  function startProposalEdit(proposal: {
    id?: number;
    lessonDate?: string;
    content?: string;
    proposedById?: number;
    status?: string | null;
  }) {
    if (!proposal.id || !canManageProposal(proposal)) {
      return;
    }

    setEditingProposalId(proposal.id);
    const lessonDate = toIsoDateOnly(proposal.lessonDate);
    setEditingProposalLessonDate(lessonDate);
    setEditingProposalLessonDateText(formatIsoDateToShort(lessonDate));
    setEditingProposalContent(proposal.content ?? "");
  }

  function cancelProposalEdit() {
    if (updateProposalMutation.isPending) {
      return;
    }

    setEditingProposalId(null);
    setEditingProposalLessonDate("");
    setEditingProposalLessonDateText("");
    setEditingProposalContent("");
  }

  function saveProposalEdit(proposalId: number) {
    const content = editingProposalContent.trim();

    if (!content) {
      toast.error("내용을 입력해 주세요.");
      return;
    }

    updateProposalMutation.mutate({
      proposalId,
      lessonDate: editingProposalLessonDate || undefined,
      content,
    });
  }

  function deleteProposal(proposalId: number) {
    if (!window.confirm("이 교환 제안을 삭제할까요?")) {
      return;
    }

    deleteProposalMutation.mutate(proposalId);
  }

  function acceptProposal(proposalId: number) {
    if (!window.confirm("이 교환 제안을 수락할까요?")) {
      return;
    }

    acceptProposalMutation.mutate(proposalId);
  }

  function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitProposal) {
      return;
    }

    createProposalMutation.mutate();
  }

  return (
    <MobileRequestShell
      backHref="/requests/class"
      title={isRequester ? "교환 제안 내역" : "교환 제안하기"}
    >
      {isAuthPending ? (
        <LoadingPanel>
          <AuthStatusSpinner />
          <LoadingText>로그인 상태를 확인하는 중입니다.</LoadingText>
        </LoadingPanel>
      ) : null}

      {!isAuthPending && !isAuthenticated ? (
        <StatePanel>
          <StateTitle>로그인이 필요한 메뉴입니다.</StateTitle>
          <StateDescription>교원 계정으로 로그인하면 교환 제안을 확인할 수 있습니다.</StateDescription>
        </StatePanel>
      ) : null}

      {isAuthenticated ? (
        <>
          <Panel>
            <PanelTitle>{request?.title ?? "교환 신청"}</PanelTitle>
            {requestDetailQuery.isLoading ? (
              <EmptyText>교환 신청 정보를 불러오는 중입니다.</EmptyText>
            ) : request ? (
              <>
                <DetailGrid>
                  <DetailField>
                    <DetailLabel>상태</DetailLabel>
                    <DetailStatusText $status={request.status}>
                      {formatRequestStatus(request.status)}
                    </DetailStatusText>
                  </DetailField>
                  <DetailField>
                    <DetailLabel>작성자</DetailLabel>
                    <DetailValue>{request.requestedByName ?? "-"}</DetailValue>
                  </DetailField>
                  <DetailField>
                    <DetailLabel>반 이름</DetailLabel>
                    <DetailValue>{request.classroomName ?? "-"}</DetailValue>
                  </DetailField>
                  <DetailField>
                    <DetailLabel>수업 일자</DetailLabel>
                    <DetailValue>{formatDetailDate(request.lessonDate)}</DetailValue>
                  </DetailField>
                  <DetailField>
                    <DetailLabel>신청 일시</DetailLabel>
                    <DetailValue>{formatDetailDate(request.createdAt)}</DetailValue>
                  </DetailField>
                  <DetailField>
                    <DetailLabel>만료일</DetailLabel>
                    <DetailValue>{formatDetailDate(request.expiresAt)}</DetailValue>
                  </DetailField>
                </DetailGrid>
                <DetailBlock>
                  <DetailLabel>교환 신청 사유</DetailLabel>
                  <DetailBody>{request.content ?? "-"}</DetailBody>
                </DetailBlock>
              </>
            ) : (
              <EmptyText>교환 신청 정보를 불러오지 못했습니다.</EmptyText>
            )}
          </Panel>

          {canShowProposalForm ? (
            <Panel>
              <PanelTitle>교환 제안하기</PanelTitle>
              <Form onSubmit={submitProposal}>
                <FieldGroup>
                  <FieldLabel>작성자</FieldLabel>
                  <ReadOnlyInput value={currentUser?.name ?? "-"} readOnly />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>반 이름</FieldLabel>
                  {assignmentClassNames.length > 1 ? (
                    <Select
                      value={proposalClassNameFallback}
                      onChange={(event) => setProposalClassName(event.target.value)}
                    >
                      {assignmentClassNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <ReadOnlyInput
                      value={proposalClassNameFallback}
                      readOnly
                    />
                  )}
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="mobile-proposal-lesson-date">수업 일자</FieldLabel>
                  <DateFieldRow>
                    <DateDisplayInput
                      id="mobile-proposal-lesson-date"
                      type="text"
                      inputMode="none"
                      placeholder="선택 안 함"
                      value={proposalLessonDateText}
                      readOnly
                      onClick={() => openDatePicker(proposalLessonDateInputRef)}
                    />
                    <HiddenNativeDateInput
                      ref={proposalLessonDateInputRef}
                      type="date"
                      value={proposalLessonDate}
                      onChange={(event) => handleProposalLessonDateChange(event.target.value)}
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <CalendarButton
                      type="button"
                      aria-label="수업 일자 달력 열기"
                      onClick={() => openDatePicker(proposalLessonDateInputRef)}
                    >
                      <IconCalendarMonth size={18} stroke={2} />
                    </CalendarButton>
                  </DateFieldRow>
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="mobile-proposal-content">내용</FieldLabel>
                  <TextArea
                    id="mobile-proposal-content"
                    placeholder="교환 제안 내용을 입력해 주세요."
                    value={proposalContent}
                    onChange={(event) => setProposalContent(event.target.value)}
                  />
                </FieldGroup>
                <PrimaryButton type="submit" disabled={!canSubmitProposal}>
                  {createProposalMutation.isPending ? "제출 중..." : "제출"}
                </PrimaryButton>
              </Form>
            </Panel>
          ) : null}

          <Panel>
            <PanelTitle>{isRequester ? "등록된 교환 제안" : "교환 제안 내역"}</PanelTitle>
            {proposalsQuery.isLoading ? (
              <EmptyText>교환 제안 내역을 불러오는 중입니다.</EmptyText>
            ) : proposals.length === 0 ? (
              <EmptyText>등록된 교환 제안이 없습니다.</EmptyText>
            ) : (
              <ProposalList>
                {proposals.map((proposal, index) => (
                  <ProposalCard key={proposal.id ?? `${proposal.proposedById}-${index}`}>
                    <ProposalDate>{formatDetailDate(proposal.createdAt)}</ProposalDate>
                    {editingProposalId === proposal.id ? (
                      <ProposalEditForm
                        onSubmit={(event) => {
                          event.preventDefault();

                          if (proposal.id) {
                            saveProposalEdit(proposal.id);
                          }
                        }}
                      >
                        <ProposalMetaGrid>
                          <ProposalMetaField>
                            <DetailLabel>작성자</DetailLabel>
                            <DetailValue>{proposal.proposedByName ?? "-"}</DetailValue>
                          </ProposalMetaField>
                          <ProposalMetaField>
                            <DetailLabel>반 이름</DetailLabel>
                            <DetailValue>{proposal.classroomName ?? "-"}</DetailValue>
                          </ProposalMetaField>
                        </ProposalMetaGrid>
                        <FieldGroup>
                          <FieldLabel htmlFor={`mobile-edit-proposal-date-${proposal.id}`}>
                            수업 일자
                          </FieldLabel>
                          <HiddenNativeDateInput
                            id={`mobile-edit-proposal-date-${proposal.id}`}
                            type="date"
                            value={editingProposalLessonDate}
                            ref={editingProposalLessonDateInputRef}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEditingProposalLessonDate(value);
                              setEditingProposalLessonDateText(formatIsoDateToShort(value));
                            }}
                          />
                          <DateFieldRow>
                            <DateDisplayInput
                              type="text"
                              inputMode="none"
                              placeholder="선택 안 함"
                              value={editingProposalLessonDateText}
                              readOnly
                              onClick={() => openDatePicker(editingProposalLessonDateInputRef)}
                            />
                            <CalendarButton
                              type="button"
                              aria-label="수업 일자 달력 열기"
                              onClick={() => openDatePicker(editingProposalLessonDateInputRef)}
                            >
                              <IconCalendarMonth size={18} stroke={2} />
                            </CalendarButton>
                          </DateFieldRow>
                        </FieldGroup>
                        <FieldGroup>
                          <FieldLabel htmlFor={`mobile-edit-proposal-content-${proposal.id}`}>
                            내용
                          </FieldLabel>
                          <TextArea
                            id={`mobile-edit-proposal-content-${proposal.id}`}
                            value={editingProposalContent}
                            onChange={(event) => setEditingProposalContent(event.target.value)}
                          />
                        </FieldGroup>
                        <ProposalActionRow>
                          <PrimaryButton
                            type="submit"
                            disabled={updateProposalMutation.isPending}
                          >
                            {updateProposalMutation.isPending ? "수정 중..." : "수정"}
                          </PrimaryButton>
                          <SecondaryButton
                            type="button"
                            onClick={cancelProposalEdit}
                            disabled={updateProposalMutation.isPending}
                          >
                            취소
                          </SecondaryButton>
                        </ProposalActionRow>
                      </ProposalEditForm>
                    ) : (
                      <>
                        <ProposalMetaGrid>
                          <ProposalMetaField>
                            <DetailLabel>작성자</DetailLabel>
                            <DetailValue>{proposal.proposedByName ?? "-"}</DetailValue>
                          </ProposalMetaField>
                          <ProposalMetaField>
                            <DetailLabel>반 이름</DetailLabel>
                            <DetailValue>{proposal.classroomName ?? "-"}</DetailValue>
                          </ProposalMetaField>
                          <ProposalMetaField>
                            <DetailLabel>수업 일자</DetailLabel>
                            <DetailValue>{formatDetailDate(proposal.lessonDate)}</DetailValue>
                          </ProposalMetaField>
                          <ProposalMetaField>
                            <DetailLabel>제안 유형</DetailLabel>
                            <DetailValue>{getProposalTypeLabel(proposal)}</DetailValue>
                          </ProposalMetaField>
                        </ProposalMetaGrid>
                        <DetailBlock>
                          <DetailLabel>내용</DetailLabel>
                          <DetailBody>{proposal.content ?? "-"}</DetailBody>
                        </DetailBlock>
                        {canManageProposal(proposal) || (isRequester && proposal.id) ? (
                          <ProposalFooter>
                            {canManageProposal(proposal) ? (
                              <ProposalManageActions>
                                <ManageButton
                                  type="button"
                                  $tone="edit"
                                  onClick={() => startProposalEdit(proposal)}
                                >
                                  수정
                                </ManageButton>
                                <ManageButton
                                  type="button"
                                  $tone="delete"
                                  onClick={() => proposal.id && deleteProposal(proposal.id)}
                                  disabled={deleteProposalMutation.isPending}
                                >
                                  삭제
                                </ManageButton>
                              </ProposalManageActions>
                            ) : null}
                            {isRequester &&
                            request?.status === "APPROVED" &&
                            proposal.id &&
                            (proposal.status === "ACTIVE" || proposal.status == null) ? (
                              <AcceptButton
                                type="button"
                                onClick={() => acceptProposal(proposal.id!)}
                                disabled={acceptProposalMutation.isPending}
                              >
                                {acceptProposalMutation.isPending ? "승낙 중..." : "교환 제안 승낙"}
                              </AcceptButton>
                            ) : null}
                          </ProposalFooter>
                        ) : null}
                      </>
                    )}
                  </ProposalCard>
                ))}
              </ProposalList>
            )}
          </Panel>
        </>
      ) : null}
    </MobileRequestShell>
  );
}

const StatePanel = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const LoadingPanel = styled(StatePanel)`
  justify-items: center;
  align-content: center;
  min-height: 16rem;
`;

const LoadingText = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const StateTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const StateDescription = styled.p`
  color: #66725f;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const Panel = styled.section`
  display: grid;
  gap: ${spacing.space16};
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: ${colors.white};
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.06);
`;

const PanelTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;

const Form = styled.form`
  display: grid;
  gap: ${spacing.space16};
`;

const FieldGroup = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const FieldLabel = styled.label`
  color: ${colors.text};
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const fieldStyle = `
  width: 100%;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  outline: none;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const ReadOnlyInput = styled.input`
  ${fieldStyle}
  color: #61705b;
`;

const Select = styled.select`
  ${fieldStyle}
  appearance: none;
`;

const DateInput = styled.input`
  ${fieldStyle}
  cursor: pointer;
`;

const DateFieldRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
`;

const DateDisplayInput = styled.input`
  ${fieldStyle}
  cursor: pointer;
`;

const HiddenNativeDateInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
`;

const CalendarButton = styled.button`
  position: absolute;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: ${colors.point};
  cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 8rem;
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const PrimaryButton = styled.button`
  min-height: 3.125rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c 0%, #5fc077 100%);
  color: ${colors.white};
  font-size: ${typography.fontSize16};
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
`;

const EmptyText = styled.p`
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  text-align: center;
  padding: ${spacing.space20} 0;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const DetailField = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const DetailLabel = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;

const DetailValue = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const DetailStatusText = styled.span<{ $status?: string }>`
  color: ${({ $status }) =>
    $status === "APPROVED" || $status === "COMPLETED"
      ? "#4f8f27"
      : $status === "REJECTED" || $status === "EXPIRED" || $status === "CANCELLED"
        ? colors.notice
        : "#7c866f"};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
`;

const DetailBlock = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const DetailBody = styled.p`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
`;

const ProposalList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ProposalCard = styled.article`
  display: grid;
  gap: ${spacing.space12};
  padding: 1rem;
  border: 1px solid #e4e8e1;
  border-radius: 1rem;
  background: #fcfdfb;
`;

const ProposalDate = styled.span`
  color: #80907a;
  font-size: ${typography.fontSize13};
  font-weight: 600;
`;

const ProposalMetaGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const ProposalMetaField = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;

const ProposalEditForm = styled.form`
  display: grid;
  gap: ${spacing.space12};
`;

const ProposalFooter = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ProposalActionRow = styled.div`
  display: grid;
  gap: ${spacing.space8};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const ProposalManageActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space8};
`;

const SecondaryButton = styled.button`
  min-height: 3.125rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius999};
  background: ${colors.white};
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const ManageButton = styled.button<{ $tone: "edit" | "delete" }>`
  min-width: 4.5rem;
  min-height: 2.375rem;
  border: 1px solid
    ${({ $tone }) => ($tone === "edit" ? "rgba(135, 194, 92, 0.35)" : "rgba(232, 108, 93, 0.28)")};
  border-radius: ${radii.radius999};
  padding: 0 ${spacing.space12};
  background: ${({ $tone }) => ($tone === "edit" ? "#f3f9ed" : "#fff3f1")};
  color: ${({ $tone }) => ($tone === "edit" ? colors.point : "#d05b4d")};
  font-size: ${typography.fontSize13};
  font-weight: 800;
`;

const AcceptButton = styled(PrimaryButton)`
  min-height: 2.875rem;
`;
