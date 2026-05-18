import type { MeetingMinute } from "@/mocks/archiveMeeting";
import MeetingMinuteAbsenceSection from "@/components/archive/meeting/MeetingMinuteAbsenceSection";
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
} from "@/components/archive/meeting/MeetingMinuteDocument.styles";

type MeetingMinuteDetailPageProps = {
  meetingMinute: MeetingMinute;
};

export default function MeetingMinuteDetailPage({ meetingMinute }: MeetingMinuteDetailPageProps) {
  return (
    <DocumentSection>
      <Toolbar>
        <ActionLink href="/staff/archive/meeting" $variant="muted">
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
        <DateBar>{meetingMinute.date}</DateBar>

        <Label>제목</Label>
        <FieldBox>{meetingMinute.title}</FieldBox>

        <Label>작성자</Label>
        <FieldBox>{meetingMinute.author}</FieldBox>

        <Label>안건</Label>
        <TextBox>{meetingMinute.agenda}</TextBox>

        <Label>논의 사항</Label>
        <TextBox $isMuted>{meetingMinute.discussion}</TextBox>

        <Label>건의 사항</Label>
        <TextBox $isMuted>{meetingMinute.suggestion}</TextBox>

        <Divider />
        <MeetingMinuteAbsenceSection initialReports={meetingMinute.absenceReports} />
      </ContentStack>
    </DocumentSection>
  );
}
