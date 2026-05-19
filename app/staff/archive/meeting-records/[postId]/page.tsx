import { notFound } from "next/navigation";
import MeetingRecordDetailPage from "@/components/staff/archive/meeting-records/MeetingRecordDetailPage";
import { getMeetingRecordById, meetingRecords } from "@/mocks/archiveMeeting";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export function generateStaticParams() {
  return meetingRecords.map((minute) => ({
    postId: String(minute.id),
  }));
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const meetingRecord = getMeetingRecordById(Number(postId));

  if (!meetingRecord) {
    notFound();
  }

  return <MeetingRecordDetailPage meetingRecord={meetingRecord} />;
}
