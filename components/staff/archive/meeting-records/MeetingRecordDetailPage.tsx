"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  deleteMeetingRecord,
  getMeetingRecord,
} from "@/api/meetingRecord/meetingRecord.api";
import ToastViewerField from "@/components/admin/posts/ToastViewerField";
import MeetingRecordAbsenceSection from "@/components/staff/archive/meeting-records/MeetingRecordAbsenceSection";
import MeetingRecordFormPage from "@/components/staff/archive/meeting-records/MeetingRecordFormPage";
import {
  ActionButton,
  ActionLink,
  ContentStack,
  DateBar,
  Divider,
  DocumentSection,
  FieldBox,
  Label,
  StateMessage,
  TextBox,
  Toolbar,
  ToolbarRight,
  ViewerBox,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";
import { queryKeys } from "@/lib/queryKeys";
import { formatUtcToKstShortDate } from "@/utils/formatUtcToKstShortDate";

type MeetingRecordDetailPageProps = {
  recordId: number;
};

export default function MeetingRecordDetailPage({ recordId }: MeetingRecordDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: meetingRecord,
    isError,
    isLoading,
  } = useQuery({
    queryKey: queryKeys.meetingRecords.detail(recordId),
    queryFn: () => getMeetingRecord({ recordId }),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMeetingRecord({ recordId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meeting-records"] });
      router.replace("/staff/archive/meeting-records");
    },
  });

  if (isEditing && meetingRecord) {
    return (
      <MeetingRecordFormPage
        mode="edit"
        initialRecord={meetingRecord}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <DocumentSection>
      <Toolbar>
        <ToolbarRight>
          <ActionButton
            type="button"
            $variant="danger"
            disabled={!meetingRecord || deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? "삭제 중" : "삭제"}
          </ActionButton>
          <ActionButton
            type="button"
            $variant="edit"
            disabled={!meetingRecord}
            onClick={() => setIsEditing(true)}
          >
            수정
          </ActionButton>
          <ActionLink href="/staff/archive/meeting-records" $variant="muted">
            목록
          </ActionLink>
        </ToolbarRight>
      </Toolbar>

      {isLoading ? <StateMessage>교학 회의록을 불러오는 중입니다.</StateMessage> : null}
      {isError ? (
        <StateMessage role="alert">교학 회의록을 불러오지 못했습니다.</StateMessage>
      ) : null}
      {deleteMutation.isError ? (
        <StateMessage role="alert">교학 회의록 삭제에 실패했습니다.</StateMessage>
      ) : null}

      {meetingRecord ? (
        <ContentStack>
          <DateBar>{formatUtcToKstShortDate(meetingRecord.createdAt)}</DateBar>

          <Label>제목</Label>
          <FieldBox>{meetingRecord.title ?? "-"}</FieldBox>

          <Label>작성자</Label>
          <FieldBox>{meetingRecord.author ?? "-"}</FieldBox>

          <Label>안건</Label>
          {meetingRecord.agenda?.trim() ? (
            <ViewerBox>
              <ToastViewerField value={meetingRecord.agenda} />
            </ViewerBox>
          ) : (
            <TextBox>-</TextBox>
          )}

          <Label>논의 사항</Label>
          {meetingRecord.discussion?.trim() ? (
            <ViewerBox>
              <ToastViewerField value={meetingRecord.discussion} />
            </ViewerBox>
          ) : (
            <TextBox>-</TextBox>
          )}

          <Label>결정 사항</Label>
          {meetingRecord.suggestion?.trim() ? (
            <ViewerBox>
              <ToastViewerField value={meetingRecord.suggestion} />
            </ViewerBox>
          ) : (
            <TextBox>-</TextBox>
          )}

          <Divider />
          <MeetingRecordAbsenceSection
            recordId={recordId}
            meetingStatus={meetingRecord.status}
            initialReports={meetingRecord.absenceReports ?? []}
          />
        </ContentStack>
      ) : null}
    </DocumentSection>
  );
}
