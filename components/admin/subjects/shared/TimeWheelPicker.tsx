"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { snapLessonTimeToFiveMinutes } from "@/components/admin/lesson-management/lessonCreateError";
import { colors, spacing, typography } from "@/styles/tokens";

const ITEM_HEIGHT_PX = 40;
const VISIBLE_COUNT = 3;
const WHEEL_HEIGHT_PX = ITEM_HEIGHT_PX * VISIBLE_COUNT;
const EDGE_PADDING_COUNT = Math.floor(VISIBLE_COUNT / 2);

const WheelField = styled.div`
  display: grid;
  gap: ${spacing.space8};
`;

const WheelFieldLabel = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize13};
  font-weight: 800;
  line-height: ${typography.lineHeight130};
`;

const WheelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const WheelColumnShell = styled.div`
  position: relative;
  width: 3.25rem;
`;

const WheelHighlight = styled.div`
  position: absolute;
  inset: 50% 0 auto;
  height: ${ITEM_HEIGHT_PX}px;
  transform: translateY(-50%);
  border: 1px solid ${colors.point};
  border-radius: 0.375rem;
  pointer-events: none;
`;

const WheelColumn = styled.div`
  height: ${WHEEL_HEIGHT_PX}px;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const WheelItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${ITEM_HEIGHT_PX}px;
  scroll-snap-align: center;
  color: ${({ $active }) => ($active ? colors.text : "#64706c")};
  font-size: ${typography.fontSize14};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  line-height: ${typography.lineHeight130};
`;

const WheelSpacer = styled.div`
  height: ${ITEM_HEIGHT_PX * EDGE_PADDING_COUNT}px;
  flex-shrink: 0;
`;

const WheelSeparator = styled.span`
  color: #64706c;
  font-size: ${typography.fontSize16};
  font-weight: 700;
`;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index * 5).padStart(2, "0"),
);

function parseTimeValue(value: string) {
  const normalized = snapLessonTimeToFiveMinutes(value.trim() || "00:00");
  const match = /^(\d{2}):(\d{2})$/.exec(normalized);
  if (!match) {
    return { hour: "00", minute: "00" };
  }

  const minute = MINUTE_OPTIONS.includes(match[2]) ? match[2] : "00";

  return { hour: match[1], minute };
}

function getCenteredOptionIndex(column: HTMLDivElement, options: string[]) {
  const index = Math.round(column.scrollTop / ITEM_HEIGHT_PX);
  return Math.min(Math.max(index, 0), options.length - 1);
}

function scrollColumnToValue(column: HTMLDivElement, options: string[], selected: string) {
  const index = Math.max(0, options.indexOf(selected));
  column.scrollTop = index * ITEM_HEIGHT_PX;
}

function readValueFromColumn(column: HTMLDivElement, options: string[]) {
  return options[getCenteredOptionIndex(column, options)] ?? options[0];
}

type TimeWheelPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TimeWheelPicker({ label, value, onChange }: TimeWheelPickerProps) {
  const hourColumnRef = useRef<HTMLDivElement>(null);
  const minuteColumnRef = useRef<HTMLDivElement>(null);
  const parsed = parseTimeValue(value);
  const [centered, setCentered] = useState({
    value,
    hour: parsed.hour,
    minute: parsed.minute,
  });
  const centeredHour = centered.value === value ? centered.hour : parsed.hour;
  const centeredMinute = centered.value === value ? centered.minute : parsed.minute;

  useEffect(() => {
    if (hourColumnRef.current) {
      scrollColumnToValue(hourColumnRef.current, HOUR_OPTIONS, parsed.hour);
    }
    if (minuteColumnRef.current) {
      scrollColumnToValue(minuteColumnRef.current, MINUTE_OPTIONS, parsed.minute);
    }
  }, [parsed.hour, parsed.minute]);

  const syncCenteredFromScroll = (column: HTMLDivElement, options: string[]) => {
    const index = getCenteredOptionIndex(column, options);
    return options[index] ?? options[0];
  };

  const handleHourScroll = () => {
    const column = hourColumnRef.current;
    if (!column) return;

    const nextHour = syncCenteredFromScroll(column, HOUR_OPTIONS);
    setCentered((current) => ({
      value,
      hour: nextHour,
      minute: current.value === value ? current.minute : parsed.minute,
    }));

    const minuteColumn = minuteColumnRef.current;
    if (!minuteColumn) return;

    onChange(`${nextHour}:${readValueFromColumn(minuteColumn, MINUTE_OPTIONS)}`);
  };

  const handleMinuteScroll = () => {
    const column = minuteColumnRef.current;
    if (!column) return;

    const nextMinute = syncCenteredFromScroll(column, MINUTE_OPTIONS);
    setCentered((current) => ({
      value,
      hour: current.value === value ? current.hour : parsed.hour,
      minute: nextMinute,
    }));

    const hourColumn = hourColumnRef.current;
    if (!hourColumn) return;

    onChange(`${readValueFromColumn(hourColumn, HOUR_OPTIONS)}:${nextMinute}`);
  };

  return (
    <WheelField>
      <WheelFieldLabel>{label}</WheelFieldLabel>
      <WheelRow>
        <WheelColumnShell>
          <WheelHighlight aria-hidden="true" />
          <WheelColumn
            ref={hourColumnRef}
            aria-label={`${label} 시`}
            onScroll={handleHourScroll}
          >
            <WheelSpacer aria-hidden="true" />
            {HOUR_OPTIONS.map((option) => (
              <WheelItem key={option} $active={option === centeredHour}>
                {option}
              </WheelItem>
            ))}
            <WheelSpacer aria-hidden="true" />
          </WheelColumn>
        </WheelColumnShell>
        <WheelSeparator aria-hidden="true">
          :
        </WheelSeparator>
        <WheelColumnShell>
          <WheelHighlight aria-hidden="true" />
          <WheelColumn
            ref={minuteColumnRef}
            aria-label={`${label} 분`}
            onScroll={handleMinuteScroll}
          >
            <WheelSpacer aria-hidden="true" />
            {MINUTE_OPTIONS.map((option) => (
              <WheelItem key={option} $active={option === centeredMinute}>
                {option}
              </WheelItem>
            ))}
            <WheelSpacer aria-hidden="true" />
          </WheelColumn>
        </WheelColumnShell>
      </WheelRow>
    </WheelField>
  );
}
