"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCalendarMonth } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { createLessonExchangeRequest } from "@/api/lessonExchange/lessonExchange.api";
import { getCurrentUser } from "@/api/user/user.api";
import { extractApiErrorMessage } from "@/lib/extractApiErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import {
  getLessonExchangeExpiresDateForApi,
  parseKoreanShortDateToIsoDate,
} from "@/utils/kstShortDate";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

function autoResizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;

  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export default function Page() {
  const queryClient = useQueryClient();
  const [lessonDateText, setLessonDateText] = useState("");
  const [expireDateText, setExpireDateText] = useState("");
  const [lessonDateValue, setLessonDateValue] = useState("");
  const [expireDateValue, setExpireDateValue] = useState("");

  const lessonDateInputRef = useRef<HTMLInputElement>(null);
  const expireDateInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const currentUserQuery = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getCurrentUser,
    retry: false,
    refetchOnMount: "always",
  });
  const currentUser = currentUserQuery.isFetchedAfterMount ? currentUserQuery.data : undefined;
  const teacherAssignments = currentUser?.teacherAssignments ?? [];
  const assignmentClassNames = Array.from(
    new Set(
      teacherAssignments
        .map((assignment) => assignment.classroomName?.trim() ?? "")
        .filter((name) => name.length > 0),
    ),
  );
  const hasMultipleClassNames = assignmentClassNames.length > 1;
  const className = assignmentClassNames.length === 1 ? assignmentClassNames[0] : "";
  const writerName = currentUser?.name ?? "";

  const createLessonExchangeMutation = useMutation({
    mutationFn: createLessonExchangeRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.requests.lessonExchangeList(),
      });
      router.push("/staff/class-management/exchange-request");
      router.refresh();
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "수업 교환 신청서 생성에 실패했습니다."));
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
    valueSetter?: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const value = event.target.value;
    if (!value) {
      valueSetter?.("");
      setter("");
      return;
    }

    const [year, month, day] = value.split("-");
    valueSetter?.(value);
    setter(`${year.slice(-2)}.${month}.${day}`);
  };

  const handleLessonDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) return;

    handleDateChange(event, setLessonDateText, setLessonDateValue);

    setExpireDateValue(value);
    setExpireDateText(`${value.slice(2, 4)}.${value.slice(5, 7)}.${value.slice(8, 10)}`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createLessonExchangeMutation.isPending) return;

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("reason") ?? "").trim();
    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateText.trim());
    const expiresDateInput = parseKoreanShortDateToIsoDate(expireDateText.trim());

    if (!title || !content) {
      window.alert("필수 입력값을 확인해주세요.");
      return;
    }
    if (!lessonDate) {
      window.alert("수업 일자를 선택해 주세요.");
      return;
    }
    if (expireDateText.trim() && !expiresDateInput) {
      window.alert("만료일을 달력에서 선택해 주세요.");
      return;
    }
    if (expiresDateInput && expiresDateInput > lessonDate) {
      window.alert("만료일은 수업 일자 이후로 선택할 수 없습니다.");
      return;
    }

    const expiresDate = getLessonExchangeExpiresDateForApi(expiresDateInput ?? "", lessonDate);

    createLessonExchangeMutation.mutate({
      lessonDate,
      title,
      content,
      ...(expiresDate ? { expiresDate } : {}),
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
              {hasMultipleClassNames ? (
                <InlineSelect id="className" name="className" defaultValue="">
                  <option value="" disabled>
                    반 이름을 선택해 주세요
                  </option>
                  {assignmentClassNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </InlineSelect>
              ) : (
                <InlineInput
                  id="className"
                  name="className"
                  placeholder="반 이름"
                  value={className}
                  readOnly
                />
              )}
              <FieldLabel htmlFor="writer">작성자</FieldLabel>
              <InlineInput id="writer" name="writer" placeholder="홍길동" value={writerName} readOnly />
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
                  value={lessonDateValue}
                  onChange={handleLessonDateChange}
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
          <ReasonInput
            id="reason"
            name="reason"
            placeholder="교환 신청 사유"
            onInput={(event) => autoResizeTextarea(event.currentTarget)}
          />
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
              max={lessonDateValue || undefined}
              value={expireDateValue}
              onChange={(e) => handleDateChange(e, setExpireDateText, setExpireDateValue)}
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
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.white};
  color: ${colors.point};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  &:not(:disabled):hover {
    background-color: ${colors.pointSoft};
  }

  &:disabled {
    border-color: #d4d4d4;
    background-color: #d4d4d4;
    color: #7b7b7b;
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

const ReasonInput = styled.textarea`
  width: 100%;
  min-height: 6.875rem;
  padding: 0.8125rem ${spacing.space12};
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  border: 1px solid #c0c0c0;
  outline: none;
  resize: none;
  overflow: hidden;
  font-family: inherit;

  &::placeholder {
    color: #c0c0c0;
  }

  &:disabled {
    background: #b5b5b5;
    color: #4f4f4f;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const InlineSelect = styled.select`
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  padding-right: 2rem;
  font-size: ${typography.fontSize14};
  font-weight: 400;
  line-height: ${typography.lineHeight130};
  border: 1px solid #c0c0c0;
  outline: none;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #8c8c8c 50%),
    linear-gradient(135deg, #8c8c8c 50%, transparent 50%);
  background-position:
    calc(100% - 1rem) calc(50% - 2px),
    calc(100% - 0.6875rem) calc(50% - 2px);
  background-size:
    0.375rem 0.375rem,
    0.375rem 0.375rem;
  background-repeat: no-repeat;

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
