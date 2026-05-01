import Link from "next/link";
import { IconDownload } from "@tabler/icons-react";
import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import type { FinanceRequest } from "@/mocks/staffFinance";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type FinanceRequestDetailPageProps = {
  request: FinanceRequest;
};

const receiptFiles = ["자료.pdf", "자료.pdf", "자료.pdf", "자료.pdf"];

export default function FinanceRequestDetailPage({ request }: FinanceRequestDetailPageProps) {
  const detailItems = [
    {
      id: request.id,
      name: request.title,
      reason: request.detail,
      receipts: receiptFiles,
    },
  ];

  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <Actions>
            <ActionButton type="button" $variant="danger">
              삭제
            </ActionButton>
            <ActionButton type="button">수정</ActionButton>
            <ListButton href="/staff/finance">목록</ListButton>
          </Actions>

          <ContentColumn>
            <DateBar>{request.paymentDate}</DateBar>

            <Section>
              <Label>제목</Label>
              <Field>{request.title}</Field>
            </Section>

            <Section>
              <SectionTitle>신청자 정보</SectionTitle>
              <InfoRow>
                <InlineLabel>반 이름</InlineLabel>
                <InlineField>{request.className}</InlineField>
                <InlineLabel>결제 일자</InlineLabel>
                <InlineField>{request.paymentDate}</InlineField>
                <InlineLabel>신청자</InlineLabel>
                <InlineField>{request.author}</InlineField>
              </InfoRow>
            </Section>

            <Section>
              <SectionTitle>상세 품목</SectionTitle>
              <DetailItemList>
                {detailItems.map((item, index) => (
                  <DetailItemRow key={item.id}>
                    <DetailLabel>품목 {index + 1}</DetailLabel>
                    <DetailField>{item.name}</DetailField>
                    <DetailLabel>결제 사유</DetailLabel>
                    <ReasonField>{item.reason}</ReasonField>
                    <DetailLabel>영수증</DetailLabel>
                    <ReceiptList>
                      {item.receipts.map((receipt, receiptIndex) => (
                        <ReceiptLink
                          key={`${item.id}-${receiptIndex}`}
                          href="#"
                          aria-label={`${receipt} 다운로드`}
                        >
                          <span>{receipt}</span>
                          <ReceiptIcon aria-hidden="true">
                            <IconDownload size={16} stroke={2.25} />
                          </ReceiptIcon>
                        </ReceiptLink>
                      ))}
                    </ReceiptList>
                  </DetailItemRow>
                ))}
              </DetailItemList>
            </Section>

            <Section>
              <SectionTitle>신청 현황</SectionTitle>
              <StatusField>{request.status}</StatusField>
            </Section>
          </ContentColumn>
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
  padding: 1.8125rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 2.75rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-inline: ${spacing.space16};
  }
`;

const Actions = styled.div`
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

const BaseAction = styled.button<{ $variant?: "default" | "danger" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${({ $variant }) => ($variant === "danger" ? "#fde4e2" : colors.point)};
  padding: 0.8125rem ${spacing.space20};
  color: ${({ $variant }) => ($variant === "danger" ? "#da3a30" : colors.white)};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;
  cursor: pointer;

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const ActionButton = styled(BaseAction)``;

const ListButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.9375rem;
  min-height: 2.6875rem;
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  padding: 0.8125rem ${spacing.space20};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    min-width: 5.9375rem;
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
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

const SectionTitle = styled.h2`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const Field = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.6875rem;
  min-width: 0;
  background-color: #f7f7f7;
  padding: 0.8125rem ${spacing.space12};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  overflow-wrap: anywhere;

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

const InlineLabel = styled.span`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineField = styled(Field)``;

const DetailItemList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(9.25rem, 13.75rem) auto minmax(0, 1fr) auto minmax(
      5.875rem,
      6.25rem
    );
  align-items: flex-start;
  gap: ${spacing.space12};
  padding-bottom: ${spacing.space20};
  border-bottom: 1px solid #d4d4d4;

  & + & {
    padding-top: ${spacing.space20};
  }

  @media (min-width: 120rem) {
    grid-template-columns: auto 17.25rem auto minmax(0, 1fr) auto 7.875rem;
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const DetailLabel = styled(InlineLabel)`
  min-height: 2.6875rem;
  display: inline-flex;
  align-items: center;

  @media (min-width: 120rem) {
    min-height: 4rem;
  }
`;

const DetailField = styled(Field)`
  color: #7b7b7b;
`;

const ReasonField = styled(DetailField)`
  align-items: flex-start;
`;

const ReceiptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  min-width: 0;
  background-color: ${colors.background};
  padding: ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const ReceiptLink = styled(Link)`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1.5rem;
  align-items: center;
  gap: ${spacing.space8};
  min-width: 0;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-offset: 0.125rem;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 120rem) {
    grid-template-columns: minmax(0, 1fr) 2.25rem;
    font-size: ${typography.fontSize20};
  }
`;

const ReceiptIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${colors.point};
  color: ${colors.white};

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
`;

const StatusField = styled(Field)`
  width: fit-content;
  justify-content: center;
  border-radius: ${radii.radius15};
  background-color: #fbf4d7;
  padding-inline: ${spacing.space20};
  color: #e5ad34;
  font-weight: 600;

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;
