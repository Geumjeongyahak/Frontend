"use client";

import styled from "styled-components";
import type { LessonExchangeDetailFieldConfig } from "@/components/admin/lesson-exchange/lessonExchangeDetailFields";
import type { LessonExchangeRequestDetailDto } from "@/api/lessonExchange/lessonExchange.dto";
import { spacing, typography } from "@/styles/tokens";

type LessonExchangeDetailFieldItemsProps = {
  fields: LessonExchangeDetailFieldConfig[];
  detail?: LessonExchangeRequestDetailDto;
  compact?: boolean;
};

export function LessonExchangeDetailFieldItems({
  fields,
  detail,
  compact = false,
}: LessonExchangeDetailFieldItemsProps) {
  return (
    <>
      {fields.map((field) => (
        <DetailField key={field.label} $fullWidth={field.fullWidth} $compact={compact}>
          <DetailFieldLabel>{field.label}</DetailFieldLabel>
          <DetailFieldValue>{field.render(detail)}</DetailFieldValue>
        </DetailField>
      ))}
    </>
  );
}

const DetailField = styled.div<{ $fullWidth?: boolean; $compact?: boolean }>`
  display: grid;
  gap: ${({ $compact }) => ($compact ? spacing.space4 : spacing.space8)};
  min-width: 0;
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
`;

const DetailFieldLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const DetailFieldValue = styled.div`
  color: #1f2b28;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
  word-break: break-word;
`;
