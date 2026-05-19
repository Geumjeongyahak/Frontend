"use client";

import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { getPurchaseRequests } from "@/api/request/request.api";
import type { PurchaseRequestStatus } from "@/api/request/request.dto";
import ListPanel from "@/components/staff/common/ListPanel";
import StaffSidebar from "@/components/staff/common/StaffSidebar";
import { FINANCE_REQUESTS_PER_PAGE } from "@/mocks/staffFinance";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type FinanceRequestListPageProps = {
  currentPage: number;
};

const statusLabels: Record<PurchaseRequestStatus, string> = {
  PENDING: "대기 중",
  APPROVED: "승인 완료",
  PURCHASED: "구매 완료",
  CONFIRMED: "결재 확인",
  REJECTED: "반려",
};

function getStatusLabel(status?: PurchaseRequestStatus) {
  return status ? (statusLabels[status] ?? status) : "-";
}

export default function FinanceRequestListPage({ currentPage }: FinanceRequestListPageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.purchaseList(),
    queryFn: () => getPurchaseRequests(),
    retry: false,
  });

  const requests = data ?? [];
  const totalPages = Math.max(1, Math.ceil(requests.length / FINANCE_REQUESTS_PER_PAGE));
  const safeCurrentPage =
    Number.isInteger(currentPage) && currentPage >= 1 && currentPage <= totalPages
      ? currentPage
      : 1;
  const startIndex = (safeCurrentPage - 1) * FINANCE_REQUESTS_PER_PAGE;
  const visibleRequests = requests.slice(startIndex, startIndex + FINANCE_REQUESTS_PER_PAGE);

  const rows = visibleRequests.map((request, index) => ({
    id: request.id ?? index,
    no: String((safeCurrentPage - 1) * FINANCE_REQUESTS_PER_PAGE + index + 1).padStart(2, "0"),
    className: request.classroomName ?? "-",
    title: request.title ?? "제목 없음",
    author: request.requestedByName ?? "-",
    date: formatUtcToKstShortDate(request.createdAt),
    status: getStatusLabel(request.status),
    detailHref: `/staff/finance-management/${request.id}`,
  }));

  const emptyMessage = isLoading
    ? "결제 신청 내역을 불러오는 중입니다."
    : isError
      ? "결제 신청 내역을 불러오지 못했습니다."
      : "결제 신청 내역이 없습니다.";

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <ListPanel
            title="결제 신청"
            writeLabel="결제 신청 하기"
            writeHref="/staff/finance-management/new"
            listPath="/staff/finance-management"
            rows={rows}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            showMineOnlyToggle={false}
            emptyMessage={emptyMessage}
            headerTone="finance"
          />
        </Content>
      </Stage>
    </Main>
  );
}

const Main = styled.main`
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};
`;

const Stage = styled.div`
  display: flex;
  width: 100%;
  max-width: 80rem;
  min-height: calc(100vh - ${layout.headerHeight});
  margin: 0 auto;
  background-color: ${colors.white};

  @media (min-width: 120rem) {
    max-width: 120rem;
    min-height: calc(100vh - 7.1875rem);
  }

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
`;
