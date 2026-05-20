"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { createJournal } from "@/api/dailySchedule/dailySchedule.api";
import { getCurrentUser } from "@/api/user/user.api";
import { formatPhone } from "@/lib/googleSheet/classJournal/classJournalSheetPayload";
import { queryKeys } from "@/lib/queryKeys";
import { parseKoreanShortDateToIsoDate } from "@/utils/kstShortDate";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const lessonPeriods = [1, 2, 3] as const;
const attendanceColumns = Array.from({ length: 10 }, (_, index) => index);

export default function ClassJournalCreatePage() {
  const router = useRouter();
  const [lessonDateText, setLessonDateText] = useState("");
  const [classroomId, setClassroomId] = useState("");

  const currentUserQuery = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getCurrentUser,
    retry: false,
  });

  const createJournalMutation = useMutation({
    mutationFn: createJournal,
    onSuccess: (data) => {
      window.alert("수업 일지가 등록되었습니다.");
      if (data.dailyScheduleId) {
        router.push(`/staff/class-management/${data.dailyScheduleId}`);
        return;
      }
      router.push("/staff/class-management");
    },
    onError: (error) => {
      window.alert(error instanceof Error ? error.message : "수업 일지 등록에 실패했습니다.");
    },
  });

  const isSubmitting = createJournalMutation.isPending;
  const currentUser = currentUserQuery.data;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const lessonDate = parseKoreanShortDateToIsoDate(lessonDateText.trim());
    const parsedClassroomId = Number.parseInt(classroomId, 10);
    const personalInfoConsent = formData.get("privacyConsent") === "on";
    const residentRegistrationNumberPrefix = String(formData.get("birthPrefix") ?? "").trim();

    if (!lessonDate) {
      window.alert("활동 일자를 00.00.00 형식으로 입력해 주세요.");
      return;
    }

    if (!Number.isInteger(parsedClassroomId) || parsedClassroomId <= 0) {
      window.alert("담당 수업 ID를 입력해 주세요.");
      return;
    }

    if (!personalInfoConsent) {
      window.alert("개인정보 제공 동의가 필요합니다.");
      return;
    }

    createJournalMutation.mutate({
      lessonDate,
      classroomId: parsedClassroomId,
      personalInfoConsent,
      residentRegistrationNumberPrefix: residentRegistrationNumberPrefix || undefined,
      lessonJournals: [],
    });
  };

  return (
    <PageSection>
      <HeaderRow>
        <Title>수업 일지 작성하기</Title>
        <HeaderActions>
          <ConsentLabel>
            <ConsentCheckbox type="checkbox" name="privacyConsent" form="class-journal-form" />
            <span>정보 제공 동의</span>
          </ConsentLabel>
          <SubmitButton type="submit" form="class-journal-form" disabled={isSubmitting}>
            {isSubmitting ? "제출 중..." : "수업 일지 제출하기"}
          </SubmitButton>
        </HeaderActions>
      </HeaderRow>

      <Form id="class-journal-form" onSubmit={handleSubmit}>
        <InfoGrid>
          <InfoField>
            <FieldLabel htmlFor="writer">작성자</FieldLabel>
            <FieldInput
              id="writer"
              name="writer"
              type="text"
              value={currentUser?.name ?? ""}
              placeholder="작성자"
              disabled
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="birthPrefix">주민번호 앞자리</FieldLabel>
            <FieldInput
              id="birthPrefix"
              name="birthPrefix"
              type="text"
              placeholder="000000"
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="phone">연락처</FieldLabel>
            <FieldInput
              id="phone"
              name="phone"
              type="text"
              value={currentUser?.phoneNumber ? formatPhone(currentUser.phoneNumber) : ""}
              placeholder="010-0000-0000"
              disabled
              readOnly
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="classroomId">담당 수업</FieldLabel>
            <FieldInput
              id="classroomId"
              name="classroomId"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="장미반"
              value={classroomId}
              onChange={(event) => setClassroomId(event.target.value)}
            />
          </InfoField>

          <InfoField>
            <FieldLabel htmlFor="lessonDate">활동 일자</FieldLabel>
            <FieldInput
              id="lessonDate"
              name="lessonDate"
              type="text"
              placeholder="00.00.00"
              value={lessonDateText}
              onChange={(event) => setLessonDateText(event.target.value)}
            />
          </InfoField>
        </InfoGrid>

        <LessonSection>
          <SectionTitle>수업 내용</SectionTitle>
          {lessonPeriods.map((period) => (
            <LessonField key={period}>
              <FieldLabel htmlFor={`lesson-${period}`}>{period}교시</FieldLabel>
              <LessonTextArea
                id={`lesson-${period}`}
                name={`lesson${period}`}
                placeholder={`${period}교시 수업 내용을 작성해주세요`}
              />
            </LessonField>
          ))}
        </LessonSection>

        <AttendanceSection>
          <SectionTitle>출석</SectionTitle>
          <AttendanceTableWrap>
            <AttendanceGrid aria-label="출석부">
              {attendanceColumns.map((column) => (
                <AttendanceInput
                  key={`student-${column}`}
                  name={`studentName${column + 1}`}
                  aria-label={`${column + 1}번 학생 이름`}
                  placeholder={column < 4 ? "최양진" : ""}
                />
              ))}
              {attendanceColumns.map((column) => (
                <AttendanceInput
                  key={`attendance-${column}`}
                  name={`attendanceStatus${column + 1}`}
                  aria-label={`${column + 1}번 출석 상태`}
                />
              ))}
            </AttendanceGrid>
            <AddAttendanceButton type="button">출석부 추가하기</AddAttendanceButton>
          </AttendanceTableWrap>
        </AttendanceSection>
      </Form>
    </PageSection>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - ${layout.headerHeight});
  padding: 2.1875rem 3.125rem 4rem;
  background-color: ${colors.white};

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
  margin-bottom: 2.1875rem;

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
  font-size: 1.625rem;
  font-weight: 600;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: 2.5rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.space20};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ConsentLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space8};
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  white-space: nowrap;
  cursor: pointer;

  @media (min-width: 120rem) {
    gap: ${spacing.space12};
    font-size: ${typography.fontSize20};
  }
`;

const ConsentCheckbox = styled.input`
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin: 0;
  appearance: none;
  border: 1px solid #c8deb8;
  border-radius: 4px;
  background-color: #eef9e6;
  cursor: pointer;

  &:checked {
    background-color: #eef9e6;
    border-color: ${colors.point};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='none' stroke='%2388CD5A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M2 6l3 3 5-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 0.75rem;
  }

  &:focus-visible {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }

  @media (min-width: 120rem) {
    width: 1.5625rem;
    height: 1.5625rem;

    &:checked {
      background-size: 1rem;
    }
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20} 1.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space24};

  @media (min-width: 120rem) {
    gap: 2rem;
  }
`;

const InfoGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space20} 3.75rem;

  @media (min-width: 120rem) {
    gap: 1.875rem 5.625rem;
  }

  @media (max-width: ${layout.breakpointMobile}) {
    grid-template-columns: 1fr;
  }
`;

const InfoField = styled.div`
  display: grid;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;

const FieldLabel = styled.label`
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

const fieldBaseStyle = `
  width: 100%;
  min-height: 2.6875rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background-color: #f8f8f8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  &:disabled {
    color: #6d6d6d;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    min-height: 4rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const FieldInput = styled.input`
  ${fieldBaseStyle}
`;

const LessonSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const LessonField = styled.div`
  display: contents;
`;

const LessonTextArea = styled.textarea`
  width: 100%;
  min-height: 5.375rem;
  padding: 0.8125rem ${spacing.space12};
  border: 0;
  background-color: #f8f8f8;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  resize: vertical;
  outline: none;

  &::placeholder {
    color: #b1b1b1;
  }

  @media (min-width: 120rem) {
    min-height: 8.0625rem;
    padding: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const AttendanceSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const AttendanceTableWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: max-content;
  max-width: 100%;
  align-self: flex-start;
  gap: ${spacing.space12};

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
  }
`;

const AttendanceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, minmax(4.5rem, 1fr));
  overflow-x: auto;
  border-top: 1px solid #c0c0c0;
  border-left: 1px solid #c0c0c0;
`;

const AttendanceInput = styled.input`
  min-width: 0;
  min-height: 2.75rem;
  padding: ${spacing.space8};
  border: 0;
  border-right: 1px solid #c0c0c0;
  border-bottom: 1px solid #c0c0c0;
  background: transparent;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-align: center;
  outline: none;

  &::placeholder {
    color: #000000;
  }

  @media (min-width: 120rem) {
    min-height: 3.875rem;
    font-size: ${typography.fontSize20};
  }
`;

const AddAttendanceButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.6875rem;
  border: 1px solid #88cd5a;
  background-color: #eef9e6;
  color: #000000;
  font-size: ${typography.fontSize14};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:hover {
    filter: brightness(0.97);
  }

  @media (min-width: 120rem) {
    min-height: 3.4375rem;
    font-size: ${typography.fontSize20};
  }
`;
