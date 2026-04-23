"use client";

import styled from "styled-components";

export default function Page() {
  return (
    <PageWrapper>
      <HeaderRow>
        <Title>교환 신청서 작성하기</Title>
        <SubmitButton type="submit" form="exchange-form">
          교환 신청서 제출하기
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
          <Label htmlFor="reason">교환 신청 사유</Label>
          <TextArea id="reason" name="reason" defaultValue="교환 신청 사유" />
        </Section>

        <Section>
          <Label htmlFor="expireDate">만료일</Label>
          <DateRow>
            <DateInput id="expireDate" name="expireDate" defaultValue="00.00.00" />
            <CalendarButton type="button" aria-label="달력 열기">
              🗓
            </CalendarButton>
          </DateRow>
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
  padding: 32px 24px 80px;
  background: #fff;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #111;
`;

const SubmitButton = styled.button`
  min-width: 150px;
  height: 48px;
  padding: 0 18px;
  border: none;
  background: #e6e6e6;
  color: #111;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Section = styled.section`
  margin-bottom: 28px;
`;

const Label = styled.label`
  display: inline-block;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #111;
`;

const Row = styled.div`
  display: flex;
  gap: 18px;

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
  gap: 16px;
  padding: 0 16px;
`;

const FieldLabel = styled.label`
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: none;
  background: #f3f3f3;
  font-size: 16px;
  color: #111;
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
  font-size: 16px;
  color: #111;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: none;
  background: #f3f3f3;
  font-size: 16px;
  color: #111;
  resize: none;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  width: 120px;
  height: 48px;
  padding: 0 12px;
  border: none;
  background: #f3f3f3;
  font-size: 16px;
  color: #111;
  outline: none;
`;

const CalendarButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #bdbdbd;
  cursor: pointer;
  font-size: 14px;
`;

const StatusSelect = styled.select`
  width: 92px;
  height: 42px;
  padding: 0 12px;
  border: none;
  background: #f3f3f3;
  font-size: 16px;
  color: #111;
  outline: none;
  appearance: none;
`;
