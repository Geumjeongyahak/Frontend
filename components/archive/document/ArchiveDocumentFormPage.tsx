import { IconPaperclip } from "@tabler/icons-react";
import {
  ActionButton,
  DocumentSection,
  Form,
  Input,
  Label,
  PageTitle,
  Textarea,
  Toolbar,
} from "@/components/archive/meeting/MeetingMinuteDocument.styles";
import {
  FileLink,
  FileSelectLabel,
  FileUploadPanel,
  HiddenFileInput,
} from "@/components/archive/document/ArchiveDocumentPages.styles";
import type { ArchiveDocumentConfig } from "@/mocks/archiveDocuments";

type ArchiveDocumentFormPageProps = {
  config: ArchiveDocumentConfig;
};

export default function ArchiveDocumentFormPage({ config }: ArchiveDocumentFormPageProps) {
  return (
    <DocumentSection>
      <Toolbar>
        <PageTitle>{config.writeTitle}</PageTitle>
        <ActionButton type="submit" form={`${config.category}-form`}>
          작성 완료
        </ActionButton>
      </Toolbar>

      <Form id={`${config.category}-form`}>
        <Label as="label" htmlFor={`${config.category}-title`}>
          제목
        </Label>
        <Input id={`${config.category}-title`} name="title" placeholder="제목" />

        <Label as="label" htmlFor={`${config.category}-author`}>
          작성자
        </Label>
        <Input id={`${config.category}-author`} name="author" placeholder="홍길동" />

        <Label as="label" htmlFor={`${config.category}-description`}>
          설명
        </Label>
        <Textarea id={`${config.category}-description`} name="description" placeholder="설명" />

        <Label>자료</Label>
        <FileUploadPanel>
          <FileLink href="#">{config.fileBaseName}.pdf</FileLink>
          <FileLink href="#">{config.fileBaseName}.png</FileLink>
          <FileSelectLabel>
            <IconPaperclip aria-hidden="true" size={16} stroke={2.25} />
            <span>파일 선택</span>
            <HiddenFileInput type="file" name="files" multiple />
          </FileSelectLabel>
        </FileUploadPanel>
      </Form>
    </DocumentSection>
  );
}
