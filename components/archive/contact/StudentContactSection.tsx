"use client";

import * as S from "@/components/archive/contact/ContactPage.styles";
import type { StudentClass, StudentContact } from "@/components/archive/contact/ContactPage.types";
import { useStudentContactSection } from "./useStudentContactSection";

type StudentContactSectionProps = {
  initialClasses?: StudentClass[];
};

export default function StudentContactSection({ initialClasses = [] }: StudentContactSectionProps) {
  const {
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
  } = useStudentContactSection(initialClasses);

  return (
    <S.ContactGroup aria-labelledby="student-contact-title">
      <S.PanelHeader>
        <S.SectionLabel id="student-contact-title">학생 연락망</S.SectionLabel>

        {isEditing ? (
          <S.CompleteEditButton type="button" onClick={completeEditing}>
            편집 완료
          </S.CompleteEditButton>
        ) : (
          <S.EditTextButton type="button" /*onClick={startEditing}*/>편집</S.EditTextButton>
        )}
      </S.PanelHeader>

      {isEditing && selectedClass ? (
        <>
          <S.ClassTabList aria-label="편집할 반 선택">
            {draftClasses.map((studentClass) => (
              <S.ClassTab
                key={studentClass.id}
                type="button"
                $isActive={studentClass.id === selectedClassId}
                onClick={() => setSelectedClassId(studentClass.id)}
              >
                {studentClass.name}
              </S.ClassTab>
            ))}
          </S.ClassTabList>

          <S.StudentEditList>
            {selectedClass.students.map((student) => (
              <S.EditRow key={student.id} $columns={2}>
                <S.EditRowInput
                  aria-label="학생 이름"
                  value={student.name}
                  onChange={(event) =>
                    updateDraftStudent(selectedClass.id, student.id, "name", event.target.value)
                  }
                />

                <S.EditRowInput
                  aria-label="학생 연락처"
                  value={student.phone}
                  onChange={(event) =>
                    updateDraftStudent(selectedClass.id, student.id, "phone", event.target.value)
                  }
                />

                <S.RemoveRowButton
                  type="button"
                  onClick={() => removeDraftStudent(selectedClass.id, student.id)}
                >
                  -
                </S.RemoveRowButton>
              </S.EditRow>
            ))}

            <S.AddRowButton type="button" onClick={() => addDraftStudent(selectedClass.id)}>
              + 추가하기
            </S.AddRowButton>
          </S.StudentEditList>
        </>
      ) : (
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
      )}
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
