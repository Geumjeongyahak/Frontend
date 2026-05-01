import { redirect } from "next/navigation";
import ListPanel, {
  type ListPanelRow,
} from "@/components/staff/ListPanel";

const ITEMS_PER_PAGE = 9;
const CURRENT_AUTHOR = "김민지";

const absenceRequests = Array.from({ length: 23 }, (_, index) => ({
  id: index + 1,
  className: `${["개나리", "해바라기", "민들레"][index % 3]}반`,
  title: `${index + 1}회차 수업 결강 신청합니다`,
  author: index % 2 === 0 ? CURRENT_AUTHOR : "박서준",
  date: `26.04.${String((index % 28) + 1).padStart(2, "0")}`,
  status: index % 3 === 0 ? "승인 완료" : "대기 중",
}));

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    mineOnly?: string;
  }>;
};

function mapRows(items: typeof absenceRequests, page: number): ListPanelRow[] {
  return items.map((item, index) => ({
    id: item.id,
    no: String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0"),
    className: item.className,
    title: item.title,
    author: item.author,
    date: item.date,
    status: item.status,
    detailHref: `/staff/class/absence/${item.id}`,
  }));
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const mineOnly = resolvedSearchParams?.mineOnly === "1";
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const filteredRequests = mineOnly
    ? absenceRequests.filter((request) => request.author === CURRENT_AUTHOR)
    : absenceRequests;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const isInvalidPage =
    !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect(mineOnly ? "/staff/class/absence?mineOnly=1" : "/staff/class/absence");
  }

  const startIndex = (parsedPage - 1) * ITEMS_PER_PAGE;
  const rows = mapRows(
    filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    parsedPage,
  );

  return (
    <ListPanel
      title="수업 결강"
      writeLabel="수업 결강 신청하기"
      writeHref="/staff/class/absence/new"
      listPath="/staff/class/absence"
      rows={rows}
      currentPage={parsedPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage="결강 신청 내역이 없습니다."
      headerTone="journal"
    />
  );
}
