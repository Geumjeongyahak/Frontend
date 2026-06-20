"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import {
  deleteAbsenceRequest,
  getAbsenceRequestDetail,
  updateAbsenceRequest,
} from "@/api/request/request.api";
import type { AbsenceRequestStatus } from "@/api/request/request.dto";
import { Button } from "@/components/common/VariantButton";
import { StatusBadge, type ExchangeStatus } from "@/components/staff/class-management/exchange-request/ExchangeRequestDetail";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

function normalizeStatusTone(status?: AbsenceRequestStatus): ExchangeStatus {
  if (status === "APPROVED") return "APPROVED";
  if (status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED") return "REJECTED";
  return "PENDING";
}

export default function AbsencePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const postId = Number(params.postId);
  const isValidPostId = Number.isInteger(postId) && postId > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editReason, setEditReason] = useState("");
  const deleteAbsenceMutation = useMutation({
    mutationFn: deleteAbsenceRequest,
    onSuccess: () => {
      router.push("/staff/class-management/absence-request");
      router.refresh();
    },
    onError: () => {
      window.alert("결강 신청서 삭제에 실패했습니다.");
    },
  });
  const updateAbsenceMutation = useMutation({
    mutationFn: (body: { title: string; reason: string }) =>
      updateAbsenceRequest({ requestId: postId }, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.requests.absenceDetail(postId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.requests.absenceList() });
      setIsEditing(false);
      window.alert("결강 신청서가 수정되었습니다.");
    },
    onError: () => {
      window.alert("결강 신청서 수정에 실패했습니다.");
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.absenceDetail(postId),
    queryFn: () => getAbsenceRequestDetail({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
  });

  const detailCreatedDate = formatUtcToKstShortDate(data?.createdAt);
  const detailLessonDate = formatUtcToKstShortDate(data?.lessonDate);
  const detailClassroomName = data?.classroomName ?? "-";
  const detailWriter = data?.requestedByName ?? "-";
  const detailReason = isError ? "결강 신청 사유를 불러오지 못했습니다." : data?.reason ?? "결강 신청 사유";
  const detailStatus = isError ? "확인 불가" : formatRequestStatus(data?.status);
  const detailTitle = isLoading ? "불러오는 중..." : data?.title ?? "-";
  const isPendingRequest = data?.status === "PENDING";
  const detailStatusTone = normalizeStatusTone(data?.status);
  const isAdmin = isAuthenticated && user?.role === "ADMIN";
  const isRequester =
    isAuthenticated &&
    typeof user?.id === "number" &&
    typeof data?.requestedById === "number" &&
    user.id === data.requestedById;
  const canManageRequest = isAdmin || isRequester;
  const canEditRequest = isPendingRequest && canManageRequest;
  const canDeleteRequest = isPendingRequest && canManageRequest;

  const handleDelete = async () => {
    if (!isValidPostId || !canDeleteRequest || deleteAbsenceMutation.isPending) return;
    if (!window.confirm("결강 신청서를 삭제하시겠습니까?")) return;
    deleteAbsenceMutation.mutate({ requestId: postId });
  };

  const handleStartEdit = () => {
    if (!canEditRequest) return;
    setEditTitle(data?.title ?? "");
    setEditReason(data?.reason ?? "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!updateAbsenceMutation.isPending) {
      setIsEditing(false);
    }
  };

  const handleSaveEdit = () => {
    const title = editTitle.trim();
    const reason = editReason.trim();

    if (!title || !reason) {
      window.alert("제목과 결강 신청 사유를 입력해 주세요.");
      return;
    }

    updateAbsenceMutation.mutate({ title, reason });
  };

  return (
    <PageWrapper>
      <TopButtonRow>
        {canManageRequest ? (
          <>
            <Button
              type="button"
              $variant="danger"
              onClick={handleDelete}
              disabled={!canDeleteRequest || deleteAbsenceMutation.isPending}
            >
              {deleteAbsenceMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  $variant="edit"
                  onClick={handleCancelEdit}
                  disabled={updateAbsenceMutation.isPending}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={updateAbsenceMutation.isPending}
                >
                  {updateAbsenceMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                $variant="edit"
                onClick={handleStartEdit}
                disabled={!canEditRequest}
              >
                수정
              </Button>
            )}
          </>
        ) : null}
        <Button type="button" $variant="neutral" onClick={() => router.push("/staff/class-management/absence-request")}>
          목록
        </Button>
      </TopButtonRow>

      <ContentColumn>
        <DateBar>{detailCreatedDate}</DateBar>

        <PostSection>
          <Label>제목</Label>
          {isEditing ? (
            <EditInput value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
          ) : (
            <ValueBox>{detailTitle}</ValueBox>
          )}

          <Label>신청자 정보</Label>
          <InfoRow>
            <FieldLabel>반 이름</FieldLabel>
            <FieldValue>{detailClassroomName}</FieldValue>
            <FieldLabel>수업 일자</FieldLabel>
            <FieldValue>{detailLessonDate}</FieldValue>
            <FieldLabel>작성자</FieldLabel>
            <FieldValue>{detailWriter}</FieldValue>
          </InfoRow>

          <Label>결강 신청 사유</Label>
          {isEditing ? (
            <EditInput
              value={editReason}
              onChange={(event) => setEditReason(event.target.value)}
            />
          ) : (
            <TextBox>{detailReason}</TextBox>
          )}

          <Label>신청 현황</Label>
          <StatusBadge $tone={detailStatusTone}>{detailStatus}</StatusBadge>
        </PostSection>
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

const ContentColumn = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
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

const ValueBox = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: #f7f7f7;
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

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const FieldLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FieldValue = styled(ValueBox)`
  min-width: 0;
`;

const TextBox = styled(ValueBox)`
  align-items: flex-start;
  min-height: 6.875rem;
  padding-top: 0.8125rem;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding-top: 1.1875rem;
  }
`;

const EditInput = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid #c0c0c0;
  background: #ffffff;
  outline: none;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;
