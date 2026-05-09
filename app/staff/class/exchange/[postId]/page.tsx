"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import styled from "styled-components";
import type {
  LessonExchangeProposalRequestDto,
  LessonExchangeRequestStatus,
  UpdateLessonExchangeRequestDto,
} from "@/api/lessonExchange/lessonExchange.dto";
import {
  cancelLessonExchangeRequest,
  createLessonExchangeProposal,
  getLessonExchangeRequestDetail,
  getLessonExchangeProposals,
  updateLessonExchangeRequest,
} from "@/api/lessonExchange/lessonExchange.api";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import {
  formatUtcToKstDatetimeLocalInput,
  formatUtcToKstShortDate,
  formatUtcToKstShortDateTime,
} from "@/utils/formatUtcToKstShortDate";
import { normalizeLessonExchangeExpiresAtForApi } from "@/utils/kstShortDate";

function normalizeRequestStatusTone(
  status: LessonExchangeRequestStatus | undefined,
): "PENDING" | "APPROVED" | "REJECTED" {
  if (status === "APPROVED") return "APPROVED";
  if (status === "REJECTED") return "REJECTED";
  return "PENDING";
}

function toIsoDateOnly(value?: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed.length >= 10 ? trimmed.slice(0, 10) : "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ExchangePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const postId = Number(params.postId);
  const isValidPostId = Number.isInteger(postId) && postId > 0;

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.lessonExchangeDetail(postId),
    queryFn: () => getLessonExchangeRequestDetail({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
  });

  const {
    data: proposalList = [],
    isLoading: proposalsLoading,
    isError: proposalsIsError,
  } = useQuery({
    queryKey: queryKeys.requests.lessonExchangeProposals(postId),
    queryFn: () => getLessonExchangeProposals({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
    select: (payload) => (Array.isArray(payload) ? payload : []),
  });

  const [proposalClassroomNameDraft, setProposalClassroomNameDraft] = useState("");
  const [proposalLessonDate, setProposalLessonDate] = useState("");
  const [proposalWriterDraft, setProposalWriterDraft] = useState("");
  const [proposalContent, setProposalContent] = useState("");

  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLessonDate, setEditLessonDate] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");

  const createProposalMutation = useMutation({
    mutationFn: (body: LessonExchangeProposalRequestDto) =>
      createLessonExchangeProposal({ requestId: postId }, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      setProposalContent("");
      setProposalLessonDate("");
      setProposalClassroomNameDraft("");
      setProposalWriterDraft("");
      window.alert("교환 제안이 등록되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "교환 제안 등록에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleProposalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = proposalContent.trim();
    if (!content) {
      window.alert("내용을 입력해 주세요.");
      return;
    }
    createProposalMutation.mutate({
      lessonDate: proposalLessonDate.trim() || undefined,
      content,
    });
  };

  const cancelRequestMutation = useMutation({
    mutationFn: () => cancelLessonExchangeRequest({ requestId: postId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      await queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      await queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeProposals(postId),
      });
      window.alert("수업 교환 신청이 취소되었습니다.");
      router.push("/staff/class/exchange");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "수업 교환 신청 취소에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleDeleteClick = () => {
    if (!isValidPostId) return;
    if (!window.confirm("수업 교환 신청을 취소할까요?")) return;
    cancelRequestMutation.mutate();
  };

  const updateRequestMutation = useMutation({
    mutationFn: (body: UpdateLessonExchangeRequestDto) =>
      updateLessonExchangeRequest({ requestId: postId }, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeDetail(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      setIsEditingRequest(false);
      window.alert("수업 교환 신청이 수정되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "수업 교환 신청 수정에 실패했습니다.";
      window.alert(message);
    },
  });

  const handleStartEdit = () => {
    if (!data || isError) {
      window.alert("신청 정보를 불러온 뒤 수정할 수 있습니다.");
      return;
    }
    setEditTitle(data.title ?? "");
    setEditLessonDate(toIsoDateOnly(data.lessonDate));
    setEditContent(data.content ?? "");
    setEditExpiresAt(formatUtcToKstDatetimeLocalInput(data.expiresAt));
    setIsEditingRequest(true);
  };

  const handleCancelEdit = () => {
    if (updateRequestMutation.isPending) return;
    setIsEditingRequest(false);
  };

  const handleSaveEdit = () => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title) {
      window.alert("제목을 입력해 주세요.");
      return;
    }
    if (!content) {
      window.alert("교환 신청 사유를 입력해 주세요.");
      return;
    }

    const expiresAt = normalizeLessonExchangeExpiresAtForApi(editExpiresAt);
    if (!expiresAt) {
      window.alert("만료일 시각을 입력해 주세요.");
      return;
    }

    updateRequestMutation.mutate({
      title,
      content,
      lessonDate: editLessonDate.trim() || undefined,
      expiresAt,
    });
  };

  const detailTitle = isLoading
    ? "불러오는 중..."
    : isError
      ? "수업 교환 신청을 불러오지 못했습니다."
      : data?.title ?? "제목";
  const detailWriter = data?.requestedByName ?? "";
  const detailClassName = data?.classroomName ?? "";
  const detailLessonDate = formatUtcToKstShortDate(data?.lessonDate);
  const detailContent = isError ? "교환 신청 사유를 불러오지 못했습니다." : data?.content ?? "";
  const detailStatusTone = isError
    ? ("PENDING" as const)
    : normalizeRequestStatusTone(data?.status);
  const detailStatus = isError ? "확인 불가" : formatRequestStatus(data?.status);
  const detailCreatedDate = formatUtcToKstShortDate(data?.createdAt);
  const detailExpiresAtDisplay = formatUtcToKstShortDateTime(data?.expiresAt);

  const acceptedHref = `/staff/class/exchange/${postId}/accepted`;

  return (
    <PageWrapper>
      <TopButtonRow>
        <DeleteActionButton
          type="button"
          disabled={
            !isAuthenticated ||
            !isValidPostId ||
            cancelRequestMutation.isPending ||
            updateRequestMutation.isPending
          }
          onClick={handleDeleteClick}
        >
          {cancelRequestMutation.isPending ? "취소 중…" : "삭제"}
        </DeleteActionButton>
        {isEditingRequest ? (
          <>
            <CancelEditButton
              type="button"
              onClick={handleCancelEdit}
              disabled={updateRequestMutation.isPending}
            >
              취소
            </CancelEditButton>
            <ActionButton
              type="button"
              onClick={handleSaveEdit}
              disabled={updateRequestMutation.isPending}
            >
              {updateRequestMutation.isPending ? "저장 중…" : "저장"}
            </ActionButton>
          </>
        ) : (
          <ActionButton
            type="button"
            onClick={handleStartEdit}
            disabled={
              !isAuthenticated ||
              !isValidPostId ||
              isLoading ||
              isError ||
              cancelRequestMutation.isPending
            }
          >
            수정
          </ActionButton>
        )}
      </TopButtonRow>

      <ContentColumn>
        <DateBar>{detailCreatedDate}</DateBar>

        <PostSection>
          <Label>제목</Label>
          {isEditingRequest ? (
            <RequestEditInput
              aria-label="제목"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <ValueBox $weight="semibold">{detailTitle}</ValueBox>
          )}

          <ApplicantSection>
            <Label>신청자 정보</Label>

            <ApplicantBoxRow>
              <ApplicantField>
                <ApplicantBoxLabel>작성자</ApplicantBoxLabel>
                <ApplicantFieldValue>{detailWriter || "—"}</ApplicantFieldValue>
              </ApplicantField>
              <ApplicantField>
                <ApplicantBoxLabel>반 이름</ApplicantBoxLabel>
                <ApplicantFieldValue>{detailClassName || "—"}</ApplicantFieldValue>
              </ApplicantField>
            </ApplicantBoxRow>

            <ApplicantFullWidthField>
              <ApplicantBoxLabel>수업 일자</ApplicantBoxLabel>
              {isEditingRequest ? (
                <RequestEditInput
                  aria-label="수업 일자"
                  type="date"
                  value={editLessonDate}
                  onChange={(e) => setEditLessonDate(e.target.value)}
                />
              ) : (
                <ApplicantFieldValueWide>{detailLessonDate || "—"}</ApplicantFieldValueWide>
              )}
            </ApplicantFullWidthField>

            <ApplicantFullWidthField>
              <ApplicantBoxLabel>교환 신청 사유</ApplicantBoxLabel>
              {isEditingRequest ? (
                <RequestEditTextarea
                  aria-label="교환 신청 사유"
                  rows={6}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                <ApplicantReasonText>{detailContent || "—"}</ApplicantReasonText>
              )}
            </ApplicantFullWidthField>
          </ApplicantSection>

          <Label>만료일</Label>
          <ExpiresRow>
            {isEditingRequest ? (
              <RequestEditInput
                aria-label="만료일 시각"
                type="datetime-local"
                value={editExpiresAt}
                onChange={(e) => setEditExpiresAt(e.target.value)}
              />
            ) : (
              <DateBox>{detailExpiresAtDisplay || "—"}</DateBox>
            )}
          </ExpiresRow>

          <Label>신청 현황</Label>
          <StatusBadge $tone={detailStatusTone}>{detailStatus}</StatusBadge>
        </PostSection>

        <Divider />

        <ProposalHeader>
          <ProposalTitle>교환 제안서</ProposalTitle>
          <ProposalSubmitButton type="submit" form="exchange-proposal-form" disabled={createProposalMutation.isPending}>
            {createProposalMutation.isPending ? "등록 중…" : "작성 완료"}
          </ProposalSubmitButton>
        </ProposalHeader>

        <ProposalForm id="exchange-proposal-form" onSubmit={handleProposalSubmit}>
          <ProposalInput
            aria-label="반 이름"
            placeholder="반 이름"
            value={proposalClassroomNameDraft}
            onChange={(e) => setProposalClassroomNameDraft(e.target.value)}
          />
          <ProposalInput
            aria-label="수업 일자"
            placeholder="수업 일자"
            type="date"
            value={proposalLessonDate}
            onChange={(e) => setProposalLessonDate(e.target.value)}
          />
          <ProposalInput
            aria-label="작성자"
            placeholder="작성자"
            value={proposalWriterDraft}
            onChange={(e) => setProposalWriterDraft(e.target.value)}
          />
          <ProposalTextarea
            placeholder="내용"
            rows={6}
            value={proposalContent}
            onChange={(e) => setProposalContent(e.target.value)}
          />
        </ProposalForm>

        <ProposalList>
          {proposalsLoading ? (
            <ProposalPlaceholder>제안 목록을 불러오는 중…</ProposalPlaceholder>
          ) : proposalsIsError ? (
            <ProposalPlaceholder role="alert">
              교환 제안 목록을 불러오지 못했습니다.
            </ProposalPlaceholder>
          ) : proposalList.length === 0 ? (
            <ProposalPlaceholder>등록된 교환 제안이 없습니다.</ProposalPlaceholder>
          ) : (
            proposalList.map((proposal, index) => (
              <ProposalCard key={proposal.id ?? index}>
                <ProposalMetaRow>
                  <ProposalMetaCell>
                    <MetaLabel>반 이름</MetaLabel>
                    <MetaValue>{proposal.classroomName ?? "—"}</MetaValue>
                  </ProposalMetaCell>
                  <ProposalMetaCell>
                    <MetaLabel>수업 일자</MetaLabel>
                    <MetaValue>
                      {formatUtcToKstShortDate(proposal.lessonDate) || "—"}
                    </MetaValue>
                  </ProposalMetaCell>
                  <ProposalMetaCell>
                    <MetaLabel>작성자</MetaLabel>
                    <MetaValue>{proposal.proposedByName ?? "—"}</MetaValue>
                  </ProposalMetaCell>
                </ProposalMetaRow>
                <ProposalContent>{proposal.content ?? "—"}</ProposalContent>
                <ProposalFooter>
                  <ProposalDate>
                    {formatUtcToKstShortDate(proposal.createdAt) || "—"}
                  </ProposalDate>
                  <AcceptLink href={acceptedHref}>제안 수락하기</AcceptLink>
                </ProposalFooter>
              </ProposalCard>
            ))
          )}
        </ProposalList>
      </ContentColumn>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 1.8125rem 3.125rem 4rem;
  background: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const TopButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.space20};
  margin-bottom: 2.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
    margin-bottom: 3rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background-color: #88cd5a;
  color: #ffffff;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  border-radius: ${radii.radius12};

  &:hover:not(:disabled) {
    background-color: #d9d9d9;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const DeleteActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  border-radius: ${radii.radius12};
  background-color: #fde4e2;
  color: #da3a30;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const CancelEditButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  border-radius: ${radii.radius12};
  background-color: #e4e4e4;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #d9d9d9;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const RequestEditInput = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const RequestEditTextarea = styled.textarea`
  width: 100%;
  min-width: 0;
  min-height: 6.875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: vertical;
  outline: none;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1.3125rem;

  @media (min-width: 120rem) {
    gap: ${spacing.space32};
  }
`;

const DateBar = styled.div`
  display: flex;
  justify-content: flex-end;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border-bottom: 1px solid #a9a9a9;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const PostSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const Label = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ValueBox = styled.div<{ $weight?: "regular" | "semibold" }>`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: ${({ $weight }) => ($weight === "semibold" ? 600 : 400)};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ApplicantSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const ApplicantBoxRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ApplicantFullWidthField = styled.div`
  display: grid;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const ApplicantField = styled.div`
  display: grid;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const ApplicantBoxLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ApplicantFieldValue = styled(ValueBox)`
  min-width: 0;
`;

const ApplicantFieldValueWide = styled(ValueBox)`
  width: 100%;
  min-width: 0;
`;

const ApplicantReasonText = styled(ValueBox)`
  align-items: flex-start;
  min-height: 6.875rem;
  padding-top: 0.75rem;
  word-break: break-word;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding-top: 1.125rem;
  }
`;

const StatusBadge = styled.span<{ $tone: "PENDING" | "APPROVED" | "REJECTED" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 3.5rem;
  padding: ${({ $tone }) =>
    $tone === "PENDING" ? "0.5rem 1.125rem" : "0.375rem 0.875rem"};
  border-radius: 999px;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  color: ${({ $tone }) => {
    switch ($tone) {
      case "APPROVED":
        return "#3DA75C";
      case "REJECTED":
        return "#DA3A30";
      case "PENDING":
      default:
        return "#E5AD34";
    }
  }};

  background: ${({ $tone }) => {
    switch ($tone) {
      case "APPROVED":
        return "#DCF4EA";
      case "REJECTED":
        return "#FDEBE9";
      case "PENDING":
      default:
        return "#FFF6DB";
    }
  }};

  @media (min-width: 120rem) {
    min-width: 4.5rem;
    padding: ${({ $tone }) =>
      $tone === "PENDING" ? "0.625rem 1.375rem" : "0.5rem 1.125rem"};
    font-size: ${typography.fontSize20};
  }
`;

const ExpiresRow = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const DateBox = styled(ValueBox)`
  width: 7.75rem;
  flex-shrink: 0;
  justify-content: center;
  text-align: center;

  @media (min-width: 120rem) {
    width: 11.625rem;
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid #a9a9a9;
  margin: 0;
`;

const ProposalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space24};
`;

const ProposalTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const ProposalSubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background-color: #88cd5a;
  color: #ffffff;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;
  border-radius: ${radii.radius12};

  &:hover:not(:disabled) {
    background-color: #d9d9d9;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ProposalForm = styled.form`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalInput = styled.input`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #eef9e6;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalTextarea = styled.textarea`
  grid-column: 1 / -1;
  min-height: 6.75rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #eef9e6;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: none;
  outline: none;

  &::placeholder {
    color: #9c9c9c;
  }

  @media (min-width: 120rem) {
    min-height: 10.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};
`;

const ProposalPlaceholder = styled.p`
  margin: 0;
  padding: ${spacing.space20} 0;
  color: #878787;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ProposalCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.8125rem;
  padding-top: ${spacing.space20};
  border-top: 1px solid #a9a9a9;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-top: 1.875rem;
  }
`;

const ProposalMetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${spacing.space12};
  width: 100%;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProposalMetaCell = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: ${spacing.space8};
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f8f8f8;

  @media (min-width: 120rem) {
    min-height: 4rem;
    gap: 0.625rem;
    padding: ${spacing.space20};
  }
`;

const MetaLabel = styled.span`
  display: inline;
  flex-shrink: 0;
  color: #878787;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const MetaValue = styled.span`
  display: inline;
  min-width: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  word-break: break-word;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ProposalContent = styled.div`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f8f8f8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ProposalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space20};
  padding-left: ${spacing.space12};

  @media (min-width: 120rem) {
    padding-left: ${spacing.space20};
  }
`;

const ProposalDate = styled.span`
  color: #c0c0c0;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const AcceptLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 1px solid #88cd5a;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  color: #88cd5a;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
