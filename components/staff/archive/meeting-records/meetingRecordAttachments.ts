export type MeetingRecordAttachment = {
  fileId: string;
  originalName: string;
  downloadUrl: string;
  viewUrl?: string;
};

const ATTACHMENTS_MARKER_REGEX =
  /<div data-meeting-attachments="([^"]+)" style="display:none"><\/div>/g;

function decodeAttachmentPayload(encoded: string): MeetingRecordAttachment[] {
  try {
    const decoded = decodeURIComponent(encoded);
    const parsed = JSON.parse(decoded) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is MeetingRecordAttachment => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<MeetingRecordAttachment>;

      return (
        typeof candidate.fileId === "string" &&
        typeof candidate.originalName === "string" &&
        typeof candidate.downloadUrl === "string"
      );
    });
  } catch {
    return [];
  }
}

export function extractMeetingRecordAttachments(html?: string) {
  if (!html) {
    return {
      content: "",
      attachments: [] as MeetingRecordAttachment[],
    };
  }

  const matches = [...html.matchAll(ATTACHMENTS_MARKER_REGEX)];
  const lastMatch = matches.at(-1);
  const attachments = lastMatch ? decodeAttachmentPayload(lastMatch[1]) : [];
  const content = html.replace(ATTACHMENTS_MARKER_REGEX, "").trim();

  return { content, attachments };
}

export function embedMeetingRecordAttachments(
  html: string,
  attachments: MeetingRecordAttachment[],
) {
  const content = html.replace(ATTACHMENTS_MARKER_REGEX, "").trim();

  if (attachments.length === 0) {
    return content;
  }

  const encoded = encodeURIComponent(JSON.stringify(attachments));
  return `${content}<div data-meeting-attachments="${encoded}" style="display:none"></div>`;
}
