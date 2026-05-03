"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Label,
  TabButton,
  TabRow,
  Textarea,
} from "@/components/archive/MeetingMinuteDocument.styles";

type MeetingPhase = "before" | "after";

export default function MeetingMinuteFormFields() {
  const [meetingPhase, setMeetingPhase] = useState<MeetingPhase>("before");
  const isBeforeMeeting = meetingPhase === "before";

  return (
    <Form id="meeting-minute-form">
      <TabRow role="tablist" aria-label="회의록 작성 구분">
        <TabButton
          type="button"
          role="tab"
          aria-selected={isBeforeMeeting}
          $active={isBeforeMeeting}
          onClick={() => setMeetingPhase("before")}
        >
          회의 전
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={!isBeforeMeeting}
          $active={!isBeforeMeeting}
          onClick={() => setMeetingPhase("after")}
        >
          회의 후
        </TabButton>
      </TabRow>
      <input type="hidden" name="meetingPhase" value={meetingPhase} />

      <Label as="label" htmlFor="meeting-title">
        제목
      </Label>
      <Input id="meeting-title" name="title" placeholder="제목" />

      <Label as="label" htmlFor="meeting-author">
        작성자
      </Label>
      <Input id="meeting-author" name="author" placeholder="홍길동" />

      <Label as="label" htmlFor="meeting-agenda">
        안건
      </Label>
      <Textarea id="meeting-agenda" name="agenda" placeholder="안건" />

      {!isBeforeMeeting ? (
        <>
          <Label as="label" htmlFor="meeting-discussion">
            논의 사항
          </Label>
          <Textarea id="meeting-discussion" name="discussion" placeholder="논의 사항" />

          <Label as="label" htmlFor="meeting-suggestion">
            건의 사항
          </Label>
          <Textarea id="meeting-suggestion" name="suggestion" placeholder="건의 사항" />
        </>
      ) : null}
    </Form>
  );
}
