import MeetingRecordDetailPage from "@/components/staff/archive/meeting-records/MeetingRecordDetailPage";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  return <MeetingRecordDetailPage recordId={Number(postId)} />;
}
