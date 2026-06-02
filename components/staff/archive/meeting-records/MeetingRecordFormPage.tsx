"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createMeetingRecord,
  updateMeetingRecord,
} from "@/api/meetingRecord/meetingRecord.api";
import type {
  MeetingRecordDetailResponseDto,
  MeetingRecordListResponseDto,
} from "@/api/meetingRecord/meetingRecord.dto";
import MeetingRecordFormFields, {
  type MeetingRecordFormValues,
} from "@/components/staff/archive/meeting-records/MeetingRecordFormFields";
import {
  ActionButton,
  DocumentSection,
  PageTitle,
  Toolbar,
  ToolbarRight,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { queryKeys } from "@/lib/queryKeys";

type MeetingRecordFormPageProps = {
  mode?: "create" | "edit";
  initialRecord?: MeetingRecordDetailResponseDto;
  onCancel?: () => void;
  onSaved?: (recordId: number) => void;
};

function getAuthorName(user: ReturnType<typeof useAuthSession>["user"]) {
  return user?.name ?? user?.nickname ?? user?.email ?? "";
}

function createInitialValues(record?: MeetingRecordDetailResponseDto): MeetingRecordFormValues {
  return {
    status: record?.status ?? "BEFORE_MEETING",
    title: record?.title ?? "",
    agenda: record?.agenda ?? "",
    discussion: record?.discussion ?? "",
    suggestion: record?.suggestion ?? "",
  };
}

function addRecordToFirstPageCache(
  current: MeetingRecordListResponseDto | undefined,
  savedRecord: MeetingRecordDetailResponseDto,
): MeetingRecordListResponseDto | undefined {
  if (!current || !savedRecord.id || current.page !== 0) return current;

  const content = current.content ?? [];
  if (content.some((record) => record.id === savedRecord.id)) return current;

  const nextContent = [
    {
      id: savedRecord.id,
      title: savedRecord.title,
      authorId: savedRecord.authorId,
      author: savedRecord.author,
      createdAt: savedRecord.createdAt,
      status: savedRecord.status,
      viewCount: savedRecord.viewCount,
    },
    ...content,
  ].slice(0, current.size ?? content.length + 1);
  const nextTotalElements = (current.totalElements ?? content.length) + 1;
  const pageSize = current.size ?? nextContent.length;

  return {
    ...current,
    content: nextContent,
    totalElements: nextTotalElements,
    totalPages: pageSize > 0 ? Math.max(1, Math.ceil(nextTotalElements / pageSize)) : 1,
  };
}

export default function MeetingRecordFormPage({
  mode = "create",
  initialRecord,
  onCancel,
  onSaved,
}: MeetingRecordFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuthSession();
  const [values, setValues] = useState(() => createInitialValues(initialRecord));
  const isBeforeMeetingDisabled = mode === "edit" && initialRecord?.status === "AFTER_MEETING";
  const authorName =
    authStatus === "authenticated"
      ? getAuthorName(user) || "이름 정보 없음"
      : authStatus === "loading"
        ? "사용자 확인 중"
        : "로그인 필요";

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (mode === "edit" && initialRecord?.id) {
        return updateMeetingRecord(
          { recordId: initialRecord.id },
          {
            title: values.title.trim(),
            agenda: values.agenda.trim(),
            discussion: values.discussion.trim(),
            suggestion: values.suggestion.trim(),
            status: values.status,
          },
        );
      }

      const created = await createMeetingRecord({
        title: values.title.trim(),
        agenda: values.agenda.trim(),
      });

      if (values.status === "AFTER_MEETING" && created.id) {
        return updateMeetingRecord(
          { recordId: created.id },
          {
            discussion: values.discussion.trim(),
            suggestion: values.suggestion.trim(),
            status: "AFTER_MEETING",
          },
        );
      }

      return created;
    },
    onSuccess: async (savedRecord) => {
      if (mode === "create") {
        queryClient.setQueriesData<MeetingRecordListResponseDto>(
          { queryKey: ["meeting-records", "list"] },
          (current) => addRecordToFirstPageCache(current, savedRecord),
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["meeting-records"] });
      if (savedRecord.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.meetingRecords.detail(savedRecord.id),
        });
      }

      const savedRecordId = savedRecord.id ?? initialRecord?.id;
      if (savedRecordId) {
        onSaved?.(savedRecordId);
        router.push(`/staff/archive/meeting-records/${savedRecordId}`);
        return;
      }

      router.push("/staff/archive/meeting-records");
    },
  });

  const canSubmit =
    values.title.trim().length > 0 &&
    values.agenda.trim().length > 0 &&
    authStatus === "authenticated" &&
    !saveMutation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    saveMutation.mutate();
  }

  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>{mode === "edit" ? "교학 회의록 수정하기" : "교학 회의록 작성하기"}</PageTitle>
        <ToolbarRight>
          <ActionButton type="submit" form="meeting-record-form" disabled={!canSubmit}>
            {saveMutation.isPending ? "저장 중" : mode === "edit" ? "수정 완료" : "작성 완료"}
          </ActionButton>
          {onCancel ? (
            <ActionButton type="button" $variant="muted" onClick={onCancel}>
              취소
            </ActionButton>
          ) : null}
        </ToolbarRight>
      </Toolbar>

      <MeetingRecordFormFields
        authorName={authorName}
        values={values}
        isBeforeMeetingDisabled={isBeforeMeetingDisabled}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
        onSubmit={handleSubmit}
      />
    </DocumentSection>
  );
}
