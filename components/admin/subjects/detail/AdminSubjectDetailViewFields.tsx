"use client";

import type { SubjectDetailResponseDto } from "@/api/subject/subject.dto";
import { TextInput } from "@/components/admin/AdminDashboardSectionParts";
import {
  DetailField,
  DetailFieldLabel,
  DetailFieldValue,
  DetailFields,
  UnassignedTeacherBadge,
} from "@/components/admin/subjects/detail/AdminSubjectDetailPanel.styles";
import { AdminSubjectScheduleEditFields } from "@/components/admin/subjects/detail/AdminSubjectScheduleEditFields";
import {
  formatSubjectDateRange,
  formatSubjectDayOfWeek,
  formatSubjectTeacherAssignedAt,
  formatSubjectTeacherName,
  formatSubjectTimeRange,
  isSubjectTeacherUnassigned,
} from "@/components/admin/subjects/shared/subjectDisplay";
import type { AdminSubjectDetailViewModel } from "@/components/admin/subjects/detail/useAdminSubjectDetail";

type AdminSubjectDetailViewFieldsProps = {
  subject: SubjectDetailResponseDto;
  detail: AdminSubjectDetailViewModel;
};

export function AdminSubjectDetailViewFields({ subject, detail }: AdminSubjectDetailViewFieldsProps) {
  const teacherNameLabel = formatSubjectTeacherName(subject.teacherName);
  const isTeacherUnassigned = isSubjectTeacherUnassigned(subject.teacherName);

  return (
    <DetailFields>
      <DetailField $fullWidth>
        <DetailFieldLabel>과목명</DetailFieldLabel>
        {detail.isEditingInfo ? (
          <TextInput
            value={detail.infoForm.name}
            onChange={(event) => {
              detail.clearActionError();
              detail.setInfoForm((current) => ({ ...current, name: event.target.value }));
            }}
            required
          />
        ) : (
          <DetailFieldValue>{subject.name ?? "—"}</DetailFieldValue>
        )}
      </DetailField>
      <DetailField>
        <DetailFieldLabel>분반</DetailFieldLabel>
        <DetailFieldValue>{subject.classroomName ?? "—"}</DetailFieldValue>
      </DetailField>
      <DetailField>
        <DetailFieldLabel>담당 교사</DetailFieldLabel>
        <DetailFieldValue>
          {isTeacherUnassigned ? (
            <UnassignedTeacherBadge>{teacherNameLabel}</UnassignedTeacherBadge>
          ) : (
            teacherNameLabel
          )}
        </DetailFieldValue>
      </DetailField>

      {detail.isEditingSchedule ? (
        <AdminSubjectScheduleEditFields detail={detail} />
      ) : (
        <>
          <DetailField>
            <DetailFieldLabel>기간</DetailFieldLabel>
            <DetailFieldValue>{formatSubjectDateRange(subject.startAt, subject.endAt)}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>요일</DetailFieldLabel>
            <DetailFieldValue>{formatSubjectDayOfWeek(subject.dayOfWeek)}</DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>시간</DetailFieldLabel>
            <DetailFieldValue>
              {formatSubjectTimeRange(subject.startTime, subject.endTime)}
            </DetailFieldValue>
          </DetailField>
          <DetailField>
            <DetailFieldLabel>교시</DetailFieldLabel>
            <DetailFieldValue>{subject.period ?? "—"}</DetailFieldValue>
          </DetailField>
        </>
      )}

      <DetailField>
        <DetailFieldLabel>교사 배정일</DetailFieldLabel>
        <DetailFieldValue>{formatSubjectTeacherAssignedAt(subject.teacherAssignedAt)}</DetailFieldValue>
      </DetailField>
    </DetailFields>
  );
}
