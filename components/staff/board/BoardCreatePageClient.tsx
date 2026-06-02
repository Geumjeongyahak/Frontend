"use client";

import { useMemo, useState } from "react";
import { IconPaperclip } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { getChannels } from "@/api/channel/channel.api";
import { getClassrooms } from "@/api/classroom/classroom.api";
import { getDepartments } from "@/api/department/department.api";
import { attachPostFile, createPost, getPost, pinPost, publishPost, updatePost } from "@/api/post/post.api";
import ToastEditorField from "@/components/admin/posts/ToastEditorField";
import BoardDropdown, { type DropdownOption } from "@/components/staff/board/BoardDropdown";
import {
  BOARD_WRITE_TYPE_OPTIONS,
  type BoardWriteType,
  getBoardWriteScopeOptions,
} from "@/components/staff/board/boardOptions";
import BoardShell from "@/components/staff/board/BoardShell";
import {
  ActionButton,
  ActionLink,
  BoardSelectRow,
  CheckboxInput,
  CheckboxLabel,
  DocumentSection,
  FileSelectLabel,
  FileUploadPanel,
  Form,
  HiddenFileInput,
  Input,
  Label,
  OptionRow,
  PageTitle,
  StateMessage,
  Toolbar,
} from "@/components/staff/board/BoardDocument.styles";
import { useAuthSession } from "@/hooks/useAuthSession";
import { uploadBoardDocument } from "@/lib/googleDrive/uploadBoardDocument";
import { queryKeys } from "@/lib/queryKeys";

type OpenDropdown = "type" | "scope" | null;

type BoardCreatePageClientProps = {
  editPostId?: number;
  editChannelId?: number;
};

export default function BoardCreatePageClient({
  editPostId,
  editChannelId,
}: BoardCreatePageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const isEditMode = typeof editPostId === "number" && typeof editChannelId === "number";
  const [boardType, setBoardType] = useState<BoardWriteType | undefined>(undefined);
  const [boardScope, setBoardScope] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [contentHtml, setContentHtml] = useState<string | undefined>(undefined);
  const [isPinned, setIsPinned] = useState<boolean | undefined>(undefined);
  const [allowComment, setAllowComment] = useState<boolean | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const channelsQuery = useQuery({
    queryKey: ["staff", "board", "channels"],
    queryFn: () => getChannels(),
    retry: false,
  });
  const classroomsQuery = useQuery({
    queryKey: ["staff", "board", "classrooms"],
    queryFn: () => getClassrooms({ size: 100 }),
    retry: false,
  });
  const departmentsQuery = useQuery({
    queryKey: ["staff", "board", "departments"],
    queryFn: () => getDepartments(),
    retry: false,
  });
  const postDetailQuery = useQuery({
    queryKey: queryKeys.posts.boardDetail(editChannelId ?? 0, editPostId ?? 0),
    queryFn: () => getPost({ channelId: editChannelId ?? 0, postId: editPostId ?? 0 }),
    enabled: isEditMode,
    retry: false,
  });

  const editPostChannel = channelsQuery.data?.find(
    (item) => item.id === (postDetailQuery.data?.channelId ?? editChannelId),
  );
  const editChannelType = editPostChannel?.channelType ?? postDetailQuery.data?.channelType;
  const editChannelName = editPostChannel?.name ?? postDetailQuery.data?.channelName;
  const selectedBoardType: BoardWriteType =
    boardType ??
    (editChannelType === "NOTICE"
      ? "NOTICE"
      : editChannelType === "DEPARTMENT"
        ? "DEPARTMENT"
        : "CLASSROOM");
  const isTypeDisabled = isEditMode;
  const isScopeDisabled = isEditMode || selectedBoardType === "NOTICE";

  const scopeOptions = useMemo<readonly DropdownOption<string>[]>(() => {
    if (selectedBoardType === "NOTICE") {
      return [{ label: "공지사항", value: "all" }];
    }

    if (selectedBoardType === "CLASSROOM") {
      const dynamicOptions =
        classroomsQuery.data?.content
          ?.filter((classroom) => typeof classroom.id === "number")
          .map((classroom) => ({
            label: classroom.name ?? `반 ${classroom.id}`,
            value: String(classroom.id),
          })) ?? [];

      return dynamicOptions.length > 0
        ? dynamicOptions
        : getBoardWriteScopeOptions(selectedBoardType);
    }

    const dynamicOptions =
      departmentsQuery.data?.departments
        ?.filter((department) => typeof department.id === "number")
        .map((department) => ({
          label: department.name ?? `부서 ${department.id}`,
          value: String(department.id),
        })) ?? [];

    return dynamicOptions.length > 0 ? dynamicOptions : getBoardWriteScopeOptions(selectedBoardType);
  }, [selectedBoardType, classroomsQuery.data, departmentsQuery.data]);

  const editScopeValue = useMemo(() => {
    if (selectedBoardType === "NOTICE") {
      return "all";
    }

    if (typeof editPostChannel?.refId === "number") {
      const refIdValue = String(editPostChannel.refId);
      if (scopeOptions.some((option) => option.value === refIdValue)) {
        return refIdValue;
      }
    }

    const normalizedChannelName = editChannelName?.trim();
    if (normalizedChannelName) {
      const matchedOption = scopeOptions.find((option) => {
        const label = option.label.trim();
        return (
          label === normalizedChannelName ||
          normalizedChannelName.includes(label) ||
          label.includes(normalizedChannelName)
        );
      });

      if (matchedOption) {
        return matchedOption.value;
      }
    }

    return scopeOptions[0]?.value ?? "";
  }, [editChannelName, editPostChannel?.refId, scopeOptions, selectedBoardType]);

  const selectedBoardScope =
    selectedBoardType === "NOTICE"
      ? "all"
      : boardScope && scopeOptions.some((option) => option.value === boardScope)
        ? boardScope
        : isEditMode
          ? editScopeValue
          : (scopeOptions[0]?.value ?? "");

  const selectedChannelId = useMemo(() => {
    if (selectedBoardType === "NOTICE") {
      return channelsQuery.data?.find((channel) => channel.channelType === "NOTICE")?.id;
    }

    const refId = Number(selectedBoardScope);

    if (Number.isInteger(refId)) {
      return channelsQuery.data?.find(
        (channel) => channel.channelType === selectedBoardType && channel.refId === refId,
      )?.id;
    }

    return channelsQuery.data?.find(
      (channel) => channel.channelType === selectedBoardType && channel.name === selectedBoardScope,
    )?.id;
  }, [selectedBoardType, channelsQuery.data, selectedBoardScope]);

  const currentUserName = user?.name ?? user?.nickname ?? user?.email ?? "";
  const initialPinned = Boolean(postDetailQuery.data?.isPinned);
  const visibleTitle = title ?? postDetailQuery.data?.title ?? "";
  const visibleAuthor = postDetailQuery.data?.authorName ?? currentUserName;
  const visibleContentHtml = contentHtml ?? postDetailQuery.data?.contentHtml ?? "";
  const visibleIsPinned = isPinned ?? initialPinned;
  const visibleAllowComment = allowComment ?? postDetailQuery.data?.allowComment ?? true;
  const isEditorReady = !isEditMode || Boolean(postDetailQuery.data);
  const cancelHref =
    isEditMode && typeof editPostId === "number" && typeof editChannelId === "number"
      ? `/staff/board/${editPostId}?channelId=${editChannelId}`
      : "/staff/board";
  const canManagePost =
    !isEditMode ||
    user?.role === "ADMIN" ||
    (typeof user?.id === "number" && postDetailQuery.data?.authorId === user.id) ||
    Boolean(
      postDetailQuery.data?.authorName &&
        (postDetailQuery.data.authorName === user?.name ||
          postDetailQuery.data.authorName === user?.nickname ||
          postDetailQuery.data.authorName === user?.email),
    );

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async () => {
      const channelId = isEditMode ? editChannelId : selectedChannelId;

      if (!channelId) {
        throw new Error("게시글을 등록할 채널을 찾을 수 없습니다.");
      }

      if (isEditMode && !canManagePost) {
        throw new Error("게시글을 수정할 권한이 없습니다.");
      }

      const title = visibleTitle.trim();
      const contentHtml = visibleContentHtml.trim();
      const allowComment = visibleAllowComment;
      const publishBody = { title, contentHtml, allowComment };

      if (selectedFiles.length > 0) {
        const draftPost = isEditMode
          ? await updatePost(
              { channelId, postId: editPostId },
              { title, contentHtml, status: "DRAFT", allowComment },
            )
          : await createPost({ channelId }, { title, contentHtml, status: "DRAFT", allowComment });

        if (typeof draftPost.id !== "number") {
          throw new Error("게시글 초안을 저장하지 못했습니다.");
        }

        const registeredFiles = await Promise.all(selectedFiles.map((file) => uploadBoardDocument(file)));

        for (const [index, registered] of registeredFiles.entries()) {
          if (!registered.fileId) {
            throw new Error("게시판 파일 메타데이터 등록에 실패했습니다.");
          }

          await attachPostFile(
            { channelId, postId: draftPost.id },
            { fileId: registered.fileId, sortOrder: index },
          );
        }

        const published = await publishPost({ channelId, postId: draftPost.id }, publishBody);

        if (visibleIsPinned !== (isEditMode ? initialPinned : false)) {
          await pinPost({ channelId, postId: draftPost.id }, { isPinned: visibleIsPinned });
        }

        return published;
      }

      if (isEditMode) {
        const updated = await updatePost(
          { channelId, postId: editPostId },
          { title, contentHtml, status: "PUBLISHED", allowComment },
        );

        if (visibleIsPinned !== initialPinned) {
          await pinPost({ channelId, postId: editPostId }, { isPinned: visibleIsPinned });
        }

        return updated;
      }

      return createPost(
        { channelId },
        {
          title,
          contentHtml,
          status: "PUBLISHED",
          isPinned: visibleIsPinned,
          allowComment,
        },
      );
    },
    onSuccess: async (post) => {
      const savedPostId = post.id ?? editPostId;
      const savedChannelId = post.channelId ?? (isEditMode ? editChannelId : selectedChannelId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["staff", "board", "notices"] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts(0, 50) }),
        typeof savedChannelId === "number" && typeof savedPostId === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(savedChannelId, savedPostId),
            })
          : Promise.resolve(),
        isEditMode && typeof editChannelId === "number" && typeof editPostId === "number"
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.posts.boardDetail(editChannelId, editPostId),
            })
          : Promise.resolve(),
      ]);

      if (typeof savedPostId === "number" && typeof savedChannelId === "number") {
        router.push(`/staff/board/${savedPostId}?channelId=${savedChannelId}`);
        return;
      }

      router.push("/staff/board");
    },
  });

  const canSubmit =
    visibleTitle.trim().length > 0 &&
    visibleContentHtml.trim().length > 0 &&
    Boolean(isEditMode ? editChannelId : selectedChannelId) &&
    canManagePost &&
    !isPending;

  return (
    <BoardShell>
      <DocumentSection>
        <Toolbar>
          <PageTitle>{isEditMode ? "글 수정" : "글쓰기"}</PageTitle>
          <ToolbarActions>
            <ActionButton type="submit" form="board-create-form" disabled={!canSubmit}>
              {isEditMode ? "수정 완료" : "작성 완료"}
            </ActionButton>
            {isEditMode ? (
              <ActionLink href={cancelHref} $variant="muted">
                취소
              </ActionLink>
            ) : null}
          </ToolbarActions>
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
              value={selectedBoardType}
              disabled={isTypeDisabled}
              isOpen={openDropdown === "type"}
              onToggle={() =>
                setOpenDropdown((current) => (current === "type" || isTypeDisabled ? null : "type"))
              }
              onSelect={(nextValue) => {
                if (isTypeDisabled) return;
                setBoardType(nextValue);
                setBoardScope("");
                setOpenDropdown(null);
              }}
              width="wide"
            />
            <BoardDropdown
              label="게시판 선택"
              options={scopeOptions}
              value={selectedBoardScope}
              disabled={isScopeDisabled}
              isOpen={openDropdown === "scope"}
              onToggle={() =>
                setOpenDropdown((current) =>
                  current === "scope" || isScopeDisabled ? null : "scope",
                )
              }
              onSelect={(nextValue) => {
                if (isScopeDisabled) return;
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
            value={visibleTitle}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Label as="label" htmlFor="board-author">
            작성자
          </Label>
          <Input
            id="board-author"
            name="author"
            placeholder="홍길동"
            value={visibleAuthor}
            readOnly
          />

          <OptionRow>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={visibleIsPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
              />
              <span>게시물 고정</span>
            </CheckboxLabel>
            <CheckboxLabel>
              <CheckboxInput
                type="checkbox"
                checked={visibleAllowComment}
                onChange={(event) => setAllowComment(event.target.checked)}
              />
              <span>댓글 허용</span>
            </CheckboxLabel>
          </OptionRow>

          <Label as="label" htmlFor="board-content">
            내용
          </Label>
          {isEditorReady ? (
            <ToastEditorField
              key={isEditMode ? `${editChannelId}-${editPostId}` : "new-board-post"}
              initialValue={visibleContentHtml}
              onChange={setContentHtml}
            />
          ) : (
            <StateMessage>게시글 내용을 불러오는 중입니다.</StateMessage>
          )}

          <Label>자료</Label>
          <FileUploadPanel>
            {selectedFiles.length > 0 ? (
              selectedFiles.map((file, index) => (
                <span key={`${file.name}-${index}`}>{file.name}</span>
              ))
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
                  setSelectedFiles(Array.from(event.target.files ?? []));
                }}
              />
            </FileSelectLabel>
          </FileUploadPanel>

          {postDetailQuery.isError ? (
            <StateMessage>수정할 게시글 내용을 불러오지 못했습니다.</StateMessage>
          ) : null}
          {!canManagePost ? (
            <StateMessage>이 게시글을 수정할 권한이 없습니다.</StateMessage>
          ) : null}
          {isError ? (
            <StateMessage>
              {isEditMode ? "게시글 수정에 실패했습니다." : "게시글 작성에 실패했습니다."}
            </StateMessage>
          ) : null}
        </Form>
      </DocumentSection>
    </BoardShell>
  );
}

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (min-width: 120rem) {
    gap: 1.875rem;
  }
`;
