"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "@/api/student/student.api";
import type { StudentListResponseDto } from "@/api/student/student.dto";
import type { StudentClass, StudentContact } from "@/components/archive/contact/ContactPage.types";

const createStudentContact = (): StudentContact => ({
  id: -Date.now(),
  name: "",
  phone: "",
});

function mapStudentsToClasses(students: StudentListResponseDto): StudentClass[] {
  const grouped = new Map<string, StudentClass>();

  students.forEach((student) => {
    const classId = String(student.classroomId ?? student.classroomName ?? "unknown");
    const className = student.classroomName ?? "미지정";

    if (!grouped.has(classId)) {
      grouped.set(classId, {
        id: classId,
        name: className,
        isOpen: grouped.size === 0,
        students: [],
      });
    }

    grouped.get(classId)?.students.push({
      id: student.id ?? Date.now(),
      name: student.name ?? "",
      phone: student.phoneNumber ?? "",
    });
  });

  return Array.from(grouped.values());
}

export function useStudentContactSection(initialClasses: StudentClass[] = []) {
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
  });

  const apiClasses = useMemo(() => mapStudentsToClasses(students), [students]);

  const [classes, setClasses] = useState<StudentClass[]>(initialClasses);
  const [draftClasses, setDraftClasses] = useState<StudentClass[]>(initialClasses);
  const [openClassIds, setOpenClassIds] = useState<Set<string>>(
    () => new Set(initialClasses.filter((studentClass) => studentClass.isOpen).map(({ id }) => id)),
  );
  const [selectedClassId, setSelectedClassId] = useState(initialClasses[0]?.id ?? "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (apiClasses.length === 0) return;

    setClasses(apiClasses);
    setDraftClasses(apiClasses);
    setOpenClassIds(
      new Set(apiClasses.filter((studentClass) => studentClass.isOpen).map(({ id }) => id)),
    );
    setSelectedClassId(apiClasses[0]?.id ?? "");
  }, [apiClasses]);

  const createStudentMutation = useMutation({
    mutationFn: ({
      classroomId,
      name,
      phone,
    }: {
      classroomId: number;
      name: string;
      phone: string;
    }) =>
      createStudent({
        classroomId,
        name: name.trim(),
        phoneNumber: phone.trim(),
      }),
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ studentId, name, phone }: { studentId: number; name: string; phone: string }) =>
      updateStudent(
        { studentId },
        {
          name: name.trim(),
          phoneNumber: phone.trim(),
        },
      ),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (studentId: number) => deleteStudent({ studentId }),
  });

  const toggleClass = (classId: string) => {
    setOpenClassIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.has(classId) ? nextIds.delete(classId) : nextIds.add(classId);
      return nextIds;
    });
  };

  const startEditing = () => {
    setDraftClasses(classes);
    setSelectedClassId(classes[0]?.id ?? "");
    setIsEditing(true);
  };

  const updateDraftStudent = (
    classId: string,
    studentId: number,
    field: keyof Omit<StudentContact, "id">,
    value: string,
  ) => {
    setDraftClasses((currentClasses) =>
      currentClasses.map((studentClass) =>
        studentClass.id === classId
          ? {
              ...studentClass,
              students: studentClass.students.map((student) =>
                student.id === studentId ? { ...student, [field]: value } : student,
              ),
            }
          : studentClass,
      ),
    );
  };

  const removeDraftStudent = (classId: string, studentId: number) => {
    setDraftClasses((currentClasses) =>
      currentClasses.map((studentClass) =>
        studentClass.id === classId
          ? {
              ...studentClass,
              students: studentClass.students.filter((student) => student.id !== studentId),
            }
          : studentClass,
      ),
    );
  };

  const addDraftStudent = (classId: string) => {
    setDraftClasses((currentClasses) =>
      currentClasses.map((studentClass) =>
        studentClass.id === classId
          ? {
              ...studentClass,
              students: [...studentClass.students, createStudentContact()],
            }
          : studentClass,
      ),
    );
  };

  const completeEditing = async () => {
    const cleanedClasses = draftClasses.map((studentClass) => ({
      ...studentClass,
      students: studentClass.students.filter((student) =>
        [student.name, student.phone].some((value) => value.trim()),
      ),
    }));

    const originalStudents = classes.flatMap((studentClass) =>
      studentClass.students.map((student) => ({
        ...student,
        classroomId: Number(studentClass.id),
      })),
    );

    const draftStudents = cleanedClasses.flatMap((studentClass) =>
      studentClass.students.map((student) => ({
        ...student,
        classroomId: Number(studentClass.id),
      })),
    );

    const newStudents = draftStudents.filter((student) => student.id < 0);
    const existingDraftStudents = draftStudents.filter((student) => student.id > 0);

    const deletedStudents = originalStudents.filter(
      (originalStudent) =>
        originalStudent.id > 0 &&
        !existingDraftStudents.some((draftStudent) => draftStudent.id === originalStudent.id),
    );

    const updatedStudents = existingDraftStudents.filter((draftStudent) => {
      const originalStudent = originalStudents.find((student) => student.id === draftStudent.id);
      if (!originalStudent) return false;

      return (
        originalStudent.name !== draftStudent.name ||
        originalStudent.phone !== draftStudent.phone ||
        originalStudent.classroomId !== draftStudent.classroomId
      );
    });

    try {
      await Promise.all([
        ...newStudents.map((student) =>
          createStudentMutation.mutateAsync({
            classroomId: student.classroomId,
            name: student.name,
            phone: student.phone,
          }),
        ),
        ...updatedStudents.map((student) =>
          updateStudentMutation.mutateAsync({
            studentId: student.id,
            name: student.name,
            phone: student.phone,
          }),
        ),
        ...deletedStudents.map((student) => deleteStudentMutation.mutateAsync(student.id)),
      ]);

      await queryClient.invalidateQueries({ queryKey: ["students"] });

      setClasses(cleanedClasses);
      setIsEditing(false);
      window.alert("학생 연락망이 저장되었습니다.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "학생 연락망 저장에 실패했습니다.");
    }
  };

  const selectedClass = draftClasses.find((studentClass) => studentClass.id === selectedClassId);

  return {
    classes,
    draftClasses,
    openClassIds,
    selectedClass,
    selectedClassId,
    isEditing,
    setSelectedClassId,
    toggleClass,
    startEditing,
    updateDraftStudent,
    removeDraftStudent,
    addDraftStudent,
    completeEditing,
  };
}
