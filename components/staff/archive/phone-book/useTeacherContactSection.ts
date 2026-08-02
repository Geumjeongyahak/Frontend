"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeacherContacts } from "@/api/user/user.api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  TeacherClass,
  TeacherContact,
} from "@/components/staff/archive/phone-book/PhoneBookPage.types";

function getTeacherContactClasses(
  contacts: Awaited<ReturnType<typeof getTeacherContacts>>,
): TeacherClass[] {
  const classesByName = new Map<string, TeacherClass>();

  contacts.forEach((contact, index) => {
    const className = contact.classroomName?.trim() || "미지정";
    const teacher: TeacherContact = {
      id: contact.id ?? -(index + 1),
      name: contact.name ?? "",
      className,
      phone: contact.phoneNumber ?? "",
    };
    const teacherClass = classesByName.get(className);

    if (teacherClass) {
      teacherClass.teachers.push(teacher);
      return;
    }

    classesByName.set(className, {
      id: className,
      name: className,
      teachers: [teacher],
    });
  });

  return [...classesByName.values()]
    .map((teacherClass) => ({
      ...teacherClass,
      teachers: [...teacherClass.teachers].sort((first, second) =>
        first.name.localeCompare(second.name, "ko"),
      ),
    }))
    .sort((first, second) => first.name.localeCompare(second.name, "ko"));
}

export function useTeacherContactSection() {
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.teachers.contactList(),
    queryFn: getTeacherContacts,
    select: getTeacherContactClasses,
  });
  const [openClassIds, setOpenClassIds] = useState<Set<string>>(() => new Set());

  const toggleClass = (classId: string) => {
    setOpenClassIds((currentIds) => {
      const nextIds = new Set(currentIds);
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
    openClassIds,
    toggleClass,
  };
}
