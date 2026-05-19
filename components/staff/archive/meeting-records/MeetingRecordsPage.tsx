import { IconEdit } from "@tabler/icons-react";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { MEETING_RECORDS_PER_PAGE, type MeetingRecord } from "@/mocks/archiveMeeting";

type MeetingRecordsPageProps = {
  currentPage: number;
  meetingRecords: MeetingRecord[];
  mineOnly: boolean;
  totalPages: number;
};

export default function MeetingRecordsPage({
  currentPage,
  meetingRecords,
  mineOnly,
  totalPages,
}: MeetingRecordsPageProps) {
  const rows: ListPanelRow[] = meetingRecords.map((minute, index) => ({
    id: minute.id,
    no: String((currentPage - 1) * MEETING_RECORDS_PER_PAGE + index + 1).padStart(2, "0"),
    className: "",
    title: minute.title,
    author: minute.author,
    date: minute.date,
    status: minute.status,
    detailHref: `/staff/archive/meeting-records/${minute.id}`,
  }));

  return (
    <ListPanel
      title="교학 회의록"
      writeLabel="교학 회의록 작성하기"
      writeHref="/staff/archive/meeting-records/new"
      listPath="/staff/archive/meeting-records"
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
