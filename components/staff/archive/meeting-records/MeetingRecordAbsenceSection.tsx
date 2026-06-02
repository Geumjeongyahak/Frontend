"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAbsenceReport,
  deleteAbsenceReport,
  updateAbsenceReport,
} from "@/api/meetingRecord/meetingRecord.api";
import type {
  MeetingAbsenceReportResponseDto,
  MeetingRecordStatus,
} from "@/api/meetingRecord/meetingRecord.dto";
import {
  AbsenceBox,
  AbsenceBoxLabel,
  AbsenceHeader,
  AbsenceInput,
  AbsenceReportTopBar,
  AbsenceStack,
  AbsenceTextarea,
  AbsenceTitle,
  ActionButton,
  Divider,
  StateMessage,
  UnderlineTextButton,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type DraftAbsenceReport = {
  reason: string;
  opinion: string;
};

type MeetingRecordAbsenceSectionProps = {
  recordId: number;
  meetingStatus?: MeetingRecordStatus;
  initialReports: MeetingAbsenceReportResponseDto[];
};

const initialDraft: DraftAbsenceReport = {
  reason: "",
  opinion: "",
};

export default function MeetingRecordAbsenceSection({
  recordId,
  meetingStatus,
  initialReports,
}: MeetingRecordAbsenceSectionProps) {
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [draft, setDraft] = useState<DraftAbsenceReport>(initialDraft);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<DraftAbsenceReport>(initialDraft);
  const [reports, setReports] = useState(initialReports);
  const authorName =
    authStatus === "authenticated"
      ? (user?.name ?? user?.nickname ?? user?.email ?? "이름 정보 없음")
      : authStatus === "loading"
        ? "사용자 확인 중"
        : "로그인 필요";
  const createMutation = useMutation({
    mutationFn: () =>
      createAbsenceReport(
        { recordId },
        {
          reason: draft.reason.trim(),
          opinion: draft.opinion.trim() || undefined,
        },
      ),
    onSuccess: async (createdReport) => {
      setReports((currentReports) => [createdReport, ...currentReports]);
      setDraft(initialDraft);
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetingRecords.detail(recordId) });
    },
  });
  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingReportId) {
        throw new Error("수정할 불참 사유서가 없습니다.");
      }

      return updateAbsenceReport(
        { recordId, absenceReportId: editingReportId },
        {
          reason: editDraft.reason.trim(),
          opinion: editDraft.opinion.trim() || undefined,
        },
      );
    },
    onSuccess: async (updatedReport) => {
      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === updatedReport.id ? { ...report, ...updatedReport } : report,
        ),
      );
      setEditingReportId(null);
      setEditDraft(initialDraft);
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetingRecords.detail(recordId) });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (absenceReportId: number) => deleteAbsenceReport({ recordId, absenceReportId }),
    onSuccess: async (_, deletedReportId) => {
      setReports((currentReports) =>
        currentReports.filter((report) => report.id !== deletedReportId),
      );
      if (editingReportId === deletedReportId) {
        setEditingReportId(null);
        setEditDraft(initialDraft);
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.meetingRecords.detail(recordId) });
    },
  });
  const canSubmit =
    draft.reason.trim().length > 0 && authStatus === "authenticated" && !createMutation.isPending;
  const canUpdate =
    editDraft.reason.trim().length > 0 &&
    authStatus === "authenticated" &&
    !updateMutation.isPending;

  const updateDraft = (key: keyof DraftAbsenceReport, value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    createMutation.mutate();
  };

  const updateEditDraft = (key: keyof DraftAbsenceReport, value: string) => {
    setEditDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  };

  const startEditing = (report: MeetingAbsenceReportResponseDto) => {
    if (!report.id) return;

    setEditingReportId(report.id);
    setEditDraft({
      reason: report.reason ?? "",
      opinion: report.opinion ?? "",
    });
  };

  const handleUpdateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canUpdate) return;

    updateMutation.mutate();
  };

  return (
    <>
      <AbsenceHeader>
        <AbsenceTitle>불참 사유서</AbsenceTitle>
        <ActionButton type="submit" form="absence-report-form" disabled={!canSubmit}>
          작성 완료
        </ActionButton>
      </AbsenceHeader>

      <AbsenceStack as="form" id="absence-report-form" onSubmit={handleSubmit}>
        <AbsenceBox as="label" $tone="draft" $height="short">
          <AbsenceInput name="author" value={authorName} readOnly />
        </AbsenceBox>
        <AbsenceBox as="label" $tone="draft" $height="large">
          <AbsenceTextarea
            name="reason"
            value={draft.reason}
            onChange={(event) => updateDraft("reason", event.target.value)}
            placeholder="불참사유"
          />
        </AbsenceBox>
        <AbsenceBox as="label" $tone="draft" $height="medium">
          <AbsenceTextarea
            name="opinion"
            value={draft.opinion}
            onChange={(event) => updateDraft("opinion", event.target.value)}
            placeholder="의견"
          />
        </AbsenceBox>
      </AbsenceStack>

      {updateMutation.isError ? (
        <StateMessage role="alert">불참 사유서 수정에 실패했습니다.</StateMessage>
      ) : null}
      {deleteMutation.isError ? (
        <StateMessage role="alert">불참 사유서 삭제에 실패했습니다.</StateMessage>
      ) : null}

      {reports.map((report, index) => {
        const reportId = report.id;
        const isEditing = Boolean(reportId && editingReportId === reportId);
        const canEdit =
          meetingStatus === "BEFORE_MEETING" &&
          typeof user?.id === "number" &&
          typeof report.authorId === "number" &&
          user.id === report.authorId;

        return (
          <AbsenceStack
            as={isEditing ? "form" : undefined}
            id={isEditing ? `absence-report-edit-form-${reportId}` : undefined}
            key={report.id ?? index}
            onSubmit={isEditing ? handleUpdateSubmit : undefined}
          >
            <Divider />
            <AbsenceReportTopBar>
              <span>{formatUtcToKstShortDate(report.createdAt)}</span>
              {canEdit ? (
                <>
                  <UnderlineTextButton
                    type={isEditing ? "submit" : "button"}
                    disabled={isEditing ? !canUpdate : updateMutation.isPending}
                    onClick={isEditing ? undefined : () => startEditing(report)}
                  >
                    {isEditing ? "수정 완료" : "수정"}
                  </UnderlineTextButton>
                  {reportId ? (
                    <UnderlineTextButton
                      type="button"
                      $tone="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(reportId)}
                    >
                      삭제
                    </UnderlineTextButton>
                  ) : null}
                </>
              ) : null}
            </AbsenceReportTopBar>
            <AbsenceBox $height="short">
              <AbsenceBoxLabel>작성자</AbsenceBoxLabel>
              <span>{report.author ?? "-"}</span>
            </AbsenceBox>
            <AbsenceBox $height="large">
              <AbsenceBoxLabel>불참사유</AbsenceBoxLabel>
              {isEditing ? (
                <AbsenceTextarea
                  name="reason"
                  value={editDraft.reason}
                  onChange={(event) => updateEditDraft("reason", event.target.value)}
                  placeholder="불참사유"
                />
              ) : (
                <span>{report.reason}</span>
              )}
            </AbsenceBox>
            <AbsenceBox $height="medium">
              <AbsenceBoxLabel>의견</AbsenceBoxLabel>
              {isEditing ? (
                <AbsenceTextarea
                  name="opinion"
                  value={editDraft.opinion}
                  onChange={(event) => updateEditDraft("opinion", event.target.value)}
                  placeholder="의견"
                />
              ) : (
                <span>{report.opinion}</span>
              )}
            </AbsenceBox>
          </AbsenceStack>
        );
      })}
    </>
  );
}
