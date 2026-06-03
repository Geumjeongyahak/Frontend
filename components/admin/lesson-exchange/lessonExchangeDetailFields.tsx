"use client";

import type { ReactNode } from "react";
import type { LessonExchangeRequestDetailDto } from "@/api/lessonExchange/lessonExchange.dto";
import { formatLessonExchangeDate } from "@/components/admin/lesson-exchange/lessonExchangeRequestConstants";
import { LessonExchangeStatusBadge } from "@/components/admin/lesson-exchange/LessonExchangeStatusBadge";

export type LessonExchangeDetailFieldConfig = {
  label: string;
  fullWidth?: boolean;
  render: (detail?: LessonExchangeRequestDetailDto) => ReactNode;
};

export const LESSON_EXCHANGE_BASIC_DETAIL_FIELDS: LessonExchangeDetailFieldConfig[] = [
  {
    label: "제목",
    fullWidth: true,
    render: (detail) => detail?.title ?? "-",
  },
  {
    label: "분반",
    render: (detail) => detail?.classroomName ?? "-",
  },
  {
    label: "요청자",
    render: (detail) => detail?.requestedByName ?? "-",
  },
  {
    label: "수업일",
    render: (detail) => formatLessonExchangeDate(detail?.lessonDate),
  },
  {
    label: "만료일",
    render: (detail) => formatLessonExchangeDate(detail?.expiresAt),
  },
  {
    label: "요청일",
    render: (detail) => formatLessonExchangeDate(detail?.createdAt),
  },
  {
    label: "상태",
    render: (detail) => <LessonExchangeStatusBadge status={detail?.status} />,
  },
];

export const LESSON_EXCHANGE_PROCESSING_META_FIELDS: LessonExchangeDetailFieldConfig[] = [
  {
    label: "처리자",
    render: (detail) => detail?.processedByName ?? "-",
  },
  {
    label: "처리일",
    render: (detail) => formatLessonExchangeDate(detail?.processedAt),
  },
  {
    label: "완료일",
    render: (detail) => formatLessonExchangeDate(detail?.completedAt),
  },
  {
    label: "취소일",
    render: (detail) => formatLessonExchangeDate(detail?.cancelledAt),
  },
];
