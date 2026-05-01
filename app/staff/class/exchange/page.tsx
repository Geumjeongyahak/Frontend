import { Suspense } from "react";
import ExchangeListPageClient from "./ExchangeListPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExchangeListPageClient />
    </Suspense>
  );
}
