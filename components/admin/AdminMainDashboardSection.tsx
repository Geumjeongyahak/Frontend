"use client";

import type { AdminMenu } from "@/components/admin/AdminDashboardTypes";
import {
  ActionCardButton,
  ActionDescription,
  ActionGrid,
  ActionTitle,
  DataState,
  DashboardGrid,
  DashboardStack,
  RequestSummaryGrid,
  SectionCard,
  SectionTitle,
  SingleActionGrid,
  StatCard,
  StatLabel,
  StatsGrid,
  StatValue,
} from "@/components/admin/AdminDashboardSectionParts";

type QueryState = {
  isLoading: boolean;
  isError: boolean;
};

type StatItem = {
  label: string;
  value: number;
};

type RequestSummaryItem = {
  label: string;
  description: string;
  count: number;
  menu: AdminMenu;
  onClick?: () => void;
};

type ManagementGroup = {
  title: string;
  columns?: "single" | "double";
  actions: {
    title: string;
    description: string;
    menu: AdminMenu;
  }[];
};

type AdminMainDashboardSectionProps = {
  stats: StatItem[];
  requestSummaries: RequestSummaryItem[];
  usersQuery: QueryState;
  departmentsQuery: QueryState;
  classroomsQuery: QueryState;
  pendingPurchasesQuery: QueryState;
  pendingAbsenceRequestsQuery: QueryState;
  pendingLessonExchangeRequestsQuery: QueryState;
  setActiveMenu: (menu: AdminMenu) => void;
};

export function AdminMainDashboardSection({
  stats,
  requestSummaries,
  usersQuery,
  departmentsQuery,
  classroomsQuery,
  pendingPurchasesQuery,
  pendingAbsenceRequestsQuery,
  pendingLessonExchangeRequestsQuery,
  setActiveMenu,
}: AdminMainDashboardSectionProps) {
  const isDashboardLoading =
    usersQuery.isLoading ||
    departmentsQuery.isLoading ||
    classroomsQuery.isLoading ||
    pendingPurchasesQuery.isLoading ||
    pendingAbsenceRequestsQuery.isLoading ||
    pendingLessonExchangeRequestsQuery.isLoading;
  const isDashboardError =
    usersQuery.isError ||
    departmentsQuery.isError ||
    classroomsQuery.isError ||
    pendingPurchasesQuery.isError ||
    pendingAbsenceRequestsQuery.isError ||
    pendingLessonExchangeRequestsQuery.isError;

  const managementGroups: ManagementGroup[] = [
    {
      title: "사용자 및 소속 관리",
      actions: [
        {
          title: "사용자 관리",
          description: "사이트 내 가입된 계정 관리",
          menu: "users",
        },
        {
          title: "부서 관리",
          description: "기관 산하 부서 조직 관리",
          menu: "departments",
        },
        {
          title: "분반 관리",
          description: "기관 내 수업 분반 관리",
          menu: "classrooms",
        },
      ],
    },
    {
      title: "교육 운영",
      columns: "single",
      actions: [
        {
          title: "수업 관리",
          description: "반별 시간표와 수업 정보 관리",
          menu: "lessons",
        },
      ],
    },
    {
      title: "게시판 관리",
      actions: [
        {
          title: "채널 관리",
          description: "게시물 분류를 위한 채널 관리",
          menu: "channels",
        },
        {
          title: "게시글 관리",
          description: "모든 채널의 게시물 관리",
          menu: "posts",
        },
      ],
    },
    {
      title: "요청 관리",
      actions: [
        {
          title: "수업 교환 요청 관리",
          description: "수업 교환 요청 승인/반려 처리",
          menu: "lessonExchange",
        },
        {
          title: "수업 결강 요청 관리",
          description: "수업 결강 요청 승인/반려 처리",
          menu: "absenceRequests",
        },
        {
          title: "결제 요청 관리",
          description: "물품 구매 요청 처리",
          menu: "purchases",
        },
      ],
    },
  ];

  return (
    <DashboardStack>
      <DataState
        isLoading={isDashboardLoading}
        isError={isDashboardError}
        isEmpty={false}
        loadingLabel="관리자 데이터 불러오는 중"
        errorLabel="대시보드 데이터를 불러오지 못했습니다."
        emptyLabel=""
      >
        <StatsGrid>
          {stats.map((stat) => (
            <StatCard key={stat.label}>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
            </StatCard>
          ))}
        </StatsGrid>
      </DataState>

      <RequestSummaryGrid>
        {requestSummaries.map((item) => {
          const hasPendingRequests = item.count > 0;

          return (
            <ActionCardButton
              key={item.label}
              type="button"
              onClick={() => {
                item.onClick?.();
                setActiveMenu(item.menu);
              }}
            >
              <ActionTitle $accent>{item.label}</ActionTitle>
              <ActionDescription $alert={hasPendingRequests}>{item.description}</ActionDescription>
            </ActionCardButton>
          );
        })}
      </RequestSummaryGrid>

      <DashboardGrid>
        {managementGroups.map((group) => {
          const GridComponent = group.columns === "single" ? SingleActionGrid : ActionGrid;

          return (
            <SectionCard key={group.title}>
              <SectionTitle>{group.title}</SectionTitle>
              <GridComponent>
                {group.actions.map((action) => (
                  <ActionCardButton
                    key={action.title}
                    type="button"
                    onClick={() => setActiveMenu(action.menu)}
                  >
                    <ActionTitle>{action.title}</ActionTitle>
                    <ActionDescription>{action.description}</ActionDescription>
                  </ActionCardButton>
                ))}
              </GridComponent>
            </SectionCard>
          );
        })}
      </DashboardGrid>
    </DashboardStack>
  );
}
