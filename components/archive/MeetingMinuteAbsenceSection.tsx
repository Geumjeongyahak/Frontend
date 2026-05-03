"use client";

import { useState, type FormEvent } from "react";
import type { AbsenceReport } from "@/mocks/archiveMeeting";
import {
  AbsenceBox,
  AbsenceBoxLabel,
  AbsenceHeader,
  AbsenceInput,
  AbsenceStack,
  AbsenceTextarea,
  AbsenceTitle,
  ActionButton,
  Divider,
} from "@/components/archive/MeetingMinuteDocument.styles";

type DraftAbsenceReport = {
  author: string;
  reason: string;
  opinion: string;
};

type MeetingMinuteAbsenceSectionProps = {
  initialReports: AbsenceReport[];
};

const initialDraft: DraftAbsenceReport = {
  author: "",
  reason: "",
  opinion: "",
};

export default function MeetingMinuteAbsenceSection({
  initialReports,
}: MeetingMinuteAbsenceSectionProps) {
  const [draft, setDraft] = useState<DraftAbsenceReport>(initialDraft);
  const [reports, setReports] = useState(initialReports);
  const canSubmit = Object.values(draft).some((value) => value.trim().length > 0);

  const updateDraft = (key: keyof DraftAbsenceReport, value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    setReports((currentReports) => [
      {
        id: Date.now(),
        author: draft.author.trim() || "작성자",
        reason: draft.reason.trim() || "불참 사유",
        opinion: draft.opinion.trim() || "의견",
      },
      ...currentReports,
    ]);
    setDraft(initialDraft);
  };

  return (
    <>
      <AbsenceHeader>
        <AbsenceTitle>불참 사유서</AbsenceTitle>
        <ActionButton
          type="submit"
          form="absence-report-form"
          disabled={!canSubmit}
        >
          작성 완료
        </ActionButton>
      </AbsenceHeader>

      <AbsenceStack as="form" id="absence-report-form" onSubmit={handleSubmit}>
        <AbsenceBox as="label" $tone="draft" $height="short">
          <AbsenceInput
            name="author"
            value={draft.author}
            onChange={(event) => updateDraft("author", event.target.value)}
            placeholder="작성자"
          />
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

      {reports.map((report) => (
        <AbsenceStack key={report.id}>
          <Divider />
          <AbsenceBox $height="short">
            <AbsenceBoxLabel>작성자</AbsenceBoxLabel>
            <span>{report.author}</span>
          </AbsenceBox>
          <AbsenceBox $height="large">
            <AbsenceBoxLabel>불참사유</AbsenceBoxLabel>
            <span>{report.reason}</span>
          </AbsenceBox>
          <AbsenceBox $height="medium">
            <AbsenceBoxLabel>의견</AbsenceBoxLabel>
            <span>{report.opinion}</span>
          </AbsenceBox>
        </AbsenceStack>
      ))}
    </>
  );
}
