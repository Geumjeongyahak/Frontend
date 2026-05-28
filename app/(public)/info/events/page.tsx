import EventListPageClient from "@/components/info/events/EventListPageClient";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const initialPage = rawPage ? Number(rawPage) : 1;

  return <EventListPageClient initialPage={initialPage} />;
}
