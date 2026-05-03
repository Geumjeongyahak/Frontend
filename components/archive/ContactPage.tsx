import StudentContactSection from "@/components/archive/StudentContactSection";
import TeacherContactSection from "@/components/archive/TeacherContactSection";
import { ContactPageSection, PageTitle } from "@/components/archive/ContactPage.styles";
import type { StudentClass, TeacherContact } from "@/components/archive/ContactPage.types";

const teacherContacts: TeacherContact[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "최양진",
  className: "00 0000반",
  phone: "000-0000-0000",
}));

const studentClasses: StudentClass[] = [
  {
    id: "gaenari",
    name: "개나리반",
    isOpen: true,
    students: Array.from({ length: 6 }, (_, index) => ({
      id: index + 1,
      name: "최양진",
      phone: "000-0000-0000",
    })),
  },
  { id: "cherry", name: "벚꽃반", isOpen: false, students: [] },
  { id: "dandelion", name: "민들레반", isOpen: false, students: [] },
  { id: "chrysanthemum", name: "국화반", isOpen: false, students: [] },
  { id: "camellia", name: "동백반", isOpen: false, students: [] },
  { id: "sunflower", name: "해바라기반", isOpen: false, students: [] },
  { id: "weekend-english", name: "주말 영어반", isOpen: false, students: [] },
  { id: "weekend-phone", name: "주말 스마트폰반", isOpen: false, students: [] },
  { id: "winter", name: "겨울반", isOpen: false, students: [] },
];

export default function ContactPage() {
  return (
    <ContactPageSection>
      <PageTitle>연락망</PageTitle>

      <TeacherContactSection initialContacts={teacherContacts} />
      <StudentContactSection initialClasses={studentClasses} />
    </ContactPageSection>
  );
}
