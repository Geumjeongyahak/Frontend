"use client";

import { useState } from "react";
import * as S from "@/components/archive/contact/ContactPage.styles";
import type { TeacherContact } from "@/components/archive/contact/ContactPage.types";

type TeacherContactSectionProps = {
  initialContacts: TeacherContact[];
};

const createTeacherContact = (id: number): TeacherContact => ({
  id,
  name: "",
  className: "",
  phone: "",
});

export default function TeacherContactSection({ initialContacts }: TeacherContactSectionProps) {
  const [contacts, setContacts] = useState<TeacherContact[]>(initialContacts);
  const [draftContacts, setDraftContacts] = useState<TeacherContact[]>(initialContacts);
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = () => {
    setDraftContacts(contacts);
    setIsEditing(true);
  };

  const updateDraftContact = (
    contactId: number,
    field: keyof Omit<TeacherContact, "id">,
    value: string,
  ) => {
    setDraftContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId ? { ...contact, [field]: value } : contact,
      ),
    );
  };

  const removeDraftContact = (contactId: number) => {
    setDraftContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== contactId),
    );
  };

  const addDraftContact = () => {
    setDraftContacts((currentContacts) => [...currentContacts, createTeacherContact(Date.now())]);
  };

  const completeEditing = () => {
    setContacts(
      draftContacts.filter((contact) =>
        [contact.name, contact.className, contact.phone].some((value) => value.trim()),
      ),
    );

    setIsEditing(false);
  };

  return (
    <S.ContactGroup aria-labelledby="teacher-contact-title">
      <S.PanelHeader>
        <S.SectionLabel id="teacher-contact-title">교사 연락망</S.SectionLabel>

        {isEditing ? (
          <S.CompleteEditButton type="button" onClick={completeEditing}>
            편집 완료
          </S.CompleteEditButton>
        ) : (
          <S.EditTextButton type="button" onClick={startEditing}>
            편집
          </S.EditTextButton>
        )}
      </S.PanelHeader>

      {isEditing ? (
        <S.TeacherEditList>
          {draftContacts.map((contact) => (
            <S.EditRow key={contact.id} $columns={3}>
              <S.EditRowInput
                aria-label="교사 이름"
                value={contact.name}
                onChange={(event) => updateDraftContact(contact.id, "name", event.target.value)}
              />
              <S.EditRowInput
                aria-label="담당 반"
                value={contact.className}
                onChange={(event) =>
                  updateDraftContact(contact.id, "className", event.target.value)
                }
              />
              <S.EditRowInput
                aria-label="교사 연락처"
                value={contact.phone}
                onChange={(event) => updateDraftContact(contact.id, "phone", event.target.value)}
              />
              <S.RemoveRowButton type="button" onClick={() => removeDraftContact(contact.id)}>
                -
              </S.RemoveRowButton>
            </S.EditRow>
          ))}

          <S.AddRowButton type="button" onClick={addDraftContact}>
            + 추가하기
          </S.AddRowButton>
        </S.TeacherEditList>
      ) : (
        <S.ContactGrid>
          {contacts.map((contact) => (
            <TeacherContactCard key={contact.id} contact={contact} />
          ))}
        </S.ContactGrid>
      )}
    </S.ContactGroup>
  );
}

function TeacherContactCard({ contact }: { contact: TeacherContact }) {
  return (
    <S.ContactCard>
      <strong>{contact.name}</strong>
      <S.Divider aria-hidden="true" />
      <S.ContactValue>{contact.className}</S.ContactValue>
      <S.Divider aria-hidden="true" />
      <S.ContactValue>{contact.phone}</S.ContactValue>
    </S.ContactCard>
  );
}
