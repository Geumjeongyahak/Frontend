"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getAccessToken, getRefreshToken } from "@/api/client/tokenStorage";
import { getDailySchedule, getDailySchedules } from "@/api/dailySchedule/dailySchedule.api";
import type { DailyScheduleDetailResponseDto } from "@/api/dailySchedule/dailySchedule.dto";
import { useAuthSession } from "@/hooks/useAuthSession";
import MobileStudentAttendanceList, {
  type MobileStudentAttendanceEntry,
} from "@/pwa/components/MobileStudentAttendanceList";
import AuthStatusSpinner from "@/pwa/pages/mobile-home/components/AuthStatusSpinner";
import MobileRequestShell from "@/pwa/requests/components/MobileRequestShell";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import { getDailyStudentAttendanceStatusOrDefault } from "@/utils/dailyStudentAttendance";
import { mapClassJournalListItem } from "@/utils/mapClassJournalListItem";

const JOURNALS_PER_PAGE = 10;
type ViewMode = "mine" | "all";

function getPageTokens(currentPage: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2)
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function mapStudentAttendanceEntries(
  schedule?: DailyScheduleDetailResponseDto,
): MobileStudentAttendanceEntry[] {
  return (schedule?.studentAttendances ?? []).map((attendance, index) => ({
    key: String(attendance.attendanceId ?? attendance.studentId ?? index),
    studentId: attendance.studentId,
    name: attendance.studentName ?? "",
    status: getDailyStudentAttendanceStatusOrDefault(attendance.status),
  }));
}

export default function MobileClassJournalListPage() {
  const { status, refreshSession } = useAuthSession();
  const isAuthenticated = status === "authenticated";
  const hasStoredToken = Boolean(getAccessToken() || getRefreshToken());
  const isAuthPending = status === "loading" || (status === "error" && hasStoredToken);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "error" && hasStoredToken) refreshSession().catch(() => undefined);
  }, [hasStoredToken, refreshSession, status]);

  const journalListQueryKey = [
    "daily-schedules",
    "list",
    "mobile",
    viewMode,
    searchKeyword,
    currentPage,
  ] as const;
  const journalQuery = useQuery({
    queryKey: journalListQueryKey,
    queryFn: () =>
      getDailySchedules({
        mine: viewMode === "mine" || undefined,
        keyword: searchKeyword || undefined,
        page: currentPage - 1,
        size: JOURNALS_PER_PAGE,
      }),
    enabled: isAuthenticated,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      if (!previousQuery) {
        return undefined;
      }

      return previousQuery.queryKey.length === journalListQueryKey.length &&
      previousQuery.queryKey.every(
        (value, index) => index === journalListQueryKey.length - 1 || value === journalListQueryKey[index],
      )
        ? previousData
        : undefined;
    },
  });
  const attendanceQuery = useQuery({
    queryKey: ["daily-schedules", "detail", "mobile-journal", expandedId] as const,
    queryFn: () => getDailySchedule({ dailyScheduleId: expandedId as number }),
    enabled: isAuthenticated && typeof expandedId === "number",
    retry: false,
  });
  const journals = (journalQuery.data?.content ?? []).map(mapClassJournalListItem);
  const totalPages = Math.max(1, journalQuery.data?.totalPages ?? 1);
  const attendanceEntries = mapStudentAttendanceEntries(attendanceQuery.data);

  function resetList() {
    setExpandedId(null);
    setCurrentPage(1);
  }
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetList();
    setSearchKeyword(searchInput.trim());
  }
  function handleViewMode(nextMode: ViewMode) {
    resetList();
    setViewMode(nextMode);
  }
  function handlePage(nextPage: number) {
    setExpandedId(null);
    setCurrentPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  return (
    <MobileRequestShell backHref="/" title="수업 일지 목록">
      {isAuthPending ? (
        <LoadingPanel>
          <AuthStatusSpinner />
          <EmptyText>로그인 상태를 확인하는 중입니다.</EmptyText>
        </LoadingPanel>
      ) : null}
      {!isAuthPending && !isAuthenticated ? (
        <StatePanel>
          <PanelTitle>로그인이 필요한 메뉴입니다.</PanelTitle>
          <EmptyText>교원 계정으로 로그인하면 수업 일지를 확인할 수 있습니다.</EmptyText>
          <LoginLink href="/login">로그인하기</LoginLink>
        </StatePanel>
      ) : null}
      {isAuthenticated ? (
        <Panel>
          <HeaderRow>
            <PanelTitle>수업 일지</PanelTitle>
            <ToggleLabel>
              <ToggleState>{viewMode === "mine" ? "나의 수업 일지" : "전체 수업 일지"}</ToggleState>
              <ToggleInput
                type="checkbox"
                aria-label="내 일지만 보기"
                checked={viewMode === "mine"}
                onChange={(event) => handleViewMode(event.target.checked ? "mine" : "all")}
              />
              <ToggleTrack aria-hidden="true">
                <ToggleThumb />
              </ToggleTrack>
            </ToggleLabel>
          </HeaderRow>
          <SearchForm onSubmit={handleSearch}>
            <SearchInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="반 이름 또는 수업 내용을 검색"
              aria-label="수업 일지 검색"
            />
            <SearchButton type="submit" aria-label="검색">
              <IconSearch size={19} />
            </SearchButton>
          </SearchForm>
          {journalQuery.isLoading && !journalQuery.data ? (
            <EmptyText>수업 일지를 불러오는 중입니다.</EmptyText>
          ) : null}
          {!journalQuery.isLoading && journalQuery.isError ? (
            <EmptyText role="status">
              수업 일지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </EmptyText>
          ) : null}
          {!journalQuery.isLoading && !journalQuery.isError && journals.length === 0 ? (
            <EmptyText role="status">수업 일지가 없습니다.</EmptyText>
          ) : null}
          {journals.length > 0 ? (
            <JournalList aria-label="수업 일지 목록">
              {journals.map((journal) => {
                const expanded = expandedId === journal.id;
                return (
                  <JournalCard key={journal.id}>
                    <JournalButton
                      type="button"
                      $expanded={expanded}
                      aria-expanded={expanded}
                      onClick={() => setExpandedId((id) => (id === journal.id ? null : journal.id))}
                    >
                      <JournalInfo>
                        <TopRow>
                          <JournalClass>{journal.className}</JournalClass>
                          <JournalDate>{journal.date}</JournalDate>
                        </TopRow>
                        <Teacher>{journal.teacher} 선생님</Teacher>
                      </JournalInfo>
                      <Chevron $expanded={expanded}>
                        <IconChevronDown size={19} />
                      </Chevron>
                    </JournalButton>
                    {expanded ? (
                      <JournalDetail>
                        {journal.lessons.map((lesson) => (
                          <LessonRow key={lesson.period}>
                            <Period>{lesson.period}</Period>
                            <LessonText>
                              {lesson.content || "작성된 수업 내용이 없습니다."}
                            </LessonText>
                          </LessonRow>
                        ))}
                        <AttendanceSection aria-labelledby={`attendance-title-${journal.id}`}>
                          <AttendanceHeading id={`attendance-title-${journal.id}`}>
                            <IconUsers size={17} aria-hidden="true" />
                            학생 출석 목록
                          </AttendanceHeading>
                          {attendanceQuery.isLoading ? (
                            <AttendanceState role="status">
                              학생 출석 정보를 불러오는 중입니다.
                            </AttendanceState>
                          ) : null}
                          {!attendanceQuery.isLoading && attendanceQuery.isError ? (
                            <AttendanceState role="status">
                              학생 출석 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                            </AttendanceState>
                          ) : null}
                          {!attendanceQuery.isLoading &&
                          !attendanceQuery.isError &&
                          attendanceEntries.length === 0 ? (
                            <AttendanceState role="status">
                              등록된 학생 출석 정보가 없습니다.
                            </AttendanceState>
                          ) : null}
                          {!attendanceQuery.isLoading &&
                          !attendanceQuery.isError &&
                          attendanceEntries.length > 0 ? (
                            <MobileStudentAttendanceList
                              entries={attendanceEntries}
                              isEditing={false}
                              disabled
                              onChangeName={() => undefined}
                              onChangeStatus={() => undefined}
                              onDelete={() => undefined}
                              onAdd={() => undefined}
                            />
                          ) : null}
                        </AttendanceSection>
                      </JournalDetail>
                    ) : null}
                  </JournalCard>
                );
              })}
            </JournalList>
          ) : null}
          {journals.length > 0 ? (
            <Pagination aria-label="페이지 이동">
              <PageButton
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePage(currentPage - 1)}
                aria-label="이전 페이지"
              >
                <IconChevronLeft size={18} />
              </PageButton>
              {getPageTokens(currentPage, totalPages).map((token, index) =>
                token === "ellipsis" ? (
                  <Ellipsis key={index}>...</Ellipsis>
                ) : (
                  <PageNumber
                    key={token}
                    type="button"
                    $active={token === currentPage}
                    onClick={() => handlePage(token as number)}
                  >
                    {token}
                  </PageNumber>
                ),
              )}
              <PageButton
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePage(currentPage + 1)}
                aria-label="다음 페이지"
              >
                <IconChevronRight size={18} />
              </PageButton>
            </Pagination>
          ) : null}
        </Panel>
      ) : null}
    </MobileRequestShell>
  );
}

const surface = `display: grid; gap: ${spacing.space16}; padding: 1.5rem; border-radius: 1.5rem; background: ${colors.white}; box-shadow: 0 .75rem 2rem rgba(0,0,0,.06);`;
const Panel = styled.section`
  ${surface}
`;
const StatePanel = styled.section`
  ${surface}
`;
const LoadingPanel = styled(StatePanel)`
  justify-items: center;
  min-height: 16rem;
  align-content: center;
`;
const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.space12};
`;
const PanelTitle = styled.h2`
  color: ${colors.text};
  font-size: ${typography.fontSize18};
  font-weight: 800;
`;
const EmptyText = styled.p`
  margin: 0;
  padding: ${spacing.space12} 0;
  color: #72806a;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  text-align: center;
`;
const LoginLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  border-radius: ${radii.radius999};
  background: linear-gradient(90deg, #87c25c, #5fc077);
  color: ${colors.white};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  text-decoration: none;
`;
const ToggleLabel = styled.label`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${spacing.space8};
  color: #72806a;
  font-size: ${typography.fontSize13};
  font-weight: 700;
`;
const ToggleState = styled.span`
  min-width: 3.375rem;
  text-align: right;
`;
const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  &:checked + span {
    background: #eef9e6;
  }
  &:checked + span span {
    transform: translateX(1.125rem);
    background: ${colors.point};
  }
  &:focus-visible + span {
    outline: 2px solid ${colors.point};
    outline-offset: 2px;
  }
`;
const ToggleTrack = styled.span`
  position: relative;
  display: inline-flex;
  width: 2.625rem;
  height: 1.5rem;
  border-radius: ${radii.radius999};
  background: #d9d9d9;
`;
const ToggleThumb = styled.span`
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #616161;
  transition: transform 0.2s ease;
`;
const SearchForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: ${spacing.space8};
`;
const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 3rem;
  padding: 0 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  outline: none;
  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;
const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  border: 0;
  border-radius: ${radii.radius15};
  background: linear-gradient(90deg, #87c25c, #5fc077);
  color: ${colors.white};
`;
const JournalList = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;
const JournalCard = styled.article`
  overflow: hidden;
  border: 1px solid #e5e8e1;
  border-radius: 1.25rem;
  background: #fcfdfb;
`;
const JournalButton = styled.button<{ $expanded: boolean }>`
  position: relative;
  display: grid;
  width: 100%;
  padding: 1rem 2.75rem 1rem 1rem;
  border: 0;
  background: ${({ $expanded }) => ($expanded ? "#f7fbf2" : "transparent")};
  text-align: left;
`;
const JournalInfo = styled.div`
  display: grid;
  gap: ${spacing.space8};
  min-width: 0;
`;
const TopRow = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
`;
const JournalClass = styled.h3`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  color: ${colors.text};
  font-size: ${typography.fontSize16};
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const JournalDate = styled.time`
  flex-shrink: 0;
  color: #80907a;
  font-size: ${typography.fontSize13};
  font-weight: 600;
`;
const Teacher = styled.span`
  color: #6b7665;
  font-size: ${typography.fontSize13};
`;
const Chevron = styled.span<{ $expanded: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  color: #6b7665;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;
const JournalDetail = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding: 1rem;
  border-top: 1px solid #eef1eb;
`;
const LessonRow = styled.div`
  display: grid;
  gap: ${spacing.space4};
`;
const Period = styled.strong`
  color: #4f8f27;
  font-size: ${typography.fontSize13};
`;
const LessonText = styled.p`
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  white-space: pre-wrap;
  word-break: keep-all;
`;
const AttendanceSection = styled.section`
  display: grid;
  gap: ${spacing.space12};
  padding-top: ${spacing.space4};
`;
const AttendanceHeading = styled.h4`
  display: flex;
  align-items: center;
  gap: ${spacing.space4};
  margin: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 800;
`;
const AttendanceState = styled.p`
  margin: 0;
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: #61705b;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  text-align: center;
`;
const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space8};
`;
const PageButton = styled.button`
  border: 0;
  background: transparent;
  color: ${colors.text};
  &:disabled {
    opacity: 0.35;
  }
`;
const PageNumber = styled.button<{ $active: boolean }>`
  min-width: 2rem;
  min-height: 2rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: ${({ $active }) => ($active ? colors.pointSoft : "transparent")};
  color: ${({ $active }) => ($active ? "#4f8f27" : colors.text)};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
`;
const Ellipsis = styled.span`
  color: #72806a;
  font-size: ${typography.fontSize14};
  font-weight: 700;
`;
