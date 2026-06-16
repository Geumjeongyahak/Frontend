import { Suspense } from "react";
import ClassJournalListPageClient from "@/components/staff/class-management/class-journal/ClassJournalListPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClassJournalListPageClient />
    </Suspense>
  );
}
