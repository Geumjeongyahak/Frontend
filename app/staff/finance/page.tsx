import FinanceRequestListPage from "@/components/staff/FinanceRequestListPage";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const parsedPage = rawPage ? Number(rawPage) : 1;

  return <FinanceRequestListPage currentPage={parsedPage} />;
}
