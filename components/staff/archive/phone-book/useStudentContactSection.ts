"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getStudents } from "@/api/student/student.api";
import { queryKeys } from "@/lib/queryKeys";
import type { StudentClass } from "@/components/staff/archive/phone-book/PhoneBookPage.types";

async function getStudentContactClasses(): Promise<StudentClass[]> {
  const classroomsResponse = await getClassrooms({ page: 0, size: 100 });
  const classrooms = classroomsResponse.content ?? [];

  const classStudentPairs = await Promise.all(
    classrooms.map(async (classroom, index) => {
      const classroomId = classroom.id;
      const students =
        typeof classroomId === "number"
          ? await getStudents({ classroomId, status: "ENROLLED" })
          : [];

      return {
        id: String(classroomId ?? `unknown-${index}`),
        name: classroom.name ?? "미지정",
        isOpen: false,
        students: students.map((student, studentIndex) => ({
          id: student.id ?? -(studentIndex + 1),
          name: student.name ?? "",
          phone: student.phoneNumber ?? "",
        })),
      };
    }),
  );

  return classStudentPairs;
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
