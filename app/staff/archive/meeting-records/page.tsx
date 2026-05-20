import MeetingRecordsPage from "@/components/staff/archive/meeting-records/MeetingRecordsPage";
import { meetingRecords } from "@/mocks/archiveMeeting";

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

  return (
    <MeetingRecordsPage
      initialPage={parsedPage}
      meetingRecords={meetingRecords}
      initialMineOnly={mineOnly}
    />
  );
}
