import { redirect } from "next/navigation";
import FinanceRequestListPage from "@/components/staff/FinanceRequestListPage";
import {
  FINANCE_REQUESTS_PER_PAGE,
  financeRequests,
} from "@/mocks/staffFinance";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const filteredRequests = financeRequests;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / FINANCE_REQUESTS_PER_PAGE));
  const isInvalidPage =
    !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect("/staff/finance");
  }

  const startIndex = (parsedPage - 1) * FINANCE_REQUESTS_PER_PAGE;
  const requests = filteredRequests.slice(startIndex, startIndex + FINANCE_REQUESTS_PER_PAGE);

  return (
    <FinanceRequestListPage
      currentPage={parsedPage}
      requests={requests}
      totalPages={totalPages}
    />
  );
}
