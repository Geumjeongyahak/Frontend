"use client";

import { IconPlus, IconX } from "@tabler/icons-react";
import styled from "styled-components";
import type { DailyStudentAttendanceStatus } from "@/api/dailySchedule/dailySchedule.dto";
import { colors, radii, spacing, typography } from "@/styles/tokens";
import {
  dailyStudentAttendanceOptions,
  getDailyStudentAttendanceStatusOrDefault,
} from "@/utils/dailyStudentAttendance";

export type MobileStudentAttendanceEntry = {
  key: string;
  studentId?: number;
  name: string;
  status: DailyStudentAttendanceStatus;
};

type MobileStudentAttendanceListProps = {
  entries: MobileStudentAttendanceEntry[];
  isEditing: boolean;
  disabled?: boolean;
  onChangeName: (entryIndex: number, name: string) => void;
  onChangeStatus: (entryIndex: number, status: DailyStudentAttendanceStatus) => void;
  onDelete: (entryIndex: number) => void;
  onAdd: () => void;
};

export default function MobileStudentAttendanceList({
  entries,
  isEditing,
  disabled = false,
  onChangeName,
  onChangeStatus,
  onDelete,
  onAdd,
}: MobileStudentAttendanceListProps) {
  if (!entries.length) {
    return (
      <>
        <EmptyState>출석을 기록할 학생이 없습니다.</EmptyState>
        {isEditing ? (
          <AddRow>
            <AddButton
              type="button"
              disabled={disabled}
              aria-label="학생 항목 추가"
              onClick={onAdd}
            >
              <IconPlus size={16} stroke={2.4} aria-hidden="true" />
            </AddButton>
          </AddRow>
        ) : null}
      </>
    );
  }

  return (
    <>
      <List role="list" aria-label="학생 출석 목록">
        {entries.map((entry, index) => (
          <ListItem key={entry.key}>
            {isEditing ? (
              <StudentNameInput
                value={entry.name}
                placeholder="학생 이름"
                disabled={disabled}
                aria-label={`${index + 1}번 학생 이름`}
                onChange={(event) => onChangeName(index, event.target.value)}
              />
            ) : (
              <StudentName>{entry.name || `학생 ${index + 1}`}</StudentName>
            )}
            <StatusSelect
              value={entry.status}
              disabled={disabled}
              aria-label={`${entry.name || `학생 ${index + 1}`} 출석 상태`}
              onChange={(event) =>
                onChangeStatus(
                  index,
                  getDailyStudentAttendanceStatusOrDefault(
                    event.target.value as DailyStudentAttendanceStatus,
                  ),
                )
              }
            >
              {dailyStudentAttendanceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </StatusSelect>
            {isEditing ? (
              <DeleteButton
                type="button"
                aria-label={`${entry.name || `학생 ${index + 1}`} 삭제`}
                onClick={() => onDelete(index)}
              >
                <IconX size={12} stroke={2.2} aria-hidden="true" />
              </DeleteButton>
            ) : null}
          </ListItem>
        ))}
      </List>
      {isEditing ? (
        <AddRow>
          <AddButton type="button" disabled={disabled} aria-label="학생 항목 추가" onClick={onAdd}>
            <IconPlus size={16} stroke={2.4} aria-hidden="true" />
          </AddButton>
        </AddRow>
      ) : null}
    </>
  );
}

const List = styled.div`
  display: grid;
  gap: ${spacing.space12};
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 7rem auto;
  align-items: center;
  gap: ${spacing.space8};
  padding: 0.75rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
`;

const StudentName = styled.div`
  min-width: 0;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 700;
  line-height: ${typography.lineHeight150};
  word-break: keep-all;
`;

const StudentNameInput = styled.input`
  min-width: 0;
  min-height: 2.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }
`;

const StatusSelect = styled.select`
  min-height: 2.375rem;
  padding: 0.5rem 2rem 0.5rem 0.875rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius12};
  background: ${colors.white};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.25 6 6.25l5-5' fill='none' stroke='%23262626' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  appearance: none;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 600;
  outline: none;

  &:focus {
    border-color: ${colors.point};
    box-shadow: 0 0 0 0.1875rem rgba(136, 205, 90, 0.16);
  }

  &:disabled {
    color: #6d6d6d;
    background: #f0f2ee;
  }
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: #e45b5b;
  color: ${colors.white};
  padding: 0;
`;

const AddRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${spacing.space12};
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: ${radii.radius999};
  background: ${colors.point};
  color: ${colors.white};
  padding: 0;

  &:disabled {
    opacity: 0.55;
  }
`;

const EmptyState = styled.div`
  padding: 0.875rem 1rem;
  border: 1px solid #d7ddd3;
  border-radius: ${radii.radius15};
  background: #fbfcfa;
  color: #61705b;
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight150};
`;
