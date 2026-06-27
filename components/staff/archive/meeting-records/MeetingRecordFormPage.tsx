"use client";

import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  attachMeetingRecordFile,
  createMeetingRecord,
  deleteMeetingRecordAttachment,
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
  if (record?.attachments?.length) {
    return record.attachments
      .filter(
        (att): att is typeof att & { fileId: string; originalName: string } =>
          typeof att.fileId === "string" && typeof att.originalName === "string",
      )
      .map((att) => ({
        fileId: att.fileId,
        originalName: att.originalName,
        downloadUrl: att.downloadUrl ?? "",
        viewUrl: att.viewUrl,
      }));
  }
  return extractMeetingRecordAttachments(record?.agenda).attachments;
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
  const uploadErrorsRef = useRef(0);
  const isBeforeMeetingDisabled = mode === "edit" && initialRecord?.status === "AFTER_MEETING";
  const authorName =
    authStatus === "authenticated"
      ? getAuthorName(user) || "이름 정보 없음"
      : authStatus === "loading"
        ? "사용자 확인 중"
        : "로그인 필요";

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Phase 1: 레코드 저장 (agenda에 첨부파일 임베딩 없음)
      let savedRecord: MeetingRecordDetailResponseDto;

      if (mode === "edit" && initialRecord?.id) {
        savedRecord = await updateMeetingRecord(
          { recordId: initialRecord.id },
          {
            title: values.title.trim(),
            agenda: values.agenda.trim(),
            discussion: values.discussion.trim(),
            suggestion: values.suggestion.trim(),
            status: values.status,
          },
        );
      } else {
        const created = await createMeetingRecord({
          title: values.title.trim(),
          agenda: values.agenda.trim(),
        });

        if (values.status === "AFTER_MEETING" && created.id) {
          savedRecord = await updateMeetingRecord(
            { recordId: created.id },
            {
              discussion: values.discussion.trim(),
              suggestion: values.suggestion.trim(),
              status: "AFTER_MEETING",
            },
          );
        } else {
          savedRecord = created;
        }
      }

      // Phase 2: 새 파일 업로드 (레코드 저장 후 recordId 확보된 상태)
      if (selectedFiles.length > 0 && savedRecord.id) {
        shouldShowUploadToastRef.current = true;
        const recordId = savedRecord.id;
        const results = await Promise.allSettled(
          selectedFiles.map((file) => attachMeetingRecordFile({ recordId }, file, file.name)),
        );
        uploadErrorsRef.current = results.filter((r) => r.status === "rejected").length;
      }

      return savedRecord;
    },
    onSuccess: async (savedRecord) => {
      const failedCount = uploadErrorsRef.current;
      uploadErrorsRef.current = 0;

      if (shouldShowUploadToastRef.current) {
        if (failedCount > 0) {
          toast.error(`파일 ${failedCount}개 업로드에 실패했습니다. 레코드는 저장되었습니다.`);
        } else {
          toast.success("파일 업로드가 완료되었습니다.");
        }
      }
      shouldShowUploadToastRef.current = false;

      const savedRecordId = savedRecord.id ?? initialRecord?.id;

      setSelectedFiles([]);

      if (mode === "create") {
        queryClient.setQueriesData<MeetingRecordListResponseDto>(
          { queryKey: ["meeting-records", "list"] },
          (current) => addRecordToFirstPageCache(current, savedRecord),
        );
      }

      if (mode === "edit" && savedRecordId) {
        queryClient.setQueryData<MeetingRecordDetailResponseDto>(
          queryKeys.meetingRecords.detail(savedRecordId),
          (current) => ({ ...current, ...savedRecord }),
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
      uploadErrorsRef.current = 0;
    },
  });

  const canSubmit =
    values.title.trim().length > 0 &&
    values.agenda.trim().length > 0 &&
    authStatus === "authenticated" &&
    !saveMutation.isPending;

  async function handleRemoveExistingAttachment(fileId: string) {
    const recordId = initialRecord?.id;
    if (!recordId) return;
    await deleteMeetingRecordAttachment({ recordId, fileId });
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
