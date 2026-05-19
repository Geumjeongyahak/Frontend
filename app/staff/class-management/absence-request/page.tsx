import { Suspense } from "react";
import AbsenceListPageClient from "../../../../components/staff/class-management/absence-request/AbsenceListPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbsenceListPageClient />
    </Suspense>
  );
}
