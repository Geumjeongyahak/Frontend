"use client";

import { useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createPost } from "@/api/post/post.api";
import BoardDropdown from "@/components/board/BoardDropdown";
import {
  BOARD_WRITE_TYPE_OPTIONS,
  type BoardWriteType,
  getBoardChannelId,
  getBoardWriteScopeOptions,
} from "@/components/board/boardOptions";
import BoardShell from "@/components/board/BoardShell";
import {
  ActionButton,
  BoardSelectRow,
  DocumentSection,
  FileSelectLabel,
  FileUploadPanel,
  Form,
  HiddenFileInput,
  Input,
  Label,
  PageTitle,
  StateMessage,
  Textarea,
  Toolbar,
} from "@/components/board/BoardDocument.styles";

type OpenDropdown = "type" | "scope" | null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toContentHtml(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export default function BoardCreatePageClient() {
  const router = useRouter();
  const [boardType, setBoardType] = useState<BoardWriteType>("CLASSROOM");
  const [boardScope, setBoardScope] = useState("cherry-blossom");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("홍길동");
  const [content, setContent] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);

  const scopeOptions = getBoardWriteScopeOptions(boardType);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () =>
      createPost(
        { channelId: getBoardChannelId(boardType, boardScope) },
        {
          title: title.trim(),
          contentHtml: toContentHtml(content.trim()),
          postType: "GENERAL",
          status: "PUBLISHED",
          allowComment: true,
        },
      ),
    onSuccess: () => {
      router.push("/board");
    },
  });

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isPending;

  return (
    <BoardShell>
      <DocumentSection>
        <Toolbar>
          <PageTitle>글쓰기</PageTitle>
          <ActionButton type="submit" form="board-create-form" disabled={!canSubmit}>
            작성 완료
          </ActionButton>
        </Toolbar>

        <Form
          id="board-create-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) mutate();
          }}
        >
          <BoardSelectRow aria-label="게시판 선택">
            <BoardDropdown
              label="게시판 유형"
              options={BOARD_WRITE_TYPE_OPTIONS}
              value={boardType}
              isOpen={openDropdown === "type"}
              onToggle={() => setOpenDropdown((current) => (current === "type" ? null : "type"))}
              onSelect={(nextValue) => {
                setBoardType(nextValue);
                setBoardScope(getBoardWriteScopeOptions(nextValue)[0].value);
                setOpenDropdown(null);
              }}
              width="wide"
            />
            <BoardDropdown
              label="게시판 선택"
              options={scopeOptions}
              value={boardScope}
              isOpen={openDropdown === "scope"}
              onToggle={() => setOpenDropdown((current) => (current === "scope" ? null : "scope"))}
              onSelect={(nextValue) => {
                setBoardScope(nextValue);
                setOpenDropdown(null);
              }}
              width="wide"
            />
          </BoardSelectRow>

          <Label as="label" htmlFor="board-title">
            제목
          </Label>
          <Input
            id="board-title"
            name="title"
            placeholder="제목"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Label as="label" htmlFor="board-author">
            작성자
          </Label>
          <Input
            id="board-author"
            name="author"
            placeholder="홍길동"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />

          <Label as="label" htmlFor="board-content">
            내용
          </Label>
          <Textarea
            id="board-content"
            name="content"
            placeholder="내용"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <Label>자료</Label>
          <FileUploadPanel>
            {fileNames.length > 0 ? (
              fileNames.map((fileName) => <span key={fileName}>{fileName}</span>)
            ) : (
              <span>선택된 파일이 없습니다.</span>
            )}
            <FileSelectLabel>
              <IconPaperclip aria-hidden="true" size={16} stroke={2.25} />
              <span>파일 선택</span>
              <HiddenFileInput
                type="file"
                name="files"
                multiple
                onChange={(event) => {
                  setFileNames(Array.from(event.target.files ?? []).map((file) => file.name));
                }}
              />
            </FileSelectLabel>
          </FileUploadPanel>

          {isError ? <StateMessage>게시글 작성에 실패했습니다.</StateMessage> : null}
        </Form>
      </DocumentSection>
    </BoardShell>
  );
}
