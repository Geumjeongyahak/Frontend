"use client";

import type { ComponentProps } from "react";
import styled from "styled-components";
import { IconChevronDown } from "@tabler/icons-react";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  FormGrid,
  InlineStatus,
  Label,
  PrimaryButton,
  SectionDescription,
  Select,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import {
  getSubjectId,
  getTeacherLabel,
  useLessonCreateOptions,
} from "@/components/admin/lesson-management/useLessonCreateOptions";
import { useLessonCreateSubmit } from "@/components/admin/lesson-management/useLessonCreateSubmit";
import {
  formatLessonTimeForDisplay,
  snapLessonTimeToFiveMinutes,
} from "@/components/admin/lesson-management/lessonCreateError";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

const LessonFormGrid = styled(FormGrid)`
  input,
  select {
    font-weight: 500;
  }
`;

const CreateTopRow = styled.div`
  display: grid;
  grid-template-columns: 11rem minmax(0, 1fr);
  gap: ${spacing.space12};
  align-items: start;

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: 1fr;
  }
`;

const TeacherField = styled(Label)`
  width: 11rem;
  max-width: 100%;
`;

const SubjectFieldBox = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 4.25rem;
  padding: ${spacing.space4};
  box-sizing: border-box;
  border: 1px solid #e6e9e7;
  border-radius: ${radii.radius12};
  background-color: ${colors.white};
`;

const SubjectInner = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space4};
  text-align: center;
`;

const SubjectInnerText = styled.p`
  margin: 0;
  color: #64706c;
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const SUBJECT_BLOCK_WIDTH = "9rem";

const SubjectGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space4};
  width: 100%;
  height: 100%;
  align-items: stretch;
`;

const SubjectOption = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing.space4};
  width: ${SUBJECT_BLOCK_WIDTH};
  flex-shrink: 0;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  box-sizing: border-box;
  border: 1px solid ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  border-radius: 0.5rem;
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:not(:disabled):hover {
    border-color: ${colors.point};
  }

  &:disabled {
    cursor: default;
  }
`;

const SubjectOptionName = styled.span<{ $selected?: boolean }>`
  color: ${({ $selected }) => ($selected ? colors.text : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const SubjectOptionMeta = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const CreateBottomRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(8rem, 1fr)
    minmax(5rem, 0.6fr)
    minmax(7rem, 0.8fr)
    minmax(7rem, 0.8fr)
    auto;
  gap: ${spacing.space12};
  align-items: end;

  @media (max-width: ${layout.breakpointTablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SubmitField = styled.div`
  display: flex;
  align-items: flex-end;
  min-height: 2.375rem;
`;

const SubjectPlaceholder = ({
  children,
  ...props
}: ComponentProps<typeof SubjectInnerText>) => (
  <SubjectInner>
    <SubjectInnerText {...props}>{children}</SubjectInnerText>
  </SubjectInner>
);

const SubjectLoadingWrap = styled(SubjectInner)``;

const TimeInput = styled(TextInput)`
  width: 100%;
`;

const TeacherSelectWrap = styled.div`
  position: relative;
  width: 100%;
`;

const TeacherSelect = styled(Select)`
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.25rem;
`;

const TeacherSelectChevron = styled(IconChevronDown)`
  position: absolute;
  top: 50%;
  right: 0.875rem;
  width: 1rem;
  height: 1rem;
  color: ${colors.muted};
  pointer-events: none;
  transform: translateY(-50%);
`;

function SubjectPicker({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: {
  subjects: SubjectDetailResponseDto[];
  selectedSubjectId: number | null;
  onSelectSubject: (subjectId: number) => void;
}) {
  if (subjects.length === 0) {
    return <SubjectPlaceholder>등록된 과목이 없습니다.</SubjectPlaceholder>;
  }

  if (subjects.length === 1) {
    const subject = subjects[0];
    const subjectId = getSubjectId(subject);
    const isSelected = subjectId != null && selectedSubjectId === subjectId;

    return (
      <SubjectOption type="button" $selected={isSelected} disabled>
        <SubjectOptionName $selected={isSelected}>{subject.name ?? "—"}</SubjectOptionName>
        {subject.classroomName ? <SubjectOptionMeta>{subject.classroomName}</SubjectOptionMeta> : null}
      </SubjectOption>
    );
  }

  return (
    <SubjectGrid>
      {subjects.map((subject) => {
        const subjectId = getSubjectId(subject);
        if (subjectId == null) return null;

        const isSelected = selectedSubjectId === subjectId;

        return (
          <SubjectOption
            key={subjectId}
            type="button"
            $selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => onSelectSubject(subjectId)}
          >
            <SubjectOptionName $selected={isSelected}>{subject.name ?? "—"}</SubjectOptionName>
            {subject.classroomName ? (
              <SubjectOptionMeta>{subject.classroomName}</SubjectOptionMeta>
            ) : null}
          </SubjectOption>
        );
      })}
    </SubjectGrid>
  );
}

function renderSubjectContent({
  selectedTeacherId,
  classroomId,
  teacherDetailQuery,
  subjectsQuery,
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: {
  selectedTeacherId: number | null;
  classroomId: number | null | undefined;
  teacherDetailQuery: { isLoading: boolean; isError: boolean };
  subjectsQuery: { isLoading: boolean; isError: boolean };
  subjects: SubjectDetailResponseDto[];
  selectedSubjectId: number | null;
  onSelectSubject: (subjectId: number) => void;
}) {
  if (!selectedTeacherId) {
    return <SubjectPlaceholder>담당 교사를 먼저 선택해 주세요.</SubjectPlaceholder>;
  }

  if (classroomId == null) {
    if (teacherDetailQuery.isLoading) {
      return (
        <SubjectLoadingWrap>
          <LoadingSpinner label="교사 정보를 불러오는 중" />
        </SubjectLoadingWrap>
      );
    }

    if (teacherDetailQuery.isError) {
      return <SubjectPlaceholder role="alert">교사 정보를 불러오지 못했습니다.</SubjectPlaceholder>;
    }

    return <SubjectPlaceholder>선택한 교사에 연결된 분반이 없습니다.</SubjectPlaceholder>;
  }

  if (subjectsQuery.isLoading) {
    return (
      <SubjectLoadingWrap>
        <LoadingSpinner label="과목 목록 불러오는 중" />
      </SubjectLoadingWrap>
    );
  }

  if (subjectsQuery.isError) {
    return <SubjectPlaceholder role="alert">과목 목록을 불러오지 못했습니다.</SubjectPlaceholder>;
  }

  return (
    <SubjectPicker
      subjects={subjects}
      selectedSubjectId={selectedSubjectId}
      onSelectSubject={onSelectSubject}
    />
  );
}

export function AdminLessonCreateForm() {
  const {
    teachers,
    teachersQuery,
    selectedTeacherId,
    selectTeacher,
    teacherDetailQuery,
    classroomId,
    subjects,
    subjectsQuery,
    selectedSubjectId,
    setSelectedSubjectId,
  } = useLessonCreateOptions();

  const {
    date,
    setDate,
    period,
    setPeriod,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    submitError,
    canSubmit,
    submitLesson,
    clearSubmitError,
    isSubmitting,
  } = useLessonCreateSubmit({
    teacherId: selectedTeacherId,
    subjectId: selectedSubjectId,
  });

  return (
    <>
      <SectionDescription>
        담당 교사, 과목, 일자, 교시, 시간을 입력해 새 수업을 등록합니다.
      </SectionDescription>

      <LessonFormGrid
        onSubmit={(event) => {
          event.preventDefault();
          submitLesson();
        }}
      >
        <CreateTopRow>
          <TeacherField>
            담당 교사
            {teachersQuery.isLoading ? (
              <TeacherSelectWrap>
                <TeacherSelect disabled value="">
                  <option value="">불러오는 중...</option>
                </TeacherSelect>
              </TeacherSelectWrap>
            ) : teachersQuery.isError ? (
              <InlineStatus role="alert">교원 목록을 불러오지 못했습니다.</InlineStatus>
            ) : (
              <TeacherSelectWrap>
                <TeacherSelect
                  value={selectedTeacherId ?? ""}
                  onChange={(event) => {
                    clearSubmitError();
                    const value = Number(event.target.value);
                    selectTeacher(Number.isInteger(value) && value > 0 ? value : null);
                  }}
                >
                  <option value="">{teachers.length === 0 ? "등록된 교원 없음" : "교원 선택"}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {getTeacherLabel(teacher)}
                    </option>
                  ))}
                </TeacherSelect>
                <TeacherSelectChevron aria-hidden="true" />
              </TeacherSelectWrap>
            )}
          </TeacherField>

          <Label>
            과목
            <SubjectFieldBox>
              {renderSubjectContent({
                selectedTeacherId,
                classroomId,
                teacherDetailQuery,
                subjectsQuery,
                subjects,
                selectedSubjectId,
                onSelectSubject: (subjectId) => {
                  clearSubmitError();
                  setSelectedSubjectId(subjectId);
                },
              })}
            </SubjectFieldBox>
          </Label>
        </CreateTopRow>

        <CreateBottomRow>
          <Label>
            수업 일자
            <TextInput
              type="date"
              value={date}
              onChange={(event) => {
                clearSubmitError();
                setDate(event.target.value);
              }}
              required
            />
          </Label>

          <Label>
            교시
            <TextInput
              type="number"
              min={1}
              step={1}
              value={period}
              onChange={(event) => {
                clearSubmitError();
                setPeriod(event.target.value);
              }}
              required
            />
          </Label>

          <Label>
            시작 시간
            <TimeInput
              type="time"
              step={300}
              value={startTime}
              onChange={(event) => {
                clearSubmitError();
                setStartTime(
                  snapLessonTimeToFiveMinutes(formatLessonTimeForDisplay(event.target.value)),
                );
              }}
              required
            />
          </Label>

          <Label>
            종료 시간
            <TimeInput
              type="time"
              step={300}
              value={endTime}
              onChange={(event) => {
                clearSubmitError();
                setEndTime(
                  snapLessonTimeToFiveMinutes(formatLessonTimeForDisplay(event.target.value)),
                );
              }}
              required
            />
          </Label>

          <SubmitField>
            <PrimaryButton type="submit" disabled={!canSubmit}>
              {isSubmitting ? "생성 중..." : "수업 생성"}
            </PrimaryButton>
          </SubmitField>
        </CreateBottomRow>

        {submitError ? <InlineStatus role="alert">{submitError}</InlineStatus> : null}
      </LessonFormGrid>
    </>
  );
}
