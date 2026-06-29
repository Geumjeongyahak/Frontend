"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import type { TeacherApplicationResponseDto } from "@/api/teacherApplication/teacherApplication.dto";
import { cancelTeacherApplication, getMyTeacherApplication } from "@/api/teacherApplication/teacherApplication.api";
import ApplyLayout from "@/components/apply/ApplyLayout";
import {
  formatTeacherApplicationPreference,
  formatTeacherApplicationStatus,
  getTeacherApplicationStatusColor,
  getTeacherApplicationFields,
} from "@/components/apply/teacherApplicationUtils";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

export default function TeacherApplyStatusPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || status === "error") {
      router.replace("/login");
    }
  }, [router, status]);

  const applicationQuery = useQuery({
    queryKey: queryKeys.teacherApplications.my(),
    queryFn: getMyTeacherApplication,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: (applicationId: number) => cancelTeacherApplication({ applicationId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.my() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.teacherApplications.adminList() }),
      ]);
      setSelectedApplicationId(null);
      setIsDetailOpen(false);
    },
  });

  const applications = useMemo(() => {
    const application = applicationQuery.data?.application;
    return applicationQuery.data?.exists && application ? [application] : [];
  }, [applicationQuery.data?.application, applicationQuery.data?.exists]);

  if (!isAuthenticated) {
    return (
      <ApplyLayout activeItem="status">
        <LoadingSection>
          <LoadingSpinner label="지원 현황을 불러오는 중" />
        </LoadingSection>
      </ApplyLayout>
    );
  }

  const selectedApplication =
    applications.find((application) => application.id === selectedApplicationId) ??
    applications[0] ??
    null;
  const fields = getTeacherApplicationFields(selectedApplication);
  const isApplicationDetailOpen = isDetailOpen && selectedApplication !== null;

  function handleCancel() {
    if (!selectedApplication?.id || cancelMutation.isPending) {
      return;
    }

    cancelMutation.mutate(selectedApplication.id);
  }

  return (
    <ApplyLayout activeItem="status">
      <PageSection>
        <Title>지원 현황</Title>

        {applicationQuery.isLoading ? (
          <LoadingSection>
            <LoadingSpinner label="지원 현황을 불러오는 중" />
          </LoadingSection>
        ) : applicationQuery.isError ? (
          <StateMessage role="alert">지원 현황을 불러오지 못했습니다.</StateMessage>
        ) : applications.length === 0 ? (
          <StateMessage>지원 현황이 없습니다.</StateMessage>
        ) : !isApplicationDetailOpen ? (
          <ApplicationListSection>
            <SectionTitle>지원 목록</SectionTitle>
            <ApplicationList>
              {applications.map((application) => (
                <ApplicationItem key={application.id ?? application.createdAt ?? "application"}>
                  <ApplicationButton
                    type="button"
                    $active={false}
                    onClick={() => {
                      setSelectedApplicationId(application.id ?? null);
                      setIsDetailOpen(true);
                    }}
                  >
                    <ApplicationPrimary>
                      <ApplicationName>{formatTeacherApplicationPreference(application)}</ApplicationName>
                      <ApplicationStatus $active $status={application.status}>
                        {formatTeacherApplicationStatus(application.status)}
                      </ApplicationStatus>
                    </ApplicationPrimary>
                    <ApplicationMeta>
                      신청일 {formatUtcToKstShortDate(application.createdAt) || "-"}
                    </ApplicationMeta>
                  </ApplicationButton>
                </ApplicationItem>
              ))}
            </ApplicationList>
          </ApplicationListSection>
        ) : selectedApplication ? (
          <DetailSection>
            <BackButton
              type="button"
              onClick={() => {
                setIsDetailOpen(false);
              }}
            >
              지원 목록
            </BackButton>
            <SummaryList>
              <SummaryItem>
                <span>상태</span>
                <StatusValue $status={selectedApplication.status}>
                  {formatTeacherApplicationStatus(selectedApplication.status)}
                </StatusValue>
              </SummaryItem>
              <SummaryItem>
                <span>신청일</span>
                <span>{formatUtcToKstShortDate(selectedApplication.createdAt) || "-"}</span>
              </SummaryItem>
              <SummaryItem>
                <span>검토자</span>
                <span>{selectedApplication.reviewedByName ?? "-"}</span>
              </SummaryItem>
              <SummaryItem>
                <span>검토 메모</span>
                <span>{selectedApplication.reviewNote?.trim() || "-"}</span>
              </SummaryItem>
            </SummaryList>

            <FieldList>
              {fields.map((field) => (
                <FieldCard key={field.label}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <FieldValue>{field.value}</FieldValue>
                </FieldCard>
              ))}
            </FieldList>

            {selectedApplication.status === "PENDING" ? (
              <ActionRow>
                <CancelButton
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={handleCancel}
                >
                  교원 신청 취소
                </CancelButton>
              </ActionRow>
            ) : null}
          </DetailSection>
        ) : null}
      </PageSection>
    </ApplyLayout>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 4rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const Title = styled.h1`
  margin: 0 0 1.5rem;
  color: #000000;
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: 2.25rem;
    font-size: 2.5rem;
  }
`;

const ApplicationListSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  width: 100%;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const ApplicationList = styled.ul`
  display: grid;
  gap: ${spacing.space8};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ApplicationItem = styled.li`
  display: block;
`;

const ApplicationButton = styled.button<{ $active: boolean }>`
  position: relative;
  display: grid;
  gap: ${spacing.space8};
  width: 100%;
  min-height: 4.75rem;
  border: 1px solid ${({ $active }) => ($active ? colors.point : colors.border)};
  border-radius: 0.5rem;
  padding: ${spacing.space12} ${spacing.space16};
  background-color: ${({ $active }) => ($active ? colors.pointSoft : colors.white)};
  color: #1f2b28;
  text-align: left;
  cursor: pointer;
  transform: translateX(${({ $active }) => ($active ? "0.25rem" : "0")});
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? colors.pointSoft : "#f1f5f2")};
    border-color: ${({ $active }) => ($active ? colors.point : "#d5ddd8")};
    transform: translateX(0.25rem);
  }

  &::before {
    position: absolute;
    top: 50%;
    left: 0.375rem;
    width: 0.1875rem;
    height: 1.5rem;
    border-radius: 999px;
    background-color: ${colors.point};
    content: "";
    opacity: ${({ $active }) => ($active ? 1 : 0)};
    transform: translateY(-50%);
    transition: opacity 0.18s ease;
  }
`;

const ApplicationPrimary = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space12};
`;

const ApplicationName = styled.strong`
  color: #050505;
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight150};
`;

const ApplicationStatus = styled.span<{
  $active: boolean;
  $status?: TeacherApplicationResponseDto["status"];
}>`
  flex-shrink: 0;
  color: ${({ $active, $status }) =>
    $active ? getTeacherApplicationStatusColor($status) : "#64706c"};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const ApplicationMeta = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const DetailSection = styled.section`
  display: grid;
  gap: 1.5rem;
`;

const BackButton = styled.button`
  justify-self: start;
  border: 0;
  padding: 0;
  background-color: transparent;
  color: ${colors.point};
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 0.125rem;
  }
`;

const SummaryList = styled.ul`
  display: grid;
  gap: ${spacing.space12};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SummaryItem = styled.li`
  display: flex;
  justify-content: space-between;
  gap: ${spacing.space12};
  padding: ${spacing.space12} ${spacing.space16};
  border: 1px solid ${colors.muted};
  border-radius: 0.5rem;
  color: #000000;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  > span:first-child {
    font-weight: 700;
  }

  > span:last-child {
    text-align: right;
  }
`;

const StatusValue = styled.span<{ $status?: TeacherApplicationResponseDto["status"] }>`
  color: ${({ $status }) => getTeacherApplicationStatusColor($status)};
  font-weight: 700;
  text-align: right;
`;

const FieldList = styled.div`
  display: grid;
  gap: 1rem;
`;

const FieldCard = styled.section`
  display: grid;
  gap: 0.75rem;
`;

const FieldLabel = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FieldValue = styled.div`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 1px solid ${colors.muted};
  background-color: #fafafa;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  min-height: 2.75rem;
  border: 1px solid #da3a30;
  border-radius: 0.5rem;
  padding: 0 ${spacing.space20};
  background-color: ${colors.white};
  color: #da3a30;
  font-family: inherit;
  font-size: ${typography.fontSize14};
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;

  &:not(:disabled):hover {
    border-color: #c53229;
    background-color: #fff1f0;
    color: #c53229;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const StateMessage = styled.p`
  margin: 0;
  padding: ${spacing.space20};
  border: 1px solid ${colors.muted};
  border-radius: 0.5rem;
  color: #606060;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;

const LoadingSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
`;
