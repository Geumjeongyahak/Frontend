import { IconEdit } from "@tabler/icons-react";
import ListPanel, { type ListPanelRow } from "@/components/staff/ListPanel";
import {
  MEETING_MINUTES_PER_PAGE,
  type MeetingMinute,
} from "@/mocks/archiveMeeting";

type MeetingMinutesPageProps = {
  currentPage: number;
  meetingMinutes: MeetingMinute[];
  mineOnly: boolean;
  totalPages: number;
};

export default function MeetingMinutesPage({
  currentPage,
  meetingMinutes,
  mineOnly,
  totalPages,
}: MeetingMinutesPageProps) {
  const rows: ListPanelRow[] = meetingMinutes.map((minute, index) => ({
    id: minute.id,
    no: String((currentPage - 1) * MEETING_MINUTES_PER_PAGE + index + 1).padStart(2, "0"),
    className: "",
    title: minute.title,
    author: minute.author,
    date: minute.date,
    status: minute.status,
    detailHref: `/staff/archive/meeting/${minute.id}`,
  }));

  return (
    <ListPanel
      title="교학 회의록"
      writeLabel="교학 회의록 작성하기"
      writeHref="/staff/archive/meeting/new"
      listPath="/staff/archive/meeting"
      rows={rows}
      currentPage={currentPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage="교학 회의록이 없습니다."
      headerTone="archive"
      showClassColumn={false}
      statusHeader="구분"
      writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
    />
  );
}
