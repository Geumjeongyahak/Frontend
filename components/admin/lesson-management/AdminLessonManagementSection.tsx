"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getLessons } from "@/api/lesson/lesson.api";
import type { LessonSummaryResponseDto } from "@/api/lesson/lesson.dto";
import { AdminLessonCreateForm } from "@/components/admin/lesson-management/AdminLessonCreateForm";
import {
  ControlRow,
  DataState,
  Label,
  SectionCard,
  SectionHeaderRow,
  SectionTitle,
  StableListArea,
  Table,
  TextInput,
  TwoColumnGrid,
} from "@/components/admin/AdminDashboardSectionParts";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

const LessonTable = styled(Table)`
  tbody tr {
    cursor: default;
  }

  tbody tr:hover {
    background-color: transparent;
  }
`;

function formatLessonTimeRange(startTime?: string, endTime?: string) {
  const start = startTime ? startTime.slice(0, 5) : "—";
  const end = endTime ? endTime.slice(0, 5) : "—";
  return `${start} - ${end}`;
}

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
  const [from, setFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState(() => dayjs().endOf("month").format("YYYY-MM-DD"));

  const isValidRange = Boolean(from && to && from <= to);

  const lessonsQuery = useQuery({
    queryKey: ["admin", "lessons", from, to],
    queryFn: () => getLessons({ from, to }),
    enabled: isValidRange,
    retry: false,
  });

  const lessons = useMemo(
    () => sortLessons(Array.isArray(lessonsQuery.data) ? lessonsQuery.data : []),
    [lessonsQuery.data],
  );

  return (
    <TwoColumnGrid>
      <SectionCard>
        <SectionHeaderRow>
          <SectionTitle>수업 목록</SectionTitle>
        </SectionHeaderRow>

        <ControlRow>
          <Label>
            시작일
            <TextInput
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </Label>
          <Label>
            종료일
            <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Label>
        </ControlRow>

        {!isValidRange ? (
          <StableListArea>시작일과 종료일을 올바르게 입력해 주세요.</StableListArea>
        ) : (
          <StableListArea>
            <DataState
              isLoading={lessonsQuery.isLoading}
              isError={lessonsQuery.isError}
              isEmpty={lessons.length === 0}
              loadingLabel="수업 목록 불러오는 중"
              errorLabel="수업 목록을 불러오지 못했습니다."
              emptyLabel="조회 기간에 해당하는 수업이 없습니다."
            >
              <LessonTable>
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
                  {lessons.map((lesson, index) => (
                    <tr key={lesson.lessonId ?? `${lesson.date}-${lesson.period}-${index}`}>
                      <td>{formatUtcToKstShortDate(lesson.date)}</td>
                      <td>{lesson.period ?? "—"}</td>
                      <td>{formatLessonTimeRange(lesson.startTime, lesson.endTime)}</td>
                      <td>{lesson.teacherName ?? "—"}</td>
                      <td>{lesson.subjectName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </LessonTable>
            </DataState>
          </StableListArea>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle>수업 생성</SectionTitle>
        <AdminLessonCreateForm />
      </SectionCard>
    </TwoColumnGrid>
  );
}
