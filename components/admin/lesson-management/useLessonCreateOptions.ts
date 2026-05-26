"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getUserDetail, getUsers } from "@/api/user/user.api";
import type { UserListItemDto, UserListQueryParamsDto } from "@/api/user/user.dto";
import { resolveLessonCreateClassroomId } from "@/components/admin/lesson-management/lessonCreateClassroomFallback";

type VolunteerUsersQuery = UserListQueryParamsDto & { role?: "VOLUNTEER" };

export type LessonCreateSelection = {
  teacherId: number | null;
  subjectId: number | null;
};

export function useLessonCreateOptions() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const volunteersQuery = useQuery({
    queryKey: ["admin", "lesson-create", "volunteers"],
    queryFn: () =>
      getUsers({
        page: 0,
        size: 100,
        role: "VOLUNTEER",
      } satisfies VolunteerUsersQuery),
    retry: false,
  });

  const volunteers = useMemo(() => {
    const items = volunteersQuery.data?.content ?? [];
    return items.filter((user) => user.role === "VOLUNTEER" || user.role == null);
  }, [volunteersQuery.data?.content]);

  const teacherDetailQuery = useQuery({
    queryKey: ["admin", "lesson-create", "teacher-detail", selectedTeacherId],
    queryFn: () => getUserDetail({ userId: selectedTeacherId! }),
    enabled: selectedTeacherId != null && selectedTeacherId > 0,
    retry: false,
  });

  const classroomId = useMemo(() => {
    const teacher =
      teacherDetailQuery.data ?? volunteers.find((user) => user.id === selectedTeacherId);
    return resolveLessonCreateClassroomId(teacher);
  }, [teacherDetailQuery.data, volunteers, selectedTeacherId]);

  const subjectsQuery = useQuery({
    queryKey: ["admin", "lesson-create", "subjects", classroomId],
    queryFn: () => getSubjects({ classroomId: classroomId! }),
    enabled: classroomId != null && classroomId > 0,
    retry: false,
  });

  const subjects = useMemo(
    () => (Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []),
    [subjectsQuery.data],
  );

  useEffect(() => {
    setSelectedSubjectId(subjects[0]?.id ?? null);
  }, [subjects, selectedTeacherId]);

  const selectTeacher = (teacherId: number | null) => {
    setSelectedTeacherId(teacherId);
    setSelectedSubjectId(null);
  };

  const selection: LessonCreateSelection = {
    teacherId: selectedTeacherId,
    subjectId: selectedSubjectId,
  };

  return {
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
    selection,
  };
}

export function getTeacherLabel(teacher: UserListItemDto) {
  return teacher.name?.trim() || teacher.nickname?.trim() || teacher.email || `교원 #${teacher.id}`;
}

export function getSubjectId(subject: SubjectDetailResponseDto) {
  return subject.id ?? null;
}
