"use client";

import * as S from "@/components/staff/archive/phone-book/PhoneBookPage.styles";
import type { TeacherContact } from "@/components/staff/archive/phone-book/PhoneBookPage.types";
import { useTeacherContactSection } from "./useTeacherContactSection";

export default function TeacherContactSection() {
  const { classes, openClassIds, toggleClass } = useTeacherContactSection();

  return (
    <S.ContactGroup aria-labelledby="teacher-contact-title">
      <S.PanelHeader>
        <S.SectionLabel id="teacher-contact-title">교사 연락망</S.SectionLabel>
      </S.PanelHeader>

      <S.StudentClassList>
        {classes.map((teacherClass) => {
          const isOpen = openClassIds.has(teacherClass.id);

          return (
            <S.SectionBody key={teacherClass.id}>
              <S.ClassHeaderButton
                type="button"
                onClick={() => toggleClass(teacherClass.id)}
                aria-expanded={isOpen}
              >
                <S.ClassName>{teacherClass.name}</S.ClassName>

                <S.ToggleIcon aria-hidden="true" $isOpen={isOpen}>
                  ▶
                </S.ToggleIcon>
              </S.ClassHeaderButton>

              {isOpen && (
                <S.StudentGrid>
                  {teacherClass.teachers.map((teacher) => (
                    <TeacherContactCard key={teacher.id} contact={teacher} />
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

function TeacherContactCard({ contact }: { contact: TeacherContact }) {
  const phone = contact.phone.trim();

  return (
    <S.ContactCard>
      <strong>{contact.name}</strong>
      {phone ? (
        <>
          <S.Divider aria-hidden="true" />
          <S.ContactValue>{phone}</S.ContactValue>
        </>
      ) : null}
    </S.ContactCard>
  );
}
