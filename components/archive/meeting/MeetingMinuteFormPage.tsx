import MeetingMinuteFormFields from "@/components/archive/meeting/MeetingMinuteFormFields";
import {
  ActionButton,
  DocumentSection,
  PageTitle,
  Toolbar,
} from "@/components/archive/meeting/MeetingMinuteDocument.styles";

export default function MeetingMinuteFormPage() {
  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>교학 회의록 작성하기</PageTitle>
        <ActionButton type="submit" form="meeting-minute-form">
          작성 완료
        </ActionButton>
      </Toolbar>

      <MeetingMinuteFormFields />
    </DocumentSection>
  );
}
