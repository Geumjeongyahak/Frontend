"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAbsenceRequests } from "@/api/request/request.api";
import ListPanel, {
  type ListPanelRow,
} from "@/components/staff/ListPanel";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
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

  const { data: absenceRequests = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.requests.absenceList(),
    queryFn: () => getAbsenceRequests(),
    enabled: isAuthenticated,
    retry: false,
  });
  const currentUserName = user?.name?.trim();
  const filteredRequests = useMemo(
    () =>
      mineOnly
        ? absenceRequests.filter((request) => {
            const requestedByName = request.requestedByName?.trim();
            return Boolean(currentUserName) && requestedByName === currentUserName;
          })
        : absenceRequests,
    [absenceRequests, currentUserName, mineOnly],
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
      title: "-",
      author: item.requestedByName ?? "-",
      date: formatUtcToKstShortDate(item.createdAt ?? item.lessonDate),
      status: formatRequestStatus(item.status),
      detailHref: `/staff/class/absence/${item.id ?? ""}`,
    }));

  const emptyMessage = authStatus === "loading"
    ? "사용자 정보를 확인하는 중입니다."
    : !isAuthenticated
      ? "로그인이 필요합니다."
      : isLoading
    ? "결강 신청 내역을 불러오는 중입니다."
    : isError
      ? "결강 신청 내역을 불러오지 못했습니다."
      : "결강 신청 내역이 없습니다.";

  return (
    <ListPanel
      title="수업 결강"
      writeLabel="수업 결강 신청하기"
      writeHref="/staff/class/absence/new"
      listPath="/staff/class/absence"
      rows={rows}
      currentPage={currentPage}
      totalPages={totalPages}
      mineOnly={mineOnly}
      emptyMessage={emptyMessage}
      headerTone="journal"
    />
  );
}
