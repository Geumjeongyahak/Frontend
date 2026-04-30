import { redirect } from "next/navigation";
import ListPanel, {
  type ListPanelRow,
} from "@/components/staff/ListPanel";

const ITEMS_PER_PAGE = 9;
const CURRENT_AUTHOR = "김민지";

const exchangeRequests = Array.from({ length: 27 }, (_, index) => ({
  id: index + 1,
  className: `${["개나리", "해바라기", "민들레"][index % 3]}반`,
  title: `${index + 1}회차 수업 교환 신청합니다`,
  author: index % 2 === 0 ? CURRENT_AUTHOR : "최유진",
  date: `26.04.${String((index % 28) + 1).padStart(2, "0")}`,
  status: index % 4 === 0 ? "승인 완료" : "대기 중",
}));

type PageProps = {
  searchParams?: Promise<{
    page?: string;
    mineOnly?: string;
  }>;
};

function mapRows(items: typeof exchangeRequests, page: number): ListPanelRow[] {
  return items.map((item, index) => ({
    id: item.id,
    no: String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, "0"),
    className: item.className,
    title: item.title,
    author: item.author,
    date: item.date,
    status: item.status,
    detailHref: `/staff/class/exchange/${item.id}`,
  }));
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPage = resolvedSearchParams?.page;
  const mineOnly = resolvedSearchParams?.mineOnly === "1";
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const filteredRequests = mineOnly
    ? exchangeRequests.filter((request) => request.author === CURRENT_AUTHOR)
    : exchangeRequests;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const isInvalidPage =
    !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > totalPages;

  if (isInvalidPage) {
    redirect(mineOnly ? "/staff/class/exchange?mineOnly=1" : "/staff/class/exchange");
  }

  const startIndex = (parsedPage - 1) * ITEMS_PER_PAGE;
  const rows = mapRows(
    filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    parsedPage,
  );

  return (
    <ListPanel
      title="수업 교환"
      writeLabel="수업 교환 신청하기"
      writeHref="/staff/class/exchange/new"
      listPath="/staff/class/exchange"
      rows={rows}
      currentPage={parsedPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage="교환 신청 내역이 없습니다."
    />
  );
}
