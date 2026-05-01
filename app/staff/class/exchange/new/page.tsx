"use client";

import { useRef, useState } from "react";
import { IconCalendarMonth } from "@tabler/icons-react";
import styled from "styled-components";
import { colors, layout, spacing, typography } from "@/styles/tokens";

export default function Page() {
  const [expireDateText, setExpireDateText] = useState("00.00.00");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDatePicker = () => {
    const dateInput = dateInputRef.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.click();
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return;

    const [, month, day] = value.split("-");
    setExpireDateText(`00.${month}.${day}`);
  };

  return (
    <PageWrapper>
      <HeaderRow>
        <Title>교환 신청서 작성하기</Title>
        <SubmitButton type="submit" form="exchange-form">
          작성 완료
        </SubmitButton>
      </HeaderRow>

      <Form id="exchange-form">
        <Section>
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" defaultValue="제목" />
        </Section>

        <Section>
          <Label as="h2">신청자 정보</Label>
          <InfoRow>
            <FieldLabel htmlFor="className">반 이름</FieldLabel>
            <InlineInput id="className" name="className" defaultValue="개나리반" />
            <FieldLabel htmlFor="lessonDate">수업 일자</FieldLabel>
            <InlineInput id="lessonDate" name="lessonDate" defaultValue="00.00.00" />
            <FieldLabel htmlFor="writer">작성자</FieldLabel>
            <InlineInput id="writer" name="writer" defaultValue="홍길동" />
          </InfoRow>
        </Section>

        <Section>
          <Label htmlFor="reason">교환 신청 사유</Label>
          <TextArea id="reason" name="reason" defaultValue="교환 신청 사유" />
        </Section>

        <Section>
          <Label htmlFor="expireDate">만료일</Label>
          <DateRow>
            <DateInput
              id="expireDate"
              name="expireDate"
              value={expireDateText}
              readOnly
              onClick={handleOpenDatePicker}
            />
            <HiddenNativeDateInput
              ref={dateInputRef}
              type="date"
              onChange={handleDateChange}
              aria-hidden="true"
              tabIndex={-1}
            />
            <CalendarButton type="button" aria-label="달력 열기" onClick={handleOpenDatePicker}>
              <IconCalendarMonth size={16} stroke={2} />
            </CalendarButton>
          </DateRow>
        </Section>
      </Form>
    </PageWrapper>
  );
}

const PageWrapper = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.3125rem 3.125rem 4rem;
  background: ${colors.white};

  @media (min-width: 120rem) {
    min-height: calc(100vh - 7.1875rem);
    padding: 3.5rem 4.6875rem 6rem;
  }

  @media (max-width: ${layout.breakpointTablet}) {
    padding: ${spacing.space32} ${spacing.space20} ${spacing.space40};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space24};
  margin-bottom: 2.625rem;

  @media (min-width: 120rem) {
    margin-bottom: 3.9375rem;
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
  min-width: 4.75rem;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space20};
  border: 0;
  background: #e4e4e4;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: #d9d9d9;
  }

  @media (min-width: 120rem) {
    min-width: 6.75rem;
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
    gap: 1.875rem;
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

const Input = styled.input`
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #e2e2e2;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  outline: none;

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
  min-width: 0;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background: #e2e2e2;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 6.875rem;
  padding: 0.75rem ${spacing.space12};
  border: 0;
  background: #e2e2e2;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: none;
  outline: none;

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: 1.125rem ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const DateRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 7.75rem;
  min-height: 2.6875rem;
  padding: 0.4375rem ${spacing.space12};
  background: #e2e2e2;

  @media (min-width: 120rem) {
    width: 11.625rem;
    min-height: 4rem;
    padding: 0.625rem ${spacing.space20};
  }
`;

const DateInput = styled.input`
  width: 4.375rem;
  border: 0;
  background: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  @media (min-width: 120rem) {
    width: 6.25rem;
    font-size: ${typography.fontSize20};
  }
`;

const HiddenNativeDateInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const CalendarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: 50%;
  background: #a8a8a8;
  color: #000000;
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;
  }
`;
