"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "@/api/subject/subject.api";
import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { getUserDetail, getUsers } from "@/api/user/user.api";
import type { UserListItemDto, UserListQueryParamsDto } from "@/api/user/user.dto";
import { resolveLessonCreateClassroomId } from "@/components/admin/lesson-management/lessonCreateClassroomFallback";
import { filterAssignableTeachers } from "@/components/admin/teacherAssignmentRoles";

type AssignableTeacherUsersQuery = UserListQueryParamsDto;

export type LessonCreateSelection = {
  teacherId: number | null;
  subjectId: number | null;
};

export function useLessonCreateOptions() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const teachersQuery = useQuery({
    queryKey: ["admin", "lesson-create", "teachers"],
    queryFn: () =>
      getUsers({
        page: 0,
        size: 100,
      } satisfies AssignableTeacherUsersQuery),
    retry: false,
  });

  const teachers = useMemo(
    () => filterAssignableTeachers(teachersQuery.data?.content),
    [teachersQuery.data?.content],
  );

  const teacherDetailQuery = useQuery({
    queryKey: ["admin", "lesson-create", "teacher-detail", selectedTeacherId],
    queryFn: () => getUserDetail({ userId: selectedTeacherId! }),
    enabled: selectedTeacherId != null && selectedTeacherId > 0,
    retry: false,
  });

  const classroomId = useMemo(() => {
    const teacher =
      teacherDetailQuery.data ?? teachers.find((user) => user.id === selectedTeacherId);
    return resolveLessonCreateClassroomId(teacher);
  }, [teacherDetailQuery.data, teachers, selectedTeacherId]);

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

  const effectiveSelectedSubjectId = selectedSubjectId ?? subjects[0]?.id ?? null;

  const selectTeacher = (teacherId: number | null) => {
    setSelectedTeacherId(teacherId);
    setSelectedSubjectId(null);
  };

  const selection: LessonCreateSelection = {
    teacherId: selectedTeacherId,
    subjectId: effectiveSelectedSubjectId,
  };

  return {
    teachers,
    teachersQuery,
    selectedTeacherId,
    selectTeacher,
    teacherDetailQuery,
    classroomId,
    subjects,
    subjectsQuery,
    selectedSubjectId: effectiveSelectedSubjectId,
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
