import { Suspense } from "react";
import AbsenceListPageClient from "../../../../components/staff/AbsenceListPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbsenceListPageClient />
    </Suspense>
  );
}
