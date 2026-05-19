import MeetingRecordFormFields from "@/components/staff/archive/meeting-records/MeetingRecordFormFields";
import {
  ActionButton,
  DocumentSection,
  PageTitle,
  Toolbar,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";

export default function MeetingRecordFormPage() {
  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>교학 회의록 작성하기</PageTitle>
        <ActionButton type="submit" form="meeting-record-form">
          작성 완료
        </ActionButton>
      </Toolbar>

      <MeetingRecordFormFields />
    </DocumentSection>
  );
}
