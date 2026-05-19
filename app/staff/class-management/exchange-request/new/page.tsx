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
  //const kstToday = getKstTodayShortDate();

  const [lessonDateText, setLessonDateText] = useState("");
  const [expireDateText, setExpireDateText] = useState("");

  const lessonDateInputRef = useRef<HTMLInputElement>(null);
  const expireDateInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const createLessonExchangeMutation = useMutation({
    mutationFn: createLessonExchangeRequest,
    onSuccess: () => {
      router.push("/staff/class-management/exchange-request");
      router.refresh();
    },
    onError: () => {
      window.alert("수업 교환 신청서 생성에 실패했습니다.");
    },
  });

  const handleOpenDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    const dateInput = ref.current;
    if (!dateInput) return;

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.click();
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const value = event.target.value;
    if (!value) return;

    const [year, month, day] = value.split("-");
    setter(`${year.slice(-2)}.${month}.${day}`);
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

    createLessonExchangeMutation.mutate({
      lessonDate,
      title,
      content,
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
          <Input id="title" name="title" placeholder="제목" />
        </Section>

        <Section>
          <Label as="h2">신청자 정보</Label>
          <InfoStack>
            <InfoPairRow>
              <FieldLabel htmlFor="className">반 이름</FieldLabel>
              <InlineInput id="className" name="className" placeholder="반 이름" />
              <FieldLabel htmlFor="writer">작성자</FieldLabel>
              <InlineInput id="writer" name="writer" placeholder="홍길동" />
              <FieldLabel htmlFor="lessonDate">수업 일자</FieldLabel>
              <DateRow>
                <DateInput
                  id="lessonDate"
                  name="lessonDate"
                  placeholder="00.00.00"
                  value={lessonDateText}
                  readOnly
                  onClick={() => handleOpenDatePicker(lessonDateInputRef)}
                />
                <HiddenNativeDateInput
                  ref={lessonDateInputRef}
                  type="date"
                  onChange={(e) => handleDateChange(e, setLessonDateText)}
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <CalendarButton
                  type="button"
                  aria-label="수업 일자 달력 열기"
                  onClick={() => handleOpenDatePicker(lessonDateInputRef)}
                >
                  <IconCalendarMonth size={16} stroke={2} color={colors.white} />
                </CalendarButton>
              </DateRow>
            </InfoPairRow>
          </InfoStack>
        </Section>

        <Section>
          <Label htmlFor="reason">교환 신청 사유</Label>
          <InlineInput id="reason" name="reason" placeholder="교환 신청 사유" />
        </Section>

        <Section>
          <Label htmlFor="expireDate">만료일</Label>
          <DateRow>
            <DateInput
              id="expireDate"
              name="expireDate"
              placeholder="00.00.00"
              value={expireDateText}
              readOnly
              onClick={() => handleOpenDatePicker(expireDateInputRef)}
            />
            <HiddenNativeDateInput
              ref={expireDateInputRef}
              type="date"
              onChange={(e) => handleDateChange(e, setExpireDateText)}
              aria-hidden="true"
              tabIndex={-1}
            />
            <CalendarButton
              type="button"
              aria-label="만료일 달력 열기"
              onClick={() => handleOpenDatePicker(expireDateInputRef)}
            >
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
  font-size: ${typography.fontSize24};
  font-weight: 500;
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
  gap: ${spacing.space16};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const Label = styled.label`
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
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  border: 1px solid #c0c0c0;
  outline: none;

  &::placeholder {
    color: #c0c0c0;
  }

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

const InfoPairRow = styled.div`
  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr)
    auto minmax(0, 1fr)
    auto auto;

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
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const InlineInput = styled.input`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  border: 1px solid #c0c0c0;
  outline: none;

  &::placeholder {
    color: #c0c0c0;
  }

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

const DateRow = styled.div`
  display: inline-flex;
  align-items: center;
  width: 100%;

  min-width: 7.75rem;
  justify-content: space-between;
  width: 7.75rem;
  min-height: 2.6875rem;
  padding: 0.4375rem ${spacing.space12};
  border: 1px solid #c0c0c0;
  outline: none;

  &::placeholder {
    color: #c0c0c0;
  }

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
