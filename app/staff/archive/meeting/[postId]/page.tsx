import { notFound } from "next/navigation";
import MeetingMinuteDetailPage from "@/components/archive/MeetingMinuteDetailPage";
import {
  getMeetingMinuteById,
  meetingMinutes,
} from "@/mocks/archiveMeeting";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export function generateStaticParams() {
  return meetingMinutes.map((minute) => ({
    postId: String(minute.id),
  }));
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const meetingMinute = getMeetingMinuteById(Number(postId));

  if (!meetingMinute) {
    notFound();
  }

  return <MeetingMinuteDetailPage meetingMinute={meetingMinute} />;
}
