"use client";

import styled from "styled-components";
import { IconChevronDown } from "@tabler/icons-react";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import {
  ActionCardButton,
  ActionGrid,
  ActionTitle,
  ButtonRow,
  DataState,
  FormGrid,
  InlineStatus,
  Label,
  PrimaryButton,
  SectionDescription,
  Select,
  StatePanel,
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
import { colors, spacing, typography } from "@/styles/tokens";

const SubjectGrid = styled(ActionGrid)`
  margin-top: ${spacing.space4};
`;

const SubjectOption = styled(ActionCardButton)<{ $selected: boolean }>`
  border-color: ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
`;

const SubjectMeta = styled.p`
  margin: ${spacing.space4} 0 0;
  color: #64706c;
  font-size: ${typography.fontSize13};
  line-height: ${typography.lineHeight130};
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const TimeField = styled(Label)`
  justify-items: stretch;
  text-align: left;
`;

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
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.point};
  }
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
    return <StatePanel>등록된 과목이 없습니다.</StatePanel>;
  }

  return (
    <SubjectGrid>
      {subjects.map((subject) => {
        const subjectId = getSubjectId(subject);
        if (subjectId == null) return null;

        const isSelected = selectedSubjectId === subjectId;
        const isSingle = subjects.length === 1;

        return (
          <SubjectOption
            key={subjectId}
            type="button"
            $selected={isSelected}
            aria-pressed={isSelected}
            disabled={isSingle}
            onClick={() => onSelectSubject(subjectId)}
          >
            <ActionTitle $accent={isSelected}>{subject.name ?? "—"}</ActionTitle>
            {subject.classroomName ? <SubjectMeta>{subject.classroomName}</SubjectMeta> : null}
          </SubjectOption>
        );
      })}
    </SubjectGrid>
  );
}

export function AdminLessonCreateForm() {
  const {
    volunteers,
    volunteersQuery,
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
        과목, 담당 교사, 일자, 교시, 시간을 입력해 새 수업을 등록합니다.
      </SectionDescription>

      <FormGrid
        onSubmit={(event) => {
          event.preventDefault();
          submitLesson();
        }}
      >
        <Label>
          담당 교사
          <DataState
            isLoading={volunteersQuery.isLoading}
            isError={volunteersQuery.isError}
            isEmpty={volunteers.length === 0}
            loadingLabel="교원 목록 불러오는 중"
            errorLabel="교원 목록을 불러오지 못했습니다."
            emptyLabel="등록된 교원이 없습니다."
          >
            <TeacherSelectWrap>
              <TeacherSelect
                value={selectedTeacherId ?? ""}
                onChange={(event) => {
                  clearSubmitError();
                  const value = Number(event.target.value);
                  selectTeacher(Number.isInteger(value) && value > 0 ? value : null);
                }}
              >
                <option value="">교원 선택</option>
                {volunteers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {getTeacherLabel(teacher)}
                  </option>
                ))}
              </TeacherSelect>
              <TeacherSelectChevron aria-hidden="true" />
            </TeacherSelectWrap>
          </DataState>
        </Label>

        <Label>
          과목
          {!selectedTeacherId ? (
            <StatePanel>담당 교사를 먼저 선택해 주세요.</StatePanel>
          ) : classroomId == null ? (
            teacherDetailQuery.isLoading ? (
              <InlineStatus>교사 정보를 불러오는 중입니다.</InlineStatus>
            ) : teacherDetailQuery.isError ? (
              <StatePanel role="alert">교사 정보를 불러오지 못했습니다.</StatePanel>
            ) : (
              <StatePanel>선택한 교사에 연결된 분반이 없습니다.</StatePanel>
            )
          ) : (
            <DataState
              isLoading={subjectsQuery.isLoading}
              isError={subjectsQuery.isError}
              isEmpty={subjects.length === 0}
              loadingLabel="과목 목록 불러오는 중"
              errorLabel="과목 목록을 불러오지 못했습니다."
              emptyLabel="해당 분반에 등록된 과목이 없습니다."
            >
              <SubjectPicker
                subjects={subjects}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={(subjectId) => {
                  clearSubmitError();
                  setSelectedSubjectId(subjectId);
                }}
              />
            </DataState>
          )}
        </Label>

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

        <TimeRow>
          <TimeField>
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
          </TimeField>

          <TimeField>
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
          </TimeField>
        </TimeRow>

        {submitError ? <InlineStatus role="alert">{submitError}</InlineStatus> : null}

        <ButtonRow>
          <PrimaryButton type="submit" disabled={!canSubmit}>
            {isSubmitting ? "생성 중..." : "수업 생성"}
          </PrimaryButton>
        </ButtonRow>
      </FormGrid>
    </>
  );
}
