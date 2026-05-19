"use client";

import { ExchangeRequestPage } from "@/components/staff/class-management/exchange-request/ExchangeRequestPage";
import { useExchangePostPage } from "./useExchangePostPage";

export default function ExchangePostPage() {
  const page = useExchangePostPage();

  return <ExchangeRequestPage page={page} />;
}
