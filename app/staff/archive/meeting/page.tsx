import { redirect } from "next/navigation";
import MeetingMinutesPage from "@/components/archive/MeetingMinutesPage";
import {
  MEETING_MINUTES_PER_PAGE,
  meetingMinutes,
} from "@/mocks/archiveMeeting";

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
  const filteredMeetingMinutes = mineOnly
    ? meetingMinutes.filter((minute) => minute.author === "홍길동")
    : meetingMinutes;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeetingMinutes.length / MEETING_MINUTES_PER_PAGE),
  );
  const isInvalidPage =
    !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect("/staff/archive/meeting");
  }

  const startIndex = (parsedPage - 1) * MEETING_MINUTES_PER_PAGE;
  const visibleMeetingMinutes = filteredMeetingMinutes.slice(
    startIndex,
    startIndex + MEETING_MINUTES_PER_PAGE,
  );

  return (
    <MeetingMinutesPage
      currentPage={parsedPage}
      meetingMinutes={visibleMeetingMinutes}
      mineOnly={mineOnly}
      totalPages={totalPages}
    />
  );
}
