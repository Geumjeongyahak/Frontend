"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { getPurchaseRequests } from "@/api/request/request.api";
import { getUsers } from "@/api/user/user.api";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const dashboardQueryKeys = {
  users: () => ["admin", "users"] as const,
  departments: () => ["admin", "departments"] as const,
  classrooms: () => ["admin", "classrooms"] as const,
  pendingPurchases: () => ["admin", ...queryKeys.requests.purchaseList(), "pending"] as const,
};

const navigationItems = ["대시보드", "사용자", "채널", "게시글", "부서", "분반", "구매 요청"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { status, user, signOut } = useAuthSession();
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && user?.role !== "ADMIN")) {
      router.replace("/admin/login");
    }
  }, [router, status, user?.role]);

  const usersQuery = useQuery({
    queryKey: dashboardQueryKeys.users(),
    queryFn: () => getUsers({ page: 0, size: 1 }),
    enabled: isAdmin,
  });
  const departmentsQuery = useQuery({
    queryKey: dashboardQueryKeys.departments(),
    queryFn: getDepartments,
    enabled: isAdmin,
  });
  const classroomsQuery = useQuery({
    queryKey: dashboardQueryKeys.classrooms(),
    queryFn: () => getClassrooms({ page: 0, size: 1 }),
    enabled: isAdmin,
  });
  const pendingPurchasesQuery = useQuery({
    queryKey: dashboardQueryKeys.pendingPurchases(),
    queryFn: () => getPurchaseRequests({ status: "PENDING" }),
    enabled: isAdmin,
  });

  const isLoading =
    status === "loading" ||
    usersQuery.isLoading ||
    departmentsQuery.isLoading ||
    classroomsQuery.isLoading ||
    pendingPurchasesQuery.isLoading;

  const hasError =
    usersQuery.isError ||
    departmentsQuery.isError ||
    classroomsQuery.isError ||
    pendingPurchasesQuery.isError;

  async function handleLogout() {
    await signOut();
    router.replace("/admin/login");
  }

  const stats = [
    { label: "사용자", value: usersQuery.data?.totalElements ?? 0 },
    { label: "부서", value: departmentsQuery.data?.departments?.length ?? 0 },
    { label: "분반", value: classroomsQuery.data?.totalElements ?? 0 },
    { label: "대기 중 구매 요청", value: pendingPurchasesQuery.data?.length ?? 0 },
  ];

  if (!isAdmin) {
    return (
      <Main>
        <AdminContent>
          <StatePanel>
            <LoadingSpinner label="관리자 권한 확인 중" />
          </StatePanel>
        </AdminContent>
      </Main>
    );
  }

  return (
    <ConsoleShell>
      <TopLine aria-hidden="true" />
      <Sidebar>
        <Brand>
          <BrandLogo src="/logo.svg" alt="" aria-hidden="true" />
          <BrandText>
            <BrandTitle>관리자 콘솔</BrandTitle>
            <BrandDescription>금정열린배움터 운영</BrandDescription>
          </BrandText>
        </Brand>

        <SidebarNav aria-label="관리자 메뉴">
          {navigationItems.map((item, index) => (
            <SidebarItem key={item} $active={index === 0}>
              {item}
            </SidebarItem>
          ))}
        </SidebarNav>

        <LogoutButton type="button" onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </Sidebar>

      <Main>
        <AdminContent>
          <AccountText>{user?.email}</AccountText>
          <PageHeader>
            <Title>대시보드</Title>
            <Description>운영자가 처리해야 할 핵심 데이터를 모아봅니다.</Description>
          </PageHeader>

          {hasError ? (
            <InlineStatus role="alert">일부 관리자 데이터를 불러오지 못했습니다.</InlineStatus>
          ) : null}

          {isLoading ? (
            <StatePanel>
              <LoadingSpinner label="관리자 데이터 불러오는 중" />
            </StatePanel>
          ) : (
            <>
              <StatsGrid>
                {stats.map((stat) => (
                  <StatCard key={stat.label}>
                    <StatLabel>{stat.label}</StatLabel>
                    <StatValue>{stat.value}</StatValue>
                  </StatCard>
                ))}
              </StatsGrid>

              <DashboardGrid>
                <SectionCard>
                  <SectionTitle>사용자 및 권한 관리</SectionTitle>
                  <ActionGrid>
                    <ActionCard>
                      <ActionTitle>사용자 관리</ActionTitle>
                      <ActionDescription>전체 사용자 및 권한 조회/수정</ActionDescription>
                    </ActionCard>
                    <ActionCard>
                      <ActionTitle>부서 관리</ActionTitle>
                      <ActionDescription>기관 산하 부서 조직 구성</ActionDescription>
                    </ActionCard>
                  </ActionGrid>
                </SectionCard>

                <SectionCard>
                  <SectionTitle>게시판 및 교육 운영</SectionTitle>
                  <ActionGrid>
                    <ActionCard>
                      <ActionTitle>채널 관리</ActionTitle>
                      <ActionDescription>소통 채널 및 게시판 설정</ActionDescription>
                    </ActionCard>
                    <ActionCard>
                      <ActionTitle>게시글 관리</ActionTitle>
                      <ActionDescription>모든 채널의 게시물 모니터링</ActionDescription>
                    </ActionCard>
                    <ActionCard>
                      <ActionTitle>분반 관리</ActionTitle>
                      <ActionDescription>분반 및 교육 과정 운영</ActionDescription>
                    </ActionCard>
                  </ActionGrid>
                </SectionCard>
              </DashboardGrid>

              <SectionCard>
                <SectionTitle>결재 및 행정 지원</SectionTitle>
                <SupportGrid>
                  <ActionCard>
                    <ActionTitle>전체 구매 요청</ActionTitle>
                    <ActionDescription>물품 구매 요청 이력 확인</ActionDescription>
                  </ActionCard>
                  <ActionCard>
                    <ActionTitle $accent>승인 대기 중</ActionTitle>
                    <ActionDescription>검토가 필요한 신규 구매 요청</ActionDescription>
                  </ActionCard>
                </SupportGrid>
              </SectionCard>
            </>
          )}
        </AdminContent>
      </Main>
    </ConsoleShell>
  );
}

const ConsoleShell = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f5;

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const TopLine = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 0.125rem;
  background-color: #17466b;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  width: 14rem;
  min-height: 100vh;
  padding: 1.5rem 0.875rem 2.25rem;
  background-color: ${colors.white};
  border-right: 1px solid ${colors.border};

  @media (min-width: 120rem) {
    width: 17.4375rem;
    padding: 2.25rem 1.5rem 3rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    width: 100%;
    min-height: auto;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  margin-bottom: ${spacing.space24};

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    margin-bottom: ${spacing.space40};
  }
`;

const BrandLogo = styled.img`
  width: 1.75rem;
  height: auto;

  @media (min-width: 120rem) {
    width: 2.625rem;
  }
`;

const BrandText = styled.div`
  min-width: 0;
`;

const BrandTitle = styled.p`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize16};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const BrandDescription = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: 0.6875rem;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize14};
  }
`;

const SidebarNav = styled.nav`
  display: grid;
  gap: ${spacing.space8};
`;

const SidebarItem = styled.div<{ $active: boolean }>`
  min-height: 2.375rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  background-color: ${({ $active }) => ($active ? colors.pointSoft : "transparent")};
  color: ${({ $active }) => ($active ? "#1d9a35" : "#1f2b28")};
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    min-height: 3.625rem;
    padding: 1rem 1rem;
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }
`;

const LogoutButton = styled.button`
  min-height: 2.375rem;
  margin-top: ${spacing.space20};
  border: 1px solid ${colors.border};
  border-radius: 0.375rem;
  background-color: ${colors.white};
  color: #1f2b28;
  font-family: inherit;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.625rem;
    margin-top: ${spacing.space32};
    border-radius: 0.5rem;
    font-size: ${typography.fontSize18};
  }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  background-color: #f4f6f5;
`;

const AdminContent = styled.div`
  position: relative;
  display: grid;
  gap: ${spacing.space16};
  width: 100%;
  max-width: ${layout.adminMaxWidth};
  margin: 0 auto;
  padding: 3.25rem ${spacing.space20} ${spacing.space32};

  @media (min-width: 120rem) {
    gap: ${spacing.space24};
    max-width: ${layout.adminMaxWidthLarge};
    padding: 5.625rem ${spacing.space24} 4.125rem;
  }
`;

const AccountText = styled.p`
  position: absolute;
  top: 1.5rem;
  right: ${spacing.space20};
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    top: 2.375rem;
    right: ${spacing.space24};
    font-size: ${typography.fontSize18};
  }
`;

const PageHeader = styled.header`
  display: grid;
  gap: ${spacing.space8};
`;

const Title = styled.h1`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize24};
  font-weight: 900;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const Description = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space16};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StatCard = styled.section`
  min-height: 5.125rem;
  padding: 1rem 0.875rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    min-height: 8.25rem;
    padding: 1.5rem;
  }
`;

const StatLabel = styled.p`
  margin: 0 0 ${spacing.space8};
  color: #64706c;
  font-size: ${typography.fontSize14};
  font-weight: 800;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space16};
    font-size: ${typography.fontSize18};
  }
`;

const StatValue = styled.p`
  margin: 0;
  color: #050505;
  font-size: ${typography.fontSize24};
  font-weight: 900;
  line-height: ${typography.lineHeight100};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.space16};

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled.section`
  padding: 1.25rem 1rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};

  @media (min-width: 120rem) {
    padding: 2rem 1.75rem;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${spacing.space16};
  color: #050505;
  font-size: ${typography.fontSize18};
  font-weight: 900;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space24};
    font-size: ${typography.fontSize24};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const SupportGrid = styled(ActionGrid)`
  max-width: 41rem;

  @media (min-width: 120rem) {
    max-width: 61.5rem;
  }
`;

const ActionCard = styled.div`
  min-height: 4.25rem;
  padding: 1rem;
  border: 1px solid #e1e5e3;
  border-radius: 0.5rem;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    min-height: 6.875rem;
    padding: 1.5rem;
  }
`;

const ActionTitle = styled.p<{ $accent?: boolean }>`
  margin: 0 0 ${spacing.space4};
  color: ${({ $accent }) => ($accent ? "#b27600" : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 900;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    margin-bottom: ${spacing.space8};
    font-size: ${typography.fontSize18};
  }
`;

const ActionDescription = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize16};
  }
`;

const StatePanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 12rem;
  background-color: ${colors.white};
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};
`;

const InlineStatus = styled.p`
  margin: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};
`;
