import { redirect } from "next/navigation";
import FinanceRequestListPage from "@/components/staff/FinanceRequestListPage";
import {
  getFinanceRequestsByPage,
  getFinanceRequestTotalPages,
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
  const totalPages = getFinanceRequestTotalPages();
  const isInvalidPage =
    !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect("/staff/finance");
  }

  return (
    <FinanceRequestListPage
      currentPage={parsedPage}
      requests={getFinanceRequestsByPage(parsedPage)}
      totalPages={totalPages}
    />
  );
}
