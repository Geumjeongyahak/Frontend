"use client";

import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { deleteAttachment } from "@/api/file/file.api";
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
import { FileUploadProgressNotice } from "@/components/common/FileUploadProgress";
import {
  embedMeetingRecordAttachments,
  extractMeetingRecordAttachments,
  type MeetingRecordAttachment,
} from "@/components/staff/archive/meeting-records/meetingRecordAttachments";
import {
  ActionButton,
  DocumentSection,
  PageTitle,
  Toolbar,
  ToolbarRight,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { uploadMeetingRecordDocumentWithMetadata } from "@/lib/googleDrive";
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
  const parsedAgenda = extractMeetingRecordAttachments(record?.agenda);

  return {
    status: record?.status ?? "BEFORE_MEETING",
    title: record?.title ?? "",
    agenda: parsedAgenda.content,
    discussion: record?.discussion ?? "",
    suggestion: record?.suggestion ?? "",
  };
}

function createInitialAttachments(record?: MeetingRecordDetailResponseDto): MeetingRecordAttachment[] {
  const parsedAgenda = extractMeetingRecordAttachments(record?.agenda);
  return record?.attachments?.length ? (record.attachments as MeetingRecordAttachment[]) : parsedAgenda.attachments;
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
  const [attachments, setAttachments] = useState(() => createInitialAttachments(initialRecord));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const shouldShowUploadToastRef = useRef(false);
  const isBeforeMeetingDisabled = mode === "edit" && initialRecord?.status === "AFTER_MEETING";
  const authorName =
    authStatus === "authenticated"
      ? getAuthorName(user) || "이름 정보 없음"
      : authStatus === "loading"
        ? "사용자 확인 중"
        : "로그인 필요";

  const saveMutation = useMutation({
    mutationFn: async () => {
      const hasFileUpload = selectedFiles.length > 0;
      shouldShowUploadToastRef.current = hasFileUpload;
      const uploadedAttachments =
        hasFileUpload
          ? await Promise.all(selectedFiles.map((file) => uploadMeetingRecordDocumentWithMetadata(file)))
          : [];
      const nextAttachments = [
        ...attachments,
        ...uploadedAttachments.map((file) => ({
          fileId: file.fileId,
          originalName: file.originalName,
          downloadUrl: file.downloadUrl,
          viewUrl: file.viewUrl,
        })),
      ];
      const agendaWithAttachments = embedMeetingRecordAttachments(values.agenda.trim(), nextAttachments);

      if (mode === "edit" && initialRecord?.id) {
        return updateMeetingRecord(
          { recordId: initialRecord.id },
          {
            title: values.title.trim(),
            agenda: agendaWithAttachments,
            discussion: values.discussion.trim(),
            suggestion: values.suggestion.trim(),
            status: values.status,
          },
        );
      }

      const created = await createMeetingRecord({
        title: values.title.trim(),
        agenda: agendaWithAttachments,
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
      if (shouldShowUploadToastRef.current) {
        toast.success("파일 업로드가 완료되었습니다.");
      }

      const savedRecordId = savedRecord.id ?? initialRecord?.id;
      const parsedAgenda = extractMeetingRecordAttachments(savedRecord.agenda);
      const normalizedRecord = {
        ...savedRecord,
        agenda: parsedAgenda.content,
        attachments: parsedAgenda.attachments,
      };

      setAttachments(parsedAgenda.attachments);
      setSelectedFiles([]);

      if (mode === "create") {
        queryClient.setQueriesData<MeetingRecordListResponseDto>(
          { queryKey: ["meeting-records", "list"] },
          (current) => addRecordToFirstPageCache(current, normalizedRecord),
        );
      }

      if (mode === "edit" && savedRecordId) {
        queryClient.setQueryData<MeetingRecordDetailResponseDto>(
          queryKeys.meetingRecords.detail(savedRecordId),
          (current) => ({ ...current, ...normalizedRecord }),
        );
        await queryClient.invalidateQueries({ queryKey: ["meeting-records"] });
        onSaved?.(savedRecordId);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["meeting-records"] });
      if (savedRecord.id) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.meetingRecords.detail(savedRecord.id),
        });
      }

      if (savedRecordId) {
        onSaved?.(savedRecordId);
        router.push(`/staff/archive/meeting-records/${savedRecordId}`);
        return;
      }

      router.push("/staff/archive/meeting-records");
    },
    onError: () => {
      shouldShowUploadToastRef.current = false;
    },
  });

  const canSubmit =
    values.title.trim().length > 0 &&
    values.agenda.trim().length > 0 &&
    authStatus === "authenticated" &&
    !saveMutation.isPending;

  async function handleRemoveExistingAttachment(fileId: string) {
    await deleteAttachment({ fileId });
    setAttachments((current) => current.filter((file) => file.fileId !== fileId));
  }

  function handleRemoveSelectedFile(file: File) {
    setSelectedFiles((current) =>
      current.filter((item) => !(item.name === file.name && item.lastModified === file.lastModified)),
    );
  }

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
          {saveMutation.isPending && selectedFiles.length > 0 ? <FileUploadProgressNotice /> : null}
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
        attachments={attachments}
        selectedFiles={selectedFiles}
        onRemoveExisting={handleRemoveExistingAttachment}
        onRemoveSelected={handleRemoveSelectedFile}
        isBeforeMeetingDisabled={isBeforeMeetingDisabled}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
        onFilesChange={(files) => setSelectedFiles((current) => [...current, ...files])}
        onSubmit={handleSubmit}
      />
    </DocumentSection>
  );
}
