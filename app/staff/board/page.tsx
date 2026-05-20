import BoardListPageClient from "@/components/staff/board/BoardListPageClient";
import type { BoardType } from "@/components/staff/board/boardOptions";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    type?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const rawType = resolvedSearchParams?.type;
  const initialPage = rawPage ? Number(rawPage) : 1;
  const initialBoardType: BoardType = rawType === "NOTICE" ? "NOTICE" : "all";

  return <BoardListPageClient initialPage={initialPage} initialBoardType={initialBoardType} />;
}
