"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAbsenceRequests } from "@/api/request/request.api";
import { getCurrentUser } from "@/api/user/user.api";
import ListPanel, {
  type ListPanelRow,
} from "@/components/staff/ListPanel";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const ITEMS_PER_PAGE = 9;
function formatStatus(status?: string) {
  if (status === "APPROVED") return "승인 완료";
  if (status === "REJECTED") return "반려";
  return "대기 중";
}

export default function Page() {
  const searchParams = useSearchParams();
  const rawPage = searchParams.get("page");
  const mineOnly = searchParams.get("mineOnly") === "1";
  const parsedPage = rawPage ? Number(rawPage) : 1;

  const { data: absenceRequests = [], isLoading, isError } = useQuery({
    queryKey: ["absence-requests"],
    queryFn: () => getAbsenceRequests(),
    retry: false,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const currentUserName = currentUser?.name?.trim();
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
      status: formatStatus(item.status),
      detailHref: `/staff/class/absence/${item.id ?? ""}`,
    }));

  const emptyMessage = isLoading
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
