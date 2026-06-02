"use client";

import type { ChangeEvent, FormEvent } from "react";
import type { MeetingRecordStatus } from "@/api/meetingRecord/meetingRecord.dto";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import {
  EditorBox,
  Form,
  Input,
  Label,
  TabButton,
  TabRow,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";

export type MeetingRecordFormValues = {
  status: MeetingRecordStatus;
  title: string;
  agenda: string;
  discussion: string;
  suggestion: string;
};

type MeetingRecordFormFieldsProps = {
  authorName: string;
  values: MeetingRecordFormValues;
  isBeforeMeetingDisabled?: boolean;
  onChange: (patch: Partial<MeetingRecordFormValues>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function MeetingRecordFormFields({
  authorName,
  values,
  isBeforeMeetingDisabled = false,
  onChange,
  onSubmit,
}: MeetingRecordFormFieldsProps) {
  const isBeforeMeeting = values.status === "BEFORE_MEETING";

  function updateField(
    key: keyof MeetingRecordFormValues,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onChange({ [key]: event.target.value });
  }

  return (
    <Form id="meeting-record-form" onSubmit={onSubmit}>
      <TabRow role="tablist" aria-label="회의록 작성 구분">
        <TabButton
          type="button"
          role="tab"
          aria-selected={isBeforeMeeting}
          disabled={isBeforeMeetingDisabled}
          $active={isBeforeMeeting}
          onClick={() => {
            if (isBeforeMeetingDisabled) return;
            onChange({ status: "BEFORE_MEETING" });
          }}
        >
          회의 전
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={!isBeforeMeeting}
          $active={!isBeforeMeeting}
          onClick={() => onChange({ status: "AFTER_MEETING" })}
        >
          회의 후
        </TabButton>
      </TabRow>
      <input type="hidden" name="meetingPhase" value={values.status} />

      <Label as="label" htmlFor="meeting-title">
        제목
      </Label>
      <Input
        id="meeting-title"
        name="title"
        placeholder="제목"
        value={values.title}
        onChange={(event) => updateField("title", event)}
      />

      <Label as="label" htmlFor="meeting-author">
        작성자
      </Label>
      <Input id="meeting-author" name="author" value={authorName} readOnly />

      <Label as="label" htmlFor="meeting-agenda">
        안건
      </Label>
      <EditorBox id="meeting-agenda">
        <ToastEditorField initialValue={values.agenda} onChange={(agenda) => onChange({ agenda })} />
      </EditorBox>

      {!isBeforeMeeting ? (
        <>
          <Label as="label" htmlFor="meeting-discussion">
            논의 사항
          </Label>
          <EditorBox id="meeting-discussion">
            <ToastEditorField
              initialValue={values.discussion}
              onChange={(discussion) => onChange({ discussion })}
            />
          </EditorBox>

          <Label as="label" htmlFor="meeting-suggestion">
            결정 사항
          </Label>
          <EditorBox id="meeting-suggestion">
            <ToastEditorField
              initialValue={values.suggestion}
              onChange={(suggestion) => onChange({ suggestion })}
            />
          </EditorBox>
        </>
      ) : null}
    </Form>
  );
}
