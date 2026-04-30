import styled from "styled-components";
import StaffRequestBoard from "@/components/staff/StaffRequestBoard";
import StaffSidebar from "@/components/staff/StaffSidebar";
import type { FinanceRequest } from "@/mocks/staffFinance";
import { colors, layout } from "@/styles/tokens";

type FinanceRequestListPageProps = {
  currentPage: number;
  requests: FinanceRequest[];
  totalPages: number;
};

export default function FinanceRequestListPage({
  currentPage,
  requests,
  totalPages,
}: FinanceRequestListPageProps) {
  const rows = requests.map((request, index) => ({
    id: request.id,
    no: String((currentPage - 1) * 10 + index + 1).padStart(2, "0"),
    className: request.className,
    title: request.title,
    author: request.author,
    date: request.paymentDate,
    status: request.status,
    detailHref: `/staff/finance/${request.id}`,
  }));

  return (
    <Main>
      <StaffSidebar />

      <Content>
        <StaffRequestBoard
          title="결제 신청"
          writeLabel="결제 신청 하기"
          writeHref="/staff/finance/new"
          listPath="/staff/finance"
          rows={rows}
          currentPage={currentPage}
          totalPages={totalPages}
          showMineOnlyToggle={false}
          emptyMessage="결제 신청 내역이 없습니다."
        />
      </Content>
    </Main>
  );
}

const Main = styled.main`
  display: flex;
  min-height: calc(100vh - ${layout.headerHeight});
  background-color: ${colors.white};

  @media (max-width: ${layout.breakpointTablet}) {
    flex-direction: column;
  }
`;

const Content = styled.section`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
`;
