import { redirect } from "next/navigation";
import MeetingRecordsPage from "@/components/staff/archive/meeting-records/MeetingRecordsPage";
import { MEETING_RECORDS_PER_PAGE, meetingRecords } from "@/mocks/archiveMeeting";

type PageProps = {
  searchParams?: Promise<{
    mineOnly?: string;
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const mineOnly = resolvedSearchParams?.mineOnly === "1";
  const filteredMeetingRecords = mineOnly
    ? meetingRecords.filter((minute) => minute.author === "홍길동")
    : meetingRecords;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeetingRecords.length / MEETING_RECORDS_PER_PAGE),
  );
  const isInvalidPage = !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect("/staff/archive/meeting-records");
  }

  const startIndex = (parsedPage - 1) * MEETING_RECORDS_PER_PAGE;
  const visibleMeetingRecords = filteredMeetingRecords.slice(
    startIndex,
    startIndex + MEETING_RECORDS_PER_PAGE,
  );

  return (
    <MeetingRecordsPage
      currentPage={parsedPage}
      meetingRecords={visibleMeetingRecords}
      mineOnly={mineOnly}
      totalPages={totalPages}
    />
  );
}
