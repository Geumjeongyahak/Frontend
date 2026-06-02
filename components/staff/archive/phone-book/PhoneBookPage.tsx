import StudentContactSection from "@/components/staff/archive/phone-book/StudentContactSection";
import TeacherContactSection from "@/components/staff/archive/phone-book/TeacherContactSection";
import {
  PhoneBookPageSection,
  PageTitle,
} from "@/components/staff/archive/phone-book/PhoneBookPage.styles";

export default function PhoneBookPage() {
  return (
    <PhoneBookPageSection>
      <PageTitle>연락망</PageTitle>

      <TeacherContactSection />
      <StudentContactSection />
    </PhoneBookPageSection>
  );
}
