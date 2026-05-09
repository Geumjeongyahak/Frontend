"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendarMonth } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import styled from "styled-components";
import { createLessonExchangeRequest } from "@/api/lessonExchange/lessonExchange.api";
import {
  getKstTodayShortDate,
  koreanShortDateToLocalDateTime,
  parseKoreanShortDateToIsoDate,
} from "@/utils/kstShortDate";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export default function Page() {
  const kstToday = getKstTodayShortDate();
  const [expireDateText, setExpireDateText] = useState(kstToday);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const createLessonExchangeMutation = useMutation({
    mutationFn: createLessonExchangeRequest,
    onSuccess: () => {
      router.push("/staff/class/exchange");
      router.refresh();
    },
    onError: () => {
      window.alert("수업 교환 신청서 생성에 실패했습니다.");
    },
  });

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

    const [year, month, day] = value.split("-");
    setExpireDateText(`${year.slice(-2)}.${month}.${day}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createLessonExchangeMutation.isPending) return;

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("reason") ?? "").trim();
    const lessonDateRaw = String(formData.get("lessonDate") ?? "").trim();
    const periodFromRaw = String(formData.get("lessonPeriodFrom") ?? "").trim();
    const periodToRaw = String(formData.get("lessonPeriodTo") ?? "").trim();

    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateRaw);
    const expiresAt = koreanShortDateToLocalDateTime(expireDateText.trim());
    const startPeriod = Number.parseInt(periodFromRaw, 10);
    const endPeriod = Number.parseInt(periodToRaw, 10);

    if (!title || !content) {
      window.alert("필수 입력값을 확인해주세요.");
      return;
    }
    if (!lessonDate) {
      window.alert("수업 일자를 YY.MM.DD 형식으로 입력해 주세요.");
      return;
    }
    if (!expiresAt) {
      window.alert("만료일을 달력에서 선택해 주세요.");
      return;
    }
    if (
      !Number.isFinite(startPeriod) ||
      !Number.isFinite(endPeriod) ||
      startPeriod < 1 ||
      endPeriod < 1
    ) {
      window.alert("수업 교시를 올바른 숫자로 입력해 주세요.");
      return;
    }

    createLessonExchangeMutation.mutate({
      lessonDate,
      title,
      content,
      startPeriod,
      endPeriod,
      expiresAt,
    });
  };

  return (
    <PageWrapper>
      <HeaderRow>
        <Title>교환 신청서 작성하기</Title>
        <SubmitButton
          type="submit"
          form="exchange-form"
          disabled={createLessonExchangeMutation.isPending}
        >
          {createLessonExchangeMutation.isPending ? "작성 중..." : "작성 완료"}
        </SubmitButton>
      </HeaderRow>

      <Form id="exchange-form" onSubmit={handleSubmit}>
        <Section>
          <Label htmlFor="title">제목</Label>
          <Input id="title" name="title" defaultValue="제목" />
        </Section>

        <Section>
          <Label as="h2">신청자 정보</Label>
          <InfoStack>
            <InfoPairRow $wideFirst>
              <FieldLabel htmlFor="className">반 이름</FieldLabel>
              <InlineInput id="className" name="className" defaultValue="개나리반" />
              <FieldLabel htmlFor="writer">작성자</FieldLabel>
              <InlineInput id="writer" name="writer" defaultValue="홍길동" disabled />
            </InfoPairRow>
            <InfoPairRow>
              <FieldLabel htmlFor="lessonDate">수업 일자</FieldLabel>
              <InlineInput id="lessonDate" name="lessonDate" defaultValue={kstToday} />
              <FieldLabel id="lessonPeriod-label">수업 교시</FieldLabel>
              <LessonPeriodInputs role="group" aria-labelledby="lessonPeriod-label">
                <LessonPeriodInput
                  name="lessonPeriodFrom"
                  defaultValue="1"
                  aria-label="수업 교시 시작"
                />
                <PeriodTilde aria-hidden>~</PeriodTilde>
                <LessonPeriodInput
                  name="lessonPeriodTo"
                  defaultValue="2"
                  aria-label="수업 교시 끝"
                />
              </LessonPeriodInputs>
            </InfoPairRow>
          </InfoStack>
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
              <IconCalendarMonth size={16} stroke={2} color={colors.white} />
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
  border-radius: ${radii.radius12};
  background-color: ${colors.point};
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  background: ${colors.background};
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

const InfoStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const InfoPairRow = styled.div<{ $wideFirst?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $wideFirst }) =>
    $wideFirst
      ? `auto minmax(0, 2.25fr) auto minmax(0, 1fr)`
      : `auto minmax(0, 1fr) auto minmax(0, 1fr)`};
  align-items: center;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const LessonPeriodInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};
  min-width: 0;

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
  }
`;

const PeriodTilde = styled.span`
  flex-shrink: 0;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FieldLabel = styled.label`
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineInput = styled.input`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  background: ${colors.background};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};

  &:disabled {
    background: #b5b5b5;
    color: #4f4f4f;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const LessonPeriodInput = styled(InlineInput)`
  flex: 1 1 0;
  min-width: 2.5rem;
  text-align: center;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 6.875rem;
  padding: 0.75rem ${spacing.space12};
  background: ${colors.background};
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
  background: ${colors.background};

  @media (min-width: 120rem) {
    width: 11.625rem;
    min-height: 4rem;
    padding: 0.625rem ${spacing.space20};
  }
`;

const DateInput = styled.input`
  width: 4.375rem;
  background: transparent;
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
  background: ${colors.point};
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;
  }
`;
