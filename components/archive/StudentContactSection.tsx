"use client";

import { useState } from "react";
import {
  AddRowButton,
  ClassHeaderButton,
  ClassName,
  ClassTab,
  ClassTabList,
  CompleteEditButton,
  ContactCard,
  ContactGroup,
  ContactValue,
  Divider,
  EditTextButton,
  EditRow,
  EditRowInput,
  PanelHeader,
  RemoveRowButton,
  SectionBody,
  SectionLabel,
  StudentClassList,
  StudentEditList,
  StudentGrid,
  ToggleIcon,
} from "@/components/archive/ContactPage.styles";
import type { StudentClass, StudentContact } from "@/components/archive/ContactPage.types";

type StudentContactSectionProps = {
  initialClasses: StudentClass[];
};

const createStudentContact = (id: number): StudentContact => ({
  id,
  name: "",
  phone: "",
});

export default function StudentContactSection({ initialClasses }: StudentContactSectionProps) {
  const [classes, setClasses] = useState<StudentClass[]>(initialClasses);
  const [draftClasses, setDraftClasses] = useState<StudentClass[]>(initialClasses);
  const [openClassIds, setOpenClassIds] = useState<Set<string>>(
    () => new Set(initialClasses.filter((studentClass) => studentClass.isOpen).map(({ id }) => id)),
  );
  const [selectedClassId, setSelectedClassId] = useState(initialClasses[0]?.id ?? "");
  const [isEditing, setIsEditing] = useState(false);

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
              students: [...studentClass.students, createStudentContact(Date.now())],
            }
          : studentClass,
      ),
    );
  };

  const completeEditing = () => {
    setClasses(
      draftClasses.map((studentClass) => ({
        ...studentClass,
        students: studentClass.students.filter((student) =>
          [student.name, student.phone].some((value) => value.trim()),
        ),
      })),
    );
    setIsEditing(false);
  };

  const selectedClass = draftClasses.find((studentClass) => studentClass.id === selectedClassId);

  return (
    <ContactGroup aria-labelledby="student-contact-title">
      <PanelHeader>
        <SectionLabel id="student-contact-title">학생 연락망</SectionLabel>
        {isEditing ? (
          <CompleteEditButton type="button" onClick={completeEditing}>
            편집 완료
          </CompleteEditButton>
        ) : (
          <EditTextButton type="button" onClick={startEditing}>
            편집
          </EditTextButton>
        )}
      </PanelHeader>
      {isEditing && selectedClass ? (
        <>
          <ClassTabList aria-label="편집할 반 선택">
            {draftClasses.map((studentClass) => (
              <ClassTab
                key={studentClass.id}
                type="button"
                $isActive={studentClass.id === selectedClassId}
                onClick={() => setSelectedClassId(studentClass.id)}
              >
                {studentClass.name}
              </ClassTab>
            ))}
          </ClassTabList>
          <StudentEditList>
            {selectedClass.students.map((student) => (
              <EditRow key={student.id} $columns={2}>
                <EditRowInput
                  aria-label="학생 이름"
                  value={student.name}
                  onChange={(event) =>
                    updateDraftStudent(selectedClass.id, student.id, "name", event.target.value)
                  }
                />
                <EditRowInput
                  aria-label="학생 연락처"
                  value={student.phone}
                  onChange={(event) =>
                    updateDraftStudent(selectedClass.id, student.id, "phone", event.target.value)
                  }
                />
                <RemoveRowButton
                  type="button"
                  onClick={() => removeDraftStudent(selectedClass.id, student.id)}
                >
                  -
                </RemoveRowButton>
              </EditRow>
            ))}
            <AddRowButton type="button" onClick={() => addDraftStudent(selectedClass.id)}>
              + 추가하기
            </AddRowButton>
          </StudentEditList>
        </>
      ) : (
        <StudentClassList>
          {classes.map((studentClass) => {
            const isOpen = openClassIds.has(studentClass.id);

            return (
              <SectionBody key={studentClass.id}>
                <ClassHeaderButton
                  type="button"
                  onClick={() => toggleClass(studentClass.id)}
                  aria-expanded={isOpen}
                >
                  <ClassName>{studentClass.name}</ClassName>
                  <ToggleIcon aria-hidden="true" $isOpen={isOpen}>
                    ▶
                  </ToggleIcon>
                </ClassHeaderButton>
                {isOpen && (
                  <StudentGrid>
                    {studentClass.students.map((student) => (
                      <StudentContactCard key={student.id} contact={student} />
                    ))}
                  </StudentGrid>
                )}
              </SectionBody>
            );
          })}
        </StudentClassList>
      )}
    </ContactGroup>
  );
}

function StudentContactCard({ contact }: { contact: StudentContact }) {
  return (
    <ContactCard>
      <strong>{contact.name}</strong>
      <Divider aria-hidden="true" />
      <ContactValue>{contact.phone}</ContactValue>
    </ContactCard>
  );
}
