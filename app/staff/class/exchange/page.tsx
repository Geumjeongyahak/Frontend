"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getLessonExchangeRequests } from "@/api/request/request.api";
import ListPanel, {
  type ListPanelRow,
} from "@/components/staff/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { formatRequestStatus } from "@/utils/formatRequestStatus";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const ITEMS_PER_PAGE = 9;

export default function Page() {
  const searchParams = useSearchParams();
  const { status: authStatus, user } = useAuthSession();
  const isAuthenticated = authStatus === "authenticated";
  const rawPage = searchParams.get("page");
  const mineOnly = searchParams.get("mineOnly") === "1";
  const parsedPage = rawPage ? Number(rawPage) : 1;

  const { data: exchangeRequests = [], isLoading, isError } = useQuery({
    queryKey: ["lesson-exchange-requests"],
    queryFn: () => getLessonExchangeRequests(),
    enabled: isAuthenticated,
    retry: false,
  });
  const currentUserName = user?.name?.trim();

  const filteredRequests = useMemo(
    () =>
      mineOnly
        ? exchangeRequests.filter((request) => {
            const requestedByName = request.requestedByName?.trim();
            return Boolean(currentUserName) && requestedByName === currentUserName;
          })
        : exchangeRequests,
    [currentUserName, exchangeRequests, mineOnly],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages ? parsedPage : 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const rows: ListPanelRow[] = filteredRequests
    .slice(startIndex, startIndex + ITEMS_PER_PAGE)
    .map((item, index) => ({
      id: item.id ?? startIndex + index + 1,
      no: String(startIndex + index + 1).padStart(2, "0"),
      className: "-",
      title: item.title ?? "제목 없음",
      author: item.requestedByName ?? "-",
      date: formatUtcToKstShortDate(item.createdAt ?? item.lessonDate),
      status: formatRequestStatus(item.status),
      detailHref: `/staff/class/exchange/${item.id ?? ""}`,
    }));

  const emptyMessage = authStatus === "loading"
    ? "사용자 정보를 확인하는 중입니다."
    : !isAuthenticated
      ? "로그인이 필요합니다."
      : isLoading
    ? "교환 신청 내역을 불러오는 중입니다."
    : isError
      ? "교환 신청 내역을 불러오지 못했습니다."
      : "교환 신청 내역이 없습니다.";

  return (
    <ListPanel
      title="수업 교환"
      writeLabel="수업 교환 신청하기"
      writeHref="/staff/class/exchange/new"
      listPath="/staff/class/exchange"
      rows={rows}
      currentPage={currentPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage={emptyMessage}
      headerTone="journal"
    />
  );
}
