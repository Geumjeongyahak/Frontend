"use client";

import * as S from "@/components/staff/archive/phone-book/PhoneBookPage.styles";
import type { StudentContact } from "@/components/staff/archive/phone-book/PhoneBookPage.types";
import { useStudentContactSection } from "./useStudentContactSection";

export default function StudentContactSection() {
  const {
    classes,
    openClassIds,
    toggleClass,
  } = useStudentContactSection();

  return (
    <S.ContactGroup aria-labelledby="student-contact-title">
      <S.PanelHeader>
        <S.SectionLabel id="student-contact-title">학생 연락망</S.SectionLabel>
      </S.PanelHeader>

      <S.StudentClassList>
        {classes.map((studentClass) => {
          const isOpen = openClassIds.has(studentClass.id);

          return (
            <S.SectionBody key={studentClass.id}>
              <S.ClassHeaderButton
                type="button"
                onClick={() => toggleClass(studentClass.id)}
                aria-expanded={isOpen}
              >
                <S.ClassName>{studentClass.name}</S.ClassName>

                <S.ToggleIcon aria-hidden="true" $isOpen={isOpen}>
                  ▶
                </S.ToggleIcon>
              </S.ClassHeaderButton>

              {isOpen && (
                <S.StudentGrid>
                  {studentClass.students.map((student) => (
                    <StudentContactCard key={student.id} contact={student} />
                  ))}
                </S.StudentGrid>
              )}
            </S.SectionBody>
          );
        })}
      </S.StudentClassList>
    </S.ContactGroup>
  );
}

function StudentContactCard({ contact }: { contact: StudentContact }) {
  return (
    <S.ContactCard>
      <strong>{contact.name}</strong>
      <S.Divider aria-hidden="true" />
      <S.ContactValue>{contact.phone}</S.ContactValue>
    </S.ContactCard>
  );
}
