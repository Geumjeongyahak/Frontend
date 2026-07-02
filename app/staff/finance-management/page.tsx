import FinanceRequestListPage from "@/components/staff/finance-management/FinanceRequestListPage";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    keyword?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const keyword = resolvedSearchParams?.keyword ?? "";
  const parsedPage = rawPage ? Number(rawPage) : 1;

  return (
    <FinanceRequestListPage
      key={`finance-list:${parsedPage}:${keyword}`}
      currentPage={parsedPage}
      initialKeyword={keyword}
    />
  );
}
