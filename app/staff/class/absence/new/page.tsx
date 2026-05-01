import { Suspense } from "react";
import AbsenceRequestForm from "../../../../../components/staff/AbsenceRequestForm";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbsenceRequestForm />
    </Suspense>
  );
}
