"use client";

import { useState } from "react";
import { IconDownload, IconPaperclip, IconX } from "@tabler/icons-react";
import styled from "styled-components";
import { getAttachmentDownloadUrl } from "@/api/file/file.api";
import { colors, layout, radii, spacing, typography } from "@/styles/tokens";

export type AttachmentItem = {
  id: string;
  label: string;
  fileId?: string;
  href?: string;
};

type AttachmentEditorPanelProps = {
  existingAttachments: AttachmentItem[];
  selectedFiles: File[];
  onSelectFiles: (files: File[]) => void;
  onRemoveExisting?: (attachmentId: string) => void;
  onRemoveSelected?: (file: File) => void;
  selectLabel?: string;
  emptyText?: string;
  disabled?: boolean;
};

type AttachmentDownloadListProps = {
  attachments: AttachmentItem[];
  emptyText?: string;
};

export function AttachmentEditorPanel({
  existingAttachments,
  selectedFiles,
  onSelectFiles,
  onRemoveExisting,
  onRemoveSelected,
  selectLabel = "파일 선택",
  emptyText = "선택된 파일이 없습니다.",
  disabled = false,
}: AttachmentEditorPanelProps) {
  const hasFiles = existingAttachments.length > 0 || selectedFiles.length > 0;

  return (
    <Panel>
      {existingAttachments.map((attachment) => (
        <Row key={attachment.id}>
          <FileName>{attachment.label}</FileName>
          {onRemoveExisting ? (
            <RemoveButton
              type="button"
              onClick={() => onRemoveExisting(attachment.id)}
              disabled={disabled}
              aria-label={`${attachment.label} 삭제`}
            >
              <IconX aria-hidden="true" size={14} stroke={2.25} />
              <span>삭제</span>
            </RemoveButton>
          ) : null}
        </Row>
      ))}

      {selectedFiles.map((file) => (
        <Row key={`${file.name}-${file.lastModified}`}>
          <FileName>{file.name}</FileName>
          {onRemoveSelected ? (
            <RemoveButton
              type="button"
              onClick={() => onRemoveSelected(file)}
              disabled={disabled}
              aria-label={`${file.name} 선택 취소`}
            >
              <IconX aria-hidden="true" size={14} stroke={2.25} />
              <span>취소</span>
            </RemoveButton>
          ) : null}
        </Row>
      ))}

      {!hasFiles ? <EmptyText>{emptyText}</EmptyText> : null}

      <FileSelectLabel $disabled={disabled}>
        <IconPaperclip aria-hidden="true" size={16} stroke={2.25} />
        <span>{selectLabel}</span>
        <HiddenFileInput
          type="file"
          name="files"
          multiple
          disabled={disabled}
          onChange={(event) => {
            onSelectFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </FileSelectLabel>
    </Panel>
  );
}

export function AttachmentDownloadList({
  attachments,
  emptyText = "첨부된 자료가 없습니다.",
}: AttachmentDownloadListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (attachments.length === 0) {
    return <EmptyListText>{emptyText}</EmptyListText>;
  }

  async function handleDownload(attachment: AttachmentItem) {
    const resolvedHref = attachment.href?.trim();

    if (!attachment.fileId) {
      if (!resolvedHref || resolvedHref === "#") {
        return;
      }
    }

    try {
      setDownloadingId(attachment.id);
      const finalHref = attachment.fileId
        ? (await getAttachmentDownloadUrl({ fileId: attachment.fileId })).downloadUrl?.trim() ||
          resolvedHref
        : resolvedHref;

      if (!finalHref || finalHref === "#") {
        return;
      }
      const link = document.createElement("a");
      link.href = finalHref;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingId((current) => (current === attachment.id ? null : current));
    }
  }

  return (
    <List>
      {attachments.map((attachment) => (
        <FileLink
          key={attachment.id}
          href="#"
          onClick={(event) => {
            event.preventDefault();
            void handleDownload(attachment);
          }}
          aria-label={`${attachment.label} 다운로드`}
          aria-disabled={downloadingId === attachment.id}
        >
          <span>{attachment.label}</span>
          <DownloadBadge aria-hidden="true">
            <IconDownload size={16} stroke={2.25} />
          </DownloadBadge>
        </FileLink>
      ))}
    </List>
  );
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space20};
  width: 100%;
  min-height: 6.875rem;
  border: 1px solid ${colors.muted};
  background-color: ${colors.white};
  padding: ${spacing.space20};

  @media (min-width: 120rem) {
    min-height: 9.6875rem;
    gap: 1.875rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.space12};
  width: 100%;

  @media (max-width: ${layout.breakpointMobile}) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const FileName = styled.span`
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: underline;
  text-underline-position: from-font;
  word-break: break-all;

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const EmptyText = styled.span`
  color: ${colors.placeholder};
  font-size: ${typography.fontSize14};
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;

const FileSelectLabel = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.space4};
  min-height: 1.9375rem;
  border: 1px solid ${colors.point};
  border-radius: ${radii.radius15};
  background-color: ${colors.pointSoft};
  padding: 0.5rem 0.625rem;
  color: ${colors.point};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? colors.pointSoft : "#e5f5db")};
  }

  @media (min-width: 120rem) {
    min-height: 2.75rem;
    padding: 0.625rem 0.9375rem;
    font-size: ${typography.fontSize20};

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  @media (max-width: ${layout.breakpointMobile}) {
    width: 100%;
  }
`;

const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space4};
  border: 0;
  background: transparent;
  padding: 0;
  color: ${colors.notice};
  font-size: ${typography.fontSize13};
  font-weight: 600;
  line-height: ${typography.lineHeight130};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize18};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${spacing.space16};
`;

const FileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.space12};
  border: 0;
  background: transparent;
  color: ${colors.text};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};
  text-decoration: none;

  @media (min-width: 120rem) {
    gap: ${spacing.space20};
    font-size: ${typography.fontSize20};
  }
`;

const DownloadBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: ${colors.point};
  color: ${colors.white};

  @media (min-width: 120rem) {
    width: 2.25rem;
    height: 2.25rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const EmptyListText = styled.span`
  color: ${colors.placeholder};
  font-size: ${typography.fontSize14};
  font-weight: 500;
  line-height: ${typography.lineHeight130};

  @media (min-width: 120rem) {
    font-size: ${typography.fontSize20};
  }
`;
