"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { deleteAbsenceRequest, getAbsenceRequestDetail } from "@/api/request/request.api";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

export default function AbsencePostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const { status: authStatus } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const postId = Number(params.postId);
  const isValidPostId = Number.isInteger(postId) && postId > 0;
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

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.absenceDetail(postId),
    queryFn: () => getAbsenceRequestDetail({ requestId: postId }),
    enabled: isAuthenticated && isValidPostId,
    retry: false,
  });

  const detailCreatedDate = formatUtcToKstShortDate(data?.createdAt);
  const detailLessonDate = formatUtcToKstShortDate(data?.lessonDate);
  const detailWriter = data?.requestedByName ?? "-";
  const detailReason = isError ? "결강 신청 사유를 불러오지 못했습니다." : data?.reason ?? "결강 신청 사유";
  const detailStatus = isError ? "확인 불가" : formatRequestStatus(data?.status);
  const detailTitle = isLoading ? "불러오는 중..." : "-";

  const handleDelete = async () => {
    if (!isValidPostId || deleteAbsenceMutation.isPending) return;
    if (!window.confirm("결강 신청서를 삭제하시겠습니까?")) return;
    deleteAbsenceMutation.mutate({ requestId: postId });
  };

  return (
    <PageWrapper>
      <TopButtonRow>
        <ToolbarDangerButton type="button" onClick={handleDelete} disabled={deleteAbsenceMutation.isPending}>
          {deleteAbsenceMutation.isPending ? "삭제 중..." : "삭제"}
        </ToolbarDangerButton>
        <ToolbarPrimaryButton type="button">수정</ToolbarPrimaryButton>
        <ToolbarListLink href="/staff/class-management/absence-request">목록</ToolbarListLink>
      </TopButtonRow>

      <ContentColumn>
        <DateBar>{detailCreatedDate}</DateBar>

        <PostSection>
          <Label>제목</Label>
          <ValueBox>{detailTitle}</ValueBox>

          <Label>신청자 정보</Label>
          <InfoRow>
            <FieldLabel>반 이름</FieldLabel>
            <FieldValue>-</FieldValue>
            <FieldLabel>수업 일자</FieldLabel>
            <FieldValue>{detailLessonDate}</FieldValue>
            <FieldLabel>작성자</FieldLabel>
            <FieldValue>{detailWriter}</FieldValue>
          </InfoRow>

          <Label>결강 신청 사유</Label>
          <TextBox>{detailReason}</TextBox>

          <Label>신청 현황</Label>
          <StatusBox>{detailStatus}</StatusBox>
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

const toolbarButtonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ToolbarDangerButton = styled.button`
  ${toolbarButtonBase}
  background: #fde4e2;
  color: #da3a30;

  &:hover:not(:disabled) {
    filter: brightness(0.97);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ToolbarPrimaryButton = styled.button`
  ${toolbarButtonBase}
  background: ${colors.point};
  color: ${colors.white};

  &:hover {
    filter: brightness(0.95);
  }
`;

const ToolbarListLink = styled(Link)`
  ${toolbarButtonBase}
  background: ${colors.point};
  color: ${colors.white};
  text-decoration: none;

  &:hover {
    filter: brightness(0.95);
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

const StatusBox = styled(ValueBox)`
  width: fit-content;
  padding-inline: ${spacing.space20};

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;
