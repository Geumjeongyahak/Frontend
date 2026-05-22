import { Suspense } from "react";
import ClassJournalDetailPageClient from "@/components/staff/class-management/class-journal/ClassJournalDetailPageClient";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function StaffClassJournalPostPage({ params }: PageProps) {
  const { postId } = await params;
  const dailyScheduleId = Number(postId);

  return (
    <Suspense fallback={null}>
      <ClassJournalDetailPageClient dailyScheduleId={dailyScheduleId} />
    </Suspense>
  );
}
