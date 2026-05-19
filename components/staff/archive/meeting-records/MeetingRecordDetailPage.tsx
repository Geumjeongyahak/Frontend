import type { MeetingRecord } from "@/mocks/archiveMeeting";
import MeetingRecordAbsenceSection from "@/components/staff/archive/meeting-records/MeetingRecordAbsenceSection";
import {
  ActionButton,
  ActionLink,
  ContentStack,
  DateBar,
  Divider,
  DocumentSection,
  FieldBox,
  Label,
  TextBox,
  Toolbar,
  ToolbarRight,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";

type MeetingRecordDetailPageProps = {
  meetingRecord: MeetingRecord;
};

export default function MeetingRecordDetailPage({ meetingRecord }: MeetingRecordDetailPageProps) {
  return (
    <DocumentSection>
      <Toolbar>
        <ActionLink href="/staff/archive/meeting-records" $variant="muted">
          목록
        </ActionLink>

        <ToolbarRight>
          <ActionButton type="button" $variant="danger">
            삭제
          </ActionButton>
          <ActionButton type="button">수정</ActionButton>
        </ToolbarRight>
      </Toolbar>

      <ContentStack>
        <DateBar>{meetingRecord.date}</DateBar>

        <Label>제목</Label>
        <FieldBox>{meetingRecord.title}</FieldBox>

        <Label>작성자</Label>
        <FieldBox>{meetingRecord.author}</FieldBox>

        <Label>안건</Label>
        <TextBox>{meetingRecord.agenda}</TextBox>

        <Label>논의 사항</Label>
        <TextBox $isMuted>{meetingRecord.discussion}</TextBox>

        <Label>건의 사항</Label>
        <TextBox $isMuted>{meetingRecord.suggestion}</TextBox>

        <Divider />
        <MeetingRecordAbsenceSection initialReports={meetingRecord.absenceReports} />
      </ContentStack>
    </DocumentSection>
  );
}
