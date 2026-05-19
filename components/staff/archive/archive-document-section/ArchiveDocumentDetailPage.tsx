import { IconDownload } from "@tabler/icons-react";
import {
  ActionButton,
  ActionLink,
  ContentStack,
  DateBar,
  DocumentSection,
  FieldBox,
  Label,
  TextBox,
  Toolbar,
  ToolbarRight,
} from "@/components/staff/archive/meeting-records/MeetingRecordDocument.styles";
import {
  DownloadBadge,
  FileLink,
  FileList,
} from "@/components/staff/archive/archive-document-section/ArchiveDocumentPages.styles";
import type { ArchiveDocument, ArchiveDocumentConfig } from "@/mocks/archiveDocuments";

type ArchiveDocumentDetailPageProps = {
  config: ArchiveDocumentConfig;
  document: ArchiveDocument;
};

export default function ArchiveDocumentDetailPage({
  config,
  document,
}: ArchiveDocumentDetailPageProps) {
  return (
    <DocumentSection>
      <Toolbar>
        <ActionLink href={config.listPath} $variant="muted">
          목록
        </ActionLink>

        <ToolbarRight>
          <ActionButton type="button" $variant="danger">
            삭제
          </ActionButton>
          <ActionButton type="button">수정</ActionButton>
        </ToolbarRight>
      </Toolbar>

      <ContentStack>
        <DateBar>{document.date}</DateBar>

        <Label>제목</Label>
        <FieldBox>{document.title}</FieldBox>

        <Label>작성자</Label>
        <FieldBox>{document.author}</FieldBox>

        <Label>설명</Label>
        <TextBox>{document.description}</TextBox>

        <Label>자료</Label>
        <FileList>
          {document.files.map((file) => (
            <FileLink key={file} href="#" aria-label={`${file} 다운로드`}>
              <span>{file}</span>
              <DownloadBadge aria-hidden="true">
                <IconDownload size={16} stroke={2.25} />
              </DownloadBadge>
            </FileLink>
          ))}
        </FileList>
      </ContentStack>
    </DocumentSection>
  );
}
