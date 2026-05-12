"use client";

import { useState } from "react";
import {
  AddRowButton,
  CompleteEditButton,
  ContactCard,
  ContactGrid,
  ContactGroup,
  ContactValue,
  Divider,
  EditTextButton,
  EditRow,
  EditRowInput,
  PanelHeader,
  RemoveRowButton,
  SectionLabel,
  TeacherEditList,
} from "@/components/archive/contact/ContactPage.styles";
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
    <ContactGroup aria-labelledby="teacher-contact-title">
      <PanelHeader>
        <SectionLabel id="teacher-contact-title">교사 연락망</SectionLabel>
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
      {isEditing ? (
        <TeacherEditList>
          {draftContacts.map((contact) => (
            <EditRow key={contact.id} $columns={3}>
              <EditRowInput
                aria-label="교사 이름"
                value={contact.name}
                onChange={(event) => updateDraftContact(contact.id, "name", event.target.value)}
              />
              <EditRowInput
                aria-label="담당 반"
                value={contact.className}
                onChange={(event) =>
                  updateDraftContact(contact.id, "className", event.target.value)
                }
              />
              <EditRowInput
                aria-label="교사 연락처"
                value={contact.phone}
                onChange={(event) => updateDraftContact(contact.id, "phone", event.target.value)}
              />
              <RemoveRowButton type="button" onClick={() => removeDraftContact(contact.id)}>
                -
              </RemoveRowButton>
            </EditRow>
          ))}
          <AddRowButton type="button" onClick={addDraftContact}>
            + 추가하기
          </AddRowButton>
        </TeacherEditList>
      ) : (
        <ContactGrid>
          {contacts.map((contact) => (
            <TeacherContactCard key={contact.id} contact={contact} />
          ))}
        </ContactGrid>
      )}
    </ContactGroup>
  );
}

function TeacherContactCard({ contact }: { contact: TeacherContact }) {
  return (
    <ContactCard>
      <strong>{contact.name}</strong>
      <Divider aria-hidden="true" />
      <ContactValue>{contact.className}</ContactValue>
      <Divider aria-hidden="true" />
      <ContactValue>{contact.phone}</ContactValue>
    </ContactCard>
  );
}
