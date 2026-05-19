import { Suspense } from "react";
import AbsenceRequestForm from "../../../../../components/staff/class-management/absence-request/AbsenceRequestForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbsenceRequestForm />
    </Suspense>
  );
}
