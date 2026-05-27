"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getLessons } from "@/api/lesson/lesson.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { AdminLessonCreateForm } from "@/components/admin/lesson-management/AdminLessonCreateForm";
import { AdminLessonDetailPanel } from "@/components/admin/lesson-management/AdminLessonDetailPanel";
import { formatLessonTimeRange } from "@/components/admin/lesson-management/lessonCreateError";
import {
  getLessonMonthRange,
  getLessonYearOptions,
  LESSON_MONTH_OPTIONS,
  parseLessonMonthFilter,
} from "@/components/admin/lesson-management/lessonMonthFilter";
import {
  ControlRow,
  DataState,
  Label,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  Select,
  StableListArea,
  Table,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { colors, spacing } from "@/styles/tokens";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const PageStack = styled.div`
  display: grid;
  gap: ${spacing.space16};
`;

const LessonTableRow = styled.tr<{ $selected: boolean }>`
  background-color: ${({ $selected }) => ($selected ? colors.pointSoft : "transparent")};
`;

const MonthFilterRow = styled(ControlRow)`
  select {
    font-weight: 500;
  }
`;

function sortLessons(lessons: LessonSummaryResponseDto[]) {
  return [...lessons].sort((a, b) => {
    const dateCompare = (a.date ?? "").localeCompare(b.date ?? "");
    if (dateCompare !== 0) return dateCompare;

    const periodCompare = (a.period ?? 0) - (b.period ?? 0);
    if (periodCompare !== 0) return periodCompare;

    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

export function AdminLessonManagementSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { year, month } = parseLessonMonthFilter(searchParams);
  const { from, to } = getLessonMonthRange(year, month);

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const yearOptions = useMemo(() => getLessonYearOptions(), []);

  const lessonsQuery = useQuery({
    queryKey: ["admin", "lessons", from, to],
    queryFn: () => getLessons({ from, to }),
    retry: false,
  });

  const lessons = useMemo(
    () => sortLessons(Array.isArray(lessonsQuery.data) ? lessonsQuery.data : []),
    [lessonsQuery.data],
  );

  const selectedLessonSummary = useMemo(
    () => lessons.find((lesson) => lesson.lessonId === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  useEffect(() => {
    setSelectedLessonId(null);
  }, [year, month]);

  const updateMonthFilter = (nextYear: number, nextMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(nextYear));
    params.set("month", String(nextMonth));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <PageStack>
      <SectionCard>
        <SectionTitle>수업 생성</SectionTitle>
        <AdminLessonCreateForm />
      </SectionCard>

      <TwoColumnGrid>
        <SectionCard>
          <SectionHeaderRow>
            <SectionTitle>수업 목록</SectionTitle>
          </SectionHeaderRow>

          <MonthFilterRow>
            <Label>
              년도
              <Select
                value={year}
                onChange={(event) => updateMonthFilter(Number(event.target.value), month)}
              >
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}년
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              월
              <Select
                value={month}
                onChange={(event) => updateMonthFilter(year, Number(event.target.value))}
              >
                {LESSON_MONTH_OPTIONS.map((optionMonth) => (
                  <option key={optionMonth} value={optionMonth}>
                    {optionMonth}월
                  </option>
                ))}
              </Select>
            </Label>
          </MonthFilterRow>

          <StableListArea>
            <DataState
              isLoading={lessonsQuery.isLoading}
              isError={lessonsQuery.isError}
              isEmpty={lessons.length === 0}
              loadingLabel="수업 목록 불러오는 중"
              errorLabel="수업 목록을 불러오지 못했습니다."
              emptyLabel="해당 월에 등록된 수업이 없습니다."
            >
              <Table>
                <thead>
                  <tr>
                    <th>일자</th>
                    <th>교시</th>
                    <th>시간</th>
                    <th>담당 교사</th>
                    <th>과목</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson, index) => {
                    const lessonId = lesson.lessonId;
                    const isSelected = lessonId != null && lessonId === selectedLessonId;

                    return (
                      <LessonTableRow
                        key={lessonId ?? `${lesson.date}-${lesson.period}-${index}`}
                        $selected={isSelected}
                        onClick={() => {
                          if (lessonId == null) return;
                          setSelectedLessonId(lessonId);
                        }}
                      >
                        <td>{formatUtcToKstShortDate(lesson.date)}</td>
                        <td>{lesson.period ?? "—"}</td>
                        <td>{formatLessonTimeRange(lesson.startTime, lesson.endTime)}</td>
                        <td>{lesson.teacherName ?? "—"}</td>
                        <td>{lesson.subjectName ?? "—"}</td>
                      </LessonTableRow>
                    );
                  })}
                </tbody>
              </Table>
            </DataState>
          </StableListArea>
        </SectionCard>

        <SectionCard>
          <SectionTitle>수업 상세</SectionTitle>
          <AdminLessonDetailPanel
            selectedLessonId={selectedLessonId}
            selectedLessonSummary={selectedLessonSummary}
            onClearSelection={() => setSelectedLessonId(null)}
          />
        </SectionCard>
      </TwoColumnGrid>
    </PageStack>
  );
}
