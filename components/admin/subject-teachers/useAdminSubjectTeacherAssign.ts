"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { assignSubjectTeacher } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getUsers } from "@/api/user/user.api";
import type { UserListItemDto } from "@/api/user/user.dto";
import { getSubjectId } from "@/components/admin/subjects/shared/subjectDisplay";
import { queryKeys } from "@/lib/queryKeys";

export function getTeacherUserId(user: UserListItemDto) {
  return typeof user.id === "number" ? user.id : null;
}

export function getTeacherClassroomName(user: UserListItemDto) {
  return user.classroom?.name?.trim() || user.email?.trim() || "—";
}

export function getSubjectTeacherId(subject?: SubjectDetailResponseDto | null) {
  const teacherId = subject?.teacherId;
  return typeof teacherId === "number" ? teacherId : null;
}

type UseAdminSubjectTeacherAssignParams = {
  subject: SubjectDetailResponseDto | null;
};

const TEACHER_UNSELECTED = "unselected" as const;

export function useAdminSubjectTeacherAssign({ subject }: UseAdminSubjectTeacherAssignParams) {
  const queryClient = useQueryClient();
  const subjectId = subject ? getSubjectId(subject) : null;
  const assignedTeacherId = getSubjectTeacherId(subject);
  const isTeacherUnassigned = assignedTeacherId == null;

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | typeof TEACHER_UNSELECTED | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const teachersQuery = useQuery({
    queryKey: queryKeys.admin.activeVolunteerTeachers(),
    queryFn: () =>
      getUsers({
        role: "VOLUNTEER",
        page: 0,
        size: 100,
      }),
  });

  const teachers = teachersQuery.data?.content ?? [];

  useEffect(() => {
    setSelectedTeacherId(null);
    setSubmitError(null);
  }, [subjectId]);

  const assignTeacherMutation = useMutation({
    mutationFn: async (teacherId: number | null) => {
      if (subjectId == null) throw new Error("과목을 선택해 주세요.");
      return assignSubjectTeacher({ subjectId }, { teacherId });
    },
    onSuccess: async () => {
      setSubmitError(null);
      setSelectedTeacherId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects() });
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "과목 담당 교사 변경에 실패했습니다.";
      setSubmitError(message);
    },
  });

  const isTeacherChoiceDisabled = (teacherId: number) => assignedTeacherId === teacherId;
  const isUnselectedChoiceDisabled = isTeacherUnassigned;
  const isUnselectedChoiceSelected = selectedTeacherId === TEACHER_UNSELECTED;

  const canSubmit =
    subjectId != null &&
    selectedTeacherId != null &&
    (selectedTeacherId === TEACHER_UNSELECTED
      ? !isUnselectedChoiceDisabled
      : !isTeacherChoiceDisabled(selectedTeacherId)) &&
    !assignTeacherMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit || selectedTeacherId == null) return;
    const nextTeacherId = selectedTeacherId === TEACHER_UNSELECTED ? null : selectedTeacherId;

    const successMessage = isTeacherUnassigned
      ? "과목 담당 교사를 배정했습니다."
      : "과목 담당 교사를 변경했습니다.";

    assignTeacherMutation.mutate(nextTeacherId, {
      onSuccess: async () => {
        toast.success(successMessage);
      },
    });
  };

  return {
    subject,
    isTeacherUnassigned,
    assignedTeacherId,
    selectedTeacherId,
    isUnselectedChoiceDisabled,
    isUnselectedChoiceSelected,
    selectTeacherUnselected: () => {
      setSubmitError(null);
      setSelectedTeacherId(TEACHER_UNSELECTED);
    },
    setSelectedTeacherId: (teacherId: number) => {
      setSubmitError(null);
      setSelectedTeacherId(teacherId);
    },
    teachers,
    teachersQuery,
    isTeacherChoiceDisabled,
    canSubmit,
    handleSubmit,
    submitError,
    isSubmitting: assignTeacherMutation.isPending,
  };
}

export type AdminSubjectTeacherAssignViewModel = ReturnType<typeof useAdminSubjectTeacherAssign>;
