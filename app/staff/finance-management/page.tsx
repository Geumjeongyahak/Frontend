import FinanceRequestListPage from "@/components/staff/finance-management/FinanceRequestListPage";
import type { PaymentType } from "@/api/request/request.dto";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    keyword?: string;
    paymentType?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const keyword = resolvedSearchParams?.keyword ?? "";
  const paymentType: PaymentType | undefined =
    resolvedSearchParams?.paymentType === "PREPAID" || resolvedSearchParams?.paymentType === "ACTUAL"
      ? resolvedSearchParams.paymentType
      : undefined;
  const parsedPage = rawPage ? Number(rawPage) : 1;

  return (
    <FinanceRequestListPage
      key={`finance-list:${parsedPage}:${keyword}:${paymentType ?? "all"}`}
      currentPage={parsedPage}
      initialKeyword={keyword}
      initialPaymentType={paymentType}
    />
  );
}
