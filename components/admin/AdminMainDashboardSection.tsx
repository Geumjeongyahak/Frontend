"use client";

import type { Dispatch, SetStateAction } from "react";
import type { PurchaseRequestStatus } from "@/api/request/request.dto";
import type { AdminMenu } from "@/components/admin/AdminDashboardTypes";
import {
  ActionCardButton,
  ActionDescription,
  ActionGrid,
  ActionTitle,
  DataState,
  DashboardGrid,
  SectionCard,
  SectionTitle,
  StatCard,
  StatLabel,
  StatsGrid,
  StatValue,
  SupportGrid,
} from "@/components/admin/AdminDashboardSectionParts";

type QueryState = {
  isLoading: boolean;
  isError: boolean;
};

type StatItem = {
  label: string;
  value: number;
};

type AdminMainDashboardSectionProps = {
  stats: StatItem[];
  usersQuery: QueryState;
  departmentsQuery: QueryState;
  classroomsQuery: QueryState;
  pendingPurchasesQuery: QueryState;
  setActiveMenu: Dispatch<SetStateAction<AdminMenu>>;
  setPurchaseStatus: Dispatch<SetStateAction<PurchaseRequestStatus | "">>;
};

export function AdminMainDashboardSection({
  stats,
  usersQuery,
  departmentsQuery,
  classroomsQuery,
  pendingPurchasesQuery,
  setActiveMenu,
  setPurchaseStatus,
}: AdminMainDashboardSectionProps) {
  return (
    <>
      <DataState
        isLoading={usersQuery.isLoading || departmentsQuery.isLoading || classroomsQuery.isLoading || pendingPurchasesQuery.isLoading}
        isError={usersQuery.isError || departmentsQuery.isError || classroomsQuery.isError || pendingPurchasesQuery.isError}
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

      <DashboardGrid>
        <SectionCard>
          <SectionTitle>사용자 및 권한 관리</SectionTitle>
          <ActionGrid>
            <ActionCardButton type="button" onClick={() => setActiveMenu("users")}>
              <ActionTitle>사용자 관리</ActionTitle>
              <ActionDescription>전체 사용자 및 권한 조회/수정</ActionDescription>
            </ActionCardButton>
            <ActionCardButton type="button" onClick={() => setActiveMenu("departments")}>
              <ActionTitle>부서 관리</ActionTitle>
              <ActionDescription>기관 산하 부서 조직 구성</ActionDescription>
            </ActionCardButton>
          </ActionGrid>
        </SectionCard>

        <SectionCard>
          <SectionTitle>게시판 및 교육 운영</SectionTitle>
          <ActionGrid>
            <ActionCardButton type="button" onClick={() => setActiveMenu("channels")}>
              <ActionTitle>채널 관리</ActionTitle>
              <ActionDescription>소통 채널 및 게시판 설정</ActionDescription>
            </ActionCardButton>
            <ActionCardButton type="button" onClick={() => setActiveMenu("posts")}>
              <ActionTitle>게시글 관리</ActionTitle>
              <ActionDescription>모든 채널의 게시물 모니터링</ActionDescription>
            </ActionCardButton>
            <ActionCardButton type="button" onClick={() => setActiveMenu("classrooms")}>
              <ActionTitle>분반 관리</ActionTitle>
              <ActionDescription>분반 및 교육 과정 운영</ActionDescription>
            </ActionCardButton>
          </ActionGrid>
        </SectionCard>
      </DashboardGrid>

      <SectionCard>
        <SectionTitle>결재 및 행정 지원</SectionTitle>
        <SupportGrid>
          <ActionCardButton type="button" onClick={() => setActiveMenu("purchases")}>
            <ActionTitle>전체 구매 요청</ActionTitle>
            <ActionDescription>물품 구매 요청 이력 확인</ActionDescription>
          </ActionCardButton>
          <ActionCardButton
            type="button"
            onClick={() => {
              setPurchaseStatus("PENDING");
              setActiveMenu("purchases");
            }}
          >
            <ActionTitle $accent>승인 대기 중</ActionTitle>
            <ActionDescription>검토가 필요한 신규 구매 요청</ActionDescription>
          </ActionCardButton>
        </SupportGrid>
      </SectionCard>
    </>
  );
}
