import Link from "next/link";
import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import type { FinanceRequest } from "@/mocks/staffFinance";
import { colors, layout, typography } from "@/styles/tokens";

type FinanceRequestDetailPageProps = {
  request: FinanceRequest;
};

export default function FinanceRequestDetailPage({
  request,
}: FinanceRequestDetailPageProps) {
  return (
    <Main>
      <StaffSidebar currentItem="결제 신청" />

      <Content>
        <Actions>
          <ActionButton type="button">삭제</ActionButton>
          <ActionButton type="button">수정</ActionButton>
          <ListButton href="/staff/finance">목록</ListButton>
        </Actions>

        <Section>
          <Label>제목</Label>
          <Field>{request.title}</Field>
        </Section>

        <Section>
          <SectionTitle>신청자 정보</SectionTitle>
          <InlineGrid>
            <InlineGroup>
              <InlineLabel>반 이름</InlineLabel>
              <InlineField>{request.className}</InlineField>
            </InlineGroup>
            <InlineGroup>
              <InlineLabel>결제 일자</InlineLabel>
              <InlineField>{request.paymentDate}</InlineField>
            </InlineGroup>
          </InlineGrid>
        </Section>

        <Section>
          <SectionTitle>상세 품목</SectionTitle>
          <LargeField>{request.detail}</LargeField>
        </Section>

        <Section>
          <SectionTitle>신청 현황</SectionTitle>
          <StatusField>{request.status}</StatusField>
        </Section>
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
  padding: 2rem 2.5rem 2.5rem;

  @media (max-width: ${layout.breakpointDesktop}) {
    padding: 1.75rem 1.5rem 2rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding: 1.5rem 1rem;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 2.75rem;
`;

const BaseAction = styled.button`
  border: 0;
  background-color: #ececec;
  padding: 0.95rem 1.5rem;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  cursor: pointer;
`;

const ActionButton = styled(BaseAction)``;

const ListButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background-color: #ececec;
  padding: 0.95rem 1.5rem;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
`;

const Section = styled.section`
  & + & {
    margin-top: 1.75rem;
  }
`;

const Label = styled.h2`
  margin-bottom: 0.75rem;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: ${colors.text};
  font-size: 1rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const Field = styled.div`
  min-height: 4rem;
  background-color: #f5f5f5;
  padding: 1.15rem 1.25rem;
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 500;
  line-height: ${typography.lineHeight150};
`;

const InlineGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

const InlineGroup = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
`;

const InlineLabel = styled.span`
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 700;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
`;

const InlineField = styled.div`
  min-height: 4rem;
  background-color: #f5f5f5;
  padding: 1.15rem 1.25rem;
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 500;
  line-height: ${typography.lineHeight150};
`;

const LargeField = styled.div`
  min-height: 9.5rem;
  background-color: #f5f5f5;
  padding: 1.15rem 1.25rem;
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 500;
  line-height: ${typography.lineHeight150};
`;

const StatusField = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 7.5rem;
  min-height: 4rem;
  background-color: #f5f5f5;
  padding: 0.75rem 1.25rem;
  color: ${colors.text};
  font-size: 0.95rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};
`;
