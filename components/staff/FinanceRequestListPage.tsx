import styled from "styled-components";
import ListPanel from "@/components/staff/ListPanel";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { FINANCE_REQUESTS_PER_PAGE, type FinanceRequest } from "@/mocks/staffFinance";
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
    no: String((currentPage - 1) * FINANCE_REQUESTS_PER_PAGE + index + 1).padStart(2, "0"),
    className: request.className,
    title: request.title,
    author: request.author,
    date: request.paymentDate,
    status: request.status,
    detailHref: `/staff/finance/${request.id}`,
  }));

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <ListPanel
            title="결제 신청"
            writeLabel="결제 신청 하기"
            writeHref="/staff/finance/new"
            listPath="/staff/finance"
            rows={rows}
            currentPage={currentPage}
            totalPages={totalPages}
            showMineOnlyToggle={false}
            emptyMessage="결제 신청 내역이 없습니다."
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
