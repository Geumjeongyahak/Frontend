"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeacherContacts } from "@/api/user/user.api";
import * as S from "@/components/staff/archive/phone-book/PhoneBookPage.styles";
import type { TeacherContact } from "@/components/staff/archive/phone-book/PhoneBookPage.types";
import { queryKeys } from "@/lib/queryKeys";

function mapTeacherContacts(contacts: Awaited<ReturnType<typeof getTeacherContacts>>) {
  return contacts.map((contact, index) => ({
    id: contact.id ?? -(index + 1),
    name: contact.name ?? "",
    className: contact.classroomName ?? "",
    phone: contact.phoneNumber ?? "",
  }));
}

export default function TeacherContactSection() {
  const { data: contacts = [] } = useQuery({
    queryKey: queryKeys.teachers.contactList(),
    queryFn: getTeacherContacts,
    select: mapTeacherContacts,
  });

  return (
    <S.ContactGroup aria-labelledby="teacher-contact-title">
      <S.PanelHeader>
        <S.SectionLabel id="teacher-contact-title">교사 연락망</S.SectionLabel>
      </S.PanelHeader>

      <S.ContactGrid>
        {contacts.map((contact) => (
          <TeacherContactCard key={contact.id} contact={contact} />
        ))}
      </S.ContactGrid>
    </S.ContactGroup>
  );
}

function TeacherContactCard({ contact }: { contact: TeacherContact }) {
  const className = contact.className.trim();
  const phone = contact.phone.trim();

  return (
    <S.ContactCard>
      <strong>{contact.name}</strong>
      {className ? (
        <>
          <S.Divider aria-hidden="true" />
          <S.ContactValue>{className}</S.ContactValue>
        </>
      ) : null}
      {phone ? (
        <>
          <S.Divider aria-hidden="true" />
          <S.ContactValue>{phone}</S.ContactValue>
        </>
      ) : null}
    </S.ContactCard>
  );
}
