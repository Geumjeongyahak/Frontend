"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import styled from "styled-components";
import { getClassrooms } from "@/api/classroom/classroom.api";
import type { ClassroomListItemDto } from "@/api/classroom/classroom.dto";
import { createSubject } from "@/api/subject/subject.api";
import type { SubjectDayOfWeek } from "@/api/subject/subject.dto";
import { getUsers } from "@/api/user/user.api";
import type { UserListItemDto } from "@/api/user/user.dto";
import {
  ButtonRow,
  DataState,
  InlineStatus,
  Label,
  PrimaryButton,
  TextInput,
} from "@/components/admin/AdminDashboardSectionParts";
import { SubjectDescriptionTextArea } from "@/components/admin/subjects/subjectFormStyles";
import { TimeWheelPicker } from "@/components/admin/subjects/TimeWheelPicker";
import {
  formatClassroomTypeLabel,
  mapSubjectCreateFormToPayload,
  SUBJECT_DAY_OPTIONS,
  validateSubjectCreateForm,
} from "@/components/admin/subjects/subjectCreateForm";
import { queryKeys } from "@/lib/queryKeys";
import { colors, spacing, typography } from "@/styles/tokens";

const SubjectLabel = styled(Label)`
  gap: ${spacing.space8};
`;

const SubjectFormGrid = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.space8};
`;

const ChoiceButton = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: ${spacing.space4};
  min-width: 9rem;
  margin: 0;
  padding: ${spacing.space8} ${spacing.space12};
  border: 1px solid ${({ $selected }) => ($selected ? colors.point : "#e1e5e3")};
  border-radius: 0.5rem;
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : colors.white)};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${colors.point};
  }
`;

const ChoiceTitle = styled.span<{ $selected?: boolean }>`
  color: ${({ $selected }) => ($selected ? colors.text : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight130};
`;

const ChoiceMeta = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
`;

const DayChoiceButton = styled(ChoiceButton)`
  min-width: 2.75rem;
  align-items: center;
  text-align: center;
`;

const DateRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${spacing.space12};
`;

const TEACHER_UNSELECTED = "unselected" as const;

function getClassroomId(classroom: ClassroomListItemDto) {
  return typeof classroom.id === "number" ? classroom.id : null;
}

function getUserId(user: UserListItemDto) {
  return typeof user.id === "number" ? user.id : null;
}

export function AdminSubjectCreateForm() {
  const queryClient = useQueryClient();
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [teacherSelection, setTeacherSelection] = useState<number | typeof TEACHER_UNSELECTED>(
    TEACHER_UNSELECTED,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<SubjectDayOfWeek | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [period, setPeriod] = useState("1");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const classroomsQuery = useQuery({
    queryKey: queryKeys.admin.classrooms(),
    queryFn: () => getClassrooms({ page: 0, size: 100 }),
  });

  const teachersQuery = useQuery({
    queryKey: ["admin", "subjects", "teachers", { role: "VOLUNTEER", currentTeacher: true }],
    queryFn: () =>
      getUsers({ role: "VOLUNTEER", currentTeacher: true, page: 0, size: 100 }),
  });

  const classrooms = classroomsQuery.data?.content ?? [];
  const teachers = teachersQuery.data?.content ?? [];

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: async () => {
      toast.success("과목을 등록했습니다.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
      setSubmitError(null);
      setClassroomId(null);
      setTeacherSelection(TEACHER_UNSELECTED);
      setName("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      setDayOfWeek(null);
      setStartTime("");
      setEndTime("");
      setPeriod("1");
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "과목 등록에 실패했습니다.";
      setSubmitError(message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = {
      classroomId,
      teacherId: teacherSelection === TEACHER_UNSELECTED ? null : teacherSelection,
      name,
      description,
      startAt,
      endAt,
      dayOfWeek,
      startTime,
      endTime,
      period,
    };

    const validationError = validateSubjectCreateForm(values);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    createSubjectMutation.mutate(mapSubjectCreateFormToPayload(values));
  };

  return (
    <form onSubmit={handleSubmit}>
      <SubjectFormGrid>
        <SubjectLabel>
          분반
          <DataState
            isLoading={classroomsQuery.isLoading}
            isError={classroomsQuery.isError}
            isEmpty={classrooms.length === 0}
            loadingLabel="분반 목록 불러오는 중"
            errorLabel="분반 목록을 불러오지 못했습니다."
            emptyLabel="등록된 분반이 없습니다."
          >
            <ChoiceGrid>
              {classrooms.map((classroom) => {
                const id = getClassroomId(classroom);
                if (id == null) return null;

                const isSelected = classroomId === id;

                return (
                  <ChoiceButton
                    key={id}
                    type="button"
                    $selected={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSubmitError(null);
                      setClassroomId(id);
                    }}
                  >
                    <ChoiceTitle $selected={isSelected}>{classroom.name ?? "—"}</ChoiceTitle>
                    <ChoiceMeta>{formatClassroomTypeLabel(classroom.type)}</ChoiceMeta>
                  </ChoiceButton>
                );
              })}
            </ChoiceGrid>
          </DataState>
        </SubjectLabel>

        <SubjectLabel>
          과목명
          <TextInput
            value={name}
            onChange={(event) => {
              setSubmitError(null);
              setName(event.target.value);
            }}
            required
          />
        </SubjectLabel>

        <DateRow>
          <SubjectLabel>
            시작일
            <TextInput
              type="date"
              value={startAt}
              max={endAt || undefined}
              onChange={(event) => {
                setSubmitError(null);
                setStartAt(event.target.value);
              }}
              required
            />
          </SubjectLabel>
          <SubjectLabel>
            종료일
            <TextInput
              type="date"
              value={endAt}
              min={startAt || undefined}
              onChange={(event) => {
                setSubmitError(null);
                setEndAt(event.target.value);
              }}
              required
            />
          </SubjectLabel>
        </DateRow>

        <SubjectLabel>
          요일
          <ChoiceGrid>
            {SUBJECT_DAY_OPTIONS.map((option) => {
              const isSelected = dayOfWeek === option.value;

              return (
                <DayChoiceButton
                  key={option.value}
                  type="button"
                  $selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSubmitError(null);
                    setDayOfWeek(option.value);
                  }}
                >
                  <ChoiceTitle $selected={isSelected}>{option.label}</ChoiceTitle>
                </DayChoiceButton>
              );
            })}
          </ChoiceGrid>
        </SubjectLabel>

        <TimeRow>
          <TimeWheelPicker label="시작 시간" value={startTime} onChange={setStartTime} />
          <TimeWheelPicker label="종료 시간" value={endTime} onChange={setEndTime} />
        </TimeRow>

        <SubjectLabel>
          교시
          <TextInput
            type="number"
            min={1}
            step={1}
            value={period}
            onChange={(event) => {
              setSubmitError(null);
              setPeriod(event.target.value);
            }}
            required
          />
        </SubjectLabel>

        <SubjectLabel>
          담당 교사
          <ChoiceGrid>
            <ChoiceButton
              type="button"
              $selected={teacherSelection === TEACHER_UNSELECTED}
              aria-pressed={teacherSelection === TEACHER_UNSELECTED}
              onClick={() => {
                setSubmitError(null);
                setTeacherSelection(TEACHER_UNSELECTED);
              }}
            >
              <ChoiceTitle $selected={teacherSelection === TEACHER_UNSELECTED}>
                교사 미선택
              </ChoiceTitle>
            </ChoiceButton>
            <DataState
              isLoading={teachersQuery.isLoading}
              isError={teachersQuery.isError}
              isEmpty={teachers.length === 0}
              loadingLabel="교사 목록 불러오는 중"
              errorLabel="교사 목록을 불러오지 못했습니다."
              emptyLabel="활동 중인 교사가 없습니다."
            >
              {teachers.map((teacher) => {
                const id = getUserId(teacher);
                if (id == null) return null;

                const isSelected = teacherSelection === id;

                return (
                  <ChoiceButton
                    key={id}
                    type="button"
                    $selected={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSubmitError(null);
                      setTeacherSelection(id);
                    }}
                  >
                    <ChoiceTitle $selected={isSelected}>{teacher.name ?? "—"}</ChoiceTitle>
                    {teacher.email ? <ChoiceMeta>{teacher.email}</ChoiceMeta> : null}
                  </ChoiceButton>
                );
              })}
            </DataState>
          </ChoiceGrid>
        </SubjectLabel>

        <SubjectLabel>
          설명
          <SubjectDescriptionTextArea
            value={description}
            onChange={(event) => {
              setSubmitError(null);
              setDescription(event.target.value);
            }}
          />
        </SubjectLabel>

        <ButtonRow>
          <PrimaryButton type="submit" disabled={createSubjectMutation.isPending}>
            {createSubjectMutation.isPending ? "등록 중..." : "과목 등록"}
          </PrimaryButton>
        </ButtonRow>

        {submitError ? <InlineStatus role="alert">{submitError}</InlineStatus> : null}
      </SubjectFormGrid>
    </form>
  );
}
