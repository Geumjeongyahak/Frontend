"use client";

import styled from "styled-components";
import { colors, spacing, typography } from "@/styles/tokens";

export default function Page() {
  return (
    <PageWrapper>
      <HeaderRow>
        <Title>결강 신청서 작성하기</Title>
        <SubmitButton type="submit" form="exchange-form">
          결강 신청서 제출하기
        </SubmitButton>
      </HeaderRow>

      <Form id="exchange-form">
        <Section>
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" defaultValue="제목" />
        </Section>

        <Section>
          <Label as="h3">신청자 정보</Label>
          <Row>
            <FieldBox>
              <FieldLabel htmlFor="className">반 이름</FieldLabel>
              <InlineInput id="className" name="className" defaultValue="개나리반" />
            </FieldBox>

            <FieldBox>
              <FieldLabel htmlFor="lessonDate">수업 일자</FieldLabel>
              <InlineInput id="lessonDate" name="lessonDate" defaultValue="00.00.00" />
            </FieldBox>
          </Row>
        </Section>

        <Section>
          <Label htmlFor="reason">결강 신청 사유</Label>
          <TextArea id="reason" name="reason" defaultValue="교환 신청 사유" />
        </Section>

        <Section>
          <Label htmlFor="status">신청 현황</Label>
          <StatusSelect id="status" name="status" defaultValue="pending">
            <option value="pending">대기 중</option>
            <option value="accepted">수락 완료</option>
            <option value="closed">마감</option>
          </StatusSelect>
        </Section>
      </Form>
    </PageWrapper>
  );
}

const PageWrapper = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${spacing.space32} ${spacing.space24} 80px;
  background: ${colors.white};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.space32};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${typography.fontSize32};
  font-weight: 700;
  color: ${colors.text};
`;

const SubmitButton = styled.button`
  min-width: 150px;
  height: 48px;
  padding: 0 ${typography.fontSize18};
  border: none;
  background: #e6e6e6;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 600;
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Section = styled.section`
  margin-bottom: ${spacing.space28};
`;

const Label = styled.label`
  display: inline-block;
  margin-bottom: ${spacing.space12};
  font-size: ${typography.fontSize18};
  font-weight: 700;
  color: ${colors.text};
`;

const Row = styled.div`
  display: flex;
  gap: ${typography.fontSize18};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FieldBox = styled.div`
  flex: 1;
  min-height: 48px;
  background: #f3f3f3;
  display: flex;
  align-items: center;
  gap: ${spacing.space16};
  padding: 0 ${spacing.space16};
`;

const FieldLabel = styled.label`
  flex-shrink: 0;
  font-size: ${typography.fontSize16};
  font-weight: 700;
  color: ${colors.text};
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 ${spacing.space16};
  border: none;
  background: #f3f3f3;
  font-size: ${typography.fontSize16};
  color: ${colors.text};
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const InlineInput = styled.input`
  flex: 1;
  height: 48px;
  border: none;
  background: transparent;
  font-size: ${typography.fontSize16};
  color: ${colors.text};
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${spacing.space16};
  border: none;
  background: #f3f3f3;
  font-size: ${typography.fontSize16};
  color: ${colors.text};
  resize: none;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
`;

const DateInput = styled.input`
  width: 120px;
  height: 48px;
  padding: 0 ${spacing.space12};
  border: none;
  background: #f3f3f3;
  font-size: ${typography.fontSize16};
  color: ${colors.text};
  outline: none;
`;

const CalendarButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #bdbdbd;
  cursor: pointer;
  font-size: ${typography.fontSize14};
`;

const StatusSelect = styled.select`
  width: 92px;
  height: 42px;
  padding: 0 ${spacing.space12};
  border: none;
  background: #f3f3f3;
  font-size: ${typography.fontSize16};
  color: ${colors.text};
  outline: none;
  appearance: none;
`;
