"use client";

import { useState } from "react";
import { IconEdit, IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import ListPanel, { type ListPanelRow } from "@/components/staff/common/ListPanel";
import { MEETING_RECORDS_PER_PAGE, type MeetingRecord } from "@/mocks/archiveMeeting";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

type MeetingRecordsPageProps = {
  initialPage: number;
  meetingRecords: MeetingRecord[];
  initialMineOnly: boolean;
};

export default function MeetingRecordsPage({
  initialPage,
  meetingRecords,
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

  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filteredMeetingRecords = meetingRecords.filter((minute) => {
    const matchesAuthor = !mineOnly || minute.author === "홍길동";
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      minute.title.toLowerCase().includes(normalizedKeyword);

    return matchesAuthor && matchesKeyword;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeetingRecords.length / MEETING_RECORDS_PER_PAGE),
  );
  const currentPage = requestedPage > totalPages ? 1 : requestedPage;
  const visibleMeetingRecords = filteredMeetingRecords.slice(
    (currentPage - 1) * MEETING_RECORDS_PER_PAGE,
    currentPage * MEETING_RECORDS_PER_PAGE,
  );

  const rows: ListPanelRow[] = visibleMeetingRecords.map((minute, index) => ({
    id: minute.id,
    no: String((currentPage - 1) * MEETING_RECORDS_PER_PAGE + index + 1).padStart(2, "0"),
    className: "",
    title: minute.title,
    author: minute.author,
    date: minute.date,
    status: minute.status,
    detailHref: `/staff/archive/meeting-records/${minute.id}`,
  }));

  return (
    <ListPanel
      title="교학 회의록"
      writeLabel="교학 회의록 작성하기"
      writeHref="/staff/archive/meeting-records/new"
      listPath="/staff/archive/meeting-records"
      rows={rows}
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
      emptyMessage="교학 회의록이 없습니다."
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
