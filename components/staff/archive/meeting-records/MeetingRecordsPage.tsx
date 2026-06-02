"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getMeetingRecords } from "@/api/meetingRecord/meetingRecord.api";
import type { MeetingRecordStatus } from "@/api/meetingRecord/meetingRecord.dto";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { queryKeys } from "@/lib/queryKeys";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type MeetingRecordsPageProps = {
  initialPage: number;
  initialMineOnly: boolean;
};

const MEETING_RECORDS_PER_PAGE = 10;

function getStatusLabel(status?: MeetingRecordStatus) {
  if (status === "AFTER_MEETING") return "회의 후";
  return "회의 전";
}

export default function MeetingRecordsPage({
  initialPage,
  initialMineOnly,
}: MeetingRecordsPageProps) {
  const router = useRouter();
  const [mineOnly, setMineOnly] = useState(initialMineOnly);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const requestedPage = Number.isInteger(initialPage) && initialPage >= 1 ? initialPage : 1;
  const resetToFirstPage = () => {
    if (requestedPage > 1) {
      router.replace("/staff/archive/meeting-records", { scroll: false });
    }
  };

  const queryParams = {
    page: Math.max(0, requestedPage - 1),
    size: MEETING_RECORDS_PER_PAGE,
    keyword: searchKeyword.trim() || undefined,
    mineOnly,
  };
  const { data, isError, isLoading } = useQuery({
    queryKey: queryKeys.meetingRecords.list(queryParams),
    queryFn: () => getMeetingRecords(queryParams),
    retry: false,
  });

  const totalElements = data?.totalElements ?? data?.content?.length ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  const records = data?.content ?? [];

  const rows: ListPanelRow[] = records.map((minute, index) => ({
    id: minute.id ?? index,
    no: String(Math.max(1, totalElements - ((currentPage - 1) * MEETING_RECORDS_PER_PAGE + index))).padStart(
      2,
      "0",
    ),
    className: "",
    title: minute.title ?? "-",
    author: minute.author ?? "-",
    date: formatUtcToKstShortDate(minute.createdAt),
    status: getStatusLabel(minute.status),
    statusType: minute.status,
    detailHref: `/staff/archive/meeting-records/${minute.id}`,
  }));

  return (
    <ListPanel
      title="교학 회의록"
      writeLabel="교학 회의록 작성하기"
      writeHref="/staff/archive/meeting-records/new"
      listPath="/staff/archive/meeting-records"
      rows={isLoading || isError ? [] : rows}
      currentPage={currentPage}
      totalPages={totalPages}
      stableTableRows={MEETING_RECORDS_PER_PAGE}
      mineOnly={mineOnly}
      showMineOnlyToggle
      toggleLabel="내가 작성한 글만 보기"
      toggleAriaLabel="내가 작성한 글만 보기"
      onMineOnlyToggle={() => {
        resetToFirstPage();
        setMineOnly((current) => !current);
      }}
      emptyMessage={
        isLoading
          ? "교학 회의록을 불러오는 중입니다."
          : isError
            ? "교학 회의록을 불러오지 못했습니다."
            : "교학 회의록이 없습니다."
      }
      headerTone="archive"
      showClassColumn={false}
      statusHeader="구분"
      writeIcon={<IconEdit aria-hidden="true" size={16} stroke={2} />}
      searchSlot={
        <SearchForm
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            resetToFirstPage();
            setSearchKeyword(searchInput);
          }}
        >
          <SearchInput
            aria-label="교학 회의록 검색"
            placeholder="검색어를 입력해주세요"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <SearchButton type="submit" aria-label="검색">
            <IconSearch size={18} stroke={2.25} />
          </SearchButton>
        </SearchForm>
      }
    />
  );
}

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: ${spacing.space8};

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 13.75rem;
  min-height: 2.25rem;
  border: 0;
  border-bottom: 1px solid ${colors.muted};
  background: ${colors.white};
  padding: 0.5rem 0;
  color: ${colors.text};
  font: inherit;
  font-size: ${typography.fontSize14};

  &::placeholder {
    color: ${colors.muted};
  }

  @media (min-width: 120rem) {
    width: 20.625rem;
    min-height: 3rem;
    font-size: ${typography.fontSize20};
  }

  @media (max-width: ${layout.breakpointMobile}) {
    flex: 1 1 auto;
    width: 100%;
  }
`;

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: ${radii.radius30};
  background: ${colors.text};
  color: ${colors.white};
  cursor: pointer;

  @media (min-width: 120rem) {
    width: 3.25rem;
    height: 3.25rem;
  }
`;
