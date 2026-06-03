"use client";

import { TextInput } from "@/components/admin/AdminDashboardSectionParts";
import {
  DayChoiceButton,
  DayChoiceGrid,
  DayChoiceLabel,
  DetailField,
  EditLabel,
  ScheduleEditGrid,
  ScheduleTimeRow,
} from "@/components/admin/subjects/detail/AdminSubjectDetailPanel.styles";
import { TimeWheelPicker } from "@/components/admin/subjects/shared/TimeWheelPicker";
import { SUBJECT_DAY_OPTIONS } from "@/components/admin/subjects/shared/subjectCreateForm";
import type { AdminSubjectDetailViewModel } from "@/components/admin/subjects/detail/useAdminSubjectDetail";

type AdminSubjectScheduleEditFieldsProps = {
  detail: AdminSubjectDetailViewModel;
};

export function AdminSubjectScheduleEditFields({ detail }: AdminSubjectScheduleEditFieldsProps) {
  return (
    <>
      <DetailField $fullWidth>
        <ScheduleEditGrid>
          <EditLabel>
            시작일
            <TextInput
              type="date"
              value={detail.scheduleForm.startAt}
              max={detail.scheduleForm.endAt || undefined}
              onChange={(event) =>
                detail.setScheduleForm((current) => ({
                  ...current,
                  startAt: event.target.value,
                }))
              }
              required
            />
          </EditLabel>
          <EditLabel>
            종료일
            <TextInput
              type="date"
              value={detail.scheduleForm.endAt}
              min={detail.scheduleForm.startAt || undefined}
              onChange={(event) =>
                detail.setScheduleForm((current) => ({
                  ...current,
                  endAt: event.target.value,
                }))
              }
              required
            />
          </EditLabel>
        </ScheduleEditGrid>
      </DetailField>
      <DetailField $fullWidth>
        <EditLabel>요일</EditLabel>
        <DayChoiceGrid>
          {SUBJECT_DAY_OPTIONS.map((option) => {
            const isSelected = detail.scheduleForm.dayOfWeek === option.value;

            return (
              <DayChoiceButton
                key={option.value}
                type="button"
                $selected={isSelected}
                aria-pressed={isSelected}
                onClick={() =>
                  detail.setScheduleForm((current) => ({
                    ...current,
                    dayOfWeek: option.value,
                  }))
                }
              >
                <DayChoiceLabel $selected={isSelected}>{option.label}</DayChoiceLabel>
              </DayChoiceButton>
            );
          })}
        </DayChoiceGrid>
      </DetailField>
      <DetailField $fullWidth>
        <ScheduleTimeRow>
          <TimeWheelPicker
            label="시작 시간"
            value={detail.scheduleForm.startTime}
            onChange={(value) =>
              detail.setScheduleForm((current) => ({ ...current, startTime: value }))
            }
          />
          <TimeWheelPicker
            label="종료 시간"
            value={detail.scheduleForm.endTime}
            onChange={(value) =>
              detail.setScheduleForm((current) => ({ ...current, endTime: value }))
            }
          />
        </ScheduleTimeRow>
      </DetailField>
      <DetailField>
        <EditLabel>
          교시
          <TextInput
            type="number"
            min={1}
            step={1}
            value={detail.scheduleForm.period}
            onChange={(event) =>
              detail.setScheduleForm((current) => ({ ...current, period: event.target.value }))
            }
            required
          />
        </EditLabel>
      </DetailField>
    </>
  );
}
