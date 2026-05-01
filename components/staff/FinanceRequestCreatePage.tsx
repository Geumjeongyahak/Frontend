import { IconFilePlus } from "@tabler/icons-react";
import styled from "styled-components";
import StaffSidebar from "@/components/staff/StaffSidebar";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function FinanceRequestCreatePage() {
  return (
    <Main>
      <Stage>
        <StaffSidebar />

        <Content>
          <HeaderRow>
            <Title>결제 신청서 작성하기</Title>
            <SubmitButton type="submit" form="finance-request-form">
              결제 신청서 제출하기
            </SubmitButton>
          </HeaderRow>

          <Form id="finance-request-form">
            <Section>
              <Label htmlFor="title">제목</Label>
              <Input id="title" name="title" placeholder="제목" />
            </Section>

            <Section>
              <SectionTitle>신청자 정보</SectionTitle>
              <InfoRow>
                <FieldLabel htmlFor="className">반 이름</FieldLabel>
                <InlineInput id="className" name="className" placeholder="개나리반" />
                <FieldLabel htmlFor="paymentDate">결제 일자</FieldLabel>
                <InlineInput id="paymentDate" name="paymentDate" placeholder="00.00.00" />
                <FieldLabel htmlFor="applicant">신청자</FieldLabel>
                <InlineInput id="applicant" name="applicant" placeholder="홍길동" />
              </InfoRow>
            </Section>

            <Section>
              <SectionTitle>상세 품목</SectionTitle>
              <ItemBlock>
                <ItemFieldRow>
                  <ItemLabel htmlFor="itemName">품목</ItemLabel>
                  <ItemInput id="itemName" name="itemName" placeholder="품목" />
                </ItemFieldRow>
                <ItemFieldRow>
                  <ItemLabel htmlFor="paymentReason">결제 사유</ItemLabel>
                  <ItemInput id="paymentReason" name="paymentReason" placeholder="품목" />
                </ItemFieldRow>
                <ItemLabel as="span">영수증</ItemLabel>
                <UploadControl>
                  <UploadInput id="receiptFile" name="receiptFile" type="file" />
                  <UploadBox htmlFor="receiptFile">
                    <IconFilePlus size={24} stroke={1.8} aria-hidden="true" />
                    <span>파일 추가하기</span>
                  </UploadBox>
                </UploadControl>
              </ItemBlock>

              <AddItemButton type="button">품목 추가하기</AddItemButton>
            </Section>
          </Form>
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
  padding: 2.3125rem 3.125rem 4rem;

  @media (min-width: 120rem) {
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    padding-inline: ${spacing.space16};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.125rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.1875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #000000;
  font-size: ${typography.fontSize20};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize32};
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  border-radius: ${radii.radius15};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
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

const Label = styled.label`
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

const inputBase = `
  min-width: 0;
  min-height: 2.6875rem;
  border: 0;
  background-color: ${colors.background};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    font-size: ${typography.fontSize20};
  }
`;

const Input = styled.input`
  ${inputBase}
  width: 100%;
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
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

const FieldLabel = styled.label`
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineInput = styled.input`
  ${inputBase}
  padding: 0.8125rem ${spacing.space12};

  @media (min-width: 120rem) {
    padding: ${spacing.space20};
  }
`;

const ItemBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};
  padding-bottom: ${spacing.space20};
  border-bottom: 1px solid #bcbcbc;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    padding-bottom: 1.875rem;
  }
`;

const ItemFieldRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const ItemLabel = styled(Label)`
  min-width: 4rem;
  white-space: nowrap;

  @media (min-width: 120rem) {
    min-width: 6.125rem;
  }
`;

const ItemInput = styled(Input)`
  padding-inline: ${spacing.space20};

  @media (min-width: 120rem) {
    padding-inline: 1.875rem;
  }
`;

const UploadControl = styled.div`
  display: flex;
  align-items: flex-start;
`;

const UploadInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
`;

const UploadBox = styled.label`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
  min-width: 5.5rem;
  min-height: 4.125rem;
  padding: ${spacing.space20};
  background-color: ${colors.background};
  color: #969696;
  font-size: 0.5rem;
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-width: 8.375rem;
    min-height: 6.25rem;
    gap: 0.9375rem;
    padding: 1.875rem;
    font-size: 0.75rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.125rem;
  border: 1px solid ${colors.point};
  background-color: #eef9e6;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  @media (min-width: 120rem) {
    min-height: 3.125rem;
    font-size: ${typography.fontSize20};
  }
`;
