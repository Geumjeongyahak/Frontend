"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getStudents } from "@/api/student/student.api";
import { queryKeys } from "@/lib/queryKeys";
import type { StudentClass } from "@/components/staff/archive/phone-book/PhoneBookPage.types";

async function getStudentContactClasses(): Promise<StudentClass[]> {
  // 분반마다 따로 부르지 않고 재학생 전체를 한 번 받아 응답의 classrooms로 나눈다
  const [classroomsResponse, students] = await Promise.all([
    getClassrooms({ page: 0, size: 100 }),
    getStudents({ status: "ENROLLED" }),
  ]);
  const classrooms = classroomsResponse.content ?? [];

  return classrooms.map((classroom, index) => {
    const classroomId = classroom.id;
    const classStudents =
      typeof classroomId === "number"
        ? students.filter((student) =>
            student.classrooms?.some((studentClassroom) => studentClassroom.id === classroomId),
          )
        : [];

    return {
      id: String(classroomId ?? `unknown-${index}`),
      name: classroom.name ?? "미지정",
      isOpen: false,
      students: classStudents.map((student, studentIndex) => ({
        id: student.id ?? -(studentIndex + 1),
        name: student.name ?? "",
        phone: student.phoneNumber ?? "",
      })),
    };
  });
}

export function useStudentContactSection() {
  const {
    data: apiClasses = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: queryKeys.students.contactClasses(),
    queryFn: getStudentContactClasses,
  });

  const [openClassIds, setOpenClassIds] = useState<Set<string> | null>(null);

  const classes = [...apiClasses]
    .map((studentClass) => ({
      ...studentClass,
      students: [...studentClass.students].sort((first, second) =>
        first.name.localeCompare(second.name, "ko"),
      ),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, "ko"));
  const defaultOpenClassIds = new Set<string>();
  const resolvedOpenClassIds = openClassIds ?? defaultOpenClassIds;

  const toggleClass = (classId: string) => {
    setOpenClassIds((currentIds) => {
      const nextIds = new Set(currentIds ?? defaultOpenClassIds);
      if (nextIds.has(classId)) {
        nextIds.delete(classId);
      } else {
        nextIds.add(classId);
      }
      return nextIds;
    });
  };

  return {
    classes,
    openClassIds: resolvedOpenClassIds,
    isLoading,
    isError,
    toggleClass,
  };
}
